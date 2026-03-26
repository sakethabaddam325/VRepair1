import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useShellContext } from './DashboardShell.jsx';
import { useAppContext } from '../contexts/AppContext.jsx';
import { getWorklistTickets, bulkTicketAction } from '../api/worklistApi.js';
import { Box, Stack, Typography, Button, Checkbox, FormControlLabel, CircularProgress, Divider, Chip, TextField, Pagination, Alert, ButtonBase } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const PAGE_SIZE = 50;

const TABLE_COLUMNS = [
  { key: 'trNum', label: 'TR #' },
  { key: 'tnCircuitId', label: 'TN / CIRCUIT ID / GROUP NAME' },
  { key: 'type', label: 'TYPE' },
  { key: 'rptdDt', label: 'RPTD D/T' },
  { key: 'commEttrDt', label: 'COMM/ETTR D/T' },
  { key: 'stat', label: 'STAT' },
  { key: 'statusDt', label: 'STATUS D/T' },
];

const ACTION_GROUPS = [
  { label: 'Primary', actions: [{ id: 'openTroubleReport', label: 'Open Trouble Report' }, { id: 'openMemberMgmt', label: 'Open Member Mgmt' }] },
  { label: 'Assignment', actions: [{ id: 'pick', label: 'Pick' }, { id: 'grab', label: 'Grab' }, { id: 'get', label: 'Get' }, { id: 'force', label: 'Force' }, { id: 'drop', label: 'Drop' }, { id: 'dropAll', label: 'Drop All' }, { id: 'assignUser', label: 'Assign User' }, { id: 'unassignUser', label: 'Unassign User' }] },
  { label: 'Group', actions: [{ id: 'cancelGroup', label: 'Cancel Group' }, { id: 'closeGroup', label: 'Close Group' }, { id: 'groupFixed', label: 'Group Fixed' }, { id: 'groupUpdate', label: 'Group Update' }, { id: 'groupAttach', label: 'Group Attach' }] },
  { label: 'Other', actions: [{ id: 'resolveNma', label: 'Resolve NMA' }, { id: 'maintenanceTime', label: 'Maintenance Time' }, { id: 'monitorService', label: 'Monitor Service' }, { id: 'copy', label: 'Copy' }] },
  { label: 'Notes', actions: [{ id: 'remarks', label: 'Remarks' }, { id: 'internalRemark', label: 'Internal Remark' }] },
];

const PRIMARY_BULK_ACTIONS = ['openTroubleReport', 'openMemberMgmt', 'pick', 'grab', 'drop', 'remarks'];

const thSx = {
  fontSize: 11,
  fontWeight: 700,
  color: 'text.primary',
  p: '4px 8px',
  borderBottom: '2px solid',
  borderColor: 'grey.900',
  bgcolor: 'grey.50',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

const tdSx = {
  fontSize: 11,
  color: 'text.primary',
  p: '2px 8px',
  borderBottom: '1px solid',
  borderColor: 'grey.50',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const getRowSx = (ticket, idx, selectedTrNums) => {
  const isSelected = selectedTrNums.has(ticket.trNum);
  const isNm = ticket.stat === 'NM';
  if (isSelected && isNm) return { bgcolor: '#ffd0d4', cursor: 'pointer', '&:hover': { bgcolor: '#ffb8bd' } };
  if (isSelected) return { bgcolor: 'primary.light', cursor: 'pointer', '&:hover': { filter: 'brightness(0.97)' } };
  if (isNm) return { bgcolor: '#fff0f0', cursor: 'pointer', '&:hover': { bgcolor: '#ffe4e6' } };
  return { bgcolor: idx % 2 === 0 ? 'background.paper' : 'grey.50', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } };
};

export default function WorklistDetailPage({ worklistId, worklistName, recordCount }) {
  const { openTicketTab } = useShellContext();
  const { addToast } = useAppContext();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const [findFilter, setFindFilter] = useState('');
  const [enableFilters, setEnableFilters] = useState(false);
  const [suppressMembers, setSuppressMembers] = useState(true);
  const [suppressRegionalGroups, setSuppressRegionalGroups] = useState(true);

  const [expandedTypes, setExpandedTypes] = useState(new Set());
  const [selectedTrNums, setSelectedTrNums] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const [contextMenu, setContextMenu] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWorklistTickets(worklistId, 1, 500);
      setTickets(res.data?.items || []);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to load tickets.');
      addToast('Failed to load tickets', 'danger');
    } finally {
      setLoading(false);
    }
  }, [worklistId, addToast]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    const handler = () => { setContextMenu(null); setMoreOpen(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const filteredTickets = useMemo(() => {
    if (!enableFilters || !findFilter.trim()) return tickets;
    const q = findFilter.toLowerCase();
    return tickets.filter((t) => t.trNum.toLowerCase().includes(q) || t.tnCircuitId.toLowerCase().includes(q) || t.groupName.toLowerCase().includes(q) || t.type.toLowerCase().includes(q) || t.stat.toLowerCase().includes(q));
  }, [tickets, findFilter, enableFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTickets.slice(start, start + PAGE_SIZE);
  }, [filteredTickets, currentPage]);

  const typeGroups = useMemo(() => {
    const map = new Map();
    paginatedTickets.forEach((t) => {
      if (!map.has(t.type)) map.set(t.type, { type: t.type, typeLabel: t.typeLabel, tickets: [] });
      map.get(t.type).tickets.push(t);
    });
    return Array.from(map.values());
  }, [paginatedTickets]);

  const formatRefresh = (d) => {
    if (!d) return '--';
    return d.toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const toggleType = (type) => {
    setExpandedTypes((prev) => { const next = new Set(prev); if (next.has(type)) next.delete(type); else next.add(type); return next; });
  };

  useEffect(() => {
    if (typeGroups.length > 0 && expandedTypes.size === 0) setExpandedTypes(new Set(typeGroups.map((g) => g.type)));
  }, [typeGroups]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleRowSelection = (trNum) => {
    setSelectedTrNums((prev) => { const next = new Set(prev); if (next.has(trNum)) next.delete(trNum); else next.add(trNum); return next; });
  };

  const toggleGroupSelection = (group) => {
    const groupTrNums = group.tickets.map((t) => t.trNum);
    const allSelected = groupTrNums.every((tr) => selectedTrNums.has(tr));
    setSelectedTrNums((prev) => { const next = new Set(prev); groupTrNums.forEach((tr) => { if (allSelected) next.delete(tr); else next.add(tr); }); return next; });
  };

  const toggleSelectAll = () => {
    const pageTrNums = paginatedTickets.map((t) => t.trNum);
    const allPageSelected = pageTrNums.every((tr) => selectedTrNums.has(tr));
    if (allPageSelected) { setSelectedTrNums((prev) => { const next = new Set(prev); pageTrNums.forEach((tr) => next.delete(tr)); return next; }); }
    else { setSelectedTrNums((prev) => new Set([...prev, ...pageTrNums])); }
  };

  const handleBulkAction = useCallback(async (actionId) => {
    const trNums = Array.from(selectedTrNums);
    if (trNums.length === 0) { addToast('No tickets selected', 'warning'); return; }
    if (actionId === 'openTroubleReport') { trNums.forEach((tr) => openTicketTab(tr)); return; }
    if (actionId === 'openMemberMgmt') { addToast('Open Member Mgmt is not yet implemented', 'info'); return; }
    try {
      const res = await bulkTicketAction(trNums, actionId);
      const count = res.data?.affectedCount || trNums.length;
      addToast(`${actionId} applied to ${count} ticket(s)`, 'success');
      setSelectedTrNums(new Set());
      fetchTickets();
    } catch {
      addToast(`Failed to perform ${actionId}`, 'danger');
    }
  }, [selectedTrNums, addToast, openTicketTab, fetchTickets]);

  const handleContextMenu = (e, trNum) => {
    e.preventDefault(); e.stopPropagation();
    if (!selectedTrNums.has(trNum)) setSelectedTrNums(new Set([trNum]));
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleRowDoubleClick = (trNum) => { openTicketTab(trNum); };

  const allExpanded = typeGroups.length > 0 && typeGroups.every((g) => expandedTypes.has(g.type));

  const toggleExpandAll = () => {
    if (allExpanded) setExpandedTypes(new Set());
    else setExpandedTypes(new Set(typeGroups.map((g) => g.type)));
  };

  const colWidths = { checkbox: '36px', tr: '100px', tnCircuit: '1fr', type: '70px', rptdDt: '140px', commDt: '140px', stat: '70px', statusDt: '140px' };

  const gridTemplateColumns = `${colWidths.checkbox} ${colWidths.tr} ${colWidths.tnCircuit} ${colWidths.type} ${colWidths.rptdDt} ${colWidths.commDt} ${colWidths.stat} ${colWidths.statusDt}`;

  return (
    <Box sx={{
 fontSize: 12, lineHeight: '14px', color: 'text.primary', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: '8px 12px', borderBottom: '1px solid', borderColor: 'divider', gap: '8px', flexWrap: 'wrap', bgcolor: 'background.paper' }}>
        <Stack direction="row" alignItems="center" sx={{ gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={fetchTickets}><RefreshIcon fontSize="small" /></Button>
          <Typography component="span" sx={{ fontSize: 11, color: 'grey.800' }}>Last Refresh: {formatRefresh(lastRefresh)}</Typography>
          <Divider orientation="vertical" flexItem />
          <FormControlLabel control={<Checkbox checked={enableFilters} onChange={() => setEnableFilters((v) => !v)} size="small" />} label="Enable Filters" />
          {enableFilters && (
            <TextField size="small" placeholder="Find..." value={findFilter} onChange={(e) => { setFindFilter(e.target.value); setCurrentPage(1); }} sx={{ width: 160 }} />
          )}
          <Divider orientation="vertical" flexItem />
          <FormControlLabel control={<Checkbox checked={suppressMembers} onChange={() => setSuppressMembers((v) => !v)} size="small" />} label="Suppress Members" />
          <FormControlLabel control={<Checkbox checked={suppressRegionalGroups} onChange={() => setSuppressRegionalGroups((v) => !v)} size="small" />} label="Suppress Regional Groups" />
        </Stack>
        <Stack direction="row" sx={{ gap: '16px' }}>
          <Typography component="span" sx={{ fontSize: 11, color: 'grey.800' }}>
            Records Returned: <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{filteredTickets.length}</Box>
          </Typography>
          <Typography component="span" sx={{ fontSize: 11, color: 'grey.800' }}>
            Records Selected: <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{selectedTrNums.size}</Box>
          </Typography>
        </Stack>
      </Stack>

      {/* Bulk Actions Bar */}
      {selectedTrNums.size > 0 && (
        <Stack direction="row" alignItems="center" sx={{ gap: '8px', p: '6px 12px', bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
          <Typography component="span" sx={{ fontSize: 11, fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap' }}>
            {selectedTrNums.size} ticket{selectedTrNums.size !== 1 ? 's' : ''} selected:
          </Typography>
          <Stack direction="row" sx={{ gap: '4px' }}>
            {ACTION_GROUPS.flatMap((g) => g.actions).filter((a) => PRIMARY_BULK_ACTIONS.includes(a.id)).map((a) => (
              <Button key={a.id} variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => handleBulkAction(a.id)}>{a.label}</Button>
            ))}
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ position: 'relative' }} ref={moreRef}>
            <Button variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={(e) => { e.stopPropagation(); setMoreOpen((v) => !v); }}>
              More Actions <ExpandMoreIcon fontSize="small" />
            </Button>
            {moreOpen && (
              <Box
                onClick={(e) => e.stopPropagation()}
                sx={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '3px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', minWidth: '180px', py: '4px' }}
              >
                {ACTION_GROUPS.flatMap((g) => g.actions).filter((a) => !PRIMARY_BULK_ACTIONS.includes(a.id)).map((a) => (
                  <Box key={a.id} onClick={() => { setMoreOpen(false); handleBulkAction(a.id); }} sx={{ px: '12px', py: '6px', fontSize: 11, color: 'text.primary', cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
                    {a.label}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Divider orientation="vertical" flexItem />
          <Button variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => setSelectedTrNums(new Set())}>Clear Selection</Button>
        </Stack>
      )}

      {loading && (
        <Stack justifyContent="center" alignItems="center" sx={{ p: '32px' }}>
          <CircularProgress size={20} />
        </Stack>
      )}

      {error && !loading && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      {!loading && !error && filteredTickets.length === 0 && (
        <Stack justifyContent="center" alignItems="center" sx={{ p: '32px' }}>
          <Alert severity="info">No tickets found for this worklist.</Alert>
        </Stack>
      )}

      {!loading && !error && filteredTickets.length > 0 && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* Sticky column header */}
          <Box sx={{ display: 'grid', gridTemplateColumns, bgcolor: 'grey.50', position: 'sticky', top: 0, zIndex: 2, borderBottom: '2px solid', borderColor: 'grey.900' }}>
            <Box sx={{ ...thSx, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Checkbox
                checked={paginatedTickets.length > 0 && paginatedTickets.every((t) => selectedTrNums.has(t.trNum))}
                onChange={toggleSelectAll}
                size="small"
              />
            </Box>
            {TABLE_COLUMNS.map((col) => (<Box key={col.key} sx={thSx}>{col.label}</Box>))}
          </Box>

          {/* Expand/Collapse All */}
          {typeGroups.length > 1 && (
            <Box sx={{ p: '4px 8px', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Button variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={toggleExpandAll}>
                {allExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                {allExpanded ? ' Collapse All' : ' Expand All'}
              </Button>
            </Box>
          )}

          {/* Type groups */}
          {typeGroups.map((group) => {
            const isExpanded = expandedTypes.has(group.type);
            const groupTrNums = group.tickets.map((t) => t.trNum);
            const allGroupSelected = groupTrNums.length > 0 && groupTrNums.every((tr) => selectedTrNums.has(tr));

            return (
              <Box key={group.type} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                {/* Group header */}
                <Stack direction="row" alignItems="center" sx={{ p: '4px 8px', bgcolor: 'grey.100', gap: '8px' }}>
                  <Box onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={allGroupSelected} onChange={(e) => { e.stopPropagation(); toggleGroupSelection(group); }} size="small" />
                  </Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    onClick={() => toggleType(group.type)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleType(group.type); }}
                    sx={{ cursor: 'pointer', gap: '6px', flex: 1 }}
                  >
                    {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                    <Typography component="span" sx={{ fontSize: 11, fontWeight: 700, color: 'text.primary' }}>
                      {group.type}{group.typeLabel ? ` - ${group.typeLabel}` : ''}
                    </Typography>
                    <Chip label={group.tickets.length} size="small" sx={{ fontSize: 11, height: 20 }} />
                  </Stack>
                </Stack>

                {/* Ticket rows */}
                {isExpanded && group.tickets.map((ticket, idx) => (
                  <Box
                    key={ticket.trNum}
                    sx={{ display: 'grid', gridTemplateColumns, ...getRowSx(ticket, idx, selectedTrNums) }}
                    onClick={() => toggleRowSelection(ticket.trNum)}
                    onDoubleClick={() => handleRowDoubleClick(ticket.trNum)}
                    onContextMenu={(e) => handleContextMenu(e, ticket.trNum)}
                  >
                    <Box sx={{ ...tdSx, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selectedTrNums.has(ticket.trNum)} onChange={() => toggleRowSelection(ticket.trNum)} size="small" />
                    </Box>
                    <Box sx={tdSx}>
                      <ButtonBase
                        onClick={(e) => { e.stopPropagation(); openTicketTab(ticket.trNum); }}
                        sx={{ p: 0, color: 'primary.main', fontSize: 'inherit', fontFamily: 'inherit', textDecoration: 'underline', '&:hover': { color: 'primary.dark' } }}
                      >
                        {ticket.trNum}
                      </ButtonBase>
                    </Box>
                    <Box sx={tdSx}>{ticket.tnCircuitId}{ticket.groupName ? ` / ${ticket.groupName}` : ''}</Box>
                    <Box sx={tdSx}>{ticket.type}</Box>
                    <Box sx={tdSx}>{ticket.rptdDt}</Box>
                    <Box sx={tdSx}>{ticket.commEttrDt}</Box>
                    <Box sx={tdSx}>
                      <Chip label={ticket.stat} size="small" sx={{ fontSize: 11, height: 20 }} color={ticket.stat === 'NM' ? 'error' : ticket.stat === 'PP' ? 'warning' : undefined} />
                    </Box>
                    <Box sx={tdSx}>{ticket.statusDt}</Box>
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <Box
          sx={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '3px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: '180px', py: '4px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {ACTION_GROUPS.map((group, idx) => (
            <Box key={group.label}>
              <Box sx={{ px: '12px', py: '4px', fontSize: 11, fontWeight: 700, color: 'grey.500', textTransform: 'uppercase' }}>{group.label}</Box>
              {group.actions.map((action) => (
                <Box key={action.id} onClick={() => { setContextMenu(null); handleBulkAction(action.id); }} sx={{ px: '12px', py: '6px', fontSize: 11, color: 'text.primary', cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
                  {action.label}
                </Box>
              ))}
              {idx < ACTION_GROUPS.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {!loading && filteredTickets.length > 0 && (
        <Box sx={{ p: '8px 12px', borderTop: '1px solid', borderColor: 'divider' }}>
          <Pagination count={totalPages} page={currentPage} onChange={(_, page) => setCurrentPage(page)} size="small" />
        </Box>
      )}
    </Box>
  );
}
