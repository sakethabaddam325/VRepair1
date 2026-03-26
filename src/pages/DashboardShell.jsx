import React, { Suspense, lazy, useState, useCallback, useEffect, createContext, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Stack, Box, Tab, CircularProgress, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DashboardPage = lazy(() => import('./DashboardPage.jsx'));
const AllWorklistsPage = lazy(() => import('./AllWorklistsPage.jsx'));
const WorklistSettingsPage = lazy(() => import('./WorklistSettingsPage.jsx'));
const GroupTroubleTabs = lazy(() => import('./GroupTroubleTabs.jsx'));
const WorklistDetailPage = lazy(() => import('./WorklistDetailPage.jsx'));

/* ─── Primary tabs (top row, red stroke on top) ─── */
const PRIMARY_TABS = [
  { id: 'my-dashboard', label: 'My Dashboard' },
  // { id: 'all-worklists', label: 'All Worklists' },
  // { id: 'worklist-settings', label: 'Worklist Settings' },
];

const Fallback = () => (
  <Stack justifyContent="center" alignItems="center" sx={{ p: '32px' }}>
    <CircularProgress size={20} />
  </Stack>
);

/* ─── Shell Context — lets child pages open ticket tabs ─── */
const ShellContext = createContext(null);

export function useShellContext() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error('useShellContext must be used within DashboardShell');
  return ctx;
}

/** Same context without throwing — use when the page may render outside `DashboardShell` (e.g. dev/HMR). */
export function useShellContextOptional() {
  return useContext(ShellContext);
}

/* ─── Dashboard Shell ─── */
export default function DashboardShell() {
  // Which primary tab is active (null if a ticket tab is active)
  const [activePrimaryTab, setActivePrimaryTab] = useState('my-dashboard');
  // Open ticket tabs (secondary row)
  const [ticketTabs, setTicketTabs] = useState([]);
  // Which ticket tab is active (null if a primary tab is active)
  const [activeTicketTab, setActiveTicketTab] = useState(null);
  // Tracks which primary tab was active before opening a ticket (for back-nav)
  const [lastPrimaryTab, setLastPrimaryTab] = useState('my-dashboard');

  /** Open a ticket (trouble report) as a new sub-tab */
  const openTicketTab = useCallback((ticketId) => {
    const tabId = 'ticket-' + ticketId;
    setTicketTabs((prev) => {
      if (prev.some((t) => t.id === tabId)) return prev;
      return [...prev, { id: tabId, label: ticketId, trNum: ticketId, tabType: 'ticket' }];
    });
    setActivePrimaryTab((prev) => {
      if (prev) setLastPrimaryTab(prev);
      return null;
    });
    setActiveTicketTab(tabId);
  }, []);

  /** Open a worklist detail page as a sub-tab */
  const openWorklistDetail = useCallback((worklistId, worklistName, recordCount) => {
    const tabId = 'worklist-' + worklistId;
    setTicketTabs((prev) => {
      if (prev.some((t) => t.id === tabId)) return prev;
      return [...prev, {
        id: tabId,
        label: worklistName || worklistId,
        worklistId,
        worklistName: worklistName || worklistId,
        recordCount: recordCount || 0,
        tabType: 'worklist',
      }];
    });
    setActivePrimaryTab((prev) => {
      if (prev) setLastPrimaryTab(prev);
      return null;
    });
    setActiveTicketTab(tabId);
  }, []);

  /** Close a ticket tab */
  const closeTicketTab = useCallback((tabId, e) => {
    if (e) e.stopPropagation();
    setTicketTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === tabId);
      const next = prev.filter((t) => t.id !== tabId);

      // If the closed tab was active, activate adjacent ticket or fall back to dashboard
      if (activeTicketTab === tabId) {
        if (next.length > 0) {
          const newActive = next[Math.min(idx, next.length - 1)];
          setActiveTicketTab(newActive.id);
        } else {
          setActiveTicketTab(null);
          setActivePrimaryTab(lastPrimaryTab);
        }
      }
      return next;
    });
  }, [activeTicketTab, lastPrimaryTab]);

  /** Select a primary tab */
  const handlePrimaryTabClick = (tabId) => {
    setActivePrimaryTab(tabId);
    setActiveTicketTab(null); // deselect ticket tabs
  };

  /** Select a ticket tab */
  const handleTicketTabClick = (tabId) => {
    setActiveTicketTab(tabId);
    setActivePrimaryTab(null); // deselect primary tabs
  };

  /* ─── Auto-open ticket from URL param (/ticket/:trNum) ─── */
  const { trNum } = useParams();
  useEffect(() => {
    if (trNum) {
      openTicketTab(trNum);
    }
  }, [trNum, openTicketTab]);

  const activeTicket = ticketTabs.find((t) => t.id === activeTicketTab);
  /** Switch to a primary tab programmatically (e.g. from child pages) */
  const switchToPrimaryTab = useCallback((tabId) => {
    setActivePrimaryTab(tabId);
    setActiveTicketTab(null);
  }, []);

  const shellValue = { openTicketTab, openWorklistDetail, closeTicketTab, switchToPrimaryTab };

  return (
    <ShellContext.Provider value={shellValue}>
      {/* ─── Single tab row: primary + ticket tabs side by side ─── */}
      <Stack
        component="nav"
        direction="row"
        alignItems="stretch"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderTop: '1px solid #D8DADA',
          borderBottom: '1px solid #D8DADA',
          px: '24px',
          bgcolor: 'background.default',
          overflow: 'hidden',
          height: 30,
          flexShrink: 0,
        }}
      >
        {/* Primary tabs */}
        {PRIMARY_TABS.map((tab) => (
          <Box
            key={tab.id}
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              borderTop: activePrimaryTab === tab.id ? '3px solid #EE0000' : '3px solid transparent',
            }}
          >
            <Tab
              label={tab.label}
              value={tab.id}
              onClick={() => handlePrimaryTabClick(tab.id)}
              sx={{
                fontWeight: 400,
                minHeight: 30,
                textTransform: 'none',
                fontSize: 13,
                '&&.MuiTab-root': {
                  color: activePrimaryTab === tab.id ? '#000' : '#4A4A4A',
                  borderTop: 'none',
                  borderRadius: 0,
                  paddingTop: '4px',
                  paddingBottom: '4px',
                },
              }}
            />
          </Box>
        ))}

        {/* Ticket tabs — inline, no separate row */}
        {ticketTabs.map((tab) => (
          <Box
            key={tab.id}
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              borderTop: activeTicketTab === tab.id ? '3px solid #EE0000' : '3px solid transparent',
            }}
          >
            <Tab
              label={tab.label}
              value={tab.id}
              onClick={() => handleTicketTabClick(tab.id)}
              sx={{
                fontWeight: 400,
                minHeight: 30,
                textTransform: 'none',
                fontSize: 13,
                '&&.MuiTab-root': {
                  color: activeTicketTab === tab.id ? '#000' : '#4A4A4A',
                  borderTop: 'none',
                  borderRadius: 0,
                  paddingTop: '4px',
                  paddingBottom: '4px',
                },
              }}
            />
            <IconButton
              onClick={(e) => closeTicketTab(tab.id, e)}
              aria-label={`Close ${tab.label}`}
              size="small"
              sx={{
                color: 'grey.500',
                p: '2px',
                ml: 'calc(-1 * 6px)',
                mr: '4px',
                borderRadius: '3px',
                transition: 'color 0.12s ease, background 0.12s ease',
                '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>

      {/* ─── Content Area ─── */}
      <Suspense fallback={<Fallback />}>
        {activePrimaryTab === 'my-dashboard' && <DashboardPage />}
        {activePrimaryTab === 'all-worklists' && <AllWorklistsPage />}
        {activePrimaryTab === 'worklist-settings' && <WorklistSettingsPage />}
        {activeTicket && activeTicket.tabType === 'worklist' && (
          <WorklistDetailPage
            worklistId={activeTicket.worklistId}
            worklistName={activeTicket.worklistName}
            recordCount={activeTicket.recordCount}
          />
        )}
        {activeTicket && activeTicket.tabType !== 'worklist' && (
          <GroupTroubleTabs trNum={activeTicket.trNum} />
        )}
      </Suspense>
    </ShellContext.Provider>
  );
}
