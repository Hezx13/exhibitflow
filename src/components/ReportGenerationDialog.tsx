import React, { useState } from 'react';
import { StyledGenerateButton, StyledSelect } from '../styles/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { FormControl, InputLabel, Button, MenuItem, Card, CardContent, Typography, Box } from '@mui/material';
import { generateReport } from '../api';
import dayjs from 'dayjs';

const ReportGenerationDialog = ({onNewReport}) =>{
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [payment, setPayment] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const isMobile = useMediaQuery('(max-width:500px)');

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    function getFirstAndLastDay(month, year) {
        const monthIndex = months.indexOf(month);
      
        // Get the first and last day of the month
        const periodStart = dayjs(new Date(year, monthIndex, 1)).format('DD-MM-YYYY');
        const periodEnd = dayjs(new Date(year, monthIndex + 1, 0)).format('DD-MM-YYYY');

        return { periodStart, periodEnd };
      }
    async function handleGenerateReport(){
        if (month && year && payment){
            setIsGenerating(true);
            let dates = getFirstAndLastDay(month, year);
            try {
            await generateReport(dates, payment);
                onNewReport();
                setIsGenerating(false);

            } catch (err) {
                console.error("An error occurred:", err);
                setIsGenerating(false);  // Log the error
            }
        }
        setIsGenerating(false);
    }
      

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 2 }, (_, i) => currentYear - i);
  

    const card = (
        <>
            <CardContent>
                <Typography sx={{ fontSize: 18 }} color={isGenerating ? 'red' : '#ffffff'} gutterBottom>
                    {isGenerating ? "Generating report..." : "Generate report"}
                </Typography>
                <FormControl variant="filled" style={{ margin: '0 10px', width: '120px'  }}>
                <InputLabel sx={{color: 'orange'}}>Month</InputLabel>
                <StyledSelect
                    value={month}
                    onChange={(e) => setMonth(e.target.value as string)}
                    label="Month"
                    size="small"
                    margin='dense'
                >
                    {months.map((m, index) => (
                    <MenuItem key={index} value={m}>
                        {m}
                    </MenuItem>
                    ))}
                </StyledSelect>
                </FormControl>

            <FormControl variant="filled" style={{ margin: '0 10px', width: '120px', height: '15px !important' }}>
            <InputLabel sx={{color: 'orange'}}>Year</InputLabel>
            <StyledSelect
                value={year}
                onChange={(e) => setYear(e.target.value as string)}
                label="Year"
                size="small"
                margin='dense'
            >
                {years.map((y, index) => (
                <MenuItem key={index} value={y}>
                    {y}
                </MenuItem>
                ))}
            </StyledSelect>
            </FormControl>
            <FormControl variant="filled" style={{ margin: '0 10px', width: '120px'  }}>
                <InputLabel sx={{color: 'orange'}}>Payment</InputLabel>
                <StyledSelect
                    value={payment}
                    onChange={(e) => setPayment(e.target.value as string)}
                    label="Month"
                    size="small"
                    margin='dense'
                >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="card">Card</MenuItem>
                    <MenuItem value="credit">Credit</MenuItem>
                    <MenuItem value="bank transfer">Bank Transfer</MenuItem>
                    <MenuItem value="pemo card">Pemo card</MenuItem>
                </StyledSelect>
                </FormControl>
                
                <StyledGenerateButton
                disabled={isGenerating}
                onClick={handleGenerateReport}
                >
                    Generate
                </StyledGenerateButton>
                
            
            </CardContent>
        </>
        )

    return (
        <Box sx={{ width: isMobile ? '350px' : '500px', boxShadow: '8px 12px 15px -10px rgba(0, 0, 0, 0.2)' }}>
        <Card variant="outlined" sx={{backgroundColor: '#ffffff10'}}>{card}</Card>
        
        </Box>
    );
}

export default ReportGenerationDialog;