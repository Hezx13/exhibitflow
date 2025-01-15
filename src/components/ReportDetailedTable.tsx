import React, { useState, useEffect, useRef } from "react";
import { useAppState } from "../state/AppStateContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableHead,
  Grid,
  TextField,
  IconButton,
  Select,
  MenuItem,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  addTask,
  editTask,
  moveFromArchive,
  removeTask,
} from "../state/actions";
import { Task } from "../state/appStateReducer";
import HoverPopover from "./HoverPopover";
import {
  StyledTableContainer,
  StyledTableRow,
  StyledTableCell,
  Status,
  AddItemButton,
} from "../styles/styles";
import { CardQuantityText, CardPriceText } from "../styles/textStyles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AddNewItem } from "./AddNewItem";
import { getCurrentDateAndTime, getNextWeek } from "../utils/timeUtils";
import { FormControl, InputLabel } from "@mui/material";
import { useReport } from "../state/reportsContext"; // Adjust the import to your file structure
import { addDebit, removeDebit } from "../api";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DebitDialog from "./DebitDialog";
type debit = {
  amount: number;
  date: string;
  check: string;
};

type Report = {
  materials: Array<Material>;
  month: any;
  debit: Array<debit>;
  credit: number;
  payment: string;
  activeProjects: [];
};

type Material = {
  id: string;
  text: string;
  article: string;
  price: string;
  quantity: number;
  date: any;
  unit: string;
  comment: string;
  deliveryDate: string;
  orderedBy: string;
  status: string;
  payment: string;
  listParent: any;
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
          style={{ fontWeight: 700, cursor: "pointer", color: "blue" }}
        >
          {isExpanded ? " <<" : " ..."}
        </span>
      )}
    </span>
  );
};



const ReportDetailedTable = () => {
  const { reports, updateReports } = useReport();
  const navigate = useNavigate();
  const location = useLocation();
  const period = location.state?.period || null;
  const payment = location.state?.payment || null;
  const [tasks, setTasks] = useState<Material[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Material[]>([]);
  const [activeProjects, setActiveProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [credit, setCredit] = useState(0);
  const [editedTask, setEditedTask] = useState<any>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const { lists, archive, dispatch } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(0);
  const [inputDate, setInputDate] = useState("");
  const [inputCheck, setInputCheck] = useState("");
  const [debit, setDebit] = useState<Array<debit>>([]);

  type Project = {
    id: string;
    name: string;
  };

  // FETCHING DATA

  useEffect(() => {
    if (!reports.length) {
      updateReports();
      return;
    }
    if (!period) navigate("/reports");
    const detailedReport = reports.filter(
      (report) =>
        report.month.start === period.start && report.payment === payment
    );
    const act_proj: string[] = [];
    setTasks(detailedReport[0].materials);
    detailedReport[0].activeProjects.map((activeProject: Project) =>
      act_proj.push(activeProject.name)
    );
    setActiveProjects(act_proj);
    calculateTotalDebit(detailedReport[0].debit);
  }, [reports]);

  //FILTERING

  useEffect(() => {
    let newFilteredTasks = tasks;

    if (searchTerm !== "") {
      newFilteredTasks = newFilteredTasks.filter((task) =>
        task.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedProject !== "") {
      newFilteredTasks = newFilteredTasks.filter(
        (task) => task.listParent.name === selectedProject
      );
    }

    setFilteredTasks(newFilteredTasks);
  }, [tasks, searchTerm, selectedProject]);

  useEffect(() => {
    calculateTotalCredit();
  }, [filteredTasks]);

  const handleEditClick = (task: any) => {
    setEditing(task.id);
    setEditedTask(task);
  };

  const calculateTotalCredit = () => {
    let totalCredit = 0;
    for (let task of filteredTasks) {
      let price = Number(task.price?.split(" ")[0] || task.price);
      let quantity = Number(task.quantity);
      if (!isNaN(price) && !isNaN(quantity)) totalCredit += price * quantity;
    }
    setCredit(totalCredit);
  };

  const calculateTotalDebit = (debits) => {
    setDebit(debits);
  };

  const isUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedTask({ ...editedTask, [field]: value });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    if (inputValue) {
      let data = { amount: Number(inputValue), date: inputDate, check: inputCheck };
      try {
        addDebit(period.start, data, payment).then(() => {
          updateReports();
        });
        setInputCheck("");
        setInputValue(0);
        setInputDate("");
      } catch (err) {
        console.log(err);
      }
    }
    setOpen(false);
  };

  const handleRemoveDebitClick = async (num: number) => {

    try {
      removeDebit(period.start, num, payment).then(() => {
        updateReports();
      });
    } catch (error) {
      console.error("Error in removeDebit:", error);
    }
  };

  return (
    <>
      <StyledTableContainer>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>
                <IconButton onClick={() => navigate("/reports")}>
                  <ArrowBackIcon htmlColor="#fff" />
                </IconButton>
              </StyledTableCell>
              <StyledTableCell>
                <TextField
                  label="Search by Name"
                  variant="standard"
                  value={searchTerm}
                  color="primary"
                  InputProps={{
                    style: {
                      color: "#000",
                      backgroundColor: "#ffffff50",
                      padding: "5px",
                    },
                  }}
                  InputLabelProps={{
                    style: {
                      zIndex: "10",
                      color: "orange",
                      fontSize: "1rem",
                      padding: "5px",
                    },
                  }}
                  style={{}}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </StyledTableCell>
              <StyledTableCell colSpan={7}>
                <FormControl
                  variant="outlined"
                  style={{ margin: "0 10px", width: "200px" }}
                >
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    label="Project"
                    size="small"
                    margin="dense"
                  >
                    <MenuItem value="">SHOW ALL</MenuItem>
                    {activeProjects.map((m, index) => (
                      <MenuItem key={index} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </StyledTableCell>
            </StyledTableRow>
            <StyledTableRow>
              <StyledTableCell></StyledTableCell>
              <StyledTableCell colSpan={3}>
                <Typography
                  sx={{
                    background: "#FF000050",
                    maxWidth: "300px",
                    padding: "10px",
                    borderRadius: "8px",
                  }}
                >
                  <span style={{ color: "#FFF" }}>Expences: </span>
                  <span style={{ fontWeight: "600" }}>{credit.toFixed(2)}</span>
                </Typography>
              </StyledTableCell>
              <StyledTableCell colSpan={5}>
                <Typography>
                  <HoverPopover
                    openHook={handleClickOpen}
                    debit={debit}
                    onRemoveDebit={handleRemoveDebitClick}
                  />
                </Typography>
              </StyledTableCell>

              {/*    DIALOG     */}

              <DebitDialog
                open={open}
                inputValue={inputValue}
                setInputValue={setInputValue}
                inputDate={inputDate}
                setInputDate={setInputDate}
                inputCheck={inputCheck}
                setInputCheck={setInputCheck}
                handleClose={handleClose}
                handleSave={handleSave}
              ></DebitDialog>
            </StyledTableRow>
            <StyledTableRow>
              <StyledTableCell>Date ordered</StyledTableCell>
              <StyledTableCell>Material</StyledTableCell>
              <StyledTableCell>Project</StyledTableCell>
              <StyledTableCell>Credit</StyledTableCell>
              <StyledTableCell>Unit</StyledTableCell>
              <StyledTableCell>Invoice</StyledTableCell>
              <StyledTableCell>Delivery Date</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Payment</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.map((task, index) => (
              <StyledTableRow
                key={task.id}
                color={index % 2 === 0 ? "#00000005" : "white"}
              >
                <StyledTableCell>
                    {dayjs(task.date).format("DD-MM-YYYY HH:MM")}
                </StyledTableCell>
                <StyledTableCell>
                    <CollapsibleText text={task.text} maxLength={60} />
                </StyledTableCell>
                <StyledTableCell>
                    <CardQuantityText>{task.listParent.name}</CardQuantityText>
                </StyledTableCell>
                <StyledTableCell>
                    <CardPriceText>
                      {(
                        Number(task.price?.split(" ")[0] || task.price) *
                        task.quantity
                      ).toFixed(2)}
                    </CardPriceText>
                </StyledTableCell>
                <StyledTableCell>
                    {task.unit}
                </StyledTableCell>
                <StyledTableCell>
                  {editing === task.id ? (
                    <TextField
                      value={editedTask.comment}
                      onChange={(e) =>
                        handleInputChange("comment", e.target.value)
                      }
                    />
                  ) : isUrl(task.comment) ? (
                    <a
                      href={task.comment}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Link
                    </a>
                  ) : (
                    task.comment
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {
                    task.deliveryDate ? dayjs(task.deliveryDate).format("DD-MM-YYYY") : ''
                  }
                </StyledTableCell>
                <StyledTableCell>
                  {editing === task.id ? (
                    <Select
                      value={editedTask.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Waiting for approval">
                        Waiting for approval
                      </MenuItem>
                      <MenuItem value="In process">In process</MenuItem>
                      <MenuItem value="Waiting for payment">
                        Waiting for payment
                      </MenuItem>
                      <MenuItem value="Done">Done</MenuItem>
                    </Select>
                  ) : (
                    <>
                      <Status
                        color={
                          task.status === "Done"
                            ? "green"
                            : task.status === "Waiting for approval"
                            ? "blue"
                            : task.status === "In process"
                            ? "orange"
                            : task.status === "Waiting for payment"
                            ? "red"
                            : "grey"
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
                      onChange={(e) =>
                        handleInputChange("payment", e.target.value)
                      }
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
              </StyledTableRow>
            ))}
            {/* <StyledTableRow>
                                    <StyledTableCell colSpan={7}>
                                        <AddNewItem
                                            toggleButtonText="+ Add another material"
                                            onAdd={
                                                (text,article, price, quantity, unit, comment, deliveryDate, orderedBy) => {
                                                    dispatch(moveFromArchive(''))
                                                    dispatch(addTask(text, '', article || '',price + ' AED', quantity || 0, getCurrentDateAndTime(), unit || 'pcs', comment || "", deliveryDate || getNextWeek(), orderedBy || 'Anonymus', "Pending", ""))
                                                }
                                            }
                                            dark
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell colSpan={6}>
                                    <AddItemButton 
                                    //onClick={handleUploadClick} dark excel
                                    >
                                        Excel import
                                    </AddItemButton>
                                    <input
                                        type="file"
                                        ref={fileInput}
                                        style={{ display: 'none' }}
                                   //     onChange={handleFileChange}
                                    />
                                    </StyledTableCell>
                                </StyledTableRow> */}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </>
  );
};

export default ReportDetailedTable;
