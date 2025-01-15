import Cookies from 'js-cookie';
import http from './http';

export const addBalance = async (debit) => {
  const res = await http.post(`/balance/add_balance`, debit, {});
  return res.status;
};

export const removeBalance = async (debit) => {
  const res = await http.post(`/balance/remove_balance`, debit, {});
  return res.status;
};

export const loadBalance = async () => {
  try {
    const res = await http.get(`/balance/balance`, {
      params: { department: localStorage.getItem('selectedDepartment') },
      headers: {
        Accept: 'application/json',
      },
    });
    return res.data;
  } catch (err: any) {
    console.error(err.message);
  }
};

export const currentBalance = async () => {
  try {
    const res = await http.get(`/balance/currentBalance`, {
      params: {
        department: localStorage.getItem('selectedDepartment'),
      },
      headers: {
        Accept: 'application/json',
      },
    });
    return res.data;
  } catch (err: any) {
    console.error(err.message);
  }
};

export const generateCashOrder = async () => {
  try {
    const response = await http({
      method: 'GET',
      params: { department: localStorage.getItem('selectedDepartment') },
      url: `/balance/generateCashOrder`,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CashOrder${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();

    return response.status; // Return the status if successful
  } catch (error) {
    console.error('Error downloading the cash order:', error);
    return new Error(); //
  }
};
