import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { StyledComponent } from 'styled-components';
type CardComponentProps = {
  text: string;
  amount: JSX.Element | number | string;
  textColor?: string;
  button?: React.ReactNode;
};

const bull = (
  <Box component="span" sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}></Box>
);

export default function CardComponent({ text, amount, textColor, button }: CardComponentProps) {
  const card = (
    <>
      <CardContent sx={{ position: 'relative' }}>
        <Typography sx={{ fontSize: 18 }} color="#ffffff" gutterBottom>
          {text}
          {button}
        </Typography>
        <Typography variant="h5" component="div" color={textColor || 'orange'}>
          {amount}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary"></Typography>
      </CardContent>
    </>
  );
  return (
    <Box sx={{ minWidth: 275, boxShadow: '8px 12px 15px -10px rgba(0, 0, 0, 0.2)' }}>
      <Card variant="outlined" sx={{ backgroundColor: '#ffffff10', border: '1px solid #000000' }}>
        {card}
      </Card>
    </Box>
  );
}
