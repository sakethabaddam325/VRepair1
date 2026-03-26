import React, { useState } from 'react';

import { Box, IconButton } from '@mui/material';

const AgentWorkspace = ({ leftRail, centreCanvas, rightRail }) => {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const railToggleSx = {
    position: 'sticky',
    top: '8px',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    mx: 'auto',
    my: '8px',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '4px',
    bgcolor: 'background.default',
    color: 'text.secondary',
    fontSize: 11,
    cursor: 'pointer',
    transition: 'background 0.15s ease, color 0.15s ease',
    lineHeight: 1,
    p: 0,
    '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `${leftCollapsed ? '36px' : '240px'} 1fr ${rightCollapsed ? '36px' : '280px'}`,
        height: 'calc(100vh - 50px)',
        width: '100%',
        overflow: 'hidden',
        transition: 'grid-template-columns 0.3s ease',
      }}
    >
      {/* Left Rail */}
      <Box
        component="aside"
        sx={{
          position: 'relative',
          overflowY: leftCollapsed ? 'hidden' : 'auto',
          overflowX: 'hidden',
          bgcolor: 'background.default',
          borderRight: leftCollapsed ? 'none' : '1px solid',
          borderColor: 'divider',
          minWidth: leftCollapsed ? 36 : undefined,
          transition: 'width 0.3s ease, min-width 0.3s ease',
        }}
      >
        <IconButton
          onClick={() => setLeftCollapsed(!leftCollapsed)}
          aria-label={leftCollapsed ? 'Expand left panel' : 'Collapse left panel'}
          sx={railToggleSx}
        >
          {leftCollapsed ? '\u25B6' : '\u25C0'}
        </IconButton>
        {!leftCollapsed && <Box sx={{ px: 1, py: '4px' }}>{leftRail}</Box>}
      </Box>

      {/* Centre Canvas */}
      <Box
        component="main"
        sx={{ overflowY: 'auto', bgcolor: 'background.default', p: '8px 12px' }}
      >
        {centreCanvas}
      </Box>

      {/* Right Rail */}
      <Box
        component="aside"
        sx={{
          position: 'relative',
          overflowY: rightCollapsed ? 'hidden' : 'auto',
          overflowX: 'hidden',
          bgcolor: 'background.default',
          borderLeft: rightCollapsed ? 'none' : '1px solid',
          borderColor: 'divider',
          minWidth: rightCollapsed ? 36 : undefined,
          transition: 'width 0.3s ease, min-width 0.3s ease',
        }}
      >
        <IconButton
          onClick={() => setRightCollapsed(!rightCollapsed)}
          aria-label={rightCollapsed ? 'Expand right panel' : 'Collapse right panel'}
          sx={railToggleSx}
        >
          {rightCollapsed ? '\u25C0' : '\u25B6'}
        </IconButton>
        {!rightCollapsed && <Box sx={{ px: 1, py: '4px' }}>{rightRail}</Box>}
      </Box>
    </Box>
  );
};

export default AgentWorkspace;
