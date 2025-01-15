import { FC, useState, memo } from "react";
import { removeBalance } from "../api/balance-api";
import { Dialog, DialogContent,DialogActions, Button, IconButton } from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import dayjs from "dayjs";

const BalanceHistoryDialog = ({open, onClose, debits, onRemove}) =>{
    
    

    return (
    <>
        <Dialog open={open}>
        <DialogContent>
            {debits.map(debit => (
                <div 
                key={debit._id}
                style={{
                    display: 'flex', 
                    padding: '5px 10px', 
                    margin: '5px', 
                    background: '#00000020', 
                    borderRadius: '5px',
                    alignItems: 'center',
                    width: 'clamp(300px, 400px, 500px)',
                }}
                    >
                <span style={{color: 'green', flex: 1}}>
                    {debit.amount} AED
                </span>
                <span style={{flex: 1}}>
                    {dayjs(debit.date).format('DD-MM-YYYY')}
                </span>
                <span style={{width: '100px'}}>
                    {debit.check}
                </span>
                <IconButton
                sx={{marginLeft: 'auto'}}
                onClick={()=>onRemove(debit)}>
                <DeleteForeverIcon fontSize="small" htmlColor='Crimson'/>
                </IconButton>
                </div>
            ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
        </Dialog>
    </>
    )
}

export default BalanceHistoryDialog;