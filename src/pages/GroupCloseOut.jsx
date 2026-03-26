import React, { useState, useCallback } from 'react';
import EventSummary from './EventSummary.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import DataGrid from '../components/DataGrid.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAppContext } from '../contexts/AppContext.jsx';
import { useGroupSearch } from '../contexts/GroupSearchContext.jsx';
import { Box, Button, TextField, MenuItem } from '@mui/material';

const labelSx = { fontSize: (theme) => theme.typography.caption.fontSize, fontWeight: 700, whiteSpace: 'nowrap', color: 'text.primary' };

const GroupCloseOut = ({ trNum, sessionUniqueKey }) => {
  const { showAlert } = useAppContext();
  const { setGroupFieldsUpdated, groupType } = useGroupSearch();

  const [isLoading, setIsLoading] = useState(false);
  const [channelRows, setChannelRows] = useState([]);
  const [lfaRows, setLfaRows] = useState([]);
  const [reasonCode, setReasonCode] = useState('');

  const channelColumns = [
    { field: 'chNum', label: '#', width: 40 },
    { field: 'name', label: 'Name', width: 150 },
    { field: 'package', label: 'Package', width: 100 },
    { field: 'both', label: 'Both', width: 50 },
    { field: 'video', label: 'Video', width: 50 },
    { field: 'audio', label: 'Audio', width: 50 },
    { field: 'prim', label: 'Prim', width: 50 },
    { field: 'sec', label: 'Sec', width: 50 },
  ];

  const lfaColumns = [
    { field: 'lfaId', label: 'ID', width: 60 },
    { field: 'productId', label: 'Product', width: 100 },
    { field: 'totalSub', label: 'Subscriber', width: 80 },
    { field: 'impactNum', label: 'Provisioned', width: 80 },
    { field: 'attachNum', label: 'Customers', width: 80 },
    { field: 'lfaReportId', label: 'LFA Rep', width: 80 },
  ];

  return (
    <Box
      id="groupCloseOutDiv"
      sx={{ fontSize: 12, p: '5px' }}
    >
      {isLoading && <LoadingSpinner />}

      <EventSummary trNum={trNum} sessionUniqueKey={sessionUniqueKey} />

      <SectionHeader title="Close-Out Details">
        <Box component="table" sx={{ width: '100%' }}>
          <Box component="tbody">
            <Box component="tr">
              <Box component="td" sx={labelSx}>Reason Code</Box>
              <Box component="td">
                <TextField
                  select
                  size="small"
                  variant="outlined"
                  id="reasonCode"
                  value={reasonCode}
                  onChange={(e) => { setReasonCode(e.target.value); setGroupFieldsUpdated(true); }}
                  sx={{ width: '220px' }}
                >
                  <MenuItem value=""></MenuItem>
                </TextField>
              </Box>
            </Box>
          </Box>
        </Box>
      </SectionHeader>

      {(groupType === 'VID' || groupType === 'VIDEO') && (
        <SectionHeader title="Channels Grid">
          <DataGrid
            columns={channelColumns}
            data={channelRows}
            height={200}
            alternateRows
            showToolbar
            showFooter
          />
          <Box sx={{ mt: '5px' }}>
            <Button
              size="small"
              variant="contained"
              onClick={() => setChannelRows((prev) => [...prev, { chNum: prev.length + 1, rowId: Date.now() }])}
            >
              + Add Channel
            </Button>
          </Box>
        </SectionHeader>
      )}

      <SectionHeader title="LFA (Lost Facilities Analysis)">
        <DataGrid
          columns={lfaColumns}
          data={lfaRows}
          height={250}
          alternateRows
          showToolbar
          showFooter
        />
        <Box sx={{ mt: '5px' }}>
          <Button
            size="small"
            variant="contained"
            onClick={() => setLfaRows((prev) => [...prev, { lfaId: prev.length + 1, rowId: Date.now() }])}
          >
            + Add LFA Row
          </Button>
        </Box>
      </SectionHeader>
    </Box>
  );
};

export default GroupCloseOut;
