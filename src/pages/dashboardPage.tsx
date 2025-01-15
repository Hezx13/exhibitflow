import {useAppState } from "../state/AppStateContext";
import Cookie from "js-cookie";
import React, {useState, useEffect, useMemo, memo} from 'react'
import {Grid, CircularProgress} from '@mui/material'
import {onUpload} from "../api";
import CardComponent from "../components/cardComponent";
import NavBar from "../components/navBar";
import TableListsComponent from "../components/tableListsComponent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { Navigate, useNavigate } from "react-router-dom";
import DebitDialog from "../components/DebitDialog";
import { addBalance, currentBalance, generateCashOrder, loadBalance, removeBalance } from "../api/balance-api";
import AddCardIcon from '@mui/icons-material/AddCard';
import dayjs from "dayjs";
import BalanceHistoryDialog from "../components/BalanceHistoryDialog";
import { StyledGenerateCashOrderButton } from "../styles/styles";
import { getMaterialCount, getSavedMaterials } from "../api/materials-api";

const BalanceCardContent = ({balance, action, historyAction}) => {
    return (
        <span style={{
            display: 'flex',
            justifyContent: 'space-between',
        }}>
        <span style={{color: balance > 0 ? 'green': 'red', cursor: 'pointer'}} onClick={historyAction}>
            {balance ? balance.toFixed(2) + " AED" : <CircularProgress color="primary"/>} 
        </span>
        <IconButton sx={{ padding: '0 5px', }} onClick={action}>
            <AddCardIcon htmlColor="green"/>
            </IconButton>
        </span>
        
    )
}

export const DashboardPage = () => {
    const { lists, archive, dispatch } = useAppState()
    const [balance, setBalance] = useState([]);
    const [current, setCurrent] = useState(0);
    const [roughTotalPrice, setRoughTotalPrice] = useState<number>(0)
    const [totalPrice, setTotalPrice] =useState<number>(0)
    const [notDoneTasksCount, setNotDoneTasksCount] = useState(0)
    const [isLoggedIn] = useState(!!localStorage.getItem('token'));
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [materialsCount, setMaterialsCount] = useState(0);
    const [inputDate, setInputDate] = useState("");
    const [inputCheck, setInputCheck] = useState("");
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);    
    const navigate = useNavigate();

    useEffect(() => {
        setRoughTotalPrice(totals.totalRough);
        setTotalPrice(totals.total);
        fetchBalance();
        fetchCurrentBalance();
        fetchSavedMaterialsCount();
    }, [lists,archive]);

    
    useEffect(() => {
        const countNotDoneTasks = lists.reduce((total, list) => {
            return total + list.tasks.filter((task) => task.status !== "Done").length;
        }, 0);
        setNotDoneTasksCount(countNotDoneTasks)
    }, [lists]);
    
    const fetchBalance = async () => {
        const res = await loadBalance();
        setBalance(res.reverse());
    }

    const fetchCurrentBalance = async () => {
    const res = await currentBalance();
    setCurrent(res);   
    }

    const fetchSavedMaterialsCount = async () => {  
        const res = await getMaterialCount();
        setMaterialsCount(res);
    }

    const calculateTotal = () => {
        let _totalPrice = 0;
        let _totalPriceRough = 0;

        lists.forEach((list) => {
            list.tasks.forEach((task) => {
                if (task.status !== "Done") {
                    const price = parseFloat(task.price);
                    const quantity = task.quantity;
                    if (task.payment?.toLowerCase() === "cash") {
                        _totalPrice += !Number.isNaN(price) ? price * quantity : 0;
                    }
                    _totalPriceRough += !Number.isNaN(price) ? price * quantity : 0;
                }
            });
        });
        return {total: parseFloat(_totalPrice.toFixed(2)), totalRough: parseFloat(_totalPriceRough.toFixed(2))}
    }

    const handleClickOpen = () => {
        setOpen(true);
      };
    
      const handleClose = () => {
        setOpen(false);
      };

    const handleSave = async () => {
        if (inputValue) {
          let data = { amount: Number(inputValue), date: dayjs(inputDate).toDate(), check: inputCheck, department: localStorage.getItem('selectedDepartment') };
          try {
            addBalance(data)
            setInputCheck("");
            setInputValue("");
            setInputDate("");
            fetchCurrentBalance();
            fetchBalance();
          } catch (err) {
            console.log(err);
          }
        }
        setOpen(false);
      };

      const handleDownloadCashOrder = async () => {
        const res = await generateCashOrder();
      };

      const handleViewSavedMaterials = () =>{
        navigate('/saved')
      }

      const handleRemoveDebitClick = async (debit) => {
        try {
            await removeBalance(debit);
            fetchBalance();
            fetchCurrentBalance();
        } catch (error) {
          console.error("Error in removeDebit:", error);
        }
      };

      const totals = useMemo(()=>calculateTotal(), [lists])
    return (
        <>
        <DebitDialog
                open={open}
                inputValue={inputValue}
                setInputValue={setInputValue}
                inputDate={inputDate}
                setInputDate={setInputDate}
                inputCheck={inputCheck}
                setInputCheck={setInputCheck}
                handleClose={handleClose}
                handleSave={handleSave}
              ></DebitDialog>
              <BalanceHistoryDialog
                open={historyDialogOpen}
                debits={balance}
                onClose={()=>setHistoryDialogOpen(false)}
                onRemove={handleRemoveDebitClick}
                />
            <Grid container>
            {!isLoggedIn && <Navigate to="/login"/>}

                <Grid item xs={12} sx={{marginBottom: '15px'}}>
                    <NavBar/>
                </Grid>
                <Grid item xs={12}>
                    <Grid container justifyContent="center" spacing={8} >
                        <Grid item xl={2}>
                            <CardComponent textColor="green" text="Waiting for payment" 
                            amount={totalPrice.toLocaleString('en-US').replace(/,/g, ' ') + " AED"}
                            //@ts-ignore
                            button={
                                <StyledGenerateCashOrderButton
                                    onClick={handleDownloadCashOrder}
                                >
                                    Generate cash order
                                </StyledGenerateCashOrderButton>
                            }
                            />
                            <CardComponent textColor="red" text="Cash order(Rough)" 
                            amount={roughTotalPrice.toLocaleString('en-US').replace(/,/g, ' ') + " AED"}/>
                        </Grid>
                        <Grid item xl={2}>
                            <CardComponent textColor="orange" text="Projects in work" amount={lists.length}/>
                            <CardComponent textColor="green" text="Current balance"
                             amount={
                             <BalanceCardContent
                                historyAction={() => setHistoryDialogOpen(true)}
                                balance={current}
                                action={handleClickOpen}
                             />
                             }/>
                        </Grid>
                        <Grid item xl={2}>
                            <CardComponent textColor="orange" text="Materials in work" amount={notDoneTasksCount}/>
                            <CardComponent textColor="orange" text="Saved materials" amount={materialsCount} 
                            //@ts-ignore
                            button={
                                <StyledGenerateCashOrderButton
                                    onClick={handleViewSavedMaterials}
                                >
                                    View materials
                                </StyledGenerateCashOrderButton>
                            }
                            />
                        </Grid>
                        
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container >
                        <Grid item xs={12} sx={{margin: '25px auto 10px auto'}}>
                            <Typography textAlign="center" color="#ffffff" variant="h4">
                                Projects in work
                            </Typography>
                        </Grid>
                        <Grid item xs={10} sx={{margin: '10px auto'}}>
                        <TableListsComponent lists={lists} isArchive={false} onUpload={onUpload}/>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container >
                        <Grid item xs={12} sx={{margin: '25px auto 10px auto'}}>
                            <Typography textAlign="center" color="#ffffff" variant="h4">
                                Projects in archive
                            </Typography>
                        </Grid>
                        <Grid item xs={10} sx={{margin: '10px auto'}}>
                            <TableListsComponent lists={archive} isArchive={true} onUpload={onUpload}/>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>

        </>
    )

}

export default memo(DashboardPage)

