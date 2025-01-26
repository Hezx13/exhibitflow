import { Action } from '../../state/actions';
import {
  GridRowModesModel,
  GridToolbarContainer,
  GridRowId,
  useGridApiContext,
  GridValidRowModel,
} from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import { AddNewItem } from '../AddNewItem';
import { addTask, moveFromArchive } from '../../state/actions';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { getCurrentDateAndTime } from '../../utils/timeUtils';
import { AddItemButton } from '../../styles/styles';
import { useRef, useState } from 'react';
import { getProjectsList, onUploadSingle } from '../../api';
import { SaveAltOutlined } from '@mui/icons-material';
import { addToProject, saveMaterial } from '../../api/materials-api';
import { Alert, List, ListItem, ListItemButton, ListItemText, Popover } from '@mui/material';
import { eventEmitter } from '../../state/EventEmitter';

interface EditToolbarProps {
  tableId: string;
  dispatch: React.Dispatch<Action>;
  userData: { username: string } | null;
  setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}

function SavedMaterialsToolbar(props: EditToolbarProps) {
  const { dispatch, tableId, userData } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [projects, setProjects] = useState([]);
  const apiRef = useGridApiContext();

  const handleAddToProject = async (id) => {
    const selectedMaterials: Map<GridRowId, GridValidRowModel> = apiRef.current.getSelectedRows();
    const arrayToAdd: string[] = [];
    let res: number | null = null;
    selectedMaterials?.forEach((material, key) => {
      arrayToAdd.push(key.toString());
    });
    if (arrayToAdd.length) {
      res = await addToProject(arrayToAdd, id);
    }
    if (res === 200) {
      setIsSaved(true);
      handleClose();
      setTimeout(() => eventEmitter.emit('savedMaterialsAdded'), 1500);
    }
  };

  const handleAddSelected = async (e) => {
    setAnchorEl(e.currentTarget);
    setIsSaving(true);
    const projectlist = await getProjectsList();
    setProjects(projectlist);
  };

  const handleClose = () => {
    setIsSaving(false);
    setAnchorEl(null);
  };

  return (
    <GridToolbarContainer>
      <Popover
        open={isSaving}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <List dense>
          {projects.map((project) => (
            <ListItem>
              <ListItemButton
                //@ts-ignore
                onClick={() => handleAddToProject(project._id)}
              >
                <ListItemText
                  //@ts-ignore
                  primary={project.text}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Popover>

      <Button
        disabled={isSaving}
        color="primary"
        startIcon={<SaveAltOutlined />}
        onClick={handleAddSelected}
      >
        Add to project
      </Button>
      {isSaved && (
        <Alert sx={{ padding: '0px 15px' }} variant="outlined" severity="success">
          Success
        </Alert>
      )}
    </GridToolbarContainer>
  );
}

export default SavedMaterialsToolbar;
