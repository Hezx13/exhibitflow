import { useEffect, memo } from 'react';
import { Select, MenuItem } from '@mui/material';
import { eventEmitter } from '../state/EventEmitter';
import { useGetDepartmentsQuery } from '../store/api/departmentsApi';
import { useAppSelector, useAppDispatch } from '../store';
import { setDepartment } from '../store/slices/authSlice';
import { libraryApi } from '../store/api/libraryApi';
import { listsApi } from '../store/api/listsApi';
import { documentsApi } from '../store/api/documentsApi';

function DepartmentSelector() {
  const selectedDepartment = useAppSelector((state) => state.auth.department);
  const dispatch = useAppDispatch();
  const { data: departments } = useGetDepartmentsQuery();
  useEffect(() => {
    if (departments) {
      if (!selectedDepartment) {
        dispatch(setDepartment(departments[0].name));
      }
    }
  }, [departments]);

  const handleDepartmentChange = (event) => {
    const newDepartment = event.target.value;
    dispatch(setDepartment(newDepartment));
    dispatch(libraryApi.util.invalidateTags(['Library']));
    dispatch(listsApi.util.invalidateTags(['Lists']));
    dispatch(documentsApi.util.invalidateTags(['Document', 'DocumentsSidebar']));
    localStorage.setItem('selectedDepartment', newDepartment);
    eventEmitter.emit('changedDepartment');
  };

  return (
    <Select
      size="small"
      labelId="depSelectorLabel"
      id="depSelector"
      value={selectedDepartment}
      onChange={handleDepartmentChange}
      label=""
    >
      {departments?.map((d, index) => (
        <MenuItem key={index} value={d._id}>
          {d.name}
        </MenuItem>
      ))}
    </Select>
  );
}

export default memo(DepartmentSelector);
