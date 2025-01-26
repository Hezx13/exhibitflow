import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  ToggleButton,
  Stack,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CreateNewFolderRoundedIcon from '@mui/icons-material/CreateNewFolderRounded';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import { useRef, useState } from 'react';
import { useUploadListMutation, useUploadPreviewMutation } from '../../../store/api/uploadApi';
import { useLocation, useNavigate } from 'react-router-dom';
import { bindMenu, bindTrigger } from 'material-ui-popup-state/hooks';
import { UploadPreviewTable } from '../../data-display/UploadPreviewTable';
import SearchBarButton from '../../actions/buttons/SearchBarButton';
import { usePopupState } from 'material-ui-popup-state/hooks';
import { useAddProjectMutation } from '../../../store/api/listsApi';

export default function SidebarActionsList() {
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const materialFileInputRef = useRef<HTMLInputElement>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [uploadPreview] = useUploadPreviewMutation();
  const [uploadLists] = useUploadListMutation();
  const [addProject] = useAddProjectMutation();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const popupState = usePopupState({ variant: 'popover', popupId: 'sidebar-actions-list' });

  const handleClose = () => {
    popupState.close();
    setPreviewData(null);
    if (projectFileInputRef.current) {
      projectFileInputRef.current.files = null;
    }
    if (materialFileInputRef.current) {
      materialFileInputRef.current.files = null;
    }
  };

  const handleProjectClick = () => {
    if (projectFileInputRef.current) {
      projectFileInputRef.current.click();
    }
  };

  const handleMaterialClick = () => {
    if (materialFileInputRef.current) {
      materialFileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    console.log(projectFileInputRef.current?.files);
    await uploadLists({ file: projectFileInputRef.current?.files?.[0] as File });
    window.location.reload();
    handleClose();
  };

  const handleAddProject = async () => {
    const result = await addProject({}).unwrap();
    navigate(`/projects/${result._id}`);
    handleClose();
  };

  const handleProjectFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      const result = await uploadPreview({ file }).unwrap();
      setPreviewData(result);
    }
  };

  const handleMaterialFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log(file);
    }
  };

  return (
    <>
      <UploadPreviewTable
        open={!!previewData}
        onClose={handleClose}
        onUpload={handleUpload}
        data={previewData}
      />
      <Stack direction="row" gap={1} alignItems="center">
        <SearchBarButton />
        <ToggleButton
          {...bindTrigger(popupState)}
          value={popupState.isOpen}
          selected={popupState.isOpen}
          size="small"
          // eslint-disable-next-line no-restricted-syntax
          sx={{
            border: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: (theme) => theme.palette.background.paper,
            padding: (theme) => theme.spacing(0.625),
            filter: (theme) =>
              theme.palette.mode === 'dark' ? 'brightness(0.85)' : 'brightness(0.95)',
          }}
        >
          <AddRoundedIcon fontSize="small" />
        </ToggleButton>
      </Stack>

      <Menu {...bindMenu(popupState)}>
        <MenuItem onClick={handleAddProject}>
          <ListItemIcon>
            <AddRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Project</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProjectClick}>
          <ListItemIcon>
            <CreateNewFolderRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Import Projects from File</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMaterialClick} disabled={!pathname.includes('projects')}>
          <ListItemIcon>
            <PlaylistAddRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Import Materials from File</ListItemText>
        </MenuItem>
      </Menu>
      <input
        ref={projectFileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleProjectFileChange}
      />
      <input
        ref={materialFileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleMaterialFileChange}
      />
    </>
  );
}
