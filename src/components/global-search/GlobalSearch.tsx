import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SearchResultItem as ResultData,
  SearchResultItem,
  useSearchQuery,
} from '../../store/api/searchApi';
import {
  Box,
  Divider,
  InputBase,
  ListItemIcon,
  MenuItem,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GlobalSearchResults from './GlobalSearchResults';
import SourceRoundedIcon from '@mui/icons-material/SourceRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

export default function GlobalSearch({ closeSearch }: { closeSearch: () => void }) {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const menuItemRefs = useRef<Map<number, HTMLLIElement>>(new Map());
  const { data, isLoading } = useSearchQuery(searchValue, {
    skip: !searchValue,
  });

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Focus management: selected item vs input
  useEffect(() => {
    if (selectedIndex >= 0) {
      menuItemRefs.current.get(selectedIndex)?.focus();
    } else {
      searchInputRef.current?.focus();
    }
  }, [selectedIndex]);

  // Return focus to input when typing
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const isNavigationKey = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key);
      const isModifierOnly = e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Meta';
      
      if (!isNavigationKey && !isModifierOnly && document.activeElement !== searchInputRef.current) {
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleInputChange = (val: string) => {
    setSearchValue(val);
  };

  const handleNavigationChange = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const setMenuItemRef = useCallback((index: number, element: HTMLLIElement | null) => {
    if (element) {
      menuItemRefs.current.set(index, element);
    } else {
      menuItemRefs.current.delete(index);
    }
  }, []);

  const renderOption = useCallback((option: SearchResultItem & { selected: boolean }, index: number) => {
    if (option._id === 'divider') {
      return (
        <Box py={0.5}>
          <Divider flexItem />
        </Box>
      );
    }

    const handleClick = () => {
      closeSearch();
      switch (option.type) {
        case 'list':
          navigate(`/projects/${option._id}`);
          break;
        case 'task':
          navigate(`/projects/${option.listId}`);
          break;
        case 'document':
          navigate(`/documents/${option._id}`);
          break;
      }
    };

    const renderIcon = (type: string) => {
      switch (type) {
        case 'list':
          return <SourceRoundedIcon />;
        case 'task':
          return <CategoryRoundedIcon />;
        case 'document':
          return <DescriptionRoundedIcon />;
      }
    };

    return (
      <MenuItem
        ref={(el) => setMenuItemRef(index, el)}
        data-cy={`search-result-${option.name}`}
        selected={option.selected}
        onClick={handleClick}
        tabIndex={option.selected ? 0 : -1}
      >
        <Stack direction="row" color="text.secondary" maxWidth="100%" gap={1}>
          {renderIcon(option.type)}
          <Typography variant="body1" color="text.secondary" noWrap>
            {option.name}
          </Typography>
        </Stack>
      </MenuItem>
    );
  }, [closeSearch, navigate, setMenuItemRef]);

  return (
    <Box width="100%" position="relative" overflow="hidden" height={500}>
      <Box
        sx={{
          backgroundColor: '#101010',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5), 0px 8px 30px rgba(0, 0, 0, 0.3)',
        }}
        borderRadius={1}
        height="auto"
        maxHeight="100%"
        overflow="hidden"
      >
        <Box
          px={2}
          py={1}
          onClick={() => {
            searchInputRef.current?.focus();
          }}
        >
          <InputBase
            data-cy="global-search-textfield"
            value={searchValue}
            {...(isFocused ? {} : { placeholder: undefined })}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            size="small"
            fullWidth
            autoComplete="off"
            autoFocus
            placeholder="Search"
            inputRef={searchInputRef}
          />
        </Box>
        <Divider flexItem className="" onClick={() => {}} />

        <GlobalSearchResults
          loading={isLoading}
          items={data?.results || []}
          searchValue={searchValue}
          onResultClick={() => {}}
          renderOption={renderOption}
          onNavigationChange={handleNavigationChange}
        />
      </Box>
    </Box>
  );
}
