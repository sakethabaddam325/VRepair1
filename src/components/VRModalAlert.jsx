import React from 'react';
import { useAppContext } from '../contexts/AppContext.jsx';
import { Box, Button } from '@mui/material';

const VRModalAlert = () => {
  const { alertModal, closeAlert } = useAppContext();

  if (!alertModal.isOpen) return null;

  return (
    <Box
      onClick={closeAlert}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        bgcolor: 'action.disabledBackground',
        zIndex: 65000,
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          p: 2.5,
          minWidth: 300,
          maxWidth: 600,
          zIndex: 65001,
          fontSize: (theme) => theme.typography.body2.fontSize,
        }}
      >
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'common.white',
            fontWeight: 700,
            py: 1,
            px: 1.5,
            mb: 1.875,
          }}
        >
          vRepair
        </Box>
        <Box sx={{ px: 0.625, pb: 1.875, color: 'text.primary', whiteSpace: 'pre-wrap' }}>
          {alertModal.message}
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Button
            onClick={closeAlert}
            size="small"
            variant="contained"
            sx={{
              py: 0.625,
              px: 1.875,
              fontSize: (theme) => theme.typography.body2.fontSize,
            }}
          >
            OK
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default VRModalAlert;
