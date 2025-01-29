import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  IconButton,
  InputBase,
  Stack,
  Avatar,
  AvatarGroup,
  Tooltip,
  ToggleButton,
} from '@mui/material';
import { Edit, Save, Delete, Archive, MoreVert, Share } from '@mui/icons-material';
import { motion, AnimatePresence } from 'motion/react';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import {
  useLoadSingleListQuery,
  usePatchListMutation,
  useDeleteListMutation,
} from '../../store/api/listsApi';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import debounce from '../../utils/debounce';
interface TopBarProps {
  listId: string;
}

export const TopBar = ({ listId }: TopBarProps) => {
  const { data: list } = useLoadSingleListQuery(listId);
  const [patchList] = usePatchListMutation();
  const [deleteList] = useDeleteListMutation();
  const [title, setTitle] = useState(list?.title || '');
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((newTitle: string) => {
      patchList({ listId, payload: { text: newTitle } });
    }, 300),
    [listId, patchList]
  );

  // Handle user input
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUserEditing(true);
    setTitle(e.target.value);
    debouncedSave(e.target.value);
  };

  // Update title from backend only if user is not currently editing
  useEffect(() => {
    if (!isUserEditing && list?.text) {
      setTitle(list.text);
    }
  }, [list?.text, isUserEditing]);

  // Reset user editing state when switching lists
  useEffect(() => {
    setIsUserEditing(false);
    setTitle(list?.text || '');
  }, [listId, list?.text]);

  const handleDelete = async () => {
    await deleteList(listId);
  };

  const MotionInputBase = useMemo(() => motion.create(InputBase), [listId]);

  const actions = [
    { icon: <Delete fontSize="small" />, onClick: handleDelete, label: 'Delete' },
    {
      icon: <GetAppRoundedIcon fontSize="small" />,
      onClick: () => console.log('Download'),
      label: 'Download',
    },
    {
      icon: <ViewSidebarRoundedIcon fontSize="small" />,
      onClick: () => patchList({ listId, payload: { isActive: !list.isActive } }),
      toggleActive: list?.isActive,
      label: list?.isActive ? 'Hide' : 'Show',
    },
    { icon: <Share fontSize="small" />, onClick: () => console.log('Share'), label: 'Share' },
  ];

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
            onChange={handleTitleChange}
            onBlur={() => setIsUserEditing(false)}
            sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}
            fullWidth
          />
        </AnimatePresence>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <motion.div
          initial={false}
          animate={{ width: isExpanded ? 'auto' : '40px' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{
            display: 'flex',
            overflow: 'hidden',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            borderRadius: '20px',
            padding: '4px',
          }}
        >
          <IconButton
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{
              transition: 'transform 0.3s ease',
              transform: isExpanded ? 'rotate(90deg)' : 'none',
            }}
          >
            <MoreVert />
          </IconButton>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', gap: '4px' }}
              >
                {actions.map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.05,
                      ease: 'easeOut',
                    }}
                  >
                    <Tooltip title={action.label}>
                      {action.toggleActive === undefined ? (
                        <IconButton
                          onClick={action.onClick}
                          size="small"
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.08)',
                            },
                          }}
                        >
                          {action.icon}
                        </IconButton>
                      ) : (
                        <ToggleButton
                          color="primary"
                          value={action.toggleActive}
                          selected={action.toggleActive}
                          onChange={action.onClick}
                          size="small"
                        >
                          {action.icon}
                        </ToggleButton>
                      )}
                    </Tooltip>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Stack>
    </Box>
  );
};
