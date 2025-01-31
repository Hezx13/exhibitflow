import { Box, IconButton, Typography } from '@mui/material';
import { RichTreeViewPro } from '@mui/x-tree-view-pro/RichTreeViewPro';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';
import {
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2Label,
  TreeItem2Root,
  TreeItem2GroupTransition,
  TreeItem2Checkbox,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { TreeItem2DragAndDropOverlay } from '@mui/x-tree-view/TreeItem2DragAndDropOverlay';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  useDeleteListMutation,
  useLazyGetStatsQuery,
  usePatchListPositionMutation,
  useSidebarListsQuery,
} from '../../../store/api/listsApi';
import { useNavigate, useParams } from 'react-router-dom';
import { forwardRef, ReactNode, Ref, useEffect, Component, ErrorInfo, useState } from 'react';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import SidebarActionsList from './SidebarActionsList';
import { RightClickMenu } from '../../actions/RigtClickMenu';
import { StatsDialog } from '../../dialogs/StatsDialog';

interface CustomTreeItemProps {
  id: string;
  itemId: string;
  label: string;
  disabled?: boolean;
  children?: ReactNode;
}
let contextMenuId: string;
const CustomTreeItem = forwardRef((props: CustomTreeItemProps, ref: Ref<HTMLLIElement>) => {
  const { id, itemId, label, disabled, children, ...other } = props;
  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    getGroupTransitionProps,
    getDragAndDropOverlayProps,
    status,
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });
  const { draggable, onDragStart, onDragOver, onDragEnd, ...otherRootProps } = getRootProps(other);
  const handleDragStart = (event: React.DragEvent) => {
    if (!onDragStart) {
      return;
    }
    onDragStart(event);
    event.dataTransfer.setDragImage((event.target as HTMLElement).parentElement!, 0, 0);
  };
  return (
    <TreeItem2Provider itemId={itemId}>
      <TreeItem2Root
        {...otherRootProps}
        onContextMenu={() => {
          contextMenuId = itemId;
        }}
      >
        <TreeItem2Content {...getContentProps()}>
          <TreeItem2IconContainer
            draggable={draggable}
            onDragStart={handleDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <DragIndicatorIcon />
          </TreeItem2IconContainer>
          <TreeItem2Checkbox {...getCheckboxProps()} />
          <Typography noWrap>{label || 'Untitled project'}</Typography>
          <TreeItem2IconContainer {...getIconContainerProps()}>
            <TreeItem2Icon status={status} />
          </TreeItem2IconContainer>
          <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />
        </TreeItem2Content>
        {children && <TreeItem2GroupTransition {...getGroupTransitionProps()} />}
      </TreeItem2Root>
    </TreeItem2Provider>
  );
});

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

class TreeViewErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log the error if it's not the specific DOM insertion error
    if (!error.message.includes('insertBefore')) {
      console.error('TreeView Error:', error, errorInfo);
    }
    // Set error state to trigger remount
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      // Reset error state and remount children
      this.state.hasError = false;
      return <>{this.props.children}</>;
    }
    return this.props.children;
  }
}

export const Sidebar = ({ open, onToggle }: SidebarProps) => {
  const { data: projects = [] } = useSidebarListsQuery();
  const [patchListPosition] = usePatchListPositionMutation();
  const [getStats, { data: statsData, isLoading: statsLoading }] = useLazyGetStatsQuery();
  const [deleteList] = useDeleteListMutation();
  const navigate = useNavigate();
  const { id: currentProjectId } = useParams();
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const handleNodeSelect = (nodeId: string) => {
    navigate(`/projects/${nodeId}`);
  };

  useEffect(() => {
    const el = document.querySelector('[role="tree"]');
    if (el) {
      const toRemove = el.querySelector(
        '[style="position: absolute; pointer-events: none; color: rgba(130, 130, 130, 0.62); z-index: 100000; width: 100%; text-align: center; bottom: 50%; right: 0px; letter-spacing: 5px; font-size: 24px;"]'
      );
      if (toRemove) {
        toRemove.remove();
      }
    }
  }, []);

  const handleItemPositionChange = (data: any) => {
    patchListPosition({ listId: data.itemId, payload: data });
  };

  return (
    <Box
      sx={{
        width: open ? 240 : 0,
        flexShrink: 0,
        backgroundColor: 'background.default',
        transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100%',
        overflowY: 'hidden',
        pl: 0.5,
        pt: 0.75,
      }}
    >
      <Box sx={{ p: 1 }}>
        <IconButton onClick={onToggle}>
          <ViewSidebarRoundedIcon />
        </IconButton>
        <SidebarActionsList />
      </Box>
      {/* workaround to supress errors */}
      <TreeViewErrorBoundary>
        <RightClickMenu
          options={[
            // {
            //   name: 'Edit',
            //   action: () => {
            //     console.log(contextMenuId);
            //   },
            // },
            {
              name: 'Delete',
              action: () => {
                deleteList(contextMenuId);
              },
            },
            {
              name: 'Get Statistics',
              action: () => {
                getStats({ listId: contextMenuId });
                setStatsDialogOpen(true);
              },
            },
          ]}
          sxContainer={{
            display: 'flex',
            flexDirection: 'row',
            height: 'auto',
            overflowY: 'auto',
            width: '100%',
          }}
        >
          <RichTreeViewPro
            sx={{
              '& > div:last-child': {
                display: 'none',
              },
              overflowY: 'auto',
              width: '100%',
            }}
            items={projects}
            onItemPositionChange={handleItemPositionChange}
            onSelectedItemsChange={(_, itemIds) => {
              if (itemIds) {
                handleNodeSelect(itemIds);
              }
            }}
            expansionTrigger="iconContainer"
            slots={{ item: CustomTreeItem as any }}
            experimentalFeatures={{
              indentationAtItemLevel: true,
              itemsReordering: true,
            }}
            itemsReordering
            selectedItems={currentProjectId ?? ''}
          />
        </RightClickMenu>
      </TreeViewErrorBoundary>
      <StatsDialog
        open={statsDialogOpen}
        onClose={() => setStatsDialogOpen(false)}
        data={statsData}
        loading={statsLoading}
      />
    </Box>
  );
};
