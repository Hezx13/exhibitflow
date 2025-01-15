import React, {useEffect, useState, useRef, memo, useCallback, useMemo} from 'react';
import Box from '@mui/material/Box';

import {findItemIndexById} from "../utils/arrayUtils";
import { Status, AddItemButton } from '../styles/styles';
import {addTask, editTask, moveFromArchive, removeTask} from "../state/actions";
import { getCurrentDateAndTime } from "../utils/timeUtils";
import {AddNewItem} from "./AddNewItem";
import { getUserData, getUsers } from '../api/user-api';
import { onUploadSingle } from '../api';

import {
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridRenderEditCellParams,
} from '@mui/x-data-grid';
import EditToolbar from './DataGridComponents/EditToolBar';
import { useAppState } from '../state/AppStateContext';
import { MenuItem, Select, TextField } from '@mui/material';
import NoDataPlaceholder from './DataGridComponents/NoDataPlaceholder';
import dayjs from 'dayjs';
import { useSocket } from '../state/socketContext';
import { eventEmitter } from '../state/EventEmitter';
import { renderColumns , userColumns } from './DataGridComponents/GridColLayout';

function FullFeaturedCrudGrid({tableId, userData, users}) {
  const [rows, setRows] = React.useState<Task[]>([]);
  const [isSaving, setIsSaving] = React.useState(false)
  const [isOccupied, setIsOccupied] = useState<boolean>(false)
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const { lists, archive,role, dispatch } = useAppState()
  const fileInput = useRef<HTMLInputElement>(null);
  const socket = useSocket();
  
  useEffect(() => {
    
        const id_a = findItemIndexById(archive, tableId)
        const id_l =  findItemIndexById(lists, tableId)
        if (id_a > -1){
            setRows(archive[id_a].tasks)
        }
        else if (id_l > -1) {
            setRows(lists[id_l].tasks)
            
            
        }
      
    }, [lists]);

    const handleUserInProject = useCallback((data) => {
        const list = data;
        console.log(list)
        Object.keys(list).forEach(key => {
          if (key === userData._id){
            delete list[key];
          }
        })
        console.log(list)
        setIsOccupied(Object.values(list).includes(tableId));
      }, [])

    useEffect(() => {
      
      
      if (socket) {
        //@ts-expect-error
        socket?.emit(
          "selected_project",
        {
        id: tableId,
        user: localStorage.getItem('token')
      } )
        //@ts-expect-error
        socket?.emit('send_users_in_project')
        //@ts-expect-error
        socket.on('user_in_project', handleUserInProject);
    
        // Return a cleanup function
        return () => {
          //@ts-expect-error
          socket.off('user_in_project', handleUserInProject);
        };
      }
    
      // If no socket is provided, return an empty cleanup function
      return () => {};
    }, [socket]);

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setIsSaving(true);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId, row: GridRowModel) => () => {
    const shouldRemove = window.confirm("Are you sure you want to remove " + row.text + " ?" );

    if (shouldRemove) {
      dispatch(removeTask(tableId, id as string));
      setRows(rows.filter((row) => row.id !== id));
  }
    
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const handleUploadClick = () => {
    fileInput.current!.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    file && onUploadSingle(file, tableId)
};

  const processRowUpdate = (newRow: GridRowModel) => {
    setIsSaving(true);
    const updatedRow = { ...newRow};
    dispatch(editTask(
      newRow.id,
      tableId,
      newRow.text,
      newRow.article,
      newRow.price,
      newRow.quantity,
      new Date(newRow.date),
      newRow.unit,
      newRow.comment,
      new Date(newRow.deliveryDate),
      newRow.orderedBy,
      newRow.status,
      newRow.payment
      ))
      let newrows = rows.map((row) => (row.id === newRow.id ? updatedRow : row)) as Task[]
      //@ts-expect-error
      socket?.emit('send_updated_materials', {projectId: tableId, material: updatedRow})
    setRows(newrows);
    setIsSaving(false);
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const hasArticle = rows.some(row => row.article !== '');

  const articleColumn: GridColDef = {
    field: 'article',
    headerName: 'Article №',
    type: 'string',
    minWidth: 150,
    flex: 1,
    align: 'left',
    headerAlign: 'left',
    editable: true,
  }


  const columns = useMemo(()=>renderColumns({rowModesModel, handleCancelClick, handleSaveClick, handleEditClick, handleDeleteClick, isSaving, users}), [])

  const formattedColumns = role === 'Admin' ? 
  hasArticle ? [...columns.slice(0, 1), articleColumn,...columns.slice(1),] : 
  columns : 
  hasArticle ? [...userColumns.slice(0, 1), articleColumn, ...userColumns.slice(1), ] : 
  userColumns


  return (
    <Box
      sx={{
        borderRadius: '10px',
        border: '1px solid orange',
        padding: '1px',
        height: 'auto',
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >
      
      {
        rows.length > 0 ? (
          <DataGrid
        rows={rows || []}
        columns={formattedColumns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: EditToolbar,
        }}
        checkboxSelection
        disableRowSelectionOnClick 
        slotProps={{
          toolbar: { dispatch, tableId, userData, setRowModesModel, isOccupied },
        }}
      />
        ) : (
          <NoDataPlaceholder>
            <AddNewItem
            toggleButtonText="+ Add another material"
            onAdd={
              (text,article, price, quantity, unit, comment, deliveryDate, orderedBy) => {
                  dispatch(moveFromArchive(tableId))
                  dispatch(addTask(text, 
                    tableId, 
                    article || '',
                    price || '0', 
                    quantity || 1, 
                    getCurrentDateAndTime(), 
                    unit || 'pcs', 
                    comment || "",
                    deliveryDate ? new Date(deliveryDate) : getCurrentDateAndTime(), 
                    userData?.username || 'Anonymus', "Pending", ""))
              }
          }
          />
          <AddItemButton onClick={handleUploadClick} dark excel>
              Excel import
          </AddItemButton>
          <input
              type="file"
              ref={fileInput}
              style={{ display: 'none' }}
              onChange={handleFileChange}
          />
          </NoDataPlaceholder>
        )
      }
      
    </Box>
  );
}

export default FullFeaturedCrudGrid