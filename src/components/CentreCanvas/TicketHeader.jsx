import React, { useMemo } from 'react';
import { Badge } from '../../atoms/Badge/Badge.tsx';
import { Button } from '../../atoms/Button/Button.tsx';
import { Box, Stack, Typography } from '@mui/material';

/* ─── Badge variant by ticket status ─── */
const statusVariant = (status) => {
  switch (status) {
    case 'OPN': return 'info';
    case 'WRK': return 'warning';
    case 'RST': return 'success';
    case 'CLD': return 'default';
    default:    return 'info';
  }
};

/* ─── Priority label ─── */
const priorityLabel = (priority) => {
  switch (String(priority)) {
    case '1': return 'P1 - Immediate';
    case '2': return 'P2 - High';
    case '3': return 'P3 - Medium';
    case '4': return 'P4 - Low';
    default:  return priority ? `P${priority}` : 'N/A';
  }
};

/* ─── Priority badge variant ─── */
const priorityVariant = (priority) => {
  switch (String(priority)) {
    case '1': return 'error';
    case '2': return 'warning';
    case '3': return 'info';
    default:  return 'default';
  }
};

/* ─── SLA color sx ─── */
const slaColorSx = (remainingMinutes) => {
  if (remainingMinutes <= 15) return { color: '#D52B1E', fontWeight: 700 };
  if (remainingMinutes <= 60) return { color: '#ED7000', fontWeight: 700 };
  return { color: '#008330', fontWeight: 700 };
};

/* ─── Format minutes to display string ─── */
const formatSla = (minutes) => {
  if (minutes == null) return 'N/A';
  const h = Math.floor(Math.abs(minutes) / 60);
  const m = Math.abs(minutes) % 60;
  const sign = minutes < 0 ? '-' : '';
  return `${sign}${h}h ${m}m remaining`;
};

const TicketHeader = ({ trData: rawTrData, trNum }) => {
  const trData = rawTrData || {};
  const displayTrNum = trNum || trData.trNum || trData.troubleReportNum || '';
  const status = trData.troubleRptStatus || trData.status || 'OPN';
  const priority = trData.priority || trData.pri || '1';
  const assignedUser = trData.assignedUser || trData.assigned || '';
  const slaMinutes = trData.slaMinutesRemaining ?? 135; // default 2h 15m

  const slaText = useMemo(() => formatSla(slaMinutes), [slaMinutes]);
  const slaValueSx = useMemo(() => slaColorSx(slaMinutes), [slaMinutes]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        gap: 1,
        py: '4px',
        px: 1,
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        minHeight: 32,
      }}
    >
      {/* ─── Left: TR#, Status, Priority ─── */}
      <Stack direction="row" alignItems="center" sx={{ gap: 1, flexShrink: 0 }}>
        <Typography
          component="span"
          sx={{
            fontSize: 13,
            fontWeight: 700,
            lineHeight: '16px',
            color: 'text.primary',
            whiteSpace: 'nowrap',
          }}
        >
          TR# {displayTrNum}
        </Typography>
        <Badge variant={statusVariant(status)}>{status}</Badge>
        <Badge variant={priorityVariant(priority)}>{priorityLabel(priority)}</Badge>
      </Stack>

      {/* ─── Center: SLA, Assigned ─── */}
      <Stack direction="row" alignItems="center" sx={{ gap: '12px', flex: 1, justifyContent: 'center' }}>
        <Stack
          direction="row"
          alignItems="center"
          sx={{ gap: '4px', fontSize: 12, lineHeight: '16px', whiteSpace: 'nowrap' }}
        >
          <Typography component="span" sx={{ fontSize: 12, color: 'grey.500' }}>
            SLA:
          </Typography>
          <Typography component="span" sx={{ fontSize: 12, ...slaValueSx }}>
            {slaText}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          sx={{ gap: '4px', fontSize: 12, lineHeight: '16px', whiteSpace: 'nowrap' }}
        >
          <Typography component="span" sx={{ fontSize: 12, color: 'grey.500' }}>
            Assigned:
          </Typography>
          <Typography component="span" sx={{ fontSize: 12, color: 'text.primary', fontWeight: 700 }}>
            {assignedUser || 'Unassigned'}
          </Typography>
        </Stack>
      </Stack>

      {/* ─── Right: Action buttons ─── */}
      <Stack direction="row" alignItems="center" sx={{ gap: '8px', flexShrink: 0 }}>
        <Button size="extraSmall" variant="secondary" onClick={() => window.location.reload()}>
          Refresh
        </Button>
        <Button size="extraSmall" variant="secondary" onClick={() => {}}>
          Flag
        </Button>
      </Stack>
    </Stack>
  );
};

export default TicketHeader;
