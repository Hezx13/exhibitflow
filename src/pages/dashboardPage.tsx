import { useState, memo } from 'react';
import { Grid2 as Grid, CircularProgress, TextField, Stack, Skeleton } from '@mui/material';
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
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { PurchaseStatsChart } from '../components/PurchaseStatsChart';

interface CardData {
  id: string;
  textColor?: string;
  text: string;
  secondaryText?: string;
  amount?: number | string;
  icon?: React.ReactNode;
  button?: React.ReactNode;
  getAmount?: (data: any) => string | number;
}

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

  const cardData: CardData[] = [
    {
      id: 'waiting-payment',
      textColor: 'success',
      text: 'Waiting for payment',
      secondaryText: 'AED',
      icon: <PaymentRoundedIcon />,
      getAmount: (data) => data?.total.toLocaleString('en-US').replace(/,/g, ' '),
      button: (
        <IconButton onClick={handleDownloadCashOrder}>
          <RequestQuoteRoundedIcon />
        </IconButton>
      ),
    },
    {
      id: 'cash-order',
      textColor: 'error',
      text: 'Cash order(Rough)',
      secondaryText: 'AED',
      getAmount: (data) => data?.totalRough?.toLocaleString('en-US').replace(/,/g, ' '),
      icon: <ReceiptRoundedIcon />,
    },
    {
      id: 'projects',
      text: 'Projects in work',
      icon: <EngineeringRoundedIcon />,
      getAmount: () => lists?.length,
    },
    {
      id: 'current-balance',
      textColor: current && current > 0 ? 'success' : 'error',
      secondaryText: 'AED',
      amount: current ? current.toFixed(2) : 0,
      text: 'Current balance',
      icon: <AccountBalanceRoundedIcon />,
      button: (
        <Stack direction="row" gap={0.5}>
          <IconButton onClick={() => setHistoryDialogOpen(true)}>
            <ReceiptLongRoundedIcon />
          </IconButton>
          <IconButton color="success" onClick={handleClickOpen}>
            <AddCardIcon />
          </IconButton>
        </Stack>
      ),
    },
    {
      id: 'materials-work',
      text: 'Materials in work',
      getAmount: () => notDoneTasksCount,
    },
    {
      id: 'saved-materials',
      icon: <SaveRoundedIcon />,
      amount: materialsCount,
      text: 'Saved materials',
      getAmount: () => materialsCount,
      button: (
        <IconButton onClick={handleViewSavedMaterials}>
          <ArrowForwardRoundedIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Stack direction="column" gap={2}>
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
      {!isLoggedIn && <Navigate to="/login" />}
      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        {cardData.map((card) => (
          <Grid key={card.id} size={{ xs: 12, sm: 6, md: 4 }}>
            {totalsLoading ? (
              <Skeleton variant="rectangular" height={94} />
            ) : (
              <CardComponent
                textColor={card.textColor}
                text={card.text}
                secondaryText={card.secondaryText}
                icon={card.icon}
                amount={card.getAmount?.(totals) ?? card.amount}
                //@ts-ignore
                button={card.button}
              />
            )}
          </Grid>
        ))}
      </Grid>
      <PurchaseStatsChart />
    </Stack>
  );
};

export default memo(DashboardPage);
