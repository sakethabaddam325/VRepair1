import React, { useState, useEffect, useCallback } from 'react';
import Collapsible from '../../molecules/Collapsible/Collapsible.tsx';
import Status from '../../atoms/Status/Status.tsx';
import Badge from '../../atoms/Badge/Badge.tsx';
import { Box, Stack, Typography, List, ListItem, IconButton } from '@mui/material';

const LINE_STATUS_VARIANT_MAP = {
  'In Service': 'success',
  'Impaired': 'warning',
  'Out of Service': 'error',
};

const TICKET_STATUS_VARIANT_MAP = {
  'Open': 'warning',
  'Closed': 'success',
  'In Progress': 'info',
  'Pending': 'warning',
  'Resolved': 'success',
};

const MOCK_DATA = {
  account: {
    customerName: 'John M. Richardson',
    accountNumber: '8472-5519-003',
    productType: 'DSL',
    serviceAddress: '1247 Oakwood Dr, Apt 3B, Nashville, TN 37203',
  },
  lineRecord: {
    lineStatus: 'In Service',
    circuitId: 'DHEC/832441/TN/NSHL',
    equipmentType: 'ADSL2+ DSLAM Port 7',
    lastTestDate: '2026-03-17 14:32 CST',
  },
  priorTickets: [
    { trNum: 'TR-884210', status: 'Closed', date: '2026-03-10', description: 'Intermittent sync loss on DSL line' },
    { trNum: 'TR-871003', status: 'Closed', date: '2026-02-22', description: 'No dial tone reported by customer' },
    { trNum: 'TR-865499', status: 'Resolved', date: '2026-02-08', description: 'Slow speeds below provisioned rate' },
    { trNum: 'TR-851220', status: 'Closed', date: '2026-01-15', description: 'Static on voice line during rain' },
    { trNum: 'TR-840017', status: 'Closed', date: '2025-12-29', description: 'CPE reboot resolved connectivity issue' },
  ],
  contact: {
    primary: { name: 'John Richardson', phone: '(615) 555-0142', email: 'j.richardson@email.com' },
    secondary: { name: 'Maria Richardson', phone: '(615) 555-0198', email: null },
  },
  serviceDetails: {
    serviceType: 'Residential DSL',
    serviceClass: 'Class A - Standard',
    rate: '25 Mbps / 3 Mbps',
    maintenanceCenter: 'Nashville Central CO',
  },
};

const labelSx = {
  fontSize: 12,
  fontWeight: 600,
  color: 'text.secondary',
  minWidth: 100,
  flexShrink: 0,
};

const valueSx = {
  fontSize: 14,
  color: 'text.primary',
  wordBreak: 'break-word',
};

const valueBoldSx = {
  fontSize: 14,
  fontWeight: 700,
  color: 'text.primary',
};

const rowSx = {
  direction: 'row',
  alignItems: 'flex-start',
  gap: '8px',
  mb: '8px',
  '&:last-child': { mb: 0 },
};

export const CustomerContextPanel = ({ trNum }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openSections, setOpenSections] = useState({
    account: true,
    lineRecord: true,
    priorTickets: true,
    contact: true,
    serviceDetails: true,
  });

  const toggleSection = useCallback((section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const allOpen = Object.values(openSections).every(Boolean);

  const toggleAll = useCallback(() => {
    const newState = !allOpen;
    setOpenSections({
      account: newState,
      lineRecord: newState,
      priorTickets: newState,
      contact: newState,
      serviceDetails: newState,
    });
  }, [allOpen]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/controller/CustomerContextController', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'GET_CONTEXT', trNum }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setData(MOCK_DATA);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [trNum]);

  // All hooks declared above — conditional returns are safe below
  if (loading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ p: '24px', fontSize: 14, color: 'text.secondary' }}
      >
        Loading customer context...
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ p: '24px', fontSize: 14, color: 'error.main' }}
      >
        {error}
      </Stack>
    );
  }

  if (!data) return null;

  const { account, lineRecord, priorTickets, contact, serviceDetails } = data;

  return (
    <Stack direction="column" sx={{ height: '100%', overflowY: 'auto', bgcolor: 'background.paper' }}>
      {/* Rail Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 1,
          py: '6px',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          position: 'sticky',
          top: 0,
          zIndex: 5,
        }}
      >
        <Typography
          component="span"
          sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          Customer Context
        </Typography>
        <IconButton
          onClick={toggleAll}
          title={allOpen ? 'Collapse All' : 'Expand All'}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            p: 0,
            bgcolor: 'background.default',
            color: 'grey.500',
            transition: 'background 0.15s, color 0.15s',
            '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
          }}
        >
          {allOpen ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5h8M3 9h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5h8M3 9h8M7 3v4M7 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          )}
        </IconButton>
      </Stack>

      {/* Section 1: Account Summary */}
      <Collapsible level={2} title="Account Summary" isOpen={openSections.account} onToggle={() => toggleSection('account')}>
        <Box sx={{ p: '12px' }}>
          <Stack {...rowSx}><Typography component="span" sx={labelSx}>Customer</Typography><Typography component="span" sx={valueBoldSx}>{account.customerName}</Typography></Stack>
          <Stack {...rowSx}><Typography component="span" sx={labelSx}>Account #</Typography><Typography component="span" sx={valueSx}>{account.accountNumber}</Typography></Stack>
          <Stack {...rowSx}><Typography component="span" sx={labelSx}>Product</Typography><Badge variant="info">{account.productType}</Badge></Stack>
          <Stack {...rowSx}><Typography component="span" sx={labelSx}>Address</Typography><Typography component="span" sx={valueSx}>{account.serviceAddress}</Typography></Stack>
        </Box>
      </Collapsible>

      {/* Section 2: Line Record */}
      <Collapsible level={2} title="Line Record" isOpen={openSections.lineRecord} onToggle={() => toggleSection('lineRecord')}>
        <Box sx={{ p: '12px' }}>
          <Stack direction="row" alignItems="center" sx={{ gap: '8px', mb: '8px' }}>
            <Typography component="span" sx={labelSx}>Status</Typography>
            <Status variant={LINE_STATUS_VARIANT_MAP[lineRecord.lineStatus] || 'default'}>{lineRecord.lineStatus}</Status>
          </Stack>
          <Stack {...rowSx}><Typography component="span" sx={labelSx}>Circuit ID</Typography><Typography component="span" sx={valueSx}>{lineRecord.circuitId}</Typography></Stack>
          <Stack {...rowSx}><Typography component="span" sx={labelSx}>Equipment</Typography><Typography component="span" sx={valueSx}>{lineRecord.equipmentType}</Typography></Stack>
          <Stack {...rowSx}><Typography component="span" sx={labelSx}>Last Test</Typography><Typography component="span" sx={valueSx}>{lineRecord.lastTestDate}</Typography></Stack>
        </Box>
      </Collapsible>

      {/* Section 3: Prior Tickets */}
      <Collapsible level={2} title="Prior Tickets (Last 5)" isOpen={openSections.priorTickets} onToggle={() => toggleSection('priorTickets')}>
        <Box sx={{ p: '12px' }}>
          <List disablePadding>
            {priorTickets.map((ticket) => (
              <ListItem
                key={ticket.trNum}
                onClick={() => {}}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: '8px',
                  px: 0,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  '&:hover': { bgcolor: 'action.hover' },
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Stack direction="column" sx={{ gap: '4px' }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>{ticket.trNum}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{ticket.description}</Typography>
                </Stack>
                <Stack direction="column" alignItems="flex-end" sx={{ gap: '4px' }}>
                  <Badge variant={TICKET_STATUS_VARIANT_MAP[ticket.status] || 'default'}>{ticket.status}</Badge>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{ticket.date}</Typography>
                </Stack>
              </ListItem>
            ))}
          </List>
        </Box>
      </Collapsible>

      {/* Section 4: Contact Information */}
      <Collapsible level={2} title="Contact Information" isOpen={openSections.contact} onToggle={() => toggleSection('contact')}>
        <Box sx={{ p: '12px' }}>
          <Box sx={{ mb: '12px' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', mb: '8px' }}>
              Primary Contact
            </Typography>
            <Stack {...rowSx}><Typography component="span" sx={labelSx}>Name</Typography><Typography component="span" sx={valueSx}>{contact.primary.name}</Typography></Stack>
            <Stack {...rowSx}><Typography component="span" sx={labelSx}>Phone</Typography><Typography component="span" sx={valueSx}>{contact.primary.phone}</Typography></Stack>
            <Stack {...rowSx}><Typography component="span" sx={labelSx}>Email</Typography><Typography component="span" sx={valueSx}>{contact.primary.email}</Typography></Stack>
          </Box>
          {contact.secondary && (
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', mb: '8px' }}>
                Secondary Contact
              </Typography>
              <Stack {...rowSx}><Typography component="span" sx={labelSx}>Name</Typography><Typography component="span" sx={valueSx}>{contact.secondary.name}</Typography></Stack>
              <Stack {...rowSx}><Typography component="span" sx={labelSx}>Phone</Typography><Typography component="span" sx={valueSx}>{contact.secondary.phone}</Typography></Stack>
              {contact.secondary.email && (
                <Stack {...rowSx}><Typography component="span" sx={labelSx}>Email</Typography><Typography component="span" sx={valueSx}>{contact.secondary.email}</Typography></Stack>
              )}
            </Box>
          )}
        </Box>
      </Collapsible>

      {/* Section 5: Service Details */}
      <Collapsible level={2} title="Service Details" isOpen={openSections.serviceDetails} onToggle={() => toggleSection('serviceDetails')}>
        <Box sx={{ p: '12px' }}>
          <Stack {...rowSx}><Typography component="span" sx={labelSx}>Service Type</Typography><Typography component="span" sx={valueSx}>{serviceDetails.serviceType}</Typography></Stack>
          <Stack {...rowSx}><Typography component="span" sx={labelSx}>Class</Typography><Typography component="span" sx={valueSx}>{serviceDetails.serviceClass}</Typography></Stack>
          <Stack {...rowSx}><Typography component="span" sx={labelSx}>Rate</Typography><Typography component="span" sx={valueSx}>{serviceDetails.rate}</Typography></Stack>
          <Stack {...rowSx}><Typography component="span" sx={labelSx}>Maint. Center</Typography><Typography component="span" sx={valueSx}>{serviceDetails.maintenanceCenter}</Typography></Stack>
        </Box>
      </Collapsible>
    </Stack>
  );
};

export default CustomerContextPanel;
