import React, { useState, useEffect, memo } from 'react';
import Cookies from 'js-cookie';
import { getDepartments } from '../api/projects-api'; // Assuming you have an API utility to fetch departments
import { Select, MenuItem } from '@mui/material';
import { eventEmitter } from '../state/EventEmitter';
import { useGetDepartmentsQuery } from '../store/api/departmentsApi';

function DepartmentSelector() {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const {data: departments} = useGetDepartmentsQuery()
  useEffect(() => {
    if (departments) {
      const departmentInCookies = localStorage.getItem('selectedDepartment');
      if (departmentInCookies) {
        setSelectedDepartment(departmentInCookies);
      } else {
        localStorage.setItem('selectedDepartment', departments[0].name);
        setSelectedDepartment(departments[0].name);
      }
    }
  }, [departments]);


  const handleDepartmentChange = (event) => {
    const newDepartment = event.target.value;
    setSelectedDepartment(newDepartment);
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
        <MenuItem key={index} value={d.name}>
          {d.name}
        </MenuItem>
      ))}
    </Select>
  );
}

export default memo(DepartmentSelector);
