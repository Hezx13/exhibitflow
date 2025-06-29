import { useEffect, memo } from 'react';
import { Box, Typography, MenuItem, List, ListItemText, ListItemButton } from '@mui/material';
import { eventEmitter } from '../state/EventEmitter';
import { useGetDepartmentsQuery } from '../store/api/departmentsApi';
import { useAppSelector, useAppDispatch } from '../store';
import { setDepartment } from '../store/slices/authSlice';
import { libraryApi } from '../store/api/libraryApi';
import { listsApi } from '../store/api/listsApi';
import { documentsApi } from '../store/api/documentsApi';
import { useGetUserDataQuery, usePatchUserMutation } from '../store/api/userApi';
import { useNavigate, useParams } from 'react-router-dom';
import { statisticsApi } from '../store/api/statisticsApi';
import { balanceApi } from '../store/api/balanceApi';

function DepartmentSelector() {
  const selectedDepartmentId = useAppSelector((state) => state.auth.department);
  const {id} = useParams();
  const [patchUser] = usePatchUserMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { departments, _id } = useGetUserDataQuery(undefined, {
    selectFromResult: ({ data }) => ({
      departments: data?.departments || [],
      _id: data?._id,
    }),
  });
  useEffect(() => {
    if (departments.length > 0 && !selectedDepartmentId) {
      const firstDepartment = departments[0];
      if (firstDepartment?._id) {
        dispatch(setDepartment(firstDepartment._id));
      }
    }
  }, [departments, selectedDepartmentId, dispatch, _id, patchUser]);

  const handleDepartmentChange = (departmentId: string) => {
    dispatch(setDepartment(departmentId));
    patchUser({
      _id: _id,
      selectedDepartment: departmentId,
    });
    dispatch(libraryApi.util.invalidateTags(['Library']));
    dispatch(listsApi.util.invalidateTags(['Lists']));
    dispatch(documentsApi.util.invalidateTags(['Document', 'DocumentsSidebar']));
    dispatch(statisticsApi.util.invalidateTags(['Statistics']));  
    dispatch(balanceApi.util.invalidateTags(['Balance']));
    if (id) {
      navigate('/');
    }
  };

  return (
    <Box sx={{ maxHeight: 200, overflowY: 'auto', width: '100%' }}>
      <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
        {departments.length > 1 ? 'Select Department' : 'Department'}
      </Typography>
      <List dense disablePadding>
        {departments.map((d) => (
          <ListItemButton
            key={d._id}
            selected={d._id === selectedDepartmentId}
            onClick={() => handleDepartmentChange(d._id)}
            sx={{ pl: 2,my: 0.125 }}
          >
            <ListItemText primary={d.name} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

export default memo(DepartmentSelector);
