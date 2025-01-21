import { useState } from 'react';
import { NewItemForm } from './NewItemForm';
import { NewItemField } from './newItemField';
import { AddItemButton } from '../styles/styles';
import AddTaskDialog from './addTaskDialog';
import Button from '@mui/material/Button';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

type AddNewItemProps = {
  onAdd(
    text: string,
    article?: string,
    price?: string,
    quantity?: number,
    unit?: string,
    comment?: string,
    deliveryDate?: Date,
    orderedBy?: string
  ): void;
  toggleButtonText: string;
  dark?: boolean;
  list?: boolean;
};

export const AddNewItem = (props: AddNewItemProps) => {
  const [showForm, setShowForm] = useState(false);
  const { onAdd, toggleButtonText, dark, list } = props;

  const handleClose = () => {
    setShowForm(false);
  };

  return (
    <>
      {list ? (
        showForm ? (
          <NewItemField
            onAdd={(text) => {
              onAdd(text);
              setShowForm(false);
            }}
          />
        ) : (
          <AddItemButton dark={dark} onClick={() => setShowForm(true)}>
            {toggleButtonText}
          </AddItemButton>
        )
      ) : (
        <>
          <AddItemButton dark={dark} onClick={() => setShowForm(true)}>
            {toggleButtonText}
          </AddItemButton>
          <Dialog
            open={showForm}
            keepMounted
            onClose={handleClose}
            sx={{ backdropFilter: 'blur(5px)' }}
            aria-describedby="alert-dialog-slide-description"
          >
            <DialogTitle>Order Details</DialogTitle>
            <DialogContent>
              <NewItemForm
                onAdd={(text, article, price, quantity, unit, comment, deliveryDate, orderedBy) => {
                  onAdd(text, article, price, quantity, unit, comment, deliveryDate, orderedBy);
                  setShowForm(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};
