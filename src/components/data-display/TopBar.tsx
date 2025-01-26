import { useEffect, useMemo, useState } from 'react';
import { Box, IconButton, InputBase, Stack, Avatar, AvatarGroup, Tooltip } from '@mui/material';
import { Edit, Save, Delete, Archive } from '@mui/icons-material';
import { motion, AnimatePresence } from 'motion/react';
import {
  useLoadSingleListQuery,
  usePatchListMutation,
  useDeleteListMutation,
} from '../../store/api/listsApi';

interface TopBarProps {
  listId: string;
}

export const TopBar = ({ listId }: TopBarProps) => {
  const { data: list } = useLoadSingleListQuery(listId);
  const [patchList] = usePatchListMutation();
  const [deleteList] = useDeleteListMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list?.title || '');

  useEffect(() => {
    setTitle(list?.text || '');
  }, [list]);

  const handleSave = async () => {
    await patchList({ listId, payload: { text: title } });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteList(listId);
  };

  const MotionInputBase = useMemo(() => motion(InputBase), [listId]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Stack direction="row" gap={1} alignItems="center" flexGrow={1}>
        <AnimatePresence mode="wait">
          <MotionInputBase
            key="editing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.15 }}
            value={title}
            fullWidth
            onChange={(e) => setTitle(e.target.value)}
            sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}
            autoFocus
          />
        </AnimatePresence>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <AvatarGroup max={4}>
          {list?.users?.map((user: any) => (
            <Tooltip key={user._id} title={user.name || user.email}>
              <Avatar src={user.avatar} alt={user.name || user.email}>
                {(user.name || user.email).charAt(0)}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>

        <IconButton onClick={handleDelete}>
          <Delete />
        </IconButton>
      </Stack>
    </Box>
  );
};
