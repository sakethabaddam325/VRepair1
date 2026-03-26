import React, { useState, useCallback, lazy, Suspense } from 'react';
import { Button } from '../../atoms/Button/Button.tsx';
import { Box, Stack } from '@mui/material';

/* ─── Lazy-loaded drawer page components ─── */
const GroupActivityLog = lazy(() => import('../../pages/GroupActivityLog.jsx'));
const GroupTroubleHistory = lazy(() => import('../../pages/GroupTroubleHistory.jsx'));
const TroubleNotes = lazy(() => import('../../pages/TroubleNotes.jsx'));
const TrMailBox = lazy(() => import('../../pages/TrMailBox.jsx'));
const Tier2 = lazy(() => import('../../pages/Tier2.jsx'));
const GroupMemberMgmt = lazy(() => import('../../pages/GroupMemberMgmt.jsx'));

/* ─── Drawer definitions ─── */
const DRAWERS = [
  { key: 'activityLog', label: 'Activity Log' },
  { key: 'history',     label: 'History' },
  { key: 'notes',       label: 'Notes' },
  { key: 'email',       label: 'Email' },
  { key: 'tier2',       label: 'Tier 2' },
  { key: 'memberMgmt',  label: 'Member Mgmt' },
];

const LoadingFallback = () => (
  <Stack
    alignItems="center"
    justifyContent="center"
    sx={{
      p: '32px',
      color: 'grey.500',
      fontSize: 14,
      lineHeight: '16.8px',
    }}
  >
    Loading...
  </Stack>
);

const SecondaryActionBar = ({ trNum, onDrawerOpen }) => {
  const [activeDrawer, setActiveDrawer] = useState(null);

  const handleToggle = useCallback(
    (key) => {
      setActiveDrawer((prev) => {
        const next = prev === key ? null : key;
        if (onDrawerOpen) onDrawerOpen(next);
        return next;
      });
    },
    [onDrawerOpen],
  );

  return (
    <Stack direction="column" sx={{ bgcolor: 'background.default' }}>
      {/* ─── Button Row ─── */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          gap: '8px',
          py: '8px',
          px: '16px',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexWrap: 'wrap',
        }}
      >
        {DRAWERS.map(({ key, label }) => (
          <Button
            key={key}
            size="small"
            variant={activeDrawer === key ? 'primary' : 'secondary'}
            onClick={() => handleToggle(key)}
          >
            {label}
          </Button>
        ))}
      </Stack>

      {/* ─── Drawer Content ─── */}
      {activeDrawer && (
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            animation: 'slideDown 0.25s ease-out',
            '@keyframes slideDown': {
              from: { opacity: 0, maxHeight: 0, transform: 'translateY(-8px)' },
              to: { opacity: 1, maxHeight: 2000, transform: 'translateY(0)' },
            },
          }}
        >
          <Box sx={{ p: '16px' }}>
            <Suspense fallback={<LoadingFallback />}>
              {activeDrawer === 'activityLog' && <GroupActivityLog trNum={trNum} />}
              {activeDrawer === 'history' && <GroupTroubleHistory trNum={trNum} />}
              {activeDrawer === 'notes' && <TroubleNotes trNum={trNum} />}
              {activeDrawer === 'email' && <TrMailBox trNum={trNum} />}
              {activeDrawer === 'tier2' && <Tier2 trNum={trNum} />}
              {activeDrawer === 'memberMgmt' && <GroupMemberMgmt trNum={trNum} />}
            </Suspense>
          </Box>
        </Box>
      )}
    </Stack>
  );
};

export default SecondaryActionBar;
