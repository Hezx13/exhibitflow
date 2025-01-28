import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
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
          size="small"
          type="string"
          fullWidth
          value={props.inputValue}
          onChange={(e) => props.setInputValue(e.target.value)}
        />
        <Stack direction="row" gap={1} alignItems="center">
          <TextField
            autoFocus
            margin="dense"
            type="date"
            size="small"
            fullWidth
            value={props.inputDate}
            onChange={(e) => props.setInputDate(e.target.value)}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => props.setInputDate(new Date().toISOString().split('T')[0])}
          >
            Today
          </Button>
        </Stack>
        <TextField
          autoFocus
          margin="dense"
          label="Cheque number / Note"
          type="text"
          size="small"
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
