import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import VRepairLogo from '../components/VRepairLogo.jsx';
import TabBar from '../components/TabBar/TabBar.jsx';
import NavigationDrawer from '../components/NavigationDrawer/NavigationDrawer.jsx';
import { Stack, Box, IconButton, InputBase, Typography, Badge } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useAppContext } from '../contexts/AppContext.jsx';

/**
 * VRepairLayout — shared layout wrapping all pages in the redesigned app.
 *
 * Renders:
 * 1. GlobalHeader (primary bar only — hamburger, logo, search, icons)
 * 2. TabBar (browser-style tabs from TabsContext)
 * 3. Main content area (children)
 * 4. NavigationDrawer (slide-out nav triggered by hamburger)
 */
export default function VRepairLayout({ children, pageNav }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginId, userCenterType } = useAppContext();

  return (
    <Stack
      direction="column"
      sx={{ height: '100vh', bgcolor: 'background.default' }}
    >
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1,
          py: 0.5,
          bgcolor: 'background.paper',
          color: 'text.primary',
          flexShrink: 0,
          minHeight: '50px',
        }}
      >
        {/* Left — hamburger + logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 0.5 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open navigation menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ p: 0.5 }}
          >
            <MenuIcon sx={{ fontSize: '35px' }} />
          </IconButton>
          <VRepairLogo />
        </Box>

        {/* Right — search + icons + user */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Universal Search */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderTop: '1px solid rgba(0,0,0,0.15)',
              borderLeft: '1px solid rgba(0,0,0,0.15)',
              borderRight: '1px solid rgba(0,0,0,0.15)',
              borderBottom: '2px solid rgba(0,0,0,0.65)',
              borderRadius: 0,
              px: 1,
              py: 0.25,
              width: 280,
              bgcolor: '#fff',
            }}
          >
            <InputBase
              placeholder="Universal Search"
              inputProps={{ 'aria-label': 'universal search' }}
              sx={{ fontSize: '13px', flex: 1 }}
            />
            <SearchIcon sx={{ fontSize: '20px', color: '#555' }} />
          </Box>

          {/* Help "?" */}
          <IconButton
            size="small"
            sx={{
              width: 22,
              height: 22,
              bgcolor: '#1976d2',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#1565c0' },
              p: 0,
            }}
          >
            <HelpOutlineIcon sx={{ fontSize: '14px' }} />
          </IconButton>

          {/* Add "+" */}
          <IconButton
            size="small"
            sx={{
              width: 22,
              height: 22,
              bgcolor: '#e0e0e0',
              color: '#555',
              '&:hover': { bgcolor: '#d0d0d0' },
              p: 0,
            }}
          >
            <AddCircleOutlineIcon sx={{ fontSize: '14px' }} />
          </IconButton>

          {/* Notification bell */}
          <IconButton sx={{ p: 0.5 }}>
            <Badge badgeContent={0} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '10px', height: '16px', minWidth: '14px' } }}>
              <NotificationsOutlinedIcon sx={{ fontSize: '24px' }} />
            </Badge>
          </IconButton>

          {/* AI Assistant */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              mx: '4px',
            }}
          >
            <SmartToyOutlinedIcon sx={{ fontSize: '18px', color: '#e65100' }} />
            <Typography sx={{ fontSize: '11px', lineHeight: 1.2, color: 'inherit' }}>
              AI Assistant
            </Typography>
          </Box>

          {/* User profile */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              mr: '8px',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 'bold', lineHeight: 1.3, textTransform: 'uppercase' }}>
                {loginId || 'User'}
              </Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 'bold', lineHeight: 1.2 }}>
                {userCenterType || 'WLS / WIRELESS NMC'}
              </Typography>
            </Box>
            <AccountCircleIcon sx={{ fontSize: '30px' }} />
          </Box>
        </Box>
      </Box>

      {pageNav}
      <TabBar />
      <Box
        component="main"
        sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        {children}
      </Box>
      <NavigationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(path) => navigate(path)}
        currentPath={location.pathname}
      />
    </Stack>
  );
}
