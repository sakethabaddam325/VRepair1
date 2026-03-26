import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShellContextOptional } from './DashboardShell.jsx';
import {
  Box, Stack, Typography, Paper, TextField, List, ListItem,
  Button, Chip, Divider, ButtonBase, IconButton,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import MenuIcon from '@mui/icons-material/Menu';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import DataGrid from '../components/DataGrid.jsx';

/* ─── Mock Data ─── */
const TODAYS_LOAD = {
  p1Critical: 14,
  p2High: 38,
  p3Normal: 127,
  unassigned: 56,
  total: 2556,
  lastRefreshed: '03/19/2026 03:24 PM',
};

const DONUT_CARDS = [
  {
    title: 'My Wireless Tickets',
    total: 42,
    categories: [
      { label: 'Transport',   count: 12, color: '#1976D2' },
      { label: 'Equipment',   count: 8,  color: '#42A5F5' },
      { label: 'Towerlight',  count: 7,  color: '#EC407A' },
      { label: 'FCC',         count: 5,  color: '#FF8A65' },
      { label: 'Environment', count: 6,  color: '#66BB6A' },
      { label: 'VRT',         count: 4,  color: '#AED581' },
    ],
  },
  {
    title: 'Tickets Created By Me',
    total: 18,
    categories: [
      { label: 'Transport',   count: 5, color: '#1976D2' },
      { label: 'Equipment',   count: 3, color: '#42A5F5' },
      { label: 'Towerlight',  count: 4, color: '#EC407A' },
      { label: 'FCC',         count: 2, color: '#FF8A65' },
      { label: 'Environment', count: 2, color: '#66BB6A' },
      { label: 'VRT',         count: 2, color: '#AED581' },
    ],
  },
  {
    title: 'My Group Tickets',
    total: 67,
    categories: [
      { label: 'Transport',   count: 20, color: '#1976D2' },
      { label: 'Equipment',   count: 15, color: '#42A5F5' },
      { label: 'Towerlight',  count: 10, color: '#EC407A' },
      { label: 'FCC',         count: 8,  color: '#FF8A65' },
      { label: 'Environment', count: 9,  color: '#66BB6A' },
      { label: 'VRT',         count: 5,  color: '#AED581' },
    ],
  },
];

const WIRELESS_TICKETS = [
  { trNum: 'NYI1127246', reportStatus: 'Open',    ticketType: 'CSM', lodIndicator: 'Y', outageCategory: 'UNPLANNED', groupAssigned: 'NMC-WLS', eventId: 'EVT-001', troubleDesc: 'Signal degradation on cell tower',      area: 'NEW YORK',   deviceHostName: 'NY-CELL-001', cellNumber: 'C1127', location: 'Manhattan, NY',    siteName: 'NY-SITE-01',  notamExpiration: '03/20/2026', lteOos: 'N', troubleTypeL1: 'Transport'   },
  { trNum: 'DCI1100098', reportStatus: 'Pending',  ticketType: 'ENC', lodIndicator: 'N', outageCategory: 'PLANNED',   groupAssigned: 'NMC-ENC', eventId: 'EVT-002', troubleDesc: 'Equipment failure at tower site',        area: 'DC METRO',   deviceHostName: 'DC-CELL-005', cellNumber: 'C1100', location: 'Arlington, VA',    siteName: 'DC-SITE-05',  notamExpiration: '03/22/2026', lteOos: 'Y', troubleTypeL1: 'Equipment'   },
  { trNum: 'NYI1121432', reportStatus: 'Open',    ticketType: 'VAT', lodIndicator: 'Y', outageCategory: 'UNPLANNED', groupAssigned: 'NMC-WLS', eventId: 'EVT-003', troubleDesc: 'Towerlight reporting fault code 44',    area: 'NEW YORK',   deviceHostName: 'NY-CELL-088', cellNumber: 'C1121', location: 'Brooklyn, NY',     siteName: 'NY-SITE-22',  notamExpiration: '03/25/2026', lteOos: 'N', troubleTypeL1: 'Towerlight'  },
  { trNum: 'NYI1121318', reportStatus: 'Closed',  ticketType: 'VAT', lodIndicator: 'N', outageCategory: 'PLANNED',   groupAssigned: 'NMC-WLS', eventId: 'EVT-004', troubleDesc: 'FCC compliance check — antenna tilt',   area: 'NEW YORK',   deviceHostName: 'NY-CELL-044', cellNumber: 'C1118', location: 'Queens, NY',       siteName: 'NY-SITE-09',  notamExpiration: '',           lteOos: 'N', troubleTypeL1: 'FCC'         },
  { trNum: 'MAAA04LK91', reportStatus: 'Closed',  ticketType: 'VAT', lodIndicator: 'N', outageCategory: 'EMERGENCY', groupAssigned: 'NMC-GRP', eventId: 'EVT-005', troubleDesc: 'Environmental sensor alarm — humidity',  area: 'MID-ATL',    deviceHostName: 'MA-CELL-012', cellNumber: 'C4001', location: 'Philadelphia, PA',  siteName: 'MA-SITE-12',  notamExpiration: '',           lteOos: 'N', troubleTypeL1: 'Environment' },
  { trNum: 'BOS1204789', reportStatus: 'Open',    ticketType: 'CSM', lodIndicator: 'Y', outageCategory: 'UNPLANNED', groupAssigned: 'NMC-NE',  eventId: 'EVT-006', troubleDesc: 'VRT module offline — no heartbeat',     area: 'NEW ENGLAND', deviceHostName: 'BOS-CELL-07', cellNumber: 'C2041', location: 'Boston, MA',       siteName: 'NE-SITE-07',  notamExpiration: '04/01/2026', lteOos: 'Y', troubleTypeL1: 'VRT'         },
];


const WORKLISTS = [
  { id: 'WL001', name: 'SASI_KT',               description: 'KT · Center IT Staff · Last opened today',         count: 2556, pinned: true  },
  { id: 'WL002', name: 'WORKLIST-DEMO',          description: 'Work List Demo · Owned by Tammi, Vishnu',          count: 84,   pinned: false },
  { id: 'WL003', name: 'NMC TESTING1',           description: 'Testing · Center IT Staff',                        count: 12,   pinned: false },
  { id: 'WL004', name: 'VISHNU_CENTER_WRKLIST',  description: 'Test Center Type · Center IT Staff',               count: 7,    pinned: false },
  { id: 'WL005', name: 'MYLIST2',                description: 'List for Mon-SVC · Center IT Staff',               count: 31,   pinned: false },
];


const QUICK_LINKS = [
  { label: 'GTRM Search',     icon: 'search' },
  { label: 'Flash Search',    icon: 'search' },
  { label: 'ETMS Ticket',     icon: 'search' },
  { label: 'Group TR Search', icon: 'search' },
  { label: 'Validation List', icon: 'check'  },
  { label: 'My Flagged List', icon: 'filter' },
];

/* ─── Shared sx ─── */
const VZ_FONT = '"Verizon-NHG-eDS", "Verizon-NHG-eTX", "Helvetica Neue", Arial, sans-serif';
const textActionSx = { fontSize: 14, color: 'info.main', p: 0, fontFamily: VZ_FONT, '&:hover': { textDecoration: 'underline' } };
const textLinkSx   = { fontSize: 12, color: 'info.main', p: 0, fontFamily: VZ_FONT, '&:hover': { textDecoration: 'underline' } };
const ticketLinkSx = { fontSize: 14, color: 'info.main', fontWeight: 700, p: 0, textAlign: 'left', fontFamily: VZ_FONT, '&:hover': { textDecoration: 'underline' } };

/* ─── SummaryDonutCard ─── */
const SummaryDonutCard = ({ title, total, categories }) => (
  <Paper
    elevation={0}
    sx={{ flex: 1, minWidth: 0, borderRadius: '6px', overflow: 'hidden', p: '16px', bgcolor: '#fff' }}
  >
    <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', mb: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {title}
    </Typography>
    <Box sx={{ position: 'relative', width: '100%', height: 140 }}>
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie
            data={categories}
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={60}
            dataKey="count"
            startAngle={90}
            endAngle={-270}
            paddingAngle={1}
          >
            {categories.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Centered total overlay */}
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
        <Typography sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: 'text.primary' }}>{total}</Typography>
        <Typography sx={{ fontSize: 10, color: 'grey.500', lineHeight: 1.4 }}>Total</Typography>
      </Box>
    </Box>
    {/* Legend */}
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', mt: '12px' }}>
      {categories.map((cat) => (
        <Stack key={cat.label} direction="row" alignItems="center" sx={{ gap: '5px', minWidth: 0 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: cat.color, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {cat.label}
          </Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.primary', ml: 'auto', flexShrink: 0 }}>
            {cat.count}
          </Typography>
        </Stack>
      ))}
    </Box>
  </Paper>
);

/* ─── DashboardPage ─── */
export default function DashboardPage() {
  const [searchValue,         setSearchValue]         = useState('');
  const [ticketFilter,        setTicketFilter]        = useState('Open');
  const [showWirelessTickets, setShowWirelessTickets] = useState(true);
  const shell    = useShellContextOptional();
  const navigate = useNavigate();

  const openTicketTab = useCallback(
    (ticketId) => {
      if (shell?.openTicketTab) shell.openTicketTab(ticketId);
      else navigate('/ticket/' + encodeURIComponent(ticketId));
    },
    [shell, navigate],
  );

  const openWorklistDetail = useCallback(
    (worklistId, worklistName, recordCount) => {
      if (shell?.openWorklistDetail) shell.openWorklistDetail(worklistId, worklistName, recordCount);
    },
    [shell],
  );

  const switchToPrimaryTab = useCallback(
    (tabId) => { shell?.switchToPrimaryTab?.(tabId); },
    [shell],
  );

  const handleSearch = () => {
    const value = searchValue.trim();
    if (!value) return;
    openTicketTab(value);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  const handleOpenWorklist = (worklist) => {
    openWorklistDetail(worklist.id || worklist.name, worklist.name, worklist.count || 0);
  };

  const filteredTickets = WIRELESS_TICKETS.filter((t) =>
    ticketFilter === 'Open'
      ? ['Open', 'Pending', 'Working'].includes(t.reportStatus)
      : ['Closed', 'Resolved'].includes(t.reportStatus)
  );

  const wirelessTicketColumns = useMemo(() => [
    {
      field: 'trNum', label: 'TR Number', width: 110,
      formatter: (val) => (
        <ButtonBase
          sx={ticketLinkSx}
          onClick={(e) => { e.stopPropagation(); openTicketTab(val); }}
        >
          {val}
        </ButtonBase>
      ),
    },
    { field: 'reportStatus',    label: 'Report Status',   width: 100 },
    { field: 'ticketType',      label: 'Ticket Type',     width: 90  },
    { field: 'lodIndicator',    label: 'LOD',             width: 60  },
    { field: 'outageCategory',  label: 'Outage Category', width: 120 },
    { field: 'groupAssigned',   label: 'Group Assigned',  width: 110 },
    { field: 'eventId',         label: 'Event ID',        width: 90  },
    { field: 'troubleDesc',     label: 'Trouble Desc',    width: 200, wrap: true },
    { field: 'area',            label: 'Area',            width: 110 },
    { field: 'deviceHostName',  label: 'Device Host',     width: 110 },
    { field: 'cellNumber',      label: 'Cell Number',     width: 90  },
    { field: 'location',        label: 'Location',        width: 140 },
    { field: 'siteName',        label: 'Site Name',       width: 110 },
    { field: 'notamExpiration', label: 'NOTAM Exp.',      width: 100 },
    { field: 'lteOos',          label: 'LTE OOS',         width: 70  },
    { field: 'troubleTypeL1',   label: 'Trouble Type L1', width: 120 },
  ], [openTicketTab]);

  return (
    <Stack direction="column" sx={{ gap: '20px', p: '16px 24px 20px', maxWidth: 1400, mx: 'auto', width: '100%', bgcolor: '#F6F7F9' }}>

      {/* ─── Change 3: Quick Search — existing Accordion component ─── */}
      <Accordion defaultExpanded sx={{ border: 'none', bgcolor: '#fff', '&:before': { display: 'none' } }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: '#000', stroke: '#000', strokeWidth: 1 }} />}
          sx={{
            flexDirection: 'row',
            '& .MuiAccordionSummary-expandIconWrapper': {
              bgcolor: 'transparent',
              boxShadow: 'none',
              border: 'none',
              p: 0,
              ml: 'auto',
            },
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>Quick Search</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="column" sx={{ gap: '12px' }}>
            <Typography component="label" sx={{ fontSize: 14, color: 'grey.800' }}>
              Search by Ticket # or Circuit ID
            </Typography>
            <Stack direction="row" sx={{ gap: '8px' }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="e.g. NYI1127246 or WHNJKO4QA"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={{ flex: 1, maxWidth: 400 }}
              />
              <Button variant="contained" size="small" onClick={handleSearch}>Search</Button>
            </Stack>
            <Stack direction="column" sx={{ gap: '8px' }}>
              <Typography component="span" sx={{ fontSize: 12, color: 'grey.500' }}>Jump to:</Typography>
              <Stack direction="row" sx={{ gap: '8px', flexWrap: 'wrap' }}>
                {QUICK_LINKS.map((link) => (
                  <ButtonBase
                    key={link.label}
                    onClick={() => {}}
                    sx={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider',
                      borderRadius: '22px', py: '4px', px: '10px', fontSize: 12,
                      fontFamily: VZ_FONT,
                      color: 'grey.800', transition: 'background 0.12s ease, border-color 0.12s ease',
                      '&:hover': { bgcolor: 'background.default', borderColor: 'info.main', color: 'info.main' },
                    }}
                  >
                    {link.icon === 'search' && <SearchIcon sx={{ fontSize: 14, color: 'info.main' }} />}
                    {link.icon === 'check'  && <CheckIcon  sx={{ fontSize: 14, color: 'info.main' }} />}
                    {link.icon === 'filter' && <FilterListIcon sx={{ fontSize: 14, color: 'info.main' }} />}
                    {link.label}
                  </ButtonBase>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* ─── Today's Load Strip ─── */}
      <Stack
        component="section"
        direction="row"
        alignItems="center"
        sx={{ gap: '16px', bgcolor: '#fff', borderRadius: '6px', py: '12px', px: '20px', flexWrap: 'wrap' }}
      >
        <Typography component="span" sx={{ fontSize: 12, fontWeight: 700, color: 'grey.500', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
          TODAY'S LOAD
        </Typography>
        <Stack direction="row" sx={{ gap: '8px' }}>
          {[
            { count: TODAYS_LOAD.p1Critical, label: 'P1 Critical', color: '#D52B1E' },
            { count: TODAYS_LOAD.p2High,     label: 'P2 High',     color: '#ED7000' },
            { count: TODAYS_LOAD.p3Normal,   label: 'P3 Normal',   color: '#0077B4' },
            { count: TODAYS_LOAD.unassigned, label: 'Unassigned',  color: 'grey.600' },
          ].map(({ count, label, color }) => (
            <Stack key={label} direction="column" alignItems="center" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '3px', py: '4px', px: '12px', minWidth: 72 }}>
              <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, color }}>{count}</Typography>
              <Typography sx={{ fontSize: 11, color, whiteSpace: 'nowrap' }}>{label}</Typography>
            </Stack>
          ))}
        </Stack>
        <Typography component="span" sx={{ fontSize: 14, color: 'grey.800', flex: 1 }}>
          <strong>{TODAYS_LOAD.total.toLocaleString()}</strong> total tickets across your worklists
        </Typography>
        <Stack direction="row" alignItems="center" sx={{ gap: '12px', ml: 'auto' }}>
          <Typography component="span" sx={{ fontSize: 11, color: 'grey.500', whiteSpace: 'nowrap' }}>
            Last refreshed: {TODAYS_LOAD.lastRefreshed}
          </Typography>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon fontSize="small" />} onClick={() => {}}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* ─── Change 2: Donut Chart Summary Cards ─── */}
      <Stack direction="row" sx={{ gap: '16px', flexWrap: 'wrap' }}>
        {DONUT_CARDS.map((card) => (
          <SummaryDonutCard key={card.title} {...card} />
        ))}
      </Stack>

      {/* ─── Changes 4 + 5: My Wireless Tickets table with Open/Resolved toggle ─── */}
      {showWirelessTickets && (
        <Paper component="section" elevation={0} sx={{ borderRadius: '6px', overflow: 'hidden', bgcolor: '#fff' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: '12px', px: '16px' }}>
            {/* Left: title + toggle inline */}
            <Stack direction="row" alignItems="center" sx={{ gap: '12px' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap' }}>
                My Wireless Tickets ({filteredTickets.length})
              </Typography>
              {/* Change 5 — Open / Resolved toggle */}
              <Stack direction="row" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '20px', overflow: 'hidden' }}>
                {['Open', 'Resolved'].map((opt) => (
                  <Box
                    key={opt}
                    component="button"
                    onClick={() => setTicketFilter(opt)}
                    sx={{
                      px: '14px', py: '4px', fontSize: 12, fontWeight: ticketFilter === opt ? 700 : 400,
                      border: 'none', cursor: 'pointer', transition: 'background 0.12s ease',
                      bgcolor: ticketFilter === opt ? 'grey.900' : 'transparent',
                      color: ticketFilter === opt ? '#fff' : 'text.secondary',
                      fontFamily: '"Verizon-NHG-eDS","Verizon-NHG-eTX","Helvetica Neue",Arial,sans-serif',
                    }}
                  >
                    {opt}
                  </Box>
                ))}
              </Stack>
            </Stack>
            {/* Right: close icon */}
            <IconButton size="small" onClick={() => setShowWirelessTickets(false)} sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Divider />
          <DataGrid
            columns={wirelessTicketColumns}
            data={filteredTickets}
            height={320}
            alternateRows
            showToolbar
            showFooter
            onRowDoubleClick={(row) => openTicketTab(row.trNum)}
          />
        </Paper>
      )}

      {/* ─── Change 6: My Worklists — secondary position below ticket table ─── */}
      <Paper component="section" elevation={0} sx={{ borderRadius: '6px', overflow: 'hidden', bgcolor: '#fff' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: '12px', px: '16px' }}>
          <Stack direction="row" alignItems="center" sx={{ gap: '8px' }}>
            <MenuIcon fontSize="small" />
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>My Worklists</Typography>
          </Stack>
          <ButtonBase sx={textActionSx} onClick={() => {}}>+ Create New List</ButtonBase>
        </Stack>
        <Divider />
        <List disablePadding>
          {WORKLISTS.map((wl) => (
            <ListItem
              key={wl.id}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: '10px', px: '16px', borderBottom: '1px solid', borderColor: 'grey.100', transition: 'background 0.12s ease', '&:last-child': { borderBottom: 'none' }, '&:hover': { bgcolor: 'grey.100' } }}
            >
              <Stack direction="row" alignItems="center" sx={{ gap: '10px', minWidth: 0 }}>
                {wl.pinned
                  ? <Box component="span" sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}><StarIcon sx={{ fontSize: 16, color: '#ED7000' }} /></Box>
                  : <Box component="span" sx={{ width: 16, flexShrink: 0 }} />
                }
                <Stack direction="column" sx={{ gap: '2px', minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" sx={{ gap: '8px', fontSize: 14, fontWeight: 700, color: 'text.primary' }}>
                    {wl.name}
                    {wl.pinned && <Chip label="Pinned" size="small" sx={{ fontSize: 11, height: 20 }} />}
                  </Stack>
                  <Typography component="span" sx={{ fontSize: 12, color: 'grey.500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {wl.description}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" alignItems="center" sx={{ gap: '12px', flexShrink: 0 }}>
                <Typography component="span" sx={{ fontSize: 14, fontWeight: 700, color: 'info.main', minWidth: 40, textAlign: 'right' }}>
                  {wl.count.toLocaleString()}
                </Typography>
                <Button variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => handleOpenWorklist(wl)}>
                  Open →
                </Button>
              </Stack>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Stack direction="row" justifyContent="space-between" sx={{ py: '10px', px: '16px' }}>
          <ButtonBase sx={textLinkSx} onClick={() => switchToPrimaryTab('all-worklists')}>≡ View all worklists (30+)</ButtonBase>
          <ButtonBase sx={textLinkSx} onClick={() => switchToPrimaryTab('worklist-settings')}>⚙ Manage &amp; settings</ButtonBase>
        </Stack>
      </Paper>

      {/* ─── Footer ─── */}
      <Typography component="footer" sx={{ textAlign: 'center', fontSize: 11, color: 'grey.500', py: '16px' }}>
        vRepair · React Redesign · Dashboard Wireframe · UX POC · March 2026
      </Typography>
    </Stack>
  );
}
