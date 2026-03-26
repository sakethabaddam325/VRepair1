import React from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography, List, ListItem, Divider, IconButton, ButtonBase } from '@mui/material';

/* ─── Inline SVG Icons (16x16, monochrome, stroke-based) ─── */

const WrenchIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2a4 4 0 0 0-3.46 6L2 12.54V14h1.46L8 9.46A4 4 0 1 0 10 2z" />
  </svg>
);

const GroupIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="5" r="2.5" />
    <path d="M2 13c0-2.21 1.79-4 4-4s4 1.79 4 4" />
    <circle cx="11.5" cy="5.5" r="1.8" />
    <path d="M14 13c0-1.66-1.12-3-2.5-3-.5 0-.97.15-1.37.4" />
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="1.5" width="12" height="13" rx="1.5" />
    <line x1="5" y1="5" x2="11" y2="5" />
    <line x1="5" y1="8" x2="11" y2="8" />
    <line x1="5" y1="11" x2="9" y2="11" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="4.5" />
    <line x1="10.5" y1="10.5" x2="14" y2="14" />
  </svg>
);

const TerminalIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="2" width="13" height="12" rx="1.5" />
    <polyline points="4.5,6 7,8.5 4.5,11" />
    <line x1="9" y1="11" x2="11.5" y2="11" />
  </svg>
);

const FlaskIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h4M6.5 2v4.5L2.5 13a1 1 0 0 0 .87 1.5h9.26a1 1 0 0 0 .87-1.5L9.5 6.5V2" />
    <line x1="4.5" y1="10" x2="11.5" y2="10" />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
    <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
    <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 9.5a3 3 0 0 0 4.24 0l2-2a3 3 0 0 0-4.24-4.24L7.5 4.26" />
    <path d="M9.5 6.5a3 3 0 0 0-4.24 0l-2 2a3 3 0 0 0 4.24 4.24L8.5 11.74" />
  </svg>
);

const MENU_ITEMS = [
  { label: 'Dashboard',                 icon: GridIcon,     path: '/dashboard' },
  { label: 'Trouble Management',       icon: WrenchIcon,   path: '/trouble-mgt' },
  { label: 'Group Trouble Management',  icon: GroupIcon,    path: '/group-trouble' },
  { label: 'Worklist',                  icon: ListIcon,     path: '/dashboard' },
  { label: 'Inventory Tools',           icon: SearchIcon,   path: '/inventory' },
  { label: 'Commands',                  icon: TerminalIcon, path: '/commands' },
  { label: 'Testing',                   icon: FlaskIcon,    path: '/testing' },
  { label: 'Tools and Links',           icon: LinkIcon,     path: '/tools-links' },
];

const NavigationDrawer = ({ isOpen, onClose, onNavigate, currentPath }) => {
  const handleItemClick = (path) => {
    onNavigate(path);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <Box
        aria-hidden="true"
        onClick={onClose}
        sx={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Drawer Panel */}
      <Box
        component="nav"
        aria-label="Main navigation"
        role="navigation"
        sx={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: 280,
          bgcolor: 'background.default',
          zIndex: 1001,
          boxShadow: '4px 0 12px rgba(0, 0, 0, 0.15)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: '16px', flexShrink: 0 }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: 20,
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: '24px',
            }}
          >
            vRepair
          </Typography>
          <IconButton
            onClick={onClose}
            aria-label="Close navigation"
            sx={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '3px',
              color: 'text.primary',
              fontSize: 20,
              lineHeight: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            &times;
          </IconButton>
        </Stack>

        {/* Divider */}
        <Divider sx={{ mx: '16px', flexShrink: 0 }} />

        {/* Menu Items */}
        <List sx={{ py: '8px', flex: 1 }} disablePadding>
          {MENU_ITEMS.map(({ label, icon: Icon, path }) => {
            const isActive = currentPath === path;
            return (
              <ListItem key={label} disablePadding>
                <ButtonBase
                  onClick={() => handleItemClick(path)}
                  sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    py: '12px',
                    px: '16px',
                    borderLeft: '3px solid',
                    borderLeftColor: isActive ? theme.palette.primary.main : 'transparent',
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    fontSize: 14,
                    lineHeight: '16.8px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      borderLeftColor: isActive ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.45),
                    },
                  })}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'inherit',
                      opacity: isActive ? 1 : 0.85,
                    }}
                  >
                    <Icon />
                  </Box>
                  <Typography component="span" sx={{ flex: 1, fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
                    {label}
                  </Typography>
                </ButtonBase>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </>
  );
};

export default NavigationDrawer;
