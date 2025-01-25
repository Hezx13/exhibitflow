import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CreateNewFolderRoundedIcon from '@mui/icons-material/CreateNewFolderRounded';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import { useRef, useState } from 'react';
import { useUploadMutation, useUploadPreviewMutation } from '../../../store/api/listsApi';
import { UploadPreviewTable } from '../../data-display/UploadPreviewTable';

export default function SidebarActionsList() {
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const materialFileInputRef = useRef<HTMLInputElement>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [uploadPreview] = useUploadPreviewMutation();
  const [upload] = useUploadMutation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
    await upload({ file: projectFileInputRef.current?.files?.[0] as File });
    window.location.reload();
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
      <List dense>
        <ListItemButton disableGutters sx={{ px: 0.5 }} onClick={handleClick}>
          <ListItemIcon>
            <AddRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Add" />
        </ListItemButton>
      </List>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleClose}>
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
        <MenuItem onClick={handleMaterialClick}>
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
