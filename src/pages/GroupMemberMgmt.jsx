import React, { useState, useEffect, useCallback } from 'react';
import DataGrid from '../components/DataGrid.jsx';
import Modal from '../components/Modal.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Button } from '@mui/material';
import { useAppContext } from '../contexts/AppContext.jsx';
import { useGroupSearch } from '../contexts/GroupSearchContext.jsx';
import { fetchWlnGroupTicketMapped } from '../api/groupTroubleApi.js';
import { Box, Stack, Typography, TextField } from '@mui/material';

const ATTACH_TYPE = { TR: 'TR', GROUP: 'GROUP' };

const GroupMemberMgmt = ({ trNum, sessionUniqueKey }) => {
  const { showAlert, userID } = useAppContext();
  const { groupType, setGroupFieldsUpdated, groupRetrieveRspVO, setGroupRetrieveRspVO } = useGroupSearch();

  const [isLoading, setIsLoading] = useState(false);
  const [attachedTrs, setAttachedTrs] = useState([]);
  const [attachedGroups, setAttachedGroups] = useState([]);
  const [selectedTrRow, setSelectedTrRow] = useState(null);
  const [selectedGroupRow, setSelectedGroupRow] = useState(null);
  const [trCount, setTrCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [attachType, setAttachType] = useState(ATTACH_TYPE.TR);
  const [searchTrNum, setSearchTrNum] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchRow, setSelectedSearchRow] = useState(null);
  // const [isSearching, setIsSearching] = useState(false); // removed — search is now synchronous/local
  const [detachConfirmOpen, setDetachConfirmOpen] = useState(false);
  const [detachTarget, setDetachTarget] = useState(null);

  const applyMemberData = useCallback((vo) => {
    const trs = Array.isArray(vo?.attachedTrs) ? vo.attachedTrs : [];
    const groups = Array.isArray(vo?.attachedGroups) ? vo.attachedGroups : [];
    setAttachedTrs(trs);
    setAttachedGroups(groups);
    setTrCount(trs.length);
    setGroupCount(groups.length);
  }, []);

  // On mount: read ATTACHED_TRS / ATTACHED_GROUPS already present in context —
  // no extra API call needed (data comes from wlnGroupTicketRetrieve at ticket load time).
  useEffect(() => {
    applyMemberData(groupRetrieveRspVO);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh button: re-fetches from server and updates context + local state.
  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const mapped = await fetchWlnGroupTicketMapped({ userId: userID, groupTroubleNum: trNum });
      if (mapped) {
        setGroupRetrieveRspVO((prev) => ({ ...prev, ...mapped }));
        applyMemberData(mapped);
      } else {
        applyMemberData(groupRetrieveRspVO);
      }
    } catch {
      showAlert('Error refreshing Member Management data.');
      applyMemberData(groupRetrieveRspVO);
    } finally {
      setIsLoading(false);
    }
  }, [userID, trNum, showAlert, setGroupRetrieveRspVO, applyMemberData, groupRetrieveRspVO]);

  const handleDetachRequest = useCallback((row, type) => {
    setDetachTarget({ row, type });
    setDetachConfirmOpen(true);
  }, []);

  const handleDetachConfirm = useCallback(() => {
    if (!detachTarget) return;
    const { row, type } = detachTarget;
    if (type === ATTACH_TYPE.TR) {
      setAttachedTrs((prev) => { const next = prev.filter((r) => r.trNum !== row.trNum); setTrCount(next.length); return next; });
    } else {
      setAttachedGroups((prev) => { const next = prev.filter((r) => r.trNum !== row.trNum); setGroupCount(next.length); return next; });
    }
    setGroupFieldsUpdated(true);
    setDetachConfirmOpen(false);
    setDetachTarget(null);
    setSelectedTrRow(null);
    setSelectedGroupRow(null);
    // Old API-based detach:
    // setDetachConfirmOpen(false);
    // setIsLoading(true);
    // try {
    //   if (type === ATTACH_TYPE.TR) {
    //     await detachTrFromGroup({ sessionUniqueKey, groupTrNum: trNum, attachedTrNum: row.trNum });
    //   } else {
    //     await detachGroupFromGroup({ sessionUniqueKey, groupTrNum: trNum, attachedGroupNum: row.trNum });
    //   }
    //   setGroupFieldsUpdated(true);
    //   await fetchMembers();
    // } catch {
    //   showAlert('Error detaching record. Please try again.');
    // } finally {
    //   setIsLoading(false);
    //   setDetachTarget(null);
    // }
  }, [detachTarget, setGroupFieldsUpdated]);

  const openAttachModal = useCallback((type) => {
    setAttachType(type);
    setSearchTrNum('');
    setSearchResults([]);
    setSelectedSearchRow(null);
    setAttachModalOpen(true);
  }, []);

  const handleSearch = useCallback(() => {
    const num = searchTrNum.trim().toUpperCase();
    if (!num) { showAlert('Please enter a TR number to search.'); return; }
    const alreadyAttached = attachType === ATTACH_TYPE.TR
      ? attachedTrs.some((r) => r.trNum === num)
      : attachedGroups.some((r) => r.trNum === num);
    if (alreadyAttached) { showAlert(`${num} is already attached to this group.`); return; }
    const now = new Date();
    const reportedDate = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (attachType === ATTACH_TYPE.TR) {
      setSearchResults([{ trNum: num, trType: 'FP', status: 'OPN', reportedDate, circuitId: `CKT-${num}` }]);
    } else {
      setSearchResults([{ trNum: num, trType: 'GP', status: 'OPN', reportedDate, groupName: `Group ${num}`, region: '' }]);
    }
    setSelectedSearchRow(null);
    // Old API-based search:
    // setIsSearching(true);
    // setSearchResults([]);
    // setSelectedSearchRow(null);
    // try {
    //   const response = await searchTrForAttach({
    //     sessionUniqueKey,
    //     groupTroubleNumber: searchTrNum.trim().toUpperCase(),
    //     searchType: attachType === ATTACH_TYPE.TR ? 'MEMBER_CNTRL' : 'GROUP_CNTRL',
    //   });
    //   if (response?.data) {
    //     const results = Array.isArray(response.data.results) ? response.data.results : [];
    //     if (results.length === 0) showAlert('No records found for the entered TR number.');
    //     setSearchResults(results);
    //   }
    // } catch {
    //   showAlert('Error searching for TR. Please try again.');
    // } finally {
    //   setIsSearching(false);
    // }
  }, [searchTrNum, attachType, attachedTrs, attachedGroups, showAlert]);

  const handleAttachConfirm = useCallback(() => {
    if (!selectedSearchRow) { showAlert('Please select a record to attach.'); return; }
    if (attachType === ATTACH_TYPE.TR) {
      setAttachedTrs((prev) => { const next = [...prev, selectedSearchRow]; setTrCount(next.length); return next; });
    } else {
      setAttachedGroups((prev) => { const next = [...prev, selectedSearchRow]; setGroupCount(next.length); return next; });
    }
    setGroupFieldsUpdated(true);
    setAttachModalOpen(false);
    setSelectedSearchRow(null);
    setSearchResults([]);
    // Old API-based attach:
    // setIsLoading(true);
    // setAttachModalOpen(false);
    // try {
    //   if (attachType === ATTACH_TYPE.TR) {
    //     await attachTrToGroup({ sessionUniqueKey, groupTrNum: trNum, attachTrNum: selectedSearchRow.trNum });
    //   } else {
    //     await attachGroupToGroup({ sessionUniqueKey, groupTrNum: trNum, attachGroupNum: selectedSearchRow.trNum });
    //   }
    //   setGroupFieldsUpdated(true);
    //   await fetchMembers();
    // } catch {
    //   showAlert('Error attaching record. Please try again.');
    // } finally {
    //   setIsLoading(false);
    //   setSelectedSearchRow(null);
    // }
  }, [selectedSearchRow, attachType, setGroupFieldsUpdated, showAlert]);

  const trColumns = [
    { field: 'trNum', label: 'TR Number', width: 130 },
    { field: 'trType', label: 'Type', width: 80 },
    { field: 'status', label: 'Status', width: 90 },
    { field: 'reportedDate', label: 'Reported Date', width: 140 },
    { field: 'customerId', label: 'Customer ID', width: 130 },
    { field: 'circuitId', label: 'Circuit ID', width: 180 },
    { field: 'region', label: 'Region', width: 90 },
    { field: 'notes', label: 'Notes', width: 200 },
  ];

  const groupColumns = [
    { field: 'trNum', label: 'Group TR Number', width: 140 },
    { field: 'trType', label: 'Type', width: 80 },
    { field: 'status', label: 'Status', width: 90 },
    { field: 'reportedDate', label: 'Reported Date', width: 140 },
    { field: 'groupName', label: 'Group Name', width: 180 },
    { field: 'region', label: 'Region', width: 90 },
  ];

  const searchColumns = [
    { field: 'trNum', label: 'TR Number', width: 140 },
    { field: 'trType', label: 'Type', width: 80 },
    { field: 'status', label: 'Status', width: 100 },
    { field: 'reportedDate', label: 'Reported Date', width: 140 },
    { field: 'circuitId', label: 'Circuit ID', width: 180 },
  ];

  const totalMemberCount = trCount + groupCount;

  return (
    <Box id="groupMemberMgmtDiv" sx={{
 fontSize: 12, p: '8px', width: '100%', boxSizing: 'border-box' }}>
      {isLoading && <LoadingSpinner />}

      {/* Detach Confirmation Modal */}
      <Modal isOpen={detachConfirmOpen} title="Confirm Detach" onClose={() => setDetachConfirmOpen(false)} width={420}
        footer={
          <Stack direction="row" sx={{ gap: '8px' }}>
            <Button size="small" variant="contained" onClick={handleDetachConfirm}>Yes, Detach</Button>
            <Button size="small" variant="outlined" onClick={() => setDetachConfirmOpen(false)}>Cancel</Button>
          </Stack>
        }
      >
        <Typography component="p" sx={{ my: '12px', fontSize: 12, color: 'text.primary' }}>
          Are you sure you want to detach <strong>{detachTarget?.row?.trNum}</strong> from Group TR <strong>{trNum}</strong>?
        </Typography>
      </Modal>

      {/* Attach Search Modal */}
      <Modal isOpen={attachModalOpen} title={`Attach ${attachType === ATTACH_TYPE.TR ? 'TR' : 'Group TR'} to Group`} onClose={() => setAttachModalOpen(false)} width={700}
        footer={
          <Stack direction="row" sx={{ gap: '8px' }}>
            <Button size="small" variant="contained" onClick={handleAttachConfirm} disabled={!selectedSearchRow}>Attach Selected</Button>
            <Button size="small" variant="outlined" onClick={() => setAttachModalOpen(false)}>Cancel</Button>
          </Stack>
        }
      >
        <Stack direction="row" alignItems="center" sx={{ gap: '8px', mb: '10px' }}>
          <Typography component="label" sx={{ fontWeight: 700, fontSize: 11, color: 'text.primary', whiteSpace: 'nowrap' }}>
            {attachType === ATTACH_TYPE.TR ? 'TR Number:' : 'Group TR Number:'}
          </Typography>
          <TextField
            size="small"
            value={searchTrNum}
            onChange={(e) => setSearchTrNum(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={`Enter ${attachType === ATTACH_TYPE.TR ? 'TR' : 'Group TR'} number`}
            sx={{
              width: '200px',
              fontSize: 11,
              lineHeight: '13.2px',
              py: '4px',
              px: '8px',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '3px',
              color: 'text.primary',
              bgcolor: 'background.paper',
              outline: 'none',
              transition: 'border-color 0.15s ease',
              '&:focus': { borderColor: 'primary.main' },
              '&::placeholder': { color: 'text.disabled' },
            }}
          />
          <Button size="small" variant="contained" onClick={handleSearch}>Search</Button>
        </Stack>

        {searchResults.length > 0 && (
          <DataGrid columns={searchColumns} data={searchResults} height={200} onRowSelect={setSelectedSearchRow} onRowDoubleClick={(row) => { setSelectedSearchRow(row); handleAttachConfirm(); }} alternateRows showToolbar showFooter />
        )}

        {searchResults.length === 0 && searchTrNum && (
          <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 11 }}>
            No results. Enter a TR number and click Search.
          </Typography>
        )}
      </Modal>

      {/* Page Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: '8px' }}>
        <Stack direction="row" alignItems="center" sx={{ gap: '12px' }}>
          <Typography component="span" sx={{ fontWeight: 700, fontSize: 14, color: 'text.primary' }}>Member Management</Typography>
          <Typography component="span" sx={{ fontSize: 11, color: 'text.primary' }}>
            Group TR: <strong>{trNum}</strong>&nbsp;&nbsp;|&nbsp;&nbsp;Total Members: <strong id="totalMemberCount">{totalMemberCount}</strong>
          </Typography>
        </Stack>
        <Button size="small" variant="outlined" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={fetchMembers}>Refresh</Button>
      </Stack>

      {/* Attached TRs */}
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '3px', mb: '10px', p: '8px', bgcolor: 'background.paper', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
        <Typography component="div" sx={{ fontWeight: 700, fontSize: 12, color: 'text.primary', mb: '8px', pb: '4px', borderBottom: '1px solid', borderColor: 'divider' }}>
          Attached Trouble Reports ({trCount})
        </Typography>
        <Stack direction="row" sx={{ gap: '8px', mb: '8px' }}>
          <Button id="attachTrBtn" size="small" variant="contained" onClick={() => openAttachModal(ATTACH_TYPE.TR)}>+ Attach TR</Button>
          <Button id="detachTrBtn" size="small" variant="outlined" onClick={() => selectedTrRow ? handleDetachRequest(selectedTrRow, ATTACH_TYPE.TR) : showAlert('Please select a TR to detach.')} disabled={!selectedTrRow}>- Detach Selected TR</Button>
        </Stack>
        <DataGrid id="attachedTrsGrid" columns={trColumns} data={attachedTrs} height={220} onRowSelect={setSelectedTrRow} alternateRows emptyMessage="No TRs are currently attached to this group." showToolbar showFooter />
      </Box>

      {/* Attached Groups */}
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '3px', mb: '10px', p: '8px', bgcolor: 'background.paper', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
        <Typography component="div" sx={{ fontWeight: 700, fontSize: 12, color: 'text.primary', mb: '8px', pb: '4px', borderBottom: '1px solid', borderColor: 'divider' }}>
          Attached Group Trouble Reports ({groupCount})
        </Typography>
        <Stack direction="row" sx={{ gap: '8px', mb: '8px' }}>
          <Button id="attachGroupBtn" size="small" variant="contained" onClick={() => openAttachModal(ATTACH_TYPE.GROUP)}>+ Attach Group</Button>
          <Button id="detachGroupBtn" size="small" variant="outlined" onClick={() => selectedGroupRow ? handleDetachRequest(selectedGroupRow, ATTACH_TYPE.GROUP) : showAlert('Please select a Group to detach.')} disabled={!selectedGroupRow}>- Detach Selected Group</Button>
        </Stack>
        <DataGrid id="attachedGroupsGrid" columns={groupColumns} data={attachedGroups} height={220} onRowSelect={setSelectedGroupRow} alternateRows emptyMessage="No Group TRs are currently attached to this group." showToolbar showFooter />
      </Box>
    </Box>
  );
};

export default GroupMemberMgmt;
