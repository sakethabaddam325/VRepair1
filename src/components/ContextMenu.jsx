import React, { useEffect, useRef } from 'react';
import { Box, Divider } from '@mui/material';

const ContextMenu = ({ isVisible, x, y, items, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <Box
      ref={menuRef}
      sx={{
        position: 'fixed',
        top: y,
        left: x,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 2,
        zIndex: 9999,
        minWidth: 15,
        fontSize: (theme) => theme.typography.body2.fontSize,
      }}
    >
      {items.map((item, idx) =>
        item.separator ? (
          <Divider key={idx} sx={{ my: 0.25, borderColor: 'divider' }} />
        ) : (
          <Box
            key={idx}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            sx={{
              py: 0.625,
              px: 1.5,
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              color: item.disabled ? 'text.disabled' : 'text.primary',
              bgcolor: 'transparent',
              userSelect: 'none',
              ...(!item.disabled && {
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                },
              }),
            }}
          >
            {item.label}
          </Box>
        )
      )}
    </Box>
  );
};

export default ContextMenu;
