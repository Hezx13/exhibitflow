import { Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Fab, Box, TablePagination, TableFooter } from '@mui/material';
import {useState, useEffect} from 'react';
import { StyledTableContainer } from '../styles/styles';
import { addDepartment, deleteDepartment, getDepartments } from '../api/projects-api';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';

const DepartmentsTable = () => {

    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [addingDepartment, setAddingDepartment] = useState<boolean>(false);
    const [newDepartmentName, setNewDepartmentName] = useState<string>("");

    const loadDepartments = async () => {
        getDepartments().then(departments => setDepartments(departments))
    }

    useEffect(()=>{
        loadDepartments();
    },[])

    const handleOpenAddField = () => {
        setAddingDepartment(prev => !prev)
    }

    const handleAddDepartment = async () => {
        if (newDepartmentName){
            await addDepartment(newDepartmentName);
            setAddingDepartment(false);
            loadDepartments();
            setNewDepartmentName("");
        }
    }

    const handleDeleteDepartment = async (name) => {
        await deleteDepartment(name);
        loadDepartments();
        setSelectedRow(null);
    }

    return (
        <Grid container>
            <StyledTableContainer 
            //@ts-ignore
            component={Paper}
            sx={{ maxHeight: 320 }}
            >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Department Name</TableCell>
                                <TableCell>Staff number</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            
                        {departments.map((row, index) => (
                            <TableRow
                            onClick={() => setSelectedRow(index)}
                            key={row.name}
                            sx={{ 
                                '&:last-child td, &:last-child th': { border: 0 },
                                boxShadow: selectedRow === index ? 'inset -5px 0px 0px 0px orange, inset 5px 0px 0px 0px orange' : '',
                                cursor: 'pointer',
                                position: 'relative', 
                                '&:hover': { background: '#303030' }
                            }}
                            >
                            <TableCell component="th" scope="row">
                                {row.name} &nbsp;
                            </TableCell>
                            
                            <TableCell component="th" scope="row">
                                {row.users?.length} &nbsp;
                            </TableCell>
                            
                            </TableRow>
                        ))}
                        {
                            addingDepartment &&
                            <TableRow>
                                <TableCell>
                                    <Box sx={{ '& > :not(style)': { m: 0.5 }, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>   
                                    <TextField 
                                    label="Department name" 
                                    value={newDepartmentName} 
                                    onChange={(e)=>setNewDepartmentName(e.target.value)}
                                    />
                                        <Fab disabled={!newDepartmentName.length} 
                                            onClick={handleAddDepartment}
                                            size="small" 
                                            color="success" 
                                            aria-label="add"
                                            
                                            >
                                            <DoneIcon />
                                        </Fab>
                                        <Fab 
                                        onClick={()=>setAddingDepartment(false)}
                                        size="small" color="error" aria-label="cancel">
                                            <ClearIcon />
                                        </Fab>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        }
                        <TableRow>

                            <TableCell colSpan={5}>
                            <div style={{
                            display:"flex", 
                            flexDirection:"row",
                            gap:10
                            }}>
                                <Button variant="outlined" onClick={handleOpenAddField}>Add Department</Button>

                                {
                                selectedRow !== null ? 
                                    <>
                                            <Button variant="outlined" 
                                            onClick={()=>handleDeleteDepartment(departments[selectedRow].name)}>Delete department</Button>
                                    </>: null
                                }   
                                </div>
                            </TableCell>
                        </TableRow>
                        </TableBody>
                    </Table>
            </StyledTableContainer>
            
        </Grid>
    )

};

export default DepartmentsTable;