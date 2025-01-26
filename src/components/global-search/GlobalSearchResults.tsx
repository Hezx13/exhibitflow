import { Box, MenuList, MenuItem, ListItemIcon, ListItemText, SvgIcon } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { SearchResultItem } from '../../store/api/searchApi';
interface GlobalSearchResultsProps {
  loading: boolean;
  items: SearchResultItem[];
  searchValue: string;
  renderOption: (item: SearchResultItem & { selected: boolean }) => React.ReactNode;
  onResultClick: (item: SearchResultItem | null | undefined) => void;
  displayCreateNew?: boolean;
}

export default function GlobalSearchResults({
  displayCreateNew = true,
  loading,
  items,
  searchValue,
  renderOption,
  onResultClick,
}: GlobalSearchResultsProps) {
  const searchResultsRef = useRef<HTMLUListElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === -1) {
            // Find first non-divider item
            const itemIndex = items.findIndex((item) => item._id !== 'divider');
            return itemIndex === -1 ? 0 : itemIndex;
          }

          const direction = e.key === 'ArrowDown' ? 1 : -1;
          let newIndex = prev + direction;

          // Skip dividers
          while (newIndex >= 0 && newIndex < items.length && items[newIndex]._id === 'divider') {
            newIndex += direction;
          }

          // Ensure index stays within bounds
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
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [items.length, handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchValue]);

  return (
    <AnimatePresence mode="wait">
      <Box
        sx={{ backgroundColor: '#101010', px: 0.5 }}
        overflow="auto"
        height="100%"
        maxHeight={500}
        borderRadius={1}
        component={motion.div}
        layout
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            layout
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MenuList ref={searchResultsRef} component={motion.ul} layout sx={{ height: '100%' }}>
              {items?.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  layout
                >
                  {renderOption({ ...item, selected: index === selectedIndex })}
                </motion.div>
              ))}
            </MenuList>
          </motion.div>
        </AnimatePresence>
      </Box>
    </AnimatePresence>
  );
}
