import React from 'react';
import { Box, useTheme } from '@mui/material';

export type StatusVariant = 'progress' | 'success' | 'error' | 'warning' | 'pending' | 'info';

interface StatusCircleProps {
  variant: StatusVariant;
  size?: number; // in pixels, default 16
}

const getStatusColor = (theme: any, variant: StatusVariant): string => {
  const colorMap: Record<StatusVariant, string> = {
    progress: theme.palette.info.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    pending: theme.palette.grey[500],
    info: theme.palette.info.main,
  };
  return colorMap[variant];
};

const StatusCircle: React.FC<StatusCircleProps> = ({ variant, size = 12 }) => {
  const theme = useTheme();
  const color = getStatusColor(theme, variant);

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'inline-block',
        flexShrink: 0,
        animation: variant === 'progress' ? 'pulse 2s infinite' : 'none',
        boxShadow: `0 0 ${size * 1.5}px ${color}80`,
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
            boxShadow: `0 0 ${size * 1.5}px ${color}80`,
          },
          '50%': {
            opacity: 0.7,
            boxShadow: `0 0 ${size * 2.5}px ${color}40`,
          },
        },
      }}
    />
  );
};

export default StatusCircle;
