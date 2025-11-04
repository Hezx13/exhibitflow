import { Box, MenuList, MenuItem, ListItemIcon, ListItemText, SvgIcon, Typography, Stack } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, useEffect, useState, useCallback, forwardRef } from 'react';
import { SearchResultItem } from '../../store/api/searchApi';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FindInPageRoundedIcon from '@mui/icons-material/FindInPageRounded';

interface GlobalSearchResultsProps {
  loading: boolean;
  items: SearchResultItem[];
  searchValue: string;
  renderOption: (item: SearchResultItem & { selected: boolean }, index: number) => React.ReactNode;
  onResultClick: (item: SearchResultItem | null | undefined) => void;
  displayCreateNew?: boolean;
  onNavigationChange?: (index: number) => void;
}

export default function GlobalSearchResults({
  displayCreateNew = true,
  loading,
  items,
  searchValue,
  renderOption,
  onResultClick,
  onNavigationChange,
}: GlobalSearchResultsProps) {
  const searchResultsRef = useRef<HTMLUListElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === -1) {
            const itemIndex = items.findIndex((item) => item._id !== 'divider');
            return itemIndex === -1 ? 0 : itemIndex;
          }

          const direction = e.key === 'ArrowDown' ? 1 : -1;
          let newIndex = prev + direction;

          while (newIndex >= 0 && newIndex < items.length && items[newIndex]._id === 'divider') {
            newIndex += direction;
          }

          if (newIndex < 0) return prev;
          if (newIndex >= items.length) return prev;

          return newIndex;
        });
      }
      if (e.key === 'Enter') {
        if (selectedIndex !== -1 && selectedIndex < items.length) {
          const selectedItem = items[selectedIndex];
          onResultClick(selectedItem);
        }
        e.stopPropagation();
      }
    },
    [items, selectedIndex, onResultClick]
  );

  useEffect(() => {
    onNavigationChange?.(selectedIndex);
  }, [selectedIndex, onNavigationChange]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [items.length, handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchValue]);

  // Reset selected index when items change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [items]);

  // Determine what content to display
  const getContent = () => {
    // Empty search - show start searching placeholder
    if (!searchValue) {
      return (
        <EmptySearchPlaceholder />
      );
    }
    
    // Loading state
    if (loading) {
      return (
        <LoadingResults />
      );
    }
    
    // No results found
    if (searchValue && (!items || items.length === 0)) {
      return (
        <NoResultsPlaceholder searchValue={searchValue} />
      );
    }
    
    // Has results
    return (
      <ResultsList 
        items={items} 
        selectedIndex={selectedIndex}
        renderOption={renderOption} 
        ref={searchResultsRef}
      />
    );
  };

  return (
    <Box
      sx={{ px: 0.5 }}
      overflow="auto"
      height="100%"
      maxHeight={500}
      borderRadius={1}
      component={motion.div}
      layout
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence mode="wait">
        {getContent()}
      </AnimatePresence>
    </Box>
  );
}

// Component for displaying the results list
const ResultsList = motion(forwardRef(function ResultsList({ 
  items, 
  selectedIndex, 
  renderOption 
}: { 
  items: SearchResultItem[]; 
  selectedIndex: number; 
  renderOption: (item: SearchResultItem & { selected: boolean }, index: number) => React.ReactNode;
}, ref: React.Ref<HTMLUListElement>) {
  return (
    <motion.div
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <MenuList ref={ref} component={motion.ul} layout sx={{ height: '100%' }}>
        {items.map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.2, 
              ease: 'easeInOut',
              delay: index * 0.03 // Stagger animation
            }}
            layout
          >
            {renderOption({ ...item, selected: index === selectedIndex }, index)}
          </motion.div>
        ))}
      </MenuList>
    </motion.div>
  );
}));

// Empty search placeholder
function EmptySearchPlaceholder() {
  return (
    <motion.div
      key="empty-search"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        py={6}
        px={2}
      >
        <Box
          component={motion.div}
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
          sx={{ color: 'text.secondary', mb: 2 }}
        >
          <SearchRoundedIcon sx={{ fontSize: 48 }} />
        </Box>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          align="center"
          component={motion.p}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Start typing to search
        </Typography>
      </Box>
    </motion.div>
  );
}

// No results found placeholder
function NoResultsPlaceholder({ searchValue }: { searchValue: string }) {
  return (
    <motion.div
      key="no-results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        py={6}
        px={2}
      >
        <Box
          component={motion.div}
          animate={{ 
            y: [0, -5, 0],
            rotateZ: [0, -5, 0, 5, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
          sx={{ color: 'text.secondary', mb: 2 }}
        >
          <FindInPageRoundedIcon sx={{ fontSize: 48 }} />
        </Box>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          align="center"
          component={motion.p}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          No results found for "{searchValue}"
        </Typography>
      </Box>
    </motion.div>
  );
}

// Loading results placeholder
function LoadingResults() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        py={6}
        px={2}
      >
        <Box
          component={motion.div}
          animate={{ 
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "linear"
          }}
          sx={{ color: 'text.secondary', mb: 2 }}
        >
          <SearchRoundedIcon sx={{ fontSize: 48 }} />
        </Box>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          align="center"
        >
          Searching...
        </Typography>
      </Box>
    </motion.div>
  );
}
