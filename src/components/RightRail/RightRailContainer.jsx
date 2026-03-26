import React, { useState, useCallback } from 'react';
import { Box, Stack, Typography, IconButton } from '@mui/material';

const RightRailContainer = ({ children, title = 'Contextual Tools' }) => {
  const [allExpanded, setAllExpanded] = useState(true);

  const toggleAll = useCallback(() => {
    setAllExpanded((prev) => !prev);
    // Dispatch a custom event that child panels can listen to
    window.dispatchEvent(new CustomEvent('rail-toggle-all', { detail: { expanded: !allExpanded } }));
  }, [allExpanded]);

  return (
    <Stack direction="column" sx={{ height: '100%' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          py: '6px',
          px: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          position: 'sticky',
          top: 0,
          zIndex: 5,
        }}
      >
        <Typography
          component="span"
          sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          {title}
        </Typography>
        <IconButton
          onClick={toggleAll}
          title={allExpanded ? 'Collapse All' : 'Expand All'}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            p: 0,
            bgcolor: 'background.default',
            color: 'grey.500',
            transition: 'background 0.15s, color 0.15s',
            '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
          }}
        >
          {allExpanded ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5h8M3 9h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5h8M3 9h8M7 3v4M7 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          )}
        </IconButton>
      </Stack>
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </Box>
    </Stack>
  );
};

export default RightRailContainer;
