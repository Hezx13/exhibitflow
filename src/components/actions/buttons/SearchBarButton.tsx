import { Box, ButtonBase, Stack, SvgIcon, Dialog, alpha } from '@mui/material';
import { usePopupState, bindTrigger, bindDialog } from 'material-ui-popup-state/hooks';
import GlobalSearch from '../../global-search/GlobalSearch';
import { useEffect, useRef } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import isUserTyping from '../../../utils/isUserTyping';
interface SearchBarButtonProps {
  labelVisible?: boolean;
}

export default function SearchBarButton({ labelVisible = true }: SearchBarButtonProps) {
  const popupState = usePopupState({ variant: 'dialog', popupId: 'search-dialog' });
  const searchInputRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && searchInputRef.current) {
        if (!isUserTyping()) {
          event.preventDefault();
          searchInputRef.current.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchInputRef]);
  return (
    <>
      <ButtonBase
        component="button"
        {...bindTrigger(popupState)}
        onClick={(e) => {
          bindTrigger(popupState).onClick(e);
        }}
        ref={searchInputRef}
        sx={{
          width: '100%',
          justifyContent: 'flex-start',
          height: 32,
          px: 1.5,
          my: 0.5,
          py: 0.75,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          filter: (theme) =>
            theme.palette.mode === 'dark' ? 'brightness(0.85)' : 'brightness(0.95)',
          backgroundColor: 'background.paper',
          color: 'text.disabled',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'transparent'
                : alpha(theme.palette.background.paper, 0.8),
            cursor: 'pointer',
            '& .hover-effect': {
              opacity: 1,
              transition: 'background-color opacity 0.2s',
            },
          },
          '& .hover-effect': {
            content: '""',
            position: 'absolute',
            width: '40px',
            filter: 'blur(10px)',
            height: '40px',
            backgroundColor: 'action.hover',
            borderRadius: '50%',
            opacity: 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none',
          },
        }}
        onMouseMove={(e) => {
          const hoverEffect = e.currentTarget.querySelector('.hover-effect') as HTMLElement;
          if (hoverEffect) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            hoverEffect.style.transform = `translate(${x - 30}px, ${y - 20}px)`;
          }
        }}
      >
        <Stack direction="row" gap={1} alignItems="center">
          <SearchRoundedIcon fontSize="small" />
          {labelVisible && (
            <Stack direction="row" gap={0.125} alignItems="center">
              Press
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  border: 1,
                  mx: 0.5,
                  borderRadius: '2px',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                /
              </Box>
              to search
            </Stack>
          )}
        </Stack>
        <div className="hover-effect" />
      </ButtonBase>

      <Dialog
        {...bindDialog(popupState)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { backgroundColor: 'transparent', borderColor: 'transparent', boxShadow: 'none', backgroundImage: 'none' },
        }}
      >
        <GlobalSearch closeSearch={() => popupState.close()} />
      </Dialog>
    </>
  );
}
