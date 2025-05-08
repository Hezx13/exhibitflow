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
  Divider,
} from '@mui/material';
import { Delete, MoreVert, Share, ContentCopy } from '@mui/icons-material';
import { motion, AnimatePresence } from 'motion/react';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import {
  useLoadSingleListQuery,
  usePatchListMutation,
  useDeleteListMutation,
  useDeleteTasksMutation,
  useDuplicateTasksMutation,
} from '../../store/api/listsApi';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import debounce from '../../utils/debounce';
import { useSelection } from './GridSelection.context';
import {
  useDeleteDocumentMutation,
  useGetDocumentQuery,
  usePatchDocumentMutation,
} from '../../store/api/documentsApi';

interface TopBarProps {
  listId?: string;
  documentId?: string;
  type: 'list' | 'document';
}

export const TopBar = ({ listId, documentId, type }: TopBarProps) => {
  const { data: list } = useLoadSingleListQuery(listId as string, {
    skip: type !== 'list' || !listId,
  });
  const { data: document } = useGetDocumentQuery(documentId as string, {
    skip: type !== 'document' || !documentId,
  });
  const [patchList] = usePatchListMutation();
  const [patchDocument] = usePatchDocumentMutation();
  const [deleteList] = useDeleteListMutation();
  const [deleteDocument] = useDeleteDocumentMutation();
  const [deleteTasks] = useDeleteTasksMutation();
  const [duplicateTasks] = useDuplicateTasksMutation();
  const [title, setTitle] = useState(list?.title || document?.documentName);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectedIds } = useSelection();

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((newTitle: string) => {
      if (type === 'list') {
        patchList({ listId: listId as string, payload: { name: newTitle } });
      } else {
        patchDocument({ documentId: documentId as string, payload: { documentName: newTitle } });
      }
    }, 300),
    [listId, patchList, documentId, patchDocument]
  );

  // Handle user input
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUserEditing(true);
    setTitle(e.target.value);
    debouncedSave(e.target.value);
  };

  // Update title from backend only if user is not currently editing
  useEffect(() => {
    if (!isUserEditing && list?.name) {
      setTitle(list.name);
    }
    if (!isUserEditing && document?.documentName) {
      setTitle(document.documentName);
    }
  }, [list?.name, document?.documentName, isUserEditing]);

  // Reset user editing state when switching lists
  useEffect(() => {
    setIsUserEditing(false);
    setTitle(list?.name || document?.documentName || '');
  }, [listId, list?.name, document?.documentName]);

  const handleDelete = async () => {
    if (type === 'list') {
      await deleteList(listId as string);
    } else {
      await deleteDocument(documentId as string);
    }
  };

  const handlePatchSidebarVisibility = () => {
    if (type === 'list') {
      patchList({ listId: listId as string, payload: { isActive: !list?.isActive } });
    } else {
      patchDocument({
        documentId: documentId as string,
        payload: { isActive: !document?.isActive },
      });
    }
  };

  const MotionInputBase = useMemo(() => motion.create(InputBase), [listId, documentId]);

  const selectionActions = [
    {
      icon: <Delete fontSize="small" />,
      onClick: () => deleteTasks({ listId: listId as string, taskIds: selectedIds }),
      label: 'Delete Selected',
    },
    {
      icon: <ContentCopy fontSize="small" />,
      onClick: () => duplicateTasks({ listId: listId as string, taskIds: selectedIds }),
      label: 'Duplicate Selected',
    },
  ];

  const actions = [
    { icon: <Delete fontSize="small" />, onClick: handleDelete, label: 'Delete' },
    {
      icon: <GetAppRoundedIcon fontSize="small" />,
      onClick: () => console.log('Download'),
      label: 'Download',
    },
    {
      icon: <ViewSidebarRoundedIcon fontSize="small" />,
      onClick: handlePatchSidebarVisibility,
      toggleActive: type === 'list' ? list?.isActive : document?.isActive,
      label:
        type === 'list' ? (list?.isActive ? 'Hide' : 'Show') : document?.isActive ? 'Hide' : 'Show',
    },
    { icon: <Share fontSize="small" />, onClick: () => console.log('Share'), label: 'Share' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        pb: 0.5,
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
        <AnimatePresence mode="wait">
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                gap: '4px',
                marginRight: '8px',
                overflow: 'hidden',
              }}
            >
              <AnimatePresence mode="sync">
                {selectionActions.map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      duration: 0.15,
                      delay: index * 0.05,
                      ease: 'easeOut',
                    }}
                  >
                    <Tooltip title={action.label}>
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
                    </Tooltip>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <Divider orientation="vertical" flexItem />
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
