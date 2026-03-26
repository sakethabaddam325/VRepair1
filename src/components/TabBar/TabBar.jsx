import React from 'react';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { useTabsContext } from '../../contexts/TabsContext';
import { Stack, Typography, ButtonBase, IconButton } from '@mui/material';

/**
 * TabBar — horizontal tab bar for open tickets/worklists.
 *
 * Hidden when no tabs are open. When the last tab is closed,
 * navigates back to the dashboard.
 */
export default function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabsContext();
  const navigate = useNavigate();

  // Don't render the bar when there are no open tabs
  if (tabs.length === 0) return null;

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  const handleClose = (e, tab) => {
    e.stopPropagation();
    closeTab(tab.id);

    const remaining = tabs.filter((t) => t.id !== tab.id);
    if (remaining.length > 0) {
      const idx = tabs.findIndex((t) => t.id === tab.id);
      const newActive = remaining[Math.min(idx, remaining.length - 1)] || remaining[0];
      navigate(newActive.path);
    } else {
      // All tabs closed — return to dashboard
      navigate('/dashboard');
    }
  };

  return (
    <Stack
      direction="row"
      alignItems="stretch"
      sx={{
        height: 36,
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: '8px',
        gap: 0,
        overflowX: 'auto',
      }}
    >
      <Typography
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: '8px',
          fontSize: 12,
          color: 'grey.500',
          whiteSpace: 'nowrap',
        }}
      >
        Open:
      </Typography>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <ButtonBase
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            sx={(theme) => ({
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              py: '8px',
              px: '16px',
              backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
              fontSize: 13,
              lineHeight: 1,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
              whiteSpace: 'nowrap',
              transition: 'color 0.15s ease, background-color 0.15s ease',
              borderRadius: 1,
              border: '1px solid transparent',
              '&:hover': {
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                borderColor: alpha(theme.palette.primary.main, 0.35),
              },
              ...(isActive && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  bgcolor: 'primary.main',
                  borderRadius: '3px 3px 0 0',
                },
              }),
            })}
          >
            <Typography component="span" sx={{ pointerEvents: 'none', fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
              {tab.label}
            </Typography>
            {tab.closable && (
              <IconButton
                onClick={(e) => handleClose(e, tab)}
                aria-label={`Close ${tab.label}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleClose(e, tab);
                }}
                size="small"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 16,
                  height: 16,
                  color: 'text.secondary',
                  fontSize: 14,
                  lineHeight: 1,
                  borderRadius: '3px',
                  transition: 'color 0.15s ease',
                  '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
                }}
              >
                &times;
              </IconButton>
            )}
          </ButtonBase>
        );
      })}
    </Stack>
  );
}
