import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {Typography, Grid} from '@mui/material';
import Box from '@mui/material/Box';
import {useAppState} from "../state/AppStateContext";
import TableComponent from "../components/tableComponent";
import NavBar from "../components/navBar";
import {addList} from "../state/actions";
import {AddNewItem} from "../components/AddNewItem";
import {StyledTab} from "../styles/styles";
import useMediaQuery from '@mui/material/useMediaQuery';
import { Navigate } from 'react-router-dom';



interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 1, width: '100%' }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export default function ArchivePage() {
    const {archive, getTasksByListId, getTasksByArchiveId, dispatch } = useAppState()
    const matches = useMediaQuery('(max-width:1280px)');

    const [value, setValue] = React.useState(0);
    const [isLoggedIn] = React.useState(!!localStorage.getItem('token'));

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleOnAdd = (text) => {
        
    }

    return (
        <Grid container>
            {!isLoggedIn && <Navigate to="/login"/>}
                <Grid item xs={12}>
                    <NavBar/>
                </Grid>
                <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {matches && 
            <Box
            sx={{bgcolor: 'background.paper', height: 'auto', borderRadius: '12px'}}
        >
            <Tabs
                orientation="horizontal"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                sx={{ borderRight: 1, borderColor: 'divider'}}
            >
                {archive.map((list, index)=>(
                    list.tasks.some((task)=>(task.status==="Pending" || task.status==='' || !task.status)) ?
                    <StyledTab label={list.text} {...a11yProps(index)} /> :
                        <Tab label={list.text} {...a11yProps(index)} />
                    )
                )}
                
                <AddNewItem
                    toggleButtonText="+ Add another project"
                    onAdd={(text) => dispatch(addList(text, localStorage.getItem('selectedDepartment') || 'Messe'))}   
                    list
                />
            </Tabs>
            <Box
                sx={{bgcolor: 'background.paper'}}
            >
            {archive.map((list, index)=>(
                <TabPanel value={value} index={index}>
                    <TableComponent tableId={list.id}/>
                </TabPanel>
            ))}
        </Box>
        </Box>
            }

        {!matches && <Box
                sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 'auto', borderRadius: '12px', width: '100%'}}
            >
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{ borderRight: 1, borderColor: 'divider',maxWidth: '200px'  }}
                >
                    {archive.map((list, index)=>(
                        list.tasks.some((task)=>(task.status==="Pending" || task.status==='' || !task.status)) ?
                        <StyledTab label={list.text} {...a11yProps(index)} /> :
                            <Tab label={list.text} {...a11yProps(index)} />
                        )
                    )}
                    
                </Tabs>
                <Box
                    sx={{ flexGrow: 1, bgcolor: 'background.paper'}}
                >
                {archive.map((list, index)=>(
                    <TabPanel value={value} index={index}>
                        <TableComponent tableId={list.id}/>
                    </TabPanel>
                ))}
            </Box>
            </Box>}
        </Box>

                </Grid>
            </Grid>
        
    );
}