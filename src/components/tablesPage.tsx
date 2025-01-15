import {FC, useEffect, useState} from 'react';
import TableComponent from "./tableComponent";
import { useLocation } from 'react-router-dom';
import {Grid} from "@mui/material";
import NavBar from './navBar'
import FullFeaturedCrudGrid from './DataGridComponent';
import { useUser } from '../state/userContext';

const TablesPage: FC = () => {
    const location = useLocation();
    const {currentUser, users} = useUser()
    
    const receivedData = location.state?.myData || 0;
    return(
        <>
            <Grid container>
                <Grid item xs={12}>
                    <NavBar/>
                </Grid>
                <Grid item xs={12}>
                    <FullFeaturedCrudGrid
                        tableId={receivedData}
                        userData={currentUser}
                        users={users}
                    />
                </Grid>

            </Grid>

        </>
    )
}

export default TablesPage;