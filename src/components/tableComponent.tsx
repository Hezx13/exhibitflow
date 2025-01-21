import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../state/AppStateContext';
import { findItemIndexById } from '../utils/arrayUtils';
import {
  Table,
  TableBody,
  TableHead,
  Grid,
  TextField,
  IconButton,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { addTask, editTask, moveFromArchive, removeTask } from '../state/actions';
import { Task } from '../state/appStateReducer';
import {
  StyledTableContainer,
  StyledTableRow,
  StyledTableCell,
  Status,
  AddItemButton,
} from '../styles/styles';
import { CardQuantityText, CardPriceText } from '../styles/textStyles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { AddNewItem } from './AddNewItem';
import { getCurrentDateAndTime, getNextWeek } from '../utils/timeUtils';
import { onUploadSingle } from '../api';
import { getUserData } from '../api/user-api';
type ColProps = {
  tableId: string;
};
type User = {
  username: string;
};

const CollapsibleText = ({ text, maxLength }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const shouldDisplayButton = text.length > maxLength;
  const displayText = isExpanded ? text : `${text.substring(0, maxLength)}`;

  return (
    <span>
      {displayText}
      {shouldDisplayButton && (
        <span
          onClick={toggleExpanded}
          style={{ fontWeight: 700, cursor: 'pointer', color: 'blue' }}
        >
          {isExpanded ? ' <<' : ' ...'}
        </span>
      )}
    </span>
  );
};

const TableComponent = ({ tableId }: ColProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [editedTask, setEditedTask] = useState<any>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const { lists, archive, dispatch } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    try {
      getUserData().then((user) => {
        const userData: User = {
          username: user.username,
        };
        setUserData(userData);
      });
    } catch (error) {
      setUserData(null);
    }
  }, []);

  useEffect(() => {
    const id_a = findItemIndexById(archive, tableId);
    const id_l = findItemIndexById(lists, tableId);
    if (id_a > -1) {
      setTasks(archive[id_a].tasks);
    } else if (id_l > -1) {
      setTasks(lists[id_l].tasks);
    }
  }, [tableId, editing, lists]);

  useEffect(() => {
    setFilteredTasks(
      tasks.filter((task) => {
        return task.text.toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [tasks, searchTerm]);

  const handleUploadClick = () => {
    fileInput.current!.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    file && onUploadSingle(file, tableId);
  };

  const handleEditClick = (task: any) => {
    setEditing(task.id);
    setEditedTask(task);
  };

  const handleRemoveClick = (target: Task) => {
    const shouldRemove = window.confirm('Are you sure you want to remove ' + target.text + ' ?');

    if (shouldRemove) {
      setTasks(tasks.filter((task) => task.id !== target.id));
      dispatch(removeTask(tableId, target.id));
    }
  };

  const isUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSaveClick = (listId: string) => {
    dispatch(
      editTask(
        editedTask.id,
        listId,
        editedTask.text,
        editedTask.article,
        editedTask.price,
        editedTask.quantity,
        editedTask.date,
        editedTask.unit,
        editedTask.comment,
        editedTask.deliveryDate,
        editedTask.orderedBy,
        editedTask.status,
        editedTask.payment
      )
    );
    setEditing(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedTask({ ...editedTask, [field]: value });
  };

  return (
    <>
      <StyledTableContainer>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>Date ordered</StyledTableCell>
              <StyledTableCell>
                {tasks.some((task) => task.article !== '') ? 'Article number' : ''}
              </StyledTableCell>
              <StyledTableCell>Material</StyledTableCell>
              <StyledTableCell>Quantity</StyledTableCell>
              <StyledTableCell>Price</StyledTableCell>
              <StyledTableCell>Unit</StyledTableCell>
              <StyledTableCell>Comment</StyledTableCell>
              <StyledTableCell>Delivery Date</StyledTableCell>
              <StyledTableCell>Ordered By</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Payment</StyledTableCell>
              <StyledTableCell>
                <TextField
                  label="Search by Name"
                  variant="standard"
                  value={searchTerm}
                  color="primary"
                  InputProps={{
                    style: {
                      color: '#000',
                      backgroundColor: '#ffffff05',
                      padding: '5px',
                    },
                  }}
                  InputLabelProps={{
                    style: {
                      zIndex: '10',
                      color: 'orange',
                      fontSize: '1rem',
                      padding: '5px',
                    },
                  }}
                  style={{}}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.map((task) => (
              <StyledTableRow key={task.id}>
                <StyledTableCell>
                  {editing === task.id ? (
                    <TextField
                      value={editedTask.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  ) : (
                    //@ts-ignore
                    task.date.split('T')[0]
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editing === task.id ? (
                    <TextField
                      value={editedTask.article}
                      onChange={(e) => handleInputChange('article', e.target.value)}
                    />
                  ) : (
                    task.article
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editing === task.id ? (
                    <TextField
                      value={editedTask.text}
                      onChange={(e) => handleInputChange('text', e.target.value)}
                    />
                  ) : (
                    <CollapsibleText text={task.text} maxLength={50} />
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editing === task.id ? (
                    <TextField
                      value={editedTask.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                    />
                  ) : (
                    <CardQuantityText>{task.quantity}</CardQuantityText>
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editing === task.id ? (
                    <TextField
                      value={editedTask.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                    />
                  ) : (
                    <CardPriceText>{task.price}</CardPriceText>
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editing === task.id ? (
                    <TextField
                      value={editedTask.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                    />
                  ) : (
                    task.unit
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editing === task.id ? (
                    <TextField
                      value={editedTask.comment}
                      onChange={(e) => handleInputChange('comment', e.target.value)}
                    />
                  ) : isUrl(task.comment) ? (
                    <a href={task.comment} target="_blank" rel="noopener noreferrer">
                      Link
                    </a>
                  ) : (
                    task.comment
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editing === task.id ? (
                    <DatePicker
                      value={dayjs(editedTask.deliveryDate)}
                      onChange={(newValue) => {
                        const formattedDate = newValue ? dayjs(newValue).format('DD-MM-YYYY') : '';
                        handleInputChange('deliveryDate', formattedDate);
                      }}
                    />
                  ) : (
                    task.deliveryDate
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editing === task.id ? (
                    <TextField
                      value={editedTask.orderedBy}
                      onChange={(e) => handleInputChange('orderedBy', e.target.value)}
                    />
                  ) : (
                    task.orderedBy
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editing === task.id ? (
                    <Select
                      value={editedTask.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Waiting for approval">Waiting for approval</MenuItem>
                      <MenuItem value="In process">In process</MenuItem>
                      <MenuItem value="Waiting for payment">Waiting for payment</MenuItem>
                      <MenuItem value="Done">Done</MenuItem>
                    </Select>
                  ) : (
                    <>
                      <Status
                        color={
                          task.status === 'Done'
                            ? 'green'
                            : task.status === 'Waiting for approval'
                              ? 'blue'
                              : task.status === 'In process'
                                ? 'orange'
                                : task.status === 'Waiting for payment'
                                  ? 'red'
                                  : 'grey'
                        }
                      ></Status>
                      {task.status}
                    </>
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {editing === task.id ? (
                    <Select
                      value={editedTask.payment}
                      onChange={(e) => handleInputChange('payment', e.target.value)}
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="card">Card</MenuItem>
                      <MenuItem value="credit">Credit</MenuItem>
                      <MenuItem value="bank transfer">Bank Transfer</MenuItem>
                      <MenuItem value="pemo card">Pemo card</MenuItem>
                      <MenuItem value="">Not paid</MenuItem>
                    </Select>
                  ) : (
                    task.payment
                  )}
                </StyledTableCell>

                <StyledTableCell>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: '100px' }}>
                    {editing === task.id ? (
                      <IconButton onClick={() => handleSaveClick(tableId)}>
                        <SaveIcon fontSize="medium" htmlColor="green" />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => handleEditClick(task)}>
                        <EditIcon fontSize="medium" htmlColor="DarkOrange" />
                      </IconButton>
                    )}
                    <IconButton onClick={() => handleRemoveClick(task)}>
                      <DeleteForeverIcon fontSize="medium" htmlColor="Crimson" />
                    </IconButton>
                  </Box>
                </StyledTableCell>
              </StyledTableRow>
            ))}
            <StyledTableRow>
              <StyledTableCell colSpan={7}>
                <AddNewItem
                  toggleButtonText="+ Add another material"
                  onAdd={(
                    text,
                    article,
                    price,
                    quantity,
                    unit,
                    comment,
                    deliveryDate,
                    orderedBy
                  ) => {
                    dispatch(moveFromArchive(tableId));
                    dispatch(
                      addTask(
                        text,
                        tableId,
                        article || '',
                        price || '',
                        quantity || 1,
                        getCurrentDateAndTime(),
                        unit || 'pcs',
                        comment || '',
                        deliveryDate || getCurrentDateAndTime(),
                        userData?.username || 'Anonymus',
                        'Pending',
                        ''
                      )
                    );
                  }}
                />
              </StyledTableCell>
              <StyledTableCell colSpan={6}>
                <AddItemButton onClick={handleUploadClick} dark excel>
                  Excel import
                </AddItemButton>
                <input
                  type="file"
                  ref={fileInput}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </StyledTableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
      </StyledTableContainer>
    </>
  );
};

export default TableComponent;
