import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext.jsx';
import { Box, Stack, Typography, TextField, Select, MenuItem, FormControl, Button, Chip, IconButton, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const APP_ENV = import.meta.env.VITE_APP_ENV || 'DEV';

const envBadgeVariant = (env) => {
  switch (env.toUpperCase()) {
    case 'PROD': return 'success';
    case 'UAT':  return 'warning';
    case 'SIT':  return 'info';
    default:     return 'error';
  }
};

const TopPanel = ({ children }) => {
  const navigate = useNavigate();
  const { loginId, addToast } = useAppContext();

  const [searchTrNum, setSearchTrNum] = useState('');
  const [searchMode, setSearchMode] = useState('GROUP');

  const handleSearch = useCallback(() => {
    const trimmed = searchTrNum.trim();
    if (!trimmed) {
      addToast('Please enter a Trouble Report number to search.', 'info');
      return;
    }
    if (searchMode === 'GROUP') {
      navigate(`/group-trouble/${encodeURIComponent(trimmed)}`);
    } else {
      navigate(`/inventory?circuitId=${encodeURIComponent(trimmed)}`);
    }
  }, [searchTrNum, searchMode, navigate, addToast]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch],
  );

  return (
    <Box
      sx={{
        fontSize: 14,
        lineHeight: '16.8px',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* ─── Header Bar ─── */}
      <Stack
        component="header"
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          gap: '16px',
          py: '8px',
          px: '20px',
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        {/* Left: branding + env badge */}
        <Stack direction="row" alignItems="center" sx={{ gap: '10px', flexShrink: 0 }}>
          <Typography
            component="span"
            sx={{
              fontSize: 20,
              fontWeight: 700,
              lineHeight: '24px',
              letterSpacing: '-0.25px',
              fontStyle: 'italic',
              whiteSpace: 'nowrap',
            }}
          >
            vRepair
          </Typography>
          <Chip
            label={APP_ENV}
            color={envBadgeVariant(APP_ENV)}
            size="small"
            sx={{ fontSize: 11, height: 20 }}
          />
        </Stack>

        {/* Center: search controls */}
        <Stack direction="row" alignItems="center" sx={{ gap: '8px', flexShrink: 0 }}>
          <Typography
            variant="subtitle2"
            component="label"
            htmlFor="vr-search-mode"
            sx={{
              fontSize: 12,
              lineHeight: '14px',
              color: 'text.primary',
              whiteSpace: 'nowrap',
            }}
          >
            Search:
          </Typography>

          <FormControl size="small">
            <Select
              id="vr-search-mode"
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value)}
              sx={{
                fontSize: 12,
                bgcolor: 'background.default',
                color: 'text.primary',
              }}
            >
              <MenuItem value="GROUP">Group TR#</MenuItem>
              <MenuItem value="CIRCUIT">Circuit ID</MenuItem>
            </Select>
          </FormControl>

          <TextField
            variant="outlined"
            size="small"
            value={searchTrNum}
            onChange={(e) => setSearchTrNum(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder={searchMode === 'GROUP' ? 'Enter TR Number' : 'Enter Circuit ID'}
            id="searchInput"
            sx={{ width: 180 }}
          />

          <Button
            size="small"
            variant="contained"
            onClick={handleSearch}
          >
            Go
          </Button>
        </Stack>

        {/* Right: nav + utility icons + user */}
        <Stack direction="row" alignItems="center" sx={{ gap: '12px', flexShrink: 0, ml: 'auto' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate('/inventory')}
          >
            DS Inventory
          </Button>

          {/* Help icon */}
          <Tooltip title="Help">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Create New Ticket">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <AddCircleOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Full name + role display */}
          {loginId && (
            <Stack
              direction="row"
              alignItems="center"
              sx={{ gap: '6px', flexShrink: 0 }}
            >
              <PersonIcon />
              <Stack direction="column" sx={{ gap: 0 }}>
                <Typography component="span" sx={{ fontSize: 12, fontWeight: 700, lineHeight: '14px', color: 'text.primary', whiteSpace: 'nowrap' }}>
                  {loginId.toUpperCase()}
                </Typography>
                <Typography component="span" sx={{ fontSize: 10, lineHeight: '13px', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  WLS/WIRELESS NMC
                </Typography>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>

      {/* ─── Main Content ─── */}
      <Box component="main" sx={{ position: 'relative' }}>{children}</Box>
    </Box>
  );
};

/* ─── Inline SVG ─── */
const PersonIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M4 21C4 17.13 7.58 14 12 14C16.42 14 20 17.13 20 21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default TopPanel;
