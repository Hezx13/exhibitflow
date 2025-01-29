import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { StyledComponent } from 'styled-components';
import { Paper, Stack } from '@mui/material';
import { motion, AnimatePresence } from 'motion/react';

type CardComponentProps = {
  text: string;
  amount?: number | string;
  textColor?: string;
  button?: React.ReactNode;
  icon?: React.ReactNode;
  secondaryText?: string;
};

const bull = (
  <Box component="span" sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}></Box>
);

export default function CardComponent({
  text,
  amount,
  textColor,
  button,
  icon,
  secondaryText,
}: CardComponentProps) {
  return (
    <Stack sx={{ height: '100%', boxShadow: '0px 4px 12px rgba(255, 255, 255, 0.05)' }}>
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent sx={{ position: 'relative', padding: 1.5, height: '100%' }}>
          <Stack direction="column" sx={{ height: '100%' }} justifyContent="space-between">
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <Stack direction="row" gap={0.5}>
                {icon}
                <Typography>{text}</Typography>
              </Stack>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {button}
              </motion.div>
            </Stack>
            <Stack direction="row" gap={0.5} justifyContent="space-between" alignItems="center">
              <Stack direction="row" gap={0.5}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <Typography variant="h6" color={textColor || 'primary'}>
                    <motion.span
                      key={amount}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {amount}
                    </motion.span>
                  </Typography>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                >
                  <Typography variant="h6" color={`${textColor ? textColor : 'primary'}.dark`}>
                    {secondaryText}
                  </Typography>
                </motion.div>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
