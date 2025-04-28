import { useEffect, memo } from 'react';
import { Select, MenuItem } from '@mui/material';
import { eventEmitter } from '../state/EventEmitter';
import { useGetDepartmentsQuery } from '../store/api/departmentsApi';
import { useAppSelector, useAppDispatch } from '../store';
import { setDepartment } from '../store/slices/authSlice';

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
    console.log('newDepartment', newDepartment);
    dispatch(setDepartment(newDepartment));
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
