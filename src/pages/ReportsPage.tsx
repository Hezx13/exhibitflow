import { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import NavBar from "../components/navBar";
import CardComponent from "../components/cardComponent";
import ReportGenerationDialog from "../components/ReportGenerationDialog";
import ReportTable from "../components/ReportsTable";
import { loadReports } from "../api";
import { Calculate } from "@mui/icons-material";
import { useReport } from '../state/reportsContext'; // Adjust the import to your file structure
import { Navigate } from "react-router-dom";

type Report = {
    materials: [],
    month: any,
    debit: Array<number>,
    credit: number,
    activeProjects: []
}

const ReportsPage = () => {
    const { reports, fetchReports, updateReports } = useReport();
    const [reportsUpdated, setRepotsUpdated] = useState(false)
    const [balance, setBalance] = useState(0);
    const [isLoggedIn] = useState(!!localStorage.getItem('token'));

    useEffect(()=>{
        calculateTotalReports(reports)
    },[reports])

    function calculateTotalReports(reportss){
        let total = 0;
        for (let report of reportss) {
            
            total += report.debit.reduce((a, b) => {
                return (a.amount || a + b.amount || 0) || 0;
              }, 0) - report.credit
            } 
              setBalance(total);
        }
    
    return (
        <>
        <Grid container>
        {!isLoggedIn && <Navigate to="/login"/>}

            <Grid item xs={12} sx={{marginBottom: '15px'}}>
                <NavBar/>
            </Grid>

            <Grid item xs={12} sx={{marginBottom: '15px'}}>
            <Grid container justifyContent="center" spacing={8} >
                        <Grid item xl={2}>
                           {  reports.length ? 
                           <CardComponent 
                           textColor={balance >= 0? "green" : "red"} 
                           text="Start of month balance" 
                           amount={balance.toFixed(2)}/> 
                           : null }
                        </Grid>
                        <Grid item xl={2}>
                            <ReportGenerationDialog onNewReport={updateReports}/>
                        </Grid>
                    </Grid>
            </Grid>
            <Grid item xs={12} sx={{marginBottom: '15px'}}>
                {
                    reports.length ? <ReportTable data={reports} updateCall={updateReports}/> : null
                }
                
            </Grid>
        </Grid>
        </>
    )

}

export default ReportsPage;