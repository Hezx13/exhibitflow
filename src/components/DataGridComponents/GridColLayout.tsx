import { Select, MenuItem } from "@mui/material";
import { GridColDef, GridRenderEditCellParams, GridRowModes, GridActionsCellItem } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { Status } from "../../styles/styles";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import EditIcon from '@mui/icons-material/Edit';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import HourglassBottomOutlinedIcon from '@mui/icons-material/HourglassBottomOutlined';

const statuses = ["Done", "In process", "Waiting for approval", "Waiting for payment", "Pending"]
const payments = ["Cash", "Credit", "Pemo Card", "Bank Transfer", ""]


export let renderColumns = (props): GridColDef[] => [
    { 
    field: 'date', 
    headerName: 'Date ordered', 
    width: 160, 
    editable: false,
    valueGetter: (params) => {
      // Convert the date from the ISO format to DD-MM-YY
      const valueFormatted = params.value ? dayjs(params.value).format('DD-MM-YYYY HH:MM') : '';
      return valueFormatted;
    },
  },
    {
      field: 'text',
      headerName: 'Material',
      type: 'string',
      minWidth: 150,
      flex: 4,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      type: 'number',
      align: 'left',
      headerAlign: 'left',
      minWidth: 80,
      flex: 1,
      editable: true,
    },
    {
      field: 'price',
      headerName: 'Price',
      type: 'string',
      minWidth: 80,
      flex: 1,
      editable: true,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      type: 'number',
      minWidth: 80,
      flex: 1,
      valueGetter: (params) => {
        const value1 = params?.row.quantity || 1;
        const value2 = params.row.price || 0;
        return Number(value1) * Number(value2) || null;
      },
    },
    {
      field: 'unit',
      headerName: 'Unit',
      flex: 1,
      minWidth: 80,
      editable: true,
      type: 'string',
    },
    {
      field: 'comment',
      headerName: 'Invoice / Note',
      minWidth: 80,
      flex: 2,
      editable: true,
      type: 'string',
    },
    {
      field: 'deliveryDate',
      headerName: 'Delivered',
      minWidth: 80,
      flex: 2,
      editable: true,
      renderEditCell: (params) => {
        return (
            <DatePicker
              value={dayjs(new Date(params.value))}
              onChange={(newValue) => {
                const formattedValue = newValue ? dayjs(newValue) : newValue;

                params.api.setEditCellValue({ id: params.id, field: params.field, value: formattedValue });
              }}
            />
        );
      },
      renderCell: (params) => {
        const valueFormatted = params.value ? dayjs(params.value).format('DD-MM-YYYY') : null;
        return valueFormatted;
      },
      type: 'string'
    },
    {
      field: 'orderedBy',
      headerName: 'Ordered by',
      minWidth: 80,
      flex: 2,
      editable: true,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <Select
          value={params.value || ''}
          onChange={(event) => {
            params.api.setEditCellValue({ id: params.id, field: params.field, value: event.target.value }, event);
          }}
          fullWidth
        >
          {props.users.map((usr) => (
            <MenuItem key={usr.email} value={usr.username}>
              {usr.username}
            </MenuItem>
          ))}
        </Select>
      ),
      type: 'string',
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 80,
      flex: 2,
      editable: true,
      renderCell: (params) => {
        const color = params.value === 'Done' ? 'green'
                      : params.value === 'Waiting for approval' ? 'blue'
                      : params.value === 'In process' ? 'orange'
                      : params.value === 'Waiting for payment' ? 'red'
                      : 'grey';
        return   <div style={{ display: 'flex', alignItems: 'center' }}>

        <Status color={color}></Status>
        <div>{params.value}</div>
        </div>
      },
      renderEditCell: (params: GridRenderEditCellParams) => (
        <Select
          value={params.value || ''}
          onChange={(event) => {
            params.api.setEditCellValue({ id: params.id, field: params.field, value: event.target.value }, event);
          }}
          fullWidth
        >
          {statuses.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      ),
      type: 'singleSelect',
    },
    {
      field: 'payment',
      headerName: 'Payment',
      width: 100,
      editable: true,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <Select
          value={params.value || ''}
          onChange={(event) => {
            params.api.setEditCellValue({ id: params.id, field: params.field, value: event.target.value }, event);
          }}
          fullWidth
        >
          {payments.map((option) => (
            <MenuItem key={option} value={option}>
              {option === "" ? 'Not paid' : option}
            </MenuItem>
          ))}
        </Select>
      ),
      type: 'string',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
       cellClassName: 'actions',
      getActions: ({ id, row }) => {
        const isInEditMode = props.rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode)
          return [
            <GridActionsCellItem
              icon={ props.isSaving ? <HourglassBottomOutlinedIcon/> : <SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={props.handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={props.handleCancelClick(id)}
              color="inherit"
            />,
          ];
          return [
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              className="textPrimary"
              onClick={props.handleEditClick(id)}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={props.handleDeleteClick(id, row)}
              color="inherit"
            />,
          ];
      },
    },
  ];

export const userColumns: GridColDef[] = [
    { field: 'date', 
    headerName: 'Date ordered', 
    width: 160, 
    editable: false,
    valueGetter: (params) => {
      let date = dayjs(params.value).format('DD-MM-YYYY HH:MM');
      return date === 'Invalid Date'? '' : date;
    },
   },
    {
      field: 'text',
      headerName: 'Material',
      type: 'string',
      minWidth: 150,
      flex: 4,
      align: 'left',
      headerAlign: 'left',
      editable: false,
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      type: 'number',
      align: 'left',
      headerAlign: 'left',
      minWidth: 80,
      flex: 1,
      editable: false,
    },
    {
      field: 'price',
      headerName: 'Price',
      type: 'string',
      minWidth: 80,
      flex: 1,
      editable: false,
    },
    {
      field: 'comment',
      headerName: 'Comment',
      type: 'string',
      minWidth: 80,
      flex: 1,
    },
    {
      field: 'unit',
      headerName: 'Unit',
      flex: 1,
      minWidth: 80,
      editable: false,
      type: 'string',
    },
    {
      field: 'deliveryDate',
      headerName: 'Delivered',
      minWidth: 80,
      flex: 2,
      editable: false,
      type: 'string',
      valueGetter: (params) => {
        let date = dayjs(params.value).format('DD-MM-YYYY');
        return date === 'Invalid Date'? '' : date;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 80,
      flex: 2,
      editable: false,
      renderCell: (params) => {
        const color = params.value === 'Done' ? 'green'
                      : params.value === 'Waiting for approval' ? 'blue'
                      : params.value === 'In process' ? 'orange'
                      : params.value === 'Waiting for payment' ? 'red'
                      : 'grey';
        return   <div style={{ display: 'flex', alignItems: 'center' }}>

        <Status color={color}></Status>
        <div>{params.value}</div>
        </div>
      },
      renderEditCell: (params: GridRenderEditCellParams) => (
        <Select
          value={params.value || ''}
          onChange={(event) => {
            params.api.setEditCellValue({ id: params.id, field: params.field, value: event.target.value }, event);
          }}
          fullWidth
        >
          {statuses.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      ),
      type: 'singleSelect',
    }
  ];