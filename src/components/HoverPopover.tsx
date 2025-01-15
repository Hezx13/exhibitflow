import React, { useState, useEffect } from 'react';
import { Typography, Paper ,IconButton, Divider, } from '@mui/material';
import { useReport } from '../state/reportsContext';
import AddCardIcon from '@mui/icons-material/AddCard';
import { Tune } from '@mui/icons-material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const HoverPopover = ({openHook, debit, onRemoveDebit}) => {
    let timerID;
  const [showDialog, setShowDialog] = useState(false);

  const handleMouseOver = () => {
    clearTimeout(timerID);
    if (debit.length)
    setShowDialog(true);
  };

  const handleMouseOut = () => {
    timerID = setTimeout(() => {
        setShowDialog(false);
    }, 300);
  };

  return (
    <div>
      <Typography
        
        sx={{
            background: "#00FF0050",
            maxWidth: '300px',
            padding: '10px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
        }}                       
        aria-haspopup="true"
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        <span>
            <span 
            
            style={{ color: '#fff' }}>Income: </span>
            <span style={{ fontWeight: '600' }}>
                {debit.reduce((a, b) => {
                return a.amount || a + b.amount || 0;
              }, 0).toFixed(2)}</span>
        </span>
        <IconButton sx={{ padding: '0px' }} onClick={openHook}>
            <AddCardIcon />
        </IconButton>
      </Typography>

      <Paper elevation={3} 
      sx={{
        position: 'absolute',
        padding: '10px', 
        marginTop: '10px', 
        opacity: showDialog ? 1 : 0, 
        visibility: showDialog ? 'visible' : 'hidden', 
        transition: 'opacity 0.3s ease, visibility 0.3s ease'
      }}
      onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}>
          {debit.map((num, index) => (
            <>
            <Typography sx={{display: 'flex',justifyContent: 'space-between', minWidth: '200px', maxWidth: '300px'}} variant="subtitle1" color="green" key={index}>
               <span>+{num.amount}</span>
            <IconButton
                onClick={()=>onRemoveDebit(num)}>
                <DeleteForeverIcon fontSize="small" htmlColor='Crimson'/>
            </IconButton>
            </Typography>
            <Typography variant="body2"
            sx={{display: 'flex',justifyContent: 'space-around'}}
            >
              <span>{num.date.split(' ')[0]}</span>
              <span>{num.check} </span>
               
            </Typography>
            <Divider />
            </>
          ))}
        </Paper>



          
    </div>
  );
};

export default HoverPopover;
