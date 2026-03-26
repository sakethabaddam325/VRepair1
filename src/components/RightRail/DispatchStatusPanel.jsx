import React, { useState, useEffect, useCallback } from 'react';
import Collapsible from '../../molecules/Collapsible/Collapsible.tsx';
import Status from '../../atoms/Status/Status.tsx';
import { Box, Stack, Typography } from '@mui/material';

const DISPATCH_STATUS_VARIANT_MAP = {
  Dispatched: 'success',
  Pending: 'warning',
  'Not Dispatched': 'info',
};

const SYNC_STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

const MOCK_DATA = {
  dispatchStatus: 'Dispatched',
  technician: {
    name: 'Carlos Mendez',
    phone: '(615) 555-0277',
  },
  eta: '2026-03-19 15:30 CST',
  ctcTablet: {
    lastSync: '2026-03-19T14:22:00-06:00',
  },
  resolution: {
    status: 'En Route',
    notes: 'Technician confirmed departure from Nashville Central CO',
  },
};

const formatSyncTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
};

const isSyncStale = (isoString) => {
  if (!isoString) return true;
  const syncTime = new Date(isoString).getTime();
  const now = Date.now();
  return now - syncTime > SYNC_STALE_THRESHOLD_MS;
};

const labelSx = {
  fontSize: 12,
  fontWeight: 600,
  color: 'text.secondary',
  minWidth: 110,
  flexShrink: 0,
};

const valueSx = {
  fontSize: 14,
  color: 'text.primary',
};

const subTitleSx = {
  fontSize: 12,
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  mb: '8px',
};

export const DispatchStatusPanel = ({ trNum }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/controller/DispatchController', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'GET_STATUS', trNum }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (!cancelled) setData(result);
      } catch {
        // Fallback to mock data for development
        if (!cancelled) setData(MOCK_DATA);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [trNum]);

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ p: '24px', fontSize: 14, color: 'text.secondary' }}>
        Loading dispatch status...
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ p: '24px', fontSize: 14, color: 'error.main' }}>
        {error}
      </Stack>
    );
  }

  if (!data) return null;

  const { dispatchStatus, technician, eta, ctcTablet, resolution } = data;
  const syncStale = isSyncStale(ctcTablet?.lastSync);

  return (
    <Stack direction="column" sx={{ bgcolor: 'background.paper' }}>
      <Collapsible level={2} title="Dispatch Status" isOpen={isOpen} onToggle={toggleOpen}>
        <Box sx={{ p: '12px' }}>
          {/* Dispatch Status */}
          <Stack direction="row" alignItems="center" sx={{ gap: '8px', mb: '8px' }}>
            <Typography component="span" sx={labelSx}>Status</Typography>
            <Status variant={DISPATCH_STATUS_VARIANT_MAP[dispatchStatus] || 'default'}>{dispatchStatus}</Status>
          </Stack>

          {/* Technician */}
          <Box sx={{ mt: '12px', pt: '12px', borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography sx={subTitleSx}>Technician</Typography>
            <Stack direction="row" alignItems="flex-start" sx={{ gap: '8px', mb: '8px' }}>
              <Typography component="span" sx={labelSx}>Name</Typography>
              <Typography component="span" sx={valueSx}>{technician?.name || 'Unassigned'}</Typography>
            </Stack>
            <Stack direction="row" alignItems="flex-start" sx={{ gap: '8px', mb: '8px' }}>
              <Typography component="span" sx={labelSx}>Phone</Typography>
              <Typography component="span" sx={valueSx}>{technician?.phone || 'N/A'}</Typography>
            </Stack>
          </Box>

          {/* ETA */}
          <Box sx={{ mt: '12px', pt: '12px', borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography sx={subTitleSx}>Estimated Arrival</Typography>
            <Stack direction="row" alignItems="flex-start" sx={{ gap: '8px', mb: '8px' }}>
              <Typography component="span" sx={labelSx}>ETA</Typography>
              <Typography component="span" sx={valueSx}>{eta || 'Not available'}</Typography>
            </Stack>
          </Box>

          {/* CTC Tablet Sync */}
          <Box sx={{ mt: '12px', pt: '12px', borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography sx={subTitleSx}>CTC Tablet Sync</Typography>
            <Stack direction="row" alignItems="center" sx={{ gap: '8px', mb: '8px' }}>
              <Typography component="span" sx={labelSx}>Sync Status</Typography>
              <Status variant={syncStale ? 'warning' : 'success'}>{syncStale ? 'Stale (>5 min)' : 'Synced'}</Status>
            </Stack>
            <Stack direction="row" alignItems="flex-start" sx={{ gap: '8px', mb: '8px' }}>
              <Typography component="span" sx={labelSx}>Last Sync</Typography>
              <Typography component="span" sx={valueSx}>{formatSyncTime(ctcTablet?.lastSync)}</Typography>
            </Stack>
          </Box>

          {/* Resolution */}
          <Box sx={{ mt: '12px', pt: '12px', borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography sx={subTitleSx}>Resolution</Typography>
            <Stack direction="row" alignItems="flex-start" sx={{ gap: '8px', mb: '8px' }}>
              <Typography component="span" sx={labelSx}>Status</Typography>
              <Typography component="span" sx={valueSx}>{resolution?.status || 'Pending'}</Typography>
            </Stack>
            {resolution?.notes && (
              <Stack direction="row" alignItems="flex-start" sx={{ gap: '8px', mb: '8px' }}>
                <Typography component="span" sx={labelSx}>Notes</Typography>
                <Typography component="span" sx={valueSx}>{resolution.notes}</Typography>
              </Stack>
            )}
          </Box>
        </Box>
      </Collapsible>
    </Stack>
  );
};

export default DispatchStatusPanel;
