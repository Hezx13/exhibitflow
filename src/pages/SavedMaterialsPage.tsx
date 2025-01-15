import { useEffect, useState, useMemo, ReactNode } from "react";
import { Autocomplete, Box, Grid, IconButton, MenuItem, Paper, Popover, Popper, Select, TextField, Typography } from "@mui/material";
import { Navigate } from "react-router-dom";
import NavBar from "../components/navBar";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { editMaterial, getCategories, getSavedMaterials, getSuppliers } from "../api/materials-api";
import SavedMaterialsToolbar from "../components/DataGridComponents/SavedMaterialsToolbar";
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PhoneEnabledOutlinedIcon from '@mui/icons-material/PhoneEnabledOutlined';
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { lightBlue } from "@mui/material/colors";
export default function SavedMaterialsPage() {
    const [isLoggedIn] = useState(!!localStorage.getItem('token'));
    const [materials, setMaterials] = useState<Material[]>([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [value, setValue] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const infoCells = ['supplier', 'listParent']
    useEffect(() => {
        getSavedMaterials().then((savedMaterials) => {
            setMaterials(savedMaterials);
        })
        getCategories().then((categories) => {
          setCategories(categories);
        })
        getSuppliers().then((suppliers) => {
          setSuppliers(suppliers);
        })
    },[])

    const handleProcessRowUpdate = async (newRow) => {
      await editMaterial(newRow);
      setMaterials(materials.map((material) => material.id === newRow.id? newRow : material))
      return newRow
  };
  

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (open){
      handlePopoverClose()
      return
    }
    const field = event.currentTarget.dataset.field!;
    if (!infoCells.includes(field)){
        handlePopoverClose()
       return;
      }
    const id = event.currentTarget.parentElement!.dataset.id!;
    const row = materials.find((r) => r.id === id)!;
    setValue(row[field]);
    setAnchorEl(event.currentTarget)
    setOpen(true);
  };

  const handleOpenSupplierDetails = (supplier) => {
    setValue(supplier);
  } 

  const handlePopoverClose = () => {
    setOpen(false);
    setAnchorEl(null);
    setValue(null);
  };

    let columns: GridColDef[] = [
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
        field: 'article',
        headerName: 'Article №',
        type: 'string',
        minWidth: 150,
        flex: 1,
        align: 'left',
        headerAlign: 'left',
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
        field: 'unit',
        headerName: 'Unit',
        flex: 1,
        minWidth: 80,
        editable: true,
        type: 'string',
      },
      {
        field: 'supplier',
        headerName: 'Supplier',
        minWidth: 80,
        flex: 2,
        editable: true,
        type: 'singleSelect',
        valueGetter: (params) => params.row.supplier?.name,
        renderCell: (params) => (
          <div style={{cursor: 'pointer'}} onClick={handlePopoverOpen}>
            {params.row.supplier?.name}
          </div>
        ),
        renderEditCell: (params) =>(
          <Select
            value={params.row.supplier}
            onChange={(event) => {
              params.api.setEditCellValue({ id: params.id, field: params.field, value: event.target.value }, event);
            }}
            fullWidth
          >
            {
              suppliers.map((option) => (
                <MenuItem key={option._id} value={option}>
                  {option.name}
                </MenuItem>
              ))
            }
          </Select>
        )
      },
      {
        field: 'category',
        headerName: 'Category',
        minWidth: 80,
        flex: 2,
        editable: true,
        type: 'string',
        renderEditCell: (params) => (
        <Autocomplete
        freeSolo
        sx={{ width: '100%', zIndex: 10 }}
        value={params.value}
        options={categories}
        onChange={(event, newValue) => {
          params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue }, event);
        } }
        renderInput={(params) => <TextField {...params} />} 
      />
        ),
      },
      {
          field: 'listParent',
          headerName: 'Project',
          minWidth: 80,
          flex: 2,
          editable: false,
          type: 'string',
          valueGetter: (params) => params.row.listParent[0].name,
          renderCell: (params) => (
            <div style={{cursor: 'pointer'}}>  
              {params.row.listParent[0].name}
            </div>
          ),
        },
        {
          field: 'comment',
          headerName: 'Comment',
          minWidth: 80,
          flex: 2,
          editable: true,
          type: 'string',
        },
  ]


    return (
        <Grid container>
            {!isLoggedIn && <Navigate to="/login"/>}

                <Grid item xs={12} sx={{marginBottom: '15px'}}>
                    <NavBar/>
                </Grid>
                {
                    materials.length && <DataGrid
                    onCellEditStart={handlePopoverClose}
                    onCellEditStop={handlePopoverClose}
                    onCellModesModelChange={handlePopoverClose}
                    rows={materials}
                    columns={columns}
                    checkboxSelection
                    disableRowSelectionOnClick 
                    processRowUpdate={handleProcessRowUpdate}
                    onProcessRowUpdateError={error => console.error(error)}
                    slots={{
                      toolbar: SavedMaterialsToolbar,
                    }}
                    slotProps={{
                      cell: {
                        onClick: handlePopoverOpen
                      },
                    }}
                    
                />
                }
                <Popper 
                  sx={{
                    zIndex: 100
                  }}
                  open={open}
                  anchorEl={anchorEl}
                  placement="bottom"
                  disablePortal
                  // onClose={handlePopoverClose}
                >
                  <ClickAwayListener onClickAway={handlePopoverClose}>

                {
                  anchorEl?.getAttribute('data-field') === 'supplier' ?
                  <Paper>
                    <Typography variant="body2" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center'}}>
                       <CategoryOutlinedIcon color="primary" fontSize="small"/> {value?.category}
                    </Typography>
                    <Typography variant="body2" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center'}}>
                      <PhoneEnabledOutlinedIcon color="primary" fontSize="small"/> {value?.phone}
                    </Typography>
                    <Typography variant="body2" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center'}}>
                      <AlternateEmailOutlinedIcon color="primary" fontSize="small"/> {value?.email}
                    </Typography>
                    <Typography variant="body2" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center'}}>
                      <LanguageOutlinedIcon color="primary" fontSize="small"/>{value?.web}
                    </Typography>
                  </Paper> 
                  :
                  <Paper>
                    
                    {Array.isArray(value) && value?.map(v=>
                      <Typography variant="body2" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center'}}>
                       {v.name}
                      </Typography>
                    )}
                  </Paper>
                }
                </ClickAwayListener>
                </Popper >
                </Grid>
    )
}