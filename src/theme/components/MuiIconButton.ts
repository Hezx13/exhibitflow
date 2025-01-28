import { alpha, Components, Palette, PaletteColor, Theme } from '@mui/material';
import { OverridableStringUnion } from '@mui/types';

declare module '@mui/material/IconButton' {
  interface IconButtonOwnProps {
    variant?: OverridableStringUnion<'plain' | 'soft' | 'solid', {}>;
    disableActiveShrink?: boolean;
  }
}

const scaleStyles = {
  transition: 'transform 0.2s ease-in-out',
  '&:active': {
    transform: 'scale(0.95)',
  },
};

type PaletteColorKey = keyof Palette;

const MuiIconButton: Components<Theme>['MuiIconButton'] = {
  defaultProps: {
    disableFocusRipple: true,
    disableTouchRipple: true,
    variant: 'plain',
  },
  styleOverrides: {
    root: ({ ownerState, theme }) => {
      const color: PaletteColorKey | undefined =
        !ownerState.color || ['inherit', 'default'].includes(ownerState.color)
          ? undefined
          : (ownerState.color as keyof Omit<Palette, 'inherit' | 'default'>);
      const solidBg =
        theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50];
      const solidHoverBg =
        theme.palette.mode === 'dark' ? theme.palette.grey[850] : theme.palette.grey[200];
      return {
        borderRadius: theme.shape.borderRadius,
        ...(!ownerState.disableActiveShrink && scaleStyles),
        ...(ownerState.variant === 'plain' && {
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: !ownerState.disableRipple && theme.palette.action.hover,
          },
        }),
        ...(ownerState.variant === 'soft' && {
          backgroundColor: color
            ? alpha(
                (theme.palette[color] as PaletteColor).main,
                theme.palette.action.selectedOpacity
              )
            : theme.palette.action.selected,
          backdropFilter: 'blur(2px)',
          '&:hover': {
            backgroundColor:
              !ownerState.disableRipple &&
              alpha(
                color ? (theme.palette[color] as PaletteColor).main : theme.palette.action.active,
                theme.palette.action.activatedOpacity
              ),
          },
        }),
        ...(ownerState.variant === 'solid' && {
          backgroundColor: color ? (theme.palette[color] as PaletteColor).main : solidBg,
          color: color
            ? (theme.palette[color] as PaletteColor).contrastText
            : theme.palette.text.primary,
          '&:hover': {
            backgroundColor:
              !ownerState.disableRipple &&
              (color ? (theme.palette[color] as PaletteColor).dark : solidHoverBg),
          },
        }),
      };
    },
  },
  variants: [
    {
      props: { size: 'small' },
      style: ({ theme }) => ({
        fontSize: theme.typography.pxToRem(20),
        padding: theme.spacing(0.5),
      }),
    },
    {
      props: { size: 'medium' },
      style: ({ theme }) => ({
        padding: theme.spacing(0.75),
      }),
    },
    {
      props: { size: 'large' },
      style: ({ theme }) => ({
        padding: theme.spacing(0.75),
      }),
    },
  ],
};

export default MuiIconButton;
