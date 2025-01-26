import { useState, memo } from 'react';
import { Grid, CircularProgress, TextField } from '@mui/material';
import CardComponent from '../components/cardComponent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Navigate, useNavigate } from 'react-router-dom';
import DebitDialog from '../components/DebitDialog';
import AddCardIcon from '@mui/icons-material/AddCard';
import dayjs from 'dayjs';
import BalanceHistoryDialog from '../components/BalanceHistoryDialog';
import { StyledGenerateCashOrderButton } from '../styles/styles';
import {
  useAddBalanceMutation,
  useGetCurrentBalanceQuery,
  useGetTotalsQuery,
  useLazyGenerateCashOrderQuery,
  useLoadBalanceQuery,
  useRemoveBalanceMutation,
} from '../store/api/balanceApi';
import { useLoadListsQuery } from '../store/api/listsApi';
import { useSearchQuery } from '../store/api/searchApi';

const BalanceCardContent = ({ balance, action, historyAction }) => {
  return (
    <span
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <span
        style={{ color: balance > 0 ? 'green' : 'red', cursor: 'pointer' }}
        onClick={historyAction}
      >
        {balance ? balance.toFixed(2) + ' AED' : <CircularProgress color="primary" />}
      </span>
      <IconButton sx={{ padding: '0 5px' }} onClick={action}>
        <AddCardIcon htmlColor="green" />
      </IconButton>
    </span>
  );
};

export const DashboardPage = () => {
  const { data: lists } = useLoadListsQuery();
  const [notDoneTasksCount, setNotDoneTasksCount] = useState(0);
  const [isLoggedIn] = useState(!!localStorage.getItem('token'));
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [materialsCount, setMaterialsCount] = useState(0);
  const [inputDate, setInputDate] = useState('');
  const [inputCheck, setInputCheck] = useState('');
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [[addBalance], [removeBalance], [generateCashOrder]] = [
    useAddBalanceMutation(),
    useRemoveBalanceMutation(),
    useLazyGenerateCashOrderQuery(),
  ];
  const { data: totals, isLoading: totalsLoading } = useGetTotalsQuery();
  const [{ data: balance }, { data: current }] = [
    useLoadBalanceQuery(),
    useGetCurrentBalanceQuery(),
  ];

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    if (inputValue) {
      let data = {
        amount: Number(inputValue),
        date: dayjs(inputDate).toDate(),
        check: inputCheck,
        department: localStorage.getItem('selectedDepartment'),
      };
      try {
        await addBalance(data);
        setInputCheck('');
        setInputValue('');
        setInputDate('');
      } catch (err) {
        console.log(err);
      }
    }
    setOpen(false);
  };

  const handleDownloadCashOrder = async () => {
    const res = await generateCashOrder();
  };

  const handleViewSavedMaterials = () => {
    navigate('/saved');
  };

  const handleRemoveDebitClick = async (debit) => {
    try {
      await removeBalance(debit);
    } catch (error) {
      console.error('Error in removeDebit:', error);
    }
  };

  if (totalsLoading) return <CircularProgress />;

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
        onClose={() => setHistoryDialogOpen(false)}
        onRemove={handleRemoveDebitClick}
      />
      <Grid container>
        {!isLoggedIn && <Navigate to="/login" />}
        <Grid item xs={12}>
          <Grid container justifyContent="center" spacing={8}>
            <Grid item xl={2}>
              <CardComponent
                textColor="green"
                text="Waiting for payment"
                amount={totals?.total.toLocaleString('en-US').replace(/,/g, ' ') + ' AED'}
                //@ts-ignore
                button={
                  <StyledGenerateCashOrderButton onClick={handleDownloadCashOrder}>
                    Generate cash order
                  </StyledGenerateCashOrderButton>
                }
              />
              <CardComponent
                textColor="red"
                text="Cash order(Rough)"
                amount={totals?.totalRough?.toLocaleString('en-US').replace(/,/g, ' ') + ' AED'}
              />
            </Grid>
            <Grid item xl={2}>
              <CardComponent textColor="orange" text="Projects in work" amount={lists.length} />
              <CardComponent
                textColor="green"
                text="Current balance"
                amount={
                  <BalanceCardContent
                    historyAction={() => setHistoryDialogOpen(true)}
                    balance={current}
                    action={handleClickOpen}
                  />
                }
              />
            </Grid>
            <Grid item xl={2}>
              <CardComponent
                textColor="orange"
                text="Materials in work"
                amount={notDoneTasksCount}
              />
              <CardComponent
                textColor="orange"
                text="Saved materials"
                amount={materialsCount}
                //@ts-ignore
                button={
                  <StyledGenerateCashOrderButton onClick={handleViewSavedMaterials}>
                    View materials
                  </StyledGenerateCashOrderButton>
                }
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container>
            <Grid item xs={12} sx={{ margin: '25px auto 10px auto' }}></Grid>
            <Grid item xs={10} sx={{ margin: '10px auto' }}></Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default memo(DashboardPage);
