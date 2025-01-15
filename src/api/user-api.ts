import http from './http';
import { eventEmitter } from '../state/EventEmitter';
import { AxiosError } from 'axios';

export const login = async (credentials) => {
  try {
    const { username, password } = credentials;
    const response = await http.post(`/auth/login`, {
      username,
      password,
    });
    if (response.status === 200) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      eventEmitter.emit('login');
    }
    return response.status;
  } catch (err: any) {
    return err.response.status;
  }
};

export const register = async (credentials) => {
  const { username, password, email, department } = credentials;
  const response = await http.post(`/auth/register`, {
    username,
    password,
    email,
    department,
  });
  return response;
};

export const logout = async () => {
  localStorage.removeItem('token');
  window.location.reload();
};

export const getUserData = async () => {
  try {
    const response = await http.get('/user/user');
    return response.data;
  } catch (error: any) {
    console.error('Error while fetching user data:', error.response || error);
    throw new Error('Error while fetching user data.');
  }
};
export const getUsers = async () => {
  try {
    const response = await http.get('/user/users');
    return response.data;
  } catch (error: any) {
    console.error('Error while fetching user data:', error.response || error);
    throw new Error('Error while fetching user data.');
  }
};

export const approveUser = async (username) => {
  try {
    const response = await http.post('/auth/approveUser', {
      userToApprove: username,
    });
    return response.status;
  } catch (error) {
    throw new Error('Error while approving user ' + username);
  }
};

export const disapproveUser = async (username) => {
  try {
    const response = await http.post('/auth/disapproveUser', {
      userToApprove: username,
    });
    return response.status;
  } catch (error) {
    throw new Error('Error while disapproving user ' + username);
  }
};

export const deleteUser = async (username) => {
  try {
    const response = await http.post('/user/removeUser', {
      userToRemove: username,
    });
    return response.status;
  } catch (error) {
    throw new Error('Error while removing user ' + username);
  }
};

export const demoteUser = async (username) => {
  try {
    const response = await http.post('/user/demoteUser', {
      userToDemote: username,
    });
    return response.status;
  } catch (error) {
    throw new Error('Error while removing user ' + username);
  }
};

export const promoteUser = async (username) => {
  try {
    const response = await http.post('/user/promoteUser', {
      userToPromote: username,
    });
    return response.status;
  } catch (error) {
    throw new Error('Error while removing user ' + username);
  }
};

export const resetUserPassword = async (username) => {
  try {
    const response = await http.post('/user/resetUserPassword', {
      userToReset: username,
    });
    return response.status;
  } catch (error) {
    throw new Error('Error while removing user ' + username);
  }
};
