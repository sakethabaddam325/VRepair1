import React, { useRef, useState } from 'react';
import { validateFile } from '../utils/validationUtils.js';
import { Box, Typography } from '@mui/material';

const UploadDownload = ({
  sessionKey,
  troubleReportNum,
  emailAction,
  srcLink,
  onFileSelected,
  isEnabled = false,
}) => {
  const fileInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const { isValid, error } = validateFile(file);
    if (!isValid) {
      alert(error);
      e.target.value = '';
      setSelectedFileName('');
      return;
    }

    setSelectedFileName(file.name);
    if (onFileSelected) onFileSelected(file);
  };

  return (
    <Box sx={{ m: 0, p: 0 }}>
      <input
        ref={fileInputRef}
        type="file"
        id="theFile"
        name="theFile"
        accept=".txt,.doc,.docx,.xml,.log,.pdf,.csv,.xls,.xlsx"
        onChange={handleFileChange}
        disabled={!isEnabled}
      />
      {selectedFileName && (
        <Typography component="span" sx={{ fontSize: (theme) => theme.typography.caption.fontSize, ml: 0.625, color: 'text.primary' }}>
          {selectedFileName}
        </Typography>
      )}
      <input type="hidden" name="sessionKey" value={sessionKey || ''} />
      <input type="hidden" name="troubleReportNum" value={troubleReportNum || ''} />
      <input type="hidden" name="emailAction" value={emailAction || ''} />
      <input type="hidden" name="src" value={srcLink || ''} />
    </Box>
  );
};

export default UploadDownload;
