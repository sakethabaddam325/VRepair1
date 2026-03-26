import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@mui/material';
import { useAppContext } from '../contexts/AppContext.jsx';
import { useGroupSearch } from '../contexts/GroupSearchContext.jsx';
import { urlDecode } from '../utils/stringUtils.js';
import { Box, Stack, Typography } from '@mui/material';

const textareaSx = {
  width: '100%',
  minHeight: '200px',
  fontSize: 12,
  lineHeight: '14px',
  color: 'text.primary',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '3px',
  p: '5px',
  resize: 'vertical',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  '&:focus': { borderColor: 'grey.900' },
};

const TroubleNotes = ({ trNum, sessionUniqueKey, isGroupTicket = false, isTicketClosed = false, existingNotes = '' }) => {
  const { showAlert } = useAppContext();
  const { setGroupFieldsUpdated, isGroupClosed } = useGroupSearch();

  const [troubleHistory, setTroubleHistory] = useState(urlDecode(existingNotes));
  const [troubleNotes, setTroubleNotes] = useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  useEffect(() => {
    const shouldDisable = (isGroupTicket && isGroupClosed) || isTicketClosed;
    setIsSubmitDisabled(shouldDisable);
  }, [isGroupTicket, isGroupClosed, isTicketClosed]);

  useEffect(() => {
    if (existingNotes) {
      setTroubleHistory(urlDecode(existingNotes));
    }
  }, [existingNotes]);

  const handleNotesChange = useCallback((e) => {
    setTroubleNotes(e.target.value);
    if (isGroupTicket) {
      setGroupFieldsUpdated(true);
    }
  }, [isGroupTicket, setGroupFieldsUpdated]);

  const handleSubmit = useCallback(async () => {
    if (!troubleNotes.trim()) {
      showAlert('Please enter notes before submitting.');
      return;
    }
    showAlert('Notes submission — connected to parent frame submit handler.');
  }, [troubleNotes, showAlert]);

  return (
    <Stack
      id="troubleNotesDiv"
      direction="column"
      sx={{
        fontSize: 12,
        lineHeight: '14px',
        color: 'text.primary',
        p: '5px',
        gap: '8px',
      }}
    >
      <input type="hidden" id="page" name="hide" value="troubleNotes" />

      <Box>
        <Typography
          component="label"
          htmlFor="troubleHistory"
          sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary', display: 'block', mb: '2px' }}
        >
          Notes History
        </Typography>
        <Box
          component="textarea"
          id="troubleHistory"
          value={troubleHistory}
          readOnly
          tabIndex={1}
          sx={{ ...textareaSx, bgcolor: 'grey.100', cursor: 'default' }}
        />
      </Box>

      <Box>
        <Typography
          component="label"
          htmlFor="troubleNotes"
          sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary', display: 'block', mb: '2px' }}
        >
          Enter Notes
        </Typography>
        <Box
          component="textarea"
          id="troubleNotes"
          value={troubleNotes}
          onChange={handleNotesChange}
          tabIndex={2}
          sx={textareaSx}
        />
      </Box>

      <Stack direction="row" justifyContent="flex-end" sx={{ pt: '4px' }}>
        <Button size="small" variant="contained" disabled={isSubmitDisabled} onClick={handleSubmit}>
          ✏ Submit
        </Button>
      </Stack>
    </Stack>
  );
};

export default TroubleNotes;
