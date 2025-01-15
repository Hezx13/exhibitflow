import React, { useState, useEffect, memo } from 'react';
import Cookies from 'js-cookie';
import { getDepartments } from '../api/projects-api'; // Assuming you have an API utility to fetch departments
import { Select, MenuItem } from '@mui/material';
import { eventEmitter } from '../state/EventEmitter';

function DepartmentSelector() {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  useEffect(() => {
    fetchDepartments().then((departments)=>{
      setDepartments(departments)
      const departmentInCookies = localStorage.getItem('selectedDepartment');
      if (departmentInCookies) {
        setSelectedDepartment(departmentInCookies);
      } else {
          localStorage.setItem('selectedDepartment', departments[0].name);
          setSelectedDepartment(departments[0].name)
      }
    })
    
  }, []);

  const fetchDepartments = async () => {
    try {
      const deps = await getDepartments(); // Assuming this fetches an array of departments
      return deps;
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleDepartmentChange = (event) => {
    const newDepartment = event.target.value;
    setSelectedDepartment(newDepartment);
    localStorage.setItem('selectedDepartment', newDepartment);
    eventEmitter.emit('changedDepartment');
  };

  return (

    <Select
        size='small'
          labelId="depSelectorLabel"
          id="depSelector"
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          label=""
        >
            {
                departments.map((d, index) => (
                    <MenuItem key={index} value={d.name}>
                      {d.name}
                    </MenuItem>
                  ))
            }
        </Select>

  );
}

export default memo(DepartmentSelector);
