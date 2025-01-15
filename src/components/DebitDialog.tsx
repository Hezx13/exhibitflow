import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material';

function DebitDialog(props) {
  return (
    <Dialog open={props.open} onClose={props.handleClose}>
      <DialogTitle>Add debit</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Amount"
          margin="dense"
          type="string"
          fullWidth
          value={props.inputValue}
          onChange={(e) => props.setInputValue(Number(e.target.value))}
        />
        <TextField
          autoFocus
          margin="dense"
          type="date"
          fullWidth
          value={props.inputDate}
          onChange={(e) => props.setInputDate(e.target.value)}
        />
        <TextField
          autoFocus
          margin="dense"
          label="Cheque number / Note"
          type="text"
          fullWidth
          value={props.inputCheck}
          onChange={(e) => props.setInputCheck(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={props.handleSave} color="primary">
          ADD
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DebitDialog;
