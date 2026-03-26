import React, { lazy, Suspense } from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';

const TroubleNotes = lazy(() => import('../pages/TroubleNotes.jsx'));

const NotesSlidePanel = ({
  isOpen,
  onClose,
  trNum,
  sessionUniqueKey,
  isGroupTicket,
  isTicketClosed,
  existingNotes,
}) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-label="Notes panel"
      onClick={handleOverlayClick}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'opacity 0.25s ease',
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: 420,
          bgcolor: 'background.default',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.16)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            p: '16px',
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, color: 'text.primary', m: 0 }}
          >
            Notes
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={onClose}
            aria-label="Close notes panel"
            sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }}
          >
            ✕
          </Button>
        </Stack>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflowY: 'auto',
            p: '16px',
          }}
        >
          <Suspense fallback={<Box>Loading notes...</Box>}>
            {isOpen && (
              <TroubleNotes
                trNum={trNum}
                sessionUniqueKey={sessionUniqueKey}
                isGroupTicket={isGroupTicket}
                isTicketClosed={isTicketClosed}
                existingNotes={existingNotes}
              />
            )}
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
};

export default NotesSlidePanel;
