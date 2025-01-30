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

export default function GlobalSearch({ closeSearch }: { closeSearch: () => void }) {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<HTMLDivElement | null>(null);
  const { data, isLoading } = useSearchQuery(searchValue, {
    skip: !searchValue,
  });

  const handleInputChange = (val: string) => {
    setSearchValue(val);
  };

  const renderOption = useCallback((option: SearchResultItem & { selected: boolean }) => {
    if (option._id === 'divider') {
      // Prevent it from being clickable as default autocomplete item
      return (
        <Box py={0.5}>
          <Divider flexItem className="" onClick={() => {}} />
        </Box>
      );
    }
    const handleClick = () => {
      closeSearch();
      if (option.type === 'list') {
        navigate(`/projects/${option._id}`);
      } else {
        navigate(`/projects/${option.listId}`);
      }
    };
    return (
      <MenuItem
        data-cy={`search-result-${option.text}`}
        selected={option.selected}
        onClick={handleClick}
      >
        <Stack direction="row" color="text.secondary" maxWidth="100%" gap={1}>
          {option.type === 'list' ? <SourceRoundedIcon /> : <CategoryRoundedIcon />}
          <Typography variant="body1" color="text.secondary" noWrap>
            {option.text}
          </Typography>
        </Stack>
      </MenuItem>
    );
  }, []);

  return (
    <Box width="100%" position="relative" overflow="hidden" height={500}>
      <Box
        sx={{
          backgroundColor: '#101010',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5), 0px 8px 30px rgba(0, 0, 0, 0.3)'
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
        />
      </Box>
    </Box>
  );
}
