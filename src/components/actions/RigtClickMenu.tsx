import React from 'react';
import { Box, Popper, Paper, MenuItem } from '@mui/material';
import { usePopupState, bindPopper } from 'material-ui-popup-state/hooks';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { motion, AnimatePresence } from 'motion/react';

interface RightClickMenuOption {
  name: string;
  action: () => void;
}

interface RightClickMenuProps {
  children: React.ReactNode;
  options: RightClickMenuOption[];
}

export const RightClickMenu: React.FC<RightClickMenuProps> = ({ children, options }) => {
  const popupState = usePopupState({ variant: 'popper', popupId: 'context-menu' });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
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
      <Box onContextMenu={handleContextMenu} width="100%" height="100%">
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
                <Paper>
                  {options.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <MenuItem onClick={() => handleClick(option.action)}>{option.name}</MenuItem>
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
