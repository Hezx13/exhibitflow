import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { StyledComponent } from 'styled-components';
import { Paper, Stack } from '@mui/material';
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
              {button}
            </Stack>
            <Stack direction="row" gap={0.5} justifyContent="space-between" alignItems="center">
              <Stack direction="row" gap={0.5}>
                <Typography variant="h6" color={textColor || 'primary'}>
                  {amount}
                </Typography>
                <Typography variant="h6" color={`${textColor ? textColor : 'primary'}.dark`}>
                  {secondaryText}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
