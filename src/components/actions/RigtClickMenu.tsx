import React, { useEffect } from 'react';
import { Box, Popper, Paper, MenuItem, SxProps, Theme } from '@mui/material';
import { usePopupState, bindPopper, PopupState } from 'material-ui-popup-state/hooks';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { motion, AnimatePresence } from 'motion/react';

interface RightClickMenuOption {
  name: string;
  action: () => void;
  disabled?: boolean;
}

interface RightClickMenuProps {
  children: React.ReactNode;
  options: RightClickMenuOption[];
  sxContainer?: SxProps;
  onContextElement?: (element: HTMLElement) => void;
}

export const RightClickMenu: React.FC<RightClickMenuProps> = ({
  children,
  options,
  sxContainer,
  onContextElement,
}) => {
  const popupState = usePopupState({ variant: 'popper', popupId: 'shared-context-menu' });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    // Get the actual element that was right-clicked
    const target = e.target as HTMLElement;
    console.log(e);

    // Close any other open menus first
    if (popupState.isOpen) {
      popupState.close();
    }
    // Set the anchor position to the cursor coordinates
    popupState.setAnchorEl({
      getBoundingClientRect: () => ({
        top: e.clientY,
        left: e.clientX + 5,
        right: e.clientX,
        bottom: e.clientY,
        width: 0,
        height: 0,
        x: e.clientX,
        y: e.clientY,
      }),
    } as HTMLElement);
    popupState.open();
  };

  const handleClick = (action: () => void) => {
    popupState.close();
    action();
  };

  return (
    <>
      <Box
        onContextMenu={handleContextMenu}
        width="100%"
        height="100%"
        sx={sxContainer}
        data-rightclick-container="true"
      >
        {children}
      </Box>
      <Popper {...bindPopper(popupState)} placement="right-start" style={{ zIndex: 1300 }}>
        <AnimatePresence>
          {popupState.isOpen && (
            <ClickAwayListener onClickAway={() => popupState.close()}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <Paper onContextMenu={(e) => e.preventDefault()} sx={{ p: 0.5 }}>
                  {options.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClick(option.action);
                        }}
                        disabled={option.disabled}
                      >
                        {option.name}
                      </MenuItem>
                    </motion.div>
                  ))}
                </Paper>
              </motion.div>
            </ClickAwayListener>
          )}
        </AnimatePresence>
      </Popper>
    </>
  );
};
