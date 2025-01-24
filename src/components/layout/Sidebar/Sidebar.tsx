import {
  Box,
  IconButton,
  Typography,
  styled,
  alpha,
  ListItemButton,
  ListItemText,
  List,
  ListItemIcon,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { RichTreeViewPro } from '@mui/x-tree-view-pro/RichTreeViewPro';
import { treeItemClasses } from '@mui/x-tree-view/TreeItem';
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
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useLoadListsQuery, usePatchListPositionMutation } from '../../../store/api/listsApi';
import { useNavigate, useParams } from 'react-router-dom';
import { forwardRef, ReactNode, Ref, SyntheticEvent, useEffect, useMemo, Component, ErrorInfo } from 'react';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import SidebarActionsList from './SidebarActionsList';
import { RightClickMenu } from '../../actions/RigtClickMenu';

interface CustomTreeItemProps {
  id: string;
  itemId: string;
  label: string;
  disabled?: boolean;
  children?: ReactNode;
}

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
      <TreeItem2Root {...otherRootProps}>
        <TreeItem2Content {...getContentProps()}>
        <RightClickMenu options={[{
      name: 'Edit',
      action: () => {
        console.log(itemId);
      }
      
    },
    {
      name: 'Delete',
      action: () => {
        console.log(itemId);
      }
    },
    {
      name: 'Get Statistics',
      action: () => {
        console.log(itemId);
      }
    }
    ]} sxContainer={{display: 'flex', flexDirection: 'row'}}>
          <TreeItem2IconContainer {...getIconContainerProps()}>
            <TreeItem2Icon status={status} />
          </TreeItem2IconContainer>
          <TreeItem2IconContainer
            draggable={draggable}
            onDragStart={handleDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <DragIndicatorIcon />
          </TreeItem2IconContainer>
          <TreeItem2Checkbox {...getCheckboxProps()} />
          <Typography noWrap>
            {label}
          </Typography>
          <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />
      </RightClickMenu>

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

class TreeViewErrorBoundary extends Component<{ children: ReactNode }> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log the error if it's not the specific DOM insertion error
    if (!error.message.includes('insertBefore')) {
      console.error('TreeView Error:', error, errorInfo);
    }
  }

  render() {
    return this.props.children;
  }
}

export const Sidebar = ({ open, onToggle }: SidebarProps) => {
  const { data: projects } = useLoadListsQuery();
  const [patchListPosition] = usePatchListPositionMutation();
  const navigate = useNavigate();

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
    console.log('data', data)
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
        pt: 0.75
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
        <RichTreeViewPro
          sx={{
            '& > div:last-child': {
              display: 'none'
            },
            height: '100%',
            overflowY: 'auto'
          }}
          items={projects}
          onItemPositionChange={handleItemPositionChange}
          onSelectedItemsChange={(_, itemIds) => {
            if (itemIds) {
              handleNodeSelect(itemIds);
            }
          }}
          slots={{ item: CustomTreeItem as any }}
          experimentalFeatures={{
            indentationAtItemLevel: true,
            itemsReordering: true
          }}
          itemsReordering
        />
      </TreeViewErrorBoundary>
    </Box>
  );
};
