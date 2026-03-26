import React, { useState, useEffect, useCallback } from 'react';
import { useShellContext } from './DashboardShell.jsx';
import { useAppContext } from '../contexts/AppContext.jsx';
import { getAllWorklists, deleteWorklist } from '../api/worklistApi.js';
import { Box, Stack, Typography, Paper, FormControl, Select, MenuItem, Button, Chip, CircularProgress, Alert, Pagination, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Toolbar } from '@mui/material';

const TABLE_COLUMNS = [
  { key: 'name', label: 'Worklist Name', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'center', label: 'Center', sortable: true },
  { key: 'recordCount', label: 'Record Count', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
];

const CENTER_OPTIONS = [
  { id: 'all', label: 'All Centers' },
  { id: 'NYCMNY01', label: 'NYCMNY01' },
  { id: 'CHCGIL01', label: 'CHCGIL01' },
  { id: 'LSANCA01', label: 'LSANCA01' },
  { id: 'DLASTX01', label: 'DLASTX01' },
];

const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

const PAGE_SIZE = 10;

export default function AllWorklistsPage() {
  const { openTicketTab, openWorklistDetail } = useShellContext();
  const { addToast } = useAppContext();

  const [worklists, setWorklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchName, setSearchName] = useState('');
  const [searchOwner, setSearchOwner] = useState('');
  const [searchCenter, setSearchCenter] = useState('all');
  const [searchStatus, setSearchStatus] = useState('all');

  const [toolbarSearch, setToolbarSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, ids: [] });

  const fetchWorklists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllWorklists();
      setWorklists(res.data || []);
    } catch {
      setError('Failed to load worklists.');
      addToast('Failed to load worklists', 'danger');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchWorklists();
  }, [fetchWorklists]);

  const filtered = worklists.filter((wl) => {
    if (searchName && !wl.name.toLowerCase().includes(searchName.toLowerCase())) return false;
    if (searchOwner && !wl.owner.toLowerCase().includes(searchOwner.toLowerCase())) return false;
    if (searchCenter !== 'all' && wl.center !== searchCenter) return false;
    if (searchStatus !== 'all' && wl.status !== searchStatus) return false;
    if (toolbarSearch && !wl.name.toLowerCase().includes(toolbarSearch.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const tableData = pageData.map((wl) => ({
    _id: wl.id,
    name: wl.name,
    owner: wl.owner,
    center: wl.center,
    recordCount: String(wl.recordCount),
    status: (
      <Chip label={wl.status === 'active' ? 'Active' : 'Inactive'} color={wl.status === 'active' ? 'success' : undefined} size="small" sx={{ fontSize: 11, height: 20 }} />
    ),
    actions: (
      <Button
        variant="outlined"
        size="small"
        sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }}
        onClick={() => openWorklistDetail(wl.id, wl.name, wl.recordCount)}
      >
        Open
      </Button>
    ),
  }));

  const handleDelete = async () => {
    const ids = deleteModal.ids;
    setDeleteModal({ isOpen: false, ids: [] });
    try {
      await Promise.all(ids.map((id) => deleteWorklist(id)));
      addToast(`${ids.length} worklist(s) deleted`, 'success');
      fetchWorklists();
    } catch {
      addToast('Failed to delete worklist(s)', 'danger');
    }
  };

  const handleSearchSubmit = () => setCurrentPage(1);

  const handleSearchClear = () => {
    setSearchName('');
    setSearchOwner('');
    setSearchCenter('all');
    setSearchStatus('all');
    setCurrentPage(1);
  };

  const kebabMenuItems = [
    {
      label: 'Open',
      onClick: (indices) => {
        const wl = pageData[indices[0]];
        if (wl?.id) openWorklistDetail(wl.id, wl.name, wl.recordCount);
      },
    },
    { label: 'Rename', onClick: () => addToast('Rename is not yet implemented', 'info') },
    { label: 'Duplicate', onClick: () => addToast('Duplicate is not yet implemented', 'info') },
    {
      label: 'Delete',
      onClick: (indices) => {
        const ids = indices.map((i) => pageData[i]?.id).filter(Boolean);
        setDeleteModal({ isOpen: true, ids });
      },
    },
  ];

  return (
    <Stack direction="column" sx={{ gap: '16px', py: '16px', px: '24px',
}}>
      {/* ── Search Form ── */}
      <Paper elevation={0} variant="outlined" sx={{ display: 'flex', flexDirection: 'column', gap: '16px', p: '16px', borderColor: 'divider', borderRadius: '6px' }}>
        <Typography variant="h5" component="h2" sx={{ fontSize: 20, fontWeight: 700, color: 'grey.900', m: 0 }}>
          Search All Worklists
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'flex-end', '@media (max-width: 480px)': { gridTemplateColumns: 'repeat(2, 1fr)' } }}>
          <Stack direction="column" sx={{ gap: '4px' }}>
            <Typography component="span" sx={{ fontSize: 12, fontWeight: 500, color: 'grey.900' }}>Worklist Name</Typography>
            <TextField size="small" fullWidth placeholder="Search by name" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
          </Stack>
          <Stack direction="column" sx={{ gap: '4px' }}>
            <Typography component="span" sx={{ fontSize: 12, fontWeight: 500, color: 'grey.900' }}>Owner</Typography>
            <TextField size="small" fullWidth placeholder="Search by owner" value={searchOwner} onChange={(e) => setSearchOwner(e.target.value)} />
          </Stack>
          <Stack direction="column" sx={{ gap: '4px' }}>
            <Typography component="span" sx={{ fontSize: 12, fontWeight: 500, color: 'grey.900' }}>Center</Typography>
            <FormControl size="small" fullWidth>
              <Select value={searchCenter} onChange={(e) => setSearchCenter(e.target.value)} displayEmpty>
                {CENTER_OPTIONS.map((opt) => <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="column" sx={{ gap: '4px' }}>
            <Typography component="span" sx={{ fontSize: 12, fontWeight: 500, color: 'grey.900' }}>Status</Typography>
            <FormControl size="small" fullWidth>
              <Select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} displayEmpty>
                {STATUS_OPTIONS.map((opt) => <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </Box>
        <Stack direction="row" justifyContent="flex-end" sx={{ gap: '8px' }}>
          <Button variant="contained" size="medium" onClick={handleSearchSubmit}>Search</Button>
          <Button variant="outlined" size="medium" onClick={handleSearchClear}>Clear</Button>
        </Stack>
      </Paper>

      {/* ── Loading ── */}
      {loading && (
        <Stack justifyContent="center" alignItems="center" sx={{ p: '32px' }}>
          <CircularProgress size={20} />
        </Stack>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      )}

      {/* ── Empty ── */}
      {!loading && !error && worklists.length === 0 && (
        <Stack direction="column" alignItems="center" sx={{ p: '32px' }}>
          <Alert severity="info">No worklists found.</Alert>
        </Stack>
      )}

      {/* ── Results ── */}
      {!loading && !error && worklists.length > 0 && (
        <Stack direction="column" sx={{ gap: '8px' }}>
          <Toolbar variant="dense" disableGutters sx={{ gap: '8px', px: '4px' }}>
            <TextField size="small" placeholder="Find in results..." value={toolbarSearch} onChange={(e) => { setToolbarSearch(e.target.value); setCurrentPage(1); }} sx={{ width: 240 }} />
          </Toolbar>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  {TABLE_COLUMNS.map((col) => (
                    <TableCell key={col.key} sx={{ fontWeight: 700, fontSize: 11 }}>{col.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pageData.map((wl, idx) => (
                  <TableRow key={wl.id} hover>
                    <TableCell sx={{ fontSize: 11 }}>{wl.name}</TableCell>
                    <TableCell sx={{ fontSize: 11 }}>{wl.owner}</TableCell>
                    <TableCell sx={{ fontSize: 11 }}>{wl.center}</TableCell>
                    <TableCell sx={{ fontSize: 11 }}>{wl.recordCount}</TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      <Chip label={wl.status === 'active' ? 'Active' : 'Inactive'} color={wl.status === 'active' ? 'success' : undefined} size="small" sx={{ fontSize: 11, height: 20 }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      <Button variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => openWorklistDetail(wl.id, wl.name, wl.recordCount)}>Open</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination count={totalPages} page={currentPage} onChange={(_, page) => setCurrentPage(page)} size="small" />
        </Stack>
      )}

      {/* ── Delete Modal ── */}
      <Dialog open={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, ids: [] })}>
        <DialogTitle>Delete Worklist</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete {deleteModal.ids.length} worklist(s)? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeleteModal({ isOpen: false, ids: [] })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
