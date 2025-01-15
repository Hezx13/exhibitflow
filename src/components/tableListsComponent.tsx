import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
    Collapse,
    Box,
} from "@mui/material";
import {StyledTableContainer, SyledListButton, StyledTableCell} from "../styles/styles";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import {CardPriceText} from "../styles/textStyles";
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import {downloadExcel} from '../api'
import {moveToArchive, removeList} from "../state/actions";
import CloseIcon from "@mui/icons-material/Close";
import ArchiveIcon from '@mui/icons-material/Archive';
import {useAppState} from "../state/AppStateContext";
const ListRow = ({ list, index, isArchive }) => {
    const navigate = useNavigate();
    const {dispatch} = useAppState();
    const calculateTotal = () => {
        let _totalPrice = 0;
        list.tasks.forEach((task) => {
            const price = parseFloat(task.price);
            const quantity = task.quantity;
                _totalPrice += !Number.isNaN(price) ? price * quantity : 0;
        });
        return _totalPrice.toFixed(2)
    }
    const calculateDone = () => {
        let _totalPrice = 0;
        list.tasks.forEach((task) => {
            if (task.status === "Done") {
                const price = parseFloat(task.price);
                const quantity = task.quantity;
                _totalPrice += !Number.isNaN(price) ? price * quantity : 0;
            }
        });
        return _totalPrice.toFixed(2)
    }
    const calculateNotDone = () => {
        let _totalPrice = 0;
        list.tasks.forEach((task) => {
            if (task.status !== "Done") {
                const price = parseFloat(task.price);

                const quantity = task.quantity;
                _totalPrice += !Number.isNaN(price) ? price * quantity : 0;
            }
        });
        return _totalPrice.toFixed(2)
    }
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [totalPrice, setTotalPrice] =useState('')
    const [totalPriceDone, setTotalPriceDone] =useState('')
    const [totalPriceNotDone, setTotalPriceNotDone] =useState('')
    
    useEffect(()=>{
        setTotalPrice(calculateTotal());
        setTotalPriceDone(calculateDone());
        setTotalPriceNotDone(calculateNotDone())
    },[list])

    const handleExpandToTable = (id) =>{
        navigate('/table', { state: { myData: id } });
    }

    return (
        <>
            <TableRow sx={{backgroundColor: index % 2 === 0 ? '#00000005' : '#ffffff05'}}>
                <StyledTableCell>
                    <IconButton size="small" onClick={() => setIsCollapsed(!isCollapsed)}>
                        {isCollapsed ? <ExpandMore /> : <ExpandLess />}
                    </IconButton>
                    <IconButton
                        disableRipple
                        onClick={()=> {
                            isArchive ?
                                dispatch(removeList(list.id))
                                :
                                dispatch(moveToArchive(list.id))
                        }}
                    >
                        {isArchive ?
                            <CloseIcon/>
                            :
                            <ArchiveIcon/>
                        }

                    </IconButton>
                </StyledTableCell>
                <StyledTableCell>
                    <SyledListButton
                        onClick={()=>{handleExpandToTable(list.id)}}
                    >
                        {list.text}
                    </SyledListButton></StyledTableCell>
                <StyledTableCell>{totalPriceDone} AED</StyledTableCell>
                <StyledTableCell>
                    <CardPriceText>{totalPriceNotDone} AED</CardPriceText>
                </StyledTableCell>
                <StyledTableCell>{totalPrice} AED</StyledTableCell>
                {/* Other list fields here */}
            </TableRow>
            
        </>
    );
};

const TableListsComponent = ({ lists, isArchive, onUpload }) => {

    const [file, setFile] = useState(null);

    const [isProcessing, setIsProcessing] = useState(false);

    const onFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const onFileUpload = (e) => {
        setIsProcessing(true);
        onUpload(file)
    };

    return (
        <StyledTableContainer>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>
                        { !isArchive &&
                            <>
                                <IconButton
                                    onClick={downloadExcel}
                                >
                                    <DownloadIcon htmlColor="#008000"/>
                                </IconButton>
                                <IconButton
                                    disabled={isProcessing}
                                    onClick={
                                        onFileUpload
                                    }
                                >
                                    <FileUploadIcon htmlColor="#008080"/>
                                </IconButton>
                                <input type="file" accept=".xlsx" onChange={onFileChange}/>
                            </>
                        }

                    </TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Total Paid</TableCell>
                    <TableCell>Total Pending</TableCell>
                    <TableCell>Total Expenses</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {lists.map((list, index) => (
                    <ListRow key={index} list={list} index={index} isArchive={isArchive}/>
                ))}
            </TableBody>
        </Table>
        </StyledTableContainer>
    );
};

export default TableListsComponent;
