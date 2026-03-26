import React, { useState, useEffect, useCallback, useRef } from 'react';
import DataGrid from '../components/DataGrid.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import { useAppContext } from '../contexts/AppContext.jsx';
import { loadGroupActivityLog, getActivityLog, voidActivityRemark, loadFunctionPanelForGroup, fetchWlnGroupActivityLog } from '../api/groupTroubleApi.js';
import { ACTIVITY_LOG_VIEWS } from '../constants/appConstants.js';
import { Box, Stack, Button, Checkbox, FormControlLabel, TextField, MenuItem } from '@mui/material';
import mockActivityLogResponse from '../../mock-server/data/Activity-log.json';
import { mapActivityLogResponse } from '../utils/activityLogMapper.js';

/**
 * Toggle: set to true  → use local mock data (no network call)
 *         set to false → call real API POST /wlnGroupActivityLog
 */
const USE_MOCK = false;

const controlSx = { '& .MuiInputBase-input': { fontSize: 11 } };

const GroupActivityLog = ({ trNum, sessionUniqueKey, sourceLink = 'GTRM' }) => {
  const { showAlert, userID } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [activityRows, setActivityRows] = useState([]);
  const [selectedEntryText, setSelectedEntryText] = useState('');
  const [currentView, setCurrentView] = useState(ACTIVITY_LOG_VIEWS.VICON);
  const [filterByValue, setFilterByValue] = useState('ALL');
  const [filterOptions, setFilterOptions] = useState([{ value: 'ALL', label: 'ALL' }]);
  const [logFilterValue, setLogFilterValue] = useState('ALL');
  const [attachDetach, setAttachDetach] = useState(false);
  const [userFlow, setUserFlow] = useState(false);
  const [findText, setFindText] = useState('');
  const [functionOptions, setFunctionOptions] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState('');
  const [functionPanelOpen, setFunctionPanelOpen] = useState(false);
  const [emailPopupOpen, setEmailPopupOpen] = useState(false);
  const [contextMenuRow, setContextMenuRow] = useState(null);
  const [postParams, setPostParams] = useState({});
  const [nextCounter, setNextCounter] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  // overrides lets callers pass the latest state values when calling
  // immediately after a setState (avoids stale closure reads).
  const loadActivityLog = useCallback(async (resetCounter = 'Y', overrides = {}) => {
    setIsLoading(true);
    try {
      let mapped;

      // Use override values when provided so callers that set state
      // immediately before invoking this always get the intended values.
      const effectiveAttachDetach = 'attachDetach' in overrides ? overrides.attachDetach : attachDetach;
      const effectiveNextCounter  = 'nextCounter'  in overrides ? overrides.nextCounter  : nextCounter;

      if (USE_MOCK) {
        await Promise.resolve();
        mapped = mapActivityLogResponse(mockActivityLogResponse);
      } else {
        try {
          const response = await fetchWlnGroupActivityLog({
            groupTroubleNum: trNum,
            type:            effectiveAttachDetach ? 'detach' : '',
            activitySeqNum:  resetCounter === 'Y' ? 0 : effectiveNextCounter,
            userId:          userID || 'GONDCH7',
            searchType:      'ACTIVITY',
          });
          mapped = mapActivityLogResponse(response.data);
        } catch (apiErr) {
          console.error('[ActivityLog] Real API failed, falling back to mock:', apiErr);
          mapped = mapActivityLogResponse(mockActivityLogResponse);
        }
      }

      const { rows, filterOptions: opts, functionOptions: fnOpts, minSequenceNum } = mapped;

      if (resetCounter === 'Y') {
        setActivityRows(rows);
      } else {
        setActivityRows((prev) => [...prev, ...rows]);
      }

      // Update the pagination cursor so "Next" requests the correct page
      setNextCounter(minSequenceNum ? Number(minSequenceNum) : 0);
      setHasNextPage(!!minSequenceNum);

      if (opts.length > 0) {
        setFilterOptions([{ value: 'ALL', label: 'ALL' }, ...opts]);
      }
      if (fnOpts.length > 0) {
        setFunctionOptions(fnOpts);
      }
    } catch {
      showAlert('Error loading Activity Log. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionUniqueKey, trNum, currentView, attachDetach, nextCounter, postParams, showAlert, userID]);

  useEffect(() => {
    loadActivityLog('Y');
  }, []);

  const handleViewChange = useCallback((view) => {
    setCurrentView(view);
    setNextCounter(0);
    // Pass nextCounter override so the reset takes effect immediately
    loadActivityLog('Y', { nextCounter: 0 });
  }, [loadActivityLog]);

  const handleGetNextRecords = useCallback(() => {
    loadActivityLog('N');
  }, [loadActivityLog]);

  const handleVoidRemark = useCallback(async (row) => {
    if (!window.confirm('Are you sure you want to void this remark?')) return;
    setIsLoading(true);
    try {
      await voidActivityRemark({ sessionUniqueKey, troubleReportNo: trNum, seqNum: row.seqNum, displaySeqNum: row.displaySeqNum });
      showAlert('Remark voided successfully.');
      loadActivityLog('Y');
    } catch {
      showAlert('Error voiding remark. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionUniqueKey, trNum, showAlert, loadActivityLog]);

  const filteredRows = useCallback(() => {
    let rows = activityRows;
    if (filterByValue !== 'ALL') {
      rows = rows.filter((r) => r.filter === filterByValue || r.center === filterByValue || r.userId === filterByValue);
    }
    if (logFilterValue === '0') {
      rows = rows.filter((r) => r.logType === 'TICKET');
    } else if (logFilterValue === '1') {
      rows = rows.filter((r) => r.logType === 'TICKET' || r.logType === 'LEVEL_UP');
    }
    if (userFlow) {
      rows = rows.filter((r) => r.isUserFlow === true);
    }
    if (selectedFunction) {
      rows = rows.filter((r) => r.function === selectedFunction);
    }
    if (findText) {
      const search = findText.toLowerCase();
      rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(search)));
    }
    return rows;
  }, [activityRows, filterByValue, logFilterValue, userFlow, selectedFunction, findText]);

  const activityColumns = [
    { field: 'seq', label: 'SEQ', width: 50 },
    { field: 'dateTime', label: 'DATE/TIME', width: 120 },
    { field: 'userId', label: 'USER ID', width: 80 },
    { field: 'center', label: 'CENTER', width: 80 },
    { field: 'function', label: 'FUNCTION', width: 120 },
    { field: 'type', label: 'TYPE', width: 60 },
    { field: 'remark', label: 'REMARK', width: 400, wrap: true },
  ];

  const contextMenuItems = useCallback((row) => [
    {
      label: 'Copy',
      onClick: () => {
        const text = row.remark || '';
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
        } else {
          const el = document.createElement('textarea');
          el.value = text;
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
        }
      },
    },
    { label: 'Void Remarks', onClick: () => handleVoidRemark(row) },
  ], [handleVoidRemark]);

  const exportToSpreadsheet = useCallback(() => {
    const rows = filteredRows();
    const headers = activityColumns.map((c) => c.label).join('\t');
    const dataRows = rows.map((r) => activityColumns.map((c) => String(r[c.field] ?? '')).join('\t')).join('\n');
    const blob = new Blob([headers + '\n' + dataRows], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_log_${trNum}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredRows, activityColumns, trNum]);

  return (
    <Box
      id="ActivityLogDiv"
      sx={{ fontSize: 12, lineHeight: '14px', p: '5px', color: 'text.primary' }}
    >
      {isLoading && <LoadingSpinner />}

      {/* Toolbar */}
      <Stack direction="row" alignItems="center" sx={{ gap: '8px', mb: '5px', flexWrap: 'wrap' }}>
        <Stack direction="row" sx={{ gap: '4px' }}>
          {[
            { view: ACTIVITY_LOG_VIEWS.VICON, label: 'View' },
            { view: ACTIVITY_LOG_VIEWS.MULTIPLE, label: 'Multi' },
            { view: ACTIVITY_LOG_VIEWS.SINGLE, label: 'Single' },
          ].map(({ view, label }) => (
            <Button key={view} size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} variant={currentView === view ? 'contained' : 'outlined'} onClick={() => handleViewChange(view)}>
              {label}
            </Button>
          ))}
        </Stack>

        <TextField size="small" id="findBox" value={findText} onChange={(e) => setFindText(e.target.value)} placeholder="Find..." sx={{ ...controlSx, width: '140px' }} />

        <TextField select size="small" id="filterByDDM" value={filterByValue} onChange={(e) => setFilterByValue(e.target.value)} sx={{ ...controlSx, width: '120px' }}>
          {filterOptions.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
        </TextField>

        <TextField select size="small" id="logFilterDDM" value={logFilterValue} onChange={(e) => setLogFilterValue(e.target.value)} sx={{ ...controlSx, width: '160px' }}>
          <MenuItem value="ALL">ALL</MenuItem>
          <MenuItem value="0">TICKET</MenuItem>
          <MenuItem value="1">TICKET/LEVEL UP</MenuItem>
        </TextField>

        <FormControlLabel control={<Checkbox checked={userFlow} onChange={(e) => setUserFlow(e.target.checked)} size="small" />} label="User Flow" />

        <FormControlLabel control={<Checkbox checked={attachDetach} onChange={(e) => { const val = e.target.checked; setAttachDetach(val); setNextCounter(0); loadActivityLog('Y', { attachDetach: val, nextCounter: 0 }); }} size="small" />} label="Attach/Detach" />

        <Stack direction="row" alignItems="center" sx={{ gap: '4px', ml: 'auto' }}>
          <TextField select size="small" id="functionDDMGAL" value={selectedFunction} onChange={(e) => setSelectedFunction(e.target.value)} sx={{ ...controlSx, width: '240px' }}>
            <MenuItem value="">-- Select Function --</MenuItem>
            {functionOptions.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
          </TextField>
          <input type="hidden" id="chosenFunctionGAL" value={selectedFunction} />
          <Button size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} variant="contained" onClick={exportToSpreadsheet}>Export</Button>
        </Stack>
      </Stack>

      {/* Grid */}
      <Box id="activityLogTab" sx={{ width: '100%' }}>
        <DataGrid
          columns={activityColumns}
          data={filteredRows()}
          height={window.innerHeight - 350}
          onRowSelect={(row) => setSelectedEntryText(row.remark || '')}
          onRightClickMenuItems={contextMenuItems}
          alternateRows
          showToolbar
          showFooter
        />
      </Box>

      {/* Next Page */}
      {hasNextPage && (
        <Box id="nextDiv" sx={{ textAlign: 'center', mt: '5px' }}>
          <Button size="small" variant="contained" onClick={handleGetNextRecords}>Next</Button>
        </Box>
      )}

      {/* Single Row Detail */}
      {currentView === ACTIVITY_LOG_VIEWS.SINGLE && (
        <Box sx={{ mt: '8px' }}>
          <TextField label="Selected Entry" value={selectedEntryText} disabled multiline rows={4} fullWidth />
        </Box>
      )}

      {/* Function Panel Modal */}
      <Modal isOpen={functionPanelOpen} onClose={() => setFunctionPanelOpen(false)} title="Function Panel" width={300} height={Math.min(1060, window.innerHeight - 100)} isModal={false}>
        <Box sx={{ p: '5px', fontSize: 11, lineHeight: '13.2px', color: 'grey.500' }}>
          Function panel content — {selectedFunction || 'No function selected'}
        </Box>
      </Modal>
    </Box>
  );
};

export default GroupActivityLog;
