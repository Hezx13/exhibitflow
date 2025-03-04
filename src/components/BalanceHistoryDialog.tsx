import { Dialog, DialogContent, DialogActions, Button, IconButton, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'motion/react';

// TODO ADD FILTERS AND PAGINATION
const BalanceHistoryDialog = ({ open, onClose, debits, onRemove }) => {
  return (
    <>
      <Dialog open={open} maxWidth="md">
        <DialogContent sx={{maxHeight: theme=>theme.breakpoints.values.sm, overflow: 'auto' }}>
          <List sx={{ width: '100%', minWidth: 400}}>
            <AnimatePresence>
              {debits?.map((debit) => (
                <motion.div
                  key={debit._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <Paper 
                    variant='outlined'
                    sx={{ 
                      mb: 1.5, 
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end" onClick={() => onRemove(debit)}>
                          <DeleteForeverIcon fontSize="small" htmlColor="Crimson" />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary={
                          <Typography variant="body1" component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            {debit.debit} AED
                          </Typography>
                        }
                        secondary={
                            <Typography variant="body2" component="span" sx={{ display: 'block' }} noWrap>
                              {dayjs(debit.date).format('DD.MM.YYYY') + (debit.description ? ` •  ${debit.description}` : '')}
                            </Typography>
                        }
                      />
                    </ListItem>
                  </Paper>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BalanceHistoryDialog;
