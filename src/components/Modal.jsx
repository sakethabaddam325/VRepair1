import React, { useMemo } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

/**
 * vRepair Modal -- wraps MUI Dialog while
 * preserving the same external API that existing call-sites rely on.
 *
 * Props kept for backward compatibility:
 *   isOpen, onClose, title, width, height, children, footer,
 *   isModal (ignored),
 *   showCloseButton (ignored).
 *
 * Canvas-specific props (submitLabel, clearLabel, onSubmit, onClear, tabs,
 * className) are accepted for gradual migration but not mapped to MUI Dialog.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  width = 500,
  height,
  footer = null,
  /* Legacy props accepted but not used */
  isModal,       // eslint-disable-line no-unused-vars
  showCloseButton, // eslint-disable-line no-unused-vars
  /* Canvas-native props -- accepted for compatibility */
  submitLabel,   // eslint-disable-line no-unused-vars
  clearLabel,    // eslint-disable-line no-unused-vars
  onSubmit,      // eslint-disable-line no-unused-vars
  onClear,       // eslint-disable-line no-unused-vars
  tabs,          // eslint-disable-line no-unused-vars
  className,     // eslint-disable-line no-unused-vars
  sx,
}) => {
  const widthValue = typeof width === 'number' ? `${width}px` : width;
  const heightValue =
    height !== undefined && height !== 'auto'
      ? typeof height === 'number'
        ? `${height}px`
        : height
      : undefined;

  return (
    <Dialog
      open={!!isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: widthValue,
          maxWidth: '95vw',
          ...(heightValue ? { height: heightValue } : {}),
          ...(sx || {}),
        },
      }}
    >
      {title && <DialogTitle>{title}</DialogTitle>}

      <DialogContent>
        {children}
      </DialogContent>

      {footer && (
        <DialogActions
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            px: 2,
            py: 1,
          }}
        >
          <Box sx={{ width: '100%' }}>{footer}</Box>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;
