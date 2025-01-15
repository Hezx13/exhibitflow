import { Action, resetRequests } from "../../state/actions"
import {
    GridRowsProp,
    GridRowModesModel,
    GridRowModes,
    DataGrid,
    GridColDef,
    GridToolbarContainer,
    GridActionsCellItem,
    GridEventListener,
    GridRowId,
    GridRowModel,
    GridRowEditStopReasons,
    useGridApiContext,
    GridApi,
    GridRenderEditCellParams,
    GridValidRowModel,
  } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import { AddNewItem } from "../AddNewItem";
import {addTask, editTask, moveFromArchive, removeTask} from "../../state/actions";
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { getCurrentDateAndTime } from "../../utils/timeUtils";
import { AddItemButton } from "../../styles/styles";
import { memo, useRef, useState } from "react";
import { onUploadSingle } from "../../api";
import { SaveAltOutlined } from "@mui/icons-material";
import DoneIcon from '@mui/icons-material/Done';
import { saveMaterial } from "../../api/materials-api";
import { Alert } from "@mui/material";
import { useAppState } from "../../state/AppStateContext";
import { useSocket } from "../../state/socketContext";


interface EditToolbarProps {
    tableId: string,
    dispatch: React.Dispatch<Action>,
    isOccupied: boolean
    userData: {username: string} | null,
      setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
  }
  
  function EditToolbar(props: EditToolbarProps) {
    const {role} = useAppState();
    const {dispatch,tableId,userData, isOccupied } = props;
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);
    const socket = useSocket();

    function createMailToLink(email: string, subject: string, body:string) {
      return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  
    const apiRef = useGridApiContext();
  
    const handleSend = () => {
      const selectedMaterials = apiRef.current.getSelectedRows();
      let message = ''
      selectedMaterials.forEach(entry => {
        message += entry.article + '-' + entry.text + '-Quantity: ' + entry.quantity + '\n';
    });
    const email = 'example@example.com';
    const subject = 'Order';
    const link = createMailToLink(email,subject,message)
    window.location.href = link;
    }

    const handleUploadClick = () => {
      fileInput.current!.click();
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      file && onUploadSingle(file, tableId)
  };

  const handleSaveSelected = async () => {
    setIsSaving(true)
    const selectedMaterials: Map<GridRowId, GridValidRowModel> = apiRef.current.getSelectedRows();
    const arrayToSave: string[] = [];
    let res: number | null = null;
    selectedMaterials.forEach((material, key) =>{
      arrayToSave.push(key.toString());
    })
    if (arrayToSave.length) res = await saveMaterial(arrayToSave, tableId);
    if (res === 200) setIsSaved(true);
    setIsSaving(false)
  };
    

    return (
      <GridToolbarContainer>
        <AddNewItem
            toggleButtonText="+ Add another material"
            onAdd={
                (text,article, price, quantity, unit, comment, deliveryDate) => {
                    dispatch(moveFromArchive(tableId))
                    dispatch(addTask(
                      text, 
                      tableId, 
                      article || '',
                      price || '', 
                      quantity || 1, 
                      getCurrentDateAndTime(), 
                      unit || 'pcs', 
                      comment || "", 
                      deliveryDate ? new Date() : getCurrentDateAndTime(), 
                      userData?.username || 'Anonymus', 
                      "Pending", ""))
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
        <Button color="primary" startIcon={<SendOutlinedIcon/>} onClick={handleSend}>
          Email selected
        </Button>
        {
          role === 'Admin' &&
        <Button disabled={isSaving} color="primary" startIcon={<SaveAltOutlined/>} onClick={handleSaveSelected}>
          Save selected
        </Button>
        }
        {isSaved && <Alert sx={{padding: '0px 15px'}} variant="outlined" severity="success">
            Success
        </Alert> }
        {
          isOccupied ? <Alert severity="warning">Another person is working in this project</Alert> : null
        }
      </GridToolbarContainer>
    );
  }

export default memo(EditToolbar);