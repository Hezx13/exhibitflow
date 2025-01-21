import http from './http';

export const getDepartments = async () => {
  try {
    const response = await http.get('/department');
    return response.data;
  } catch (error: any) {
    console.error('Error while fetching departments data:', error.response || error);
    throw new Error('Error while fetching departments data.');
  }
};

export const addDepartment = async (name: string) => {
  try {
    const response = await http.post('/department', {
      name: name,
    });
    return response.status;
  } catch (error: any) {
    console.error('Error while adding department:', error.response || error);
    throw new Error('Error while adding department.');
  }
};

export const deleteDepartment = async (name: string) => {
  try {
    const response = await http.delete(`/department/${name}`);
    return response.status;
  } catch (error: any) {
    console.error('Error while deleting department:', error.response || error);
    throw new Error('Error while deleting department.');
  }
};
