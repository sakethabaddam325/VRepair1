import React, { useState, useEffect, useCallback } from 'react';
import DataGrid from '../components/DataGrid.jsx';
import DateTimeInput from '../components/DateTimeInput.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAppContext } from '../contexts/AppContext.jsx';
import { useGroupSearch } from '../contexts/GroupSearchContext.jsx';
import { submitActivityDetails } from '../api/groupTroubleApi.js';
import { isDate2BeforeDate1, isValidDate } from '../utils/dateUtils.js';
import { Box, Stack, Typography, Button, TextField, MenuItem } from '@mui/material';

const FUNCTION_OPTIONS = [
  { value: '', label: '' },
  { value: 'NO ACCESS SUBSCRIBER', label: 'NO ACCESS SUBSCRIBER' },
  { value: 'NO ACCESS OTHER', label: 'NO ACCESS OTHER' },
  { value: 'ACTUAL', label: 'ACTUAL' },
  { value: 'CENTER', label: 'CENTER' },
  { value: 'REFERRAL', label: 'REFERRAL' },
  { value: 'HANDOFF', label: 'HANDOFF' },
  { value: 'OUT OF SERVICE', label: 'OUT OF SERVICE' },
  { value: 'ELEC BONDING', label: 'ELEC BONDING' },
  { value: 'REBATE', label: 'REBATE' },
];

/* 4-column grid container — children (InputsWithLabels) stretch to fill cell */
const gridSx = { display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '16px',
  alignItems: 'start',
  '& > *': { width: '100% !important' },
};

const sectionHeaderSx = { fontSize: '11px',
  fontWeight: 700,
  color: 'primary.main',
  py: '4px',
  pb: '2px',
  borderBottom: '1px solid',
  borderColor: 'divider',
  mb: '4px',
  textTransform: 'uppercase',
};

const lblSx = { fontSize: '11px', fontWeight: 400, color: 'text.primary', whiteSpace: 'nowrap', alignSelf: 'center' };

const inpSx = { height: '22px',
  px: '4px',
  fontSize: '11px',
  color: 'text.primary',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '3px',
  bgcolor: 'background.paper',
  outline: 'none',
  minWidth: 0,
  '&:focus': { borderColor: 'primary.main' },
};

const GroupActivityDetails = ({ trNum, sessionUniqueKey }) => {
  const { showAlert } = useAppContext();
  const { groupRetrieveRspVO } = useGroupSearch();
  const [isLoading, setIsLoading] = useState(false);
  const [trStatus, setTrStatus] = useState('');

  const [reportedDt, setReportedDt] = useState('');
  const [restoredDt, setRestoredDt] = useState('');
  const [rri, setRri] = useState('');
  const [rebateQualified, setRebateQualified] = useState('');
  const [sentToBilling, setSentToBilling] = useState('');

  const [noaccess, setNoaccess] = useState('');
  const [noaccessother, setNoaccessother] = useState('');
  const [actual, setActual] = useState('');
  const [center, setCenter] = useState('');
  const [referral, setReferral] = useState('');
  const [handoff, setHandoff] = useState('');
  const [outofservice, setOutofservice] = useState('');
  const [elecbonding, setElecbonding] = useState('');
  const [rebate, setRebate] = useState('');
  const [total, setTotal] = useState('');
  const [suspDur, setSuspDur] = useState('');
  const [handoffDur, setHandoffDur] = useState('');
  const [monitorDuration, setMonitorDuration] = useState('');
  const [maintenanceDuration, setMaintenanceDuration] = useState('');
  const [hanoffetmsDuration, setHanoffetmsDuration] = useState('');
  const [numhandsoff, setNumhandsoff] = useState('');

  const [dispatchCenterName, setDispatchCenterName] = useState('');
  const [dispatchLocationRoutingAddress, setDispatchLocationRoutingAddress] = useState('');

  const [activityGridRows, setActivityGridRows] = useState([]);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [isRstDateChanged, setIsRstDateChanged] = useState(false);

  // Populate fields from the already-fetched ticket retrieve response (ACTIVITY_DETAILS block),
  // avoiding a redundant call to ActivityDetailsController.
  useEffect(() => {
    const d = groupRetrieveRspVO?.activityDetails;
    if (!d) return;

    setReportedDt(d.reportedDt || '');
    setRestoredDt(d.restoredDt || '');
    setRri(d.rri || '');
    setRebateQualified(d.rebateQualified || '');
    setSentToBilling(d.sentToBilling || '');
    setNoaccess(d.noaccess || '');
    setNoaccessother(d.noaccessother || '');
    setActual(d.actual || '');
    setCenter(d.center || '');
    setReferral(d.referral || '');
    setHandoff(d.handoff || '');
    setOutofservice(d.outofservice || '');
    setElecbonding(d.elecbonding || '');
    setRebate(d.rebate || '');
    setTotal(d.total || '');
    setSuspDur(d.suspDur || '');
    setHandoffDur(d.handoffDur || '');
    setMonitorDuration(d.monitorDuration || '');
    setMaintenanceDuration(d.maintenanceDuration || '');
    setHanoffetmsDuration(d.hanoffetmsDuration || '');
    setNumhandsoff(d.numhandsoff || '');
    setTrStatus(d.trStatus || '');
    setDispatchCenterName(d.dispatchCenterName || '');
    setDispatchLocationRoutingAddress(d.dispatchLocationRoutingAddress || '');
    if (Array.isArray(d.activityRows)) {
      setActivityGridRows(d.activityRows);
    }
  }, [groupRetrieveRspVO]);

  const isClosed = trStatus === 'CLD' || trStatus === 'CLD-GRP';

  const handleAddRow = useCallback(() => {
    if (activityGridRows.length > 0) {
      const lastRow = activityGridRows[activityGridRows.length - 1];
      if (!lastRow.function || !lastRow.startDt || !lastRow.endDt) {
        showAlert('Please fill in Function, Start D/T, and End D/T for the current row before adding a new one.');
        return;
      }
    }
    const newRow = { rowId: Date.now(), deleteFlag: false, function: '', location: '', jobId: '', center: '', ctrType: '', workType: '', cktEnd: '', startDt: '', dspEndDt: '', endDt: '', duration: '', seqNum: '', isEdited: true };
    setActivityGridRows((prev) => [...prev, newRow]);
  }, [activityGridRows, showAlert]);

  const handleRowChange = useCallback((rowId, field, value) => {
    setActivityGridRows((prev) => prev.map((row) => row.rowId === rowId ? { ...row, [field]: value, isEdited: true } : row));
    setIsSubmitEnabled(true);
  }, []);

  const handleDeleteRow = useCallback((rowId) => {
    setActivityGridRows((prev) => prev.map((row) => row.rowId === rowId ? { ...row, deleteFlag: true } : row));
    setIsSubmitEnabled(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    for (const row of activityGridRows) {
      if (!row.isEdited || row.deleteFlag) continue;
      if (!isValidDate(row.startDt)) { showAlert(`Row has invalid Start D/T: ${row.startDt}`); return; }
      if (!isValidDate(row.endDt)) { showAlert(`Row has invalid End D/T: ${row.endDt}`); return; }
      if (isDate2BeforeDate1(row.startDt, row.endDt)) { showAlert('End D/T cannot be before Start D/T.'); return; }
      if (row.dspEndDt && isDate2BeforeDate1(row.dspEndDt, row.endDt)) { showAlert('DSP End D/T cannot be after End D/T.'); return; }
    }
    setIsLoading(true);
    try {
      const editedRows = activityGridRows.filter((r) => r.isEdited || r.deleteFlag);
      const formValues = editedRows.map((r) => ({
        activityModFlag: r.deleteFlag ? 'D' : (r.seqNum ? 'U' : 'I'),
        activityDetailsSeqNum: r.seqNum || '',
        activityFunctionCode: r.function,
        startDate: r.startDt,
        endDate: r.endDt,
        dspEndDate: r.dspEndDt || '',
        activityCenterName: r.center,
        dispatchCenterName,
        dispatchLocationRoutingAddress,
        restoredDate: restoredDt,
      }));
      await submitActivityDetails({ sessionUniqueKey, trNum, activityDetails: JSON.stringify(formValues) });
      showAlert('Activity Details submitted successfully.');
      setIsSubmitEnabled(false);
    } catch {
      showAlert('Error submitting Activity Details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [activityGridRows, dispatchCenterName, dispatchLocationRoutingAddress, restoredDt, sessionUniqueKey, trNum, showAlert]);

  const activityColumns = [
    { field: 'deleteFlag', label: 'Del', width: 30, formatter: (val, row) => isClosed ? (<input type="checkbox" checked={!!val} onChange={() => handleDeleteRow(row.rowId)} />) : null },
    {
      field: 'function',
      label: 'Function',
      width: 160,
      formatter: (val, row) => isClosed ? (
        <TextField
          select
          size="small"
          value={val || ''}
          onChange={(e) => handleRowChange(row.rowId, 'function', e.target.value)}
          sx={{ width: 18.75 }}
        >
          {FUNCTION_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
      ) : val,
    },
    { field: 'location', label: 'Location', width: 80 },
    { field: 'jobId', label: 'Job ID/TR#', width: 80 },
    { field: 'center', label: 'Center', width: 80 },
    { field: 'ctrType', label: 'Ctr Type', width: 60 },
    { field: 'workType', label: 'Work Type', width: 80 },
    { field: 'cktEnd', label: 'Ckt End', width: 60 },
    { field: 'startDt', label: 'Start D/T', width: 135, formatter: (val, row) => isClosed ? (<DateTimeInput value={val} onChange={(v) => handleRowChange(row.rowId, 'startDt', v)} />) : val },
    { field: 'dspEndDt', label: 'Dsp End D/T', width: 135, formatter: (val, row) => isClosed ? (<DateTimeInput value={val} onChange={(v) => handleRowChange(row.rowId, 'dspEndDt', v)} />) : val },
    { field: 'endDt', label: 'End D/T', width: 135, formatter: (val, row) => isClosed ? (<DateTimeInput value={val} onChange={(v) => handleRowChange(row.rowId, 'endDt', v)} />) : val },
    { field: 'duration', label: 'Duration', width: 70 },
  ];

  return (
    <Box id="groupActivityDetailsDiv" sx={{ fontSize: 12, lineHeight: 1.4, p: '5px', color: 'text.primary' }}>
      {isLoading && <LoadingSpinner />}

      {/* Activity Summary — 4-column grid, 16px gutter */}
      <Box sx={{ mb: '8px' }}>
        <Typography component="div" sx={sectionHeaderSx}>Activity Summary</Typography>
        <Box sx={gridSx}>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 11, fontWeight: 400, color: '#9E9E9E' }}>Reported D/T</Typography><TextField size="small" fullWidth value={reportedDt} disabled inputProps={{ readOnly: true }} /></Stack>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 11, fontWeight: 400, color: '#9E9E9E' }}>RRI</Typography><TextField size="small" fullWidth value={rri} disabled inputProps={{ readOnly: true }} /></Stack>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 11, fontWeight: 400, color: '#9E9E9E' }}>Rebate Qualified</Typography><TextField size="small" fullWidth value={rebateQualified} disabled inputProps={{ readOnly: true }} /></Stack>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box component="span" sx={{ ...lblSx, mb: '4px', fontSize: 12, fontWeight: 400 }}>Restored D/T</Box>
            <DateTimeInput id="restoredDt" value={restoredDt} onChange={(val) => { setRestoredDt(val); setIsRstDateChanged(true); setIsSubmitEnabled(true); }} showCalendarIcon />
          </Box>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 11, fontWeight: 400, color: '#9E9E9E' }}>Sent to Billing</Typography><TextField size="small" fullWidth value={sentToBilling} disabled inputProps={{ readOnly: true }} /></Stack>
        </Box>
      </Box>

      {/* Duration — 4-column grid, 16px gutter */}
      <Box sx={{ mb: '8px' }}>
        <Typography component="div" sx={sectionHeaderSx}>Duration</Typography>
        <Box sx={gridSx}>
          {[
            ['No Access Sub', noaccess], ['No Access Other', noaccessother], ['Actual', actual], ['Center', center],
            ['Referral', referral], ['Handoff', handoff], ['Out of Service', outofservice], ['Elec. Bonding', elecbonding],
            ['Rebate', rebate], ['Total', total], ['Suspend Dur', suspDur], ['Handoff DSL', handoffDur],
            ['Monitor', monitorDuration], ['Maintenance', maintenanceDuration], ['Handoff ETMS', hanoffetmsDuration],
          ].map(([label, val]) => (
            <Stack key={label} direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 11, fontWeight: 400, color: '#9E9E9E' }}>{label}</Typography><TextField size="small" fullWidth value={val} disabled inputProps={{ readOnly: true }} /></Stack>
          ))}
        </Box>
      </Box>

      {/* Dispatch Activity Grid — 4-column grid, 16px gutter */}
      <Box sx={{ mb: '8px' }}>
        <Typography component="div" sx={sectionHeaderSx}>Dispatch Activity Grid</Typography>
        <Box sx={{ ...gridSx, mb: '5px' }}>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 11, fontWeight: 400, color: !isClosed ? '#9E9E9E' : 'text.primary' }}>Dispatch Center</Typography><TextField size="small" fullWidth value={dispatchCenterName} disabled={!isClosed} onChange={(e) => { setDispatchCenterName(e.target.value); setIsSubmitEnabled(true); }} /></Stack>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 11, fontWeight: 400, color: !isClosed ? '#9E9E9E' : 'text.primary' }}>Dispatch Location</Typography><TextField size="small" fullWidth value={dispatchLocationRoutingAddress} disabled={!isClosed} onChange={(e) => { setDispatchLocationRoutingAddress(e.target.value); setIsSubmitEnabled(true); }} /></Stack>
        </Box>

        <DataGrid columns={activityColumns} data={activityGridRows.filter((r) => !r.deleteFlag)} height={200} alternateRows showToolbar showFooter />

        <Stack direction="row" justifyContent="flex-end" sx={{ gap: '8px', mt: '8px' }}>
          {isClosed && (
            <Button id="insertRowButton" variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={handleAddRow}>+ New Row</Button>
          )}
          <Button id="createTicketButtonEnabled" variant="contained" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={handleSubmit} disabled={!isSubmitEnabled}>SUBMIT</Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default GroupActivityDetails;
