import React, { useState, useEffect, useCallback } from 'react';
import DateTimeInput from '../components/DateTimeInput.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import DataGrid from '../components/DataGrid.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Button } from '@mui/material';
import { useAppContext } from '../contexts/AppContext.jsx';
import { getTier2Data, submitTier2, searchClientInfo, voidTier2ActionLog, loadVendorData, searchVendorByDDM, loadPlatforms, loadEquipment, loadEquipmentId, reloadCauseCode } from '../api/tier2Api.js';
import { Box, Stack, Typography, TextField, MenuItem, Link } from '@mui/material';

const fieldLabelSx = {
  fontSize: 11,
  fontWeight: 400,
  whiteSpace: 'nowrap',
  color: 'text.primary',
  userSelect: 'none',
  lineHeight: '14px',
};

const requiredLabelSx = {
  ...fieldLabelSx,
  color: '#D52B1E',
};

const readOnlyLabelSx = {
  ...fieldLabelSx,
  color: '#9E9E9E',
};

const sectionHeaderSx = {
  fontSize: 12,
  fontWeight: 700,
  color: 'primary.main',
  py: '4px',
  pb: '2px',
  borderBottom: '1px solid',
  borderColor: 'divider',
  mt: '8px',
  mb: '4px',
};

const formGrid4Sx = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr',
  gap: '16px 12px',
  p: '8px',
  alignItems: 'start',
};

const fullWidthSx = { gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '2px' };

const FieldRow = ({ label, required, readOnly = false, children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
    <Box component="span" sx={required ? requiredLabelSx : readOnly ? readOnlyLabelSx : fieldLabelSx}>
      {label}{required && <Box component="span" sx={{ color: '#D52B1E', ml: '2px' }}>*</Box>}
    </Box>
    {children}
  </Box>
);

const Tier2 = ({ trNum, sessionUniqueKey, sourceLink = 'GTRM', maintCenter = '' }) => {
  const { showAlert } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const [reportedDTT2, setReportedDTT2] = useState('');
  const [ddmStatusT2, setDdmStatusT2] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [txtTroubleDescT2, setTxtTroubleDescT2] = useState('');

  const [txtClientIDT2, setTxtClientIDT2] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [txtClientAltPhoneT2, setTxtClientAltPhoneT2] = useState('');
  const [txtClientTktT2, setTxtClientTktT2] = useState('');
  const [ddmClientMOCT2, setDdmClientMOCT2] = useState('');
  const [modeOfContactOptions, setModeOfContactOptions] = useState([]);
  const [ddmClientOrgT2, setDdmClientOrgT2] = useState('');
  const [clientOrgOptions, setClientOrgOptions] = useState([]);

  const [ddmWRStatusT2, setDdmWRStatusT2] = useState('');
  const [wrStatusOptions, setWrStatusOptions] = useState([]);
  const [ddmRequestTypeT2, setDdmRequestTypeT2] = useState('');
  const [requestTypeOptions, setRequestTypeOptions] = useState([]);
  const [reportedDTWRT2, setReportedDTWRT2] = useState('');
  const [ddmRegionT2, setDdmRegionT2] = useState('');
  const [regionOptions, setRegionOptions] = useState([]);
  const [nodeTxt4EquipNcc, setNodeTxt4EquipNcc] = useState('');

  const [ddmPlatformT2, setDdmPlatformT2] = useState('');
  const [platformOptions, setPlatformOptions] = useState([]);
  const [ddmEquipmentT2, setDdmEquipmentT2] = useState('');
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [ddmEquipmentIdT2, setDdmEquipmentIdT2] = useState('');
  const [equipmentIdOptions, setEquipmentIdOptions] = useState([]);
  const [txtCktT2, setTxtCktT2] = useState('');

  const [txtDescriptionT2, setTxtDescriptionT2] = useState('');
  const [txtHoursT2, setTxtHoursT2] = useState('');
  const [txtMinutesT2, setTxtMinutesT2] = useState('');
  const [txtWorkDurationT2, setTxtWorkDurationT2] = useState('');
  const [actionLogRows, setActionLogRows] = useState([]);

  const [vendorTicket, setVendorTicket] = useState('');
  const [vendorDDM, setVendorDDM] = useState('');
  const [vendorOptions, setVendorOptions] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorContPh, setVendorContPh] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorWaitingOn, setVendorWaitingOn] = useState('');
  const [vendorScope, setVendorScope] = useState('');
  const [vendorWaitingOnOptions, setVendorWaitingOnOptions] = useState([]);
  const [vendorScopeOptions, setVendorScopeOptions] = useState([]);

  const [ddmCauseCodeT2, setDdmCauseCodeT2] = useState('');
  const [causeCodeOptions, setCauseCodeOptions] = useState([]);
  const [ddmSubCauseCodeT2, setDdmSubCauseCodeT2] = useState('');
  const [subCauseCodeOptions, setSubCauseCodeOptions] = useState([]);
  const [ddmRFAComplexityT2, setDdmRFAComplexityT2] = useState('');
  const [complexityOptions, setComplexityOptions] = useState([]);
  const [txtTroubleResolutionT2, setTxtTroubleResolutionT2] = useState('');

  const [showActionLog, setShowActionLog] = useState(false);
  const [tier2Template, setTier2Template] = useState('RFA');

  useEffect(() => {
    initializeTier2();
  }, []);

  const initializeTier2 = useCallback(async () => {
    setIsLoading(true);
    try {
      const action = sourceLink === 'GTRE' ? 'getCacheData' : 'retrieve';
      const response = await getTier2Data({ action, trNum, maintCenter, sessionUniqueKey });
      if (response.data) {
        const d = response.data;
        setStatusOptions(d.statusOptions || []);
        setModeOfContactOptions(d.modeOfContactOptions || []);
        setClientOrgOptions(d.clientOrgOptions || []);
        setWrStatusOptions(d.wrStatusOptions || []);
        setRequestTypeOptions(d.requestTypeOptions || []);
        setRegionOptions(d.regionOptions || []);
        setCauseCodeOptions(d.causeCodeOptions || []);
        setSubCauseCodeOptions(d.subCauseCodeOptions || []);
        setComplexityOptions(d.complexityOptions || []);
        setActionLogRows(d.actionLog || []);
        setTier2Template(d.tier2Template || 'RFA');
        if (d.details) {
          setDdmStatusT2(d.details.status || '');
          setTxtTroubleDescT2(d.details.troubleDesc || '');
          setReportedDTT2(d.details.reportedDT || '');
          setTxtClientIDT2(d.details.clientId || '');
          setClientName(d.details.clientName || '');
          setClientPhone(d.details.clientPhone || '');
          setClientEmail(d.details.clientEmail || '');
          setDdmClientMOCT2(d.details.contactMethod || '');
          setDdmClientOrgT2(d.details.clientOrg || '');
          setTxtClientTktT2(d.details.clientTicket || '');
          setTxtClientAltPhoneT2(d.details.altPhone || '');
          setDdmCauseCodeT2(d.details.causeCode || '');
          setDdmSubCauseCodeT2(d.details.subCauseCode || '');
          setDdmRFAComplexityT2(d.details.rfaComplexity || '');
          setTxtTroubleResolutionT2(d.details.troubleResolution || '');
        }
        await initVendorSection();
        await loadPlatformOptions();
      }
    } catch {
      showAlert('Error loading Tier 2 data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [trNum, maintCenter, sessionUniqueKey, sourceLink, showAlert]);

  const initVendorSection = useCallback(async () => {
    try {
      const response = await loadVendorData({ sessionUniqueKey });
      if (response.data) {
        setVendorOptions(response.data.vendorDDMData || []);
        setVendorWaitingOnOptions(response.data.wOnDDMData || []);
        setVendorScopeOptions(response.data.scopeDDMData || []);
      }
    } catch {}
  }, [sessionUniqueKey]);

  const loadPlatformOptions = useCallback(async () => {
    try {
      const response = await loadPlatforms({ sessionUniqueKey, centerId: maintCenter });
      if (response.data?.platforms) setPlatformOptions(response.data.platforms);
    } catch {}
  }, [sessionUniqueKey, maintCenter]);

  const handlePlatformChange = useCallback(async (platformVal) => {
    setDdmPlatformT2(platformVal);
    setDdmEquipmentT2('');
    setEquipmentOptions([]);
    setDdmEquipmentIdT2('');
    setEquipmentIdOptions([]);
    try {
      const response = await loadEquipment({ sessionUniqueKey, platformId: platformVal });
      setEquipmentOptions(response.data?.equipment || []);
    } catch {}
  }, [sessionUniqueKey]);

  const handleEquipmentChange = useCallback(async (equipVal) => {
    setDdmEquipmentT2(equipVal);
    setDdmEquipmentIdT2('');
    setEquipmentIdOptions([]);
    try {
      const response = await loadEquipmentId({ sessionUniqueKey, equipmentId: equipVal });
      setEquipmentIdOptions(response.data?.equipmentIds || []);
    } catch {}
  }, [sessionUniqueKey]);

  const handleCauseCodeChange = useCallback(async (causeCode) => {
    setDdmCauseCodeT2(causeCode);
    setDdmSubCauseCodeT2('');
    const filtered = (await reloadCauseCode({ sessionUniqueKey, center: maintCenter, causeCode }).catch(() => ({ data: null }))).data?.subCauseCodes || [];
    setSubCauseCodeOptions(filtered);
  }, [sessionUniqueKey, maintCenter]);

  const handleClientSearch = useCallback(async () => {
    if (!txtClientIDT2.trim()) { showAlert('Please enter a Client ID to search.'); return; }
    setIsLoading(true);
    try {
      const response = await searchClientInfo({ sessionUniqueKey, clientId: txtClientIDT2 });
      if (response.data?.recordCount === '0') {
        showAlert('No client information found for the provided ID.');
      } else if (response.data) {
        setClientName(response.data.clientName || '');
        setClientPhone(response.data.clientPhone || '');
        setClientEmail(response.data.clientEmail || '');
        setTxtClientAltPhoneT2(response.data.altPhone || '');
      }
    } catch {
      showAlert('Error searching client information.');
    } finally {
      setIsLoading(false);
    }
  }, [txtClientIDT2, sessionUniqueKey, showAlert]);

  const handleVoidActionLog = useCallback(async (actionId) => {
    if (!window.confirm('Are you sure you want to void this action log entry?')) return;
    setIsLoading(true);
    try {
      await voidTier2ActionLog({ sessionUniqueKey, actionId });
      showAlert('Action log entry voided successfully.');
      initializeTier2();
    } catch {
      showAlert('Error voiding action log entry.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionUniqueKey, showAlert, initializeTier2]);

  const validateSubmit = useCallback(() => {
    const missing = [];
    if (!ddmStatusT2) missing.push('Status');
    if (!txtTroubleDescT2.trim()) missing.push('Trouble Description');
    if (txtDescriptionT2 && (!txtHoursT2 || !txtMinutesT2)) missing.push('Hours/Minutes (required when Description entered)');
    if (txtMinutesT2 && parseInt(txtMinutesT2, 10) > 59) { showAlert('Minutes cannot exceed 59.'); return false; }
    if (missing.length > 0) { showAlert(`Please fill in all required fields: ${missing.join(', ')}`); return false; }
    return true;
  }, [ddmStatusT2, txtTroubleDescT2, txtDescriptionT2, txtHoursT2, txtMinutesT2, showAlert]);

  const handleSubmitTier2 = useCallback(async () => {
    if (!validateSubmit()) return;
    setIsLoading(true);
    try {
      await submitTier2({
        sessionUniqueKey, trNum, status: ddmStatusT2, troubleDesc: txtTroubleDescT2, reportedDT: reportedDTT2,
        clientId: txtClientIDT2, clientName, clientPhone, clientEmail, altPhone: txtClientAltPhoneT2,
        clientTicket: txtClientTktT2, contactMethod: ddmClientMOCT2, clientOrg: ddmClientOrgT2,
        platform: ddmPlatformT2, equipment: ddmEquipmentT2, equipmentId: ddmEquipmentIdT2,
        circuitId: txtCktT2, description: txtDescriptionT2, hours: txtHoursT2, minutes: txtMinutesT2,
        causeCode: ddmCauseCodeT2, subCauseCode: ddmSubCauseCodeT2, rfaComplexity: ddmRFAComplexityT2,
        troubleResolution: txtTroubleResolutionT2, vendorTicket, vendorId: vendorDDM, vendorName,
        vendorContPh, vendorEmail, vendorWaitingOn, vendorScope, requestType: ddmRequestTypeT2,
        reportedDTWR: reportedDTWRT2, region: ddmRegionT2, wrNode: nodeTxt4EquipNcc,
      });
      showAlert('Tier 2 data submitted successfully.');
      setTxtDescriptionT2('');
      setTxtHoursT2('');
      setTxtMinutesT2('');
      initializeTier2();
    } catch {
      showAlert('Error submitting Tier 2 data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [validateSubmit, sessionUniqueKey, trNum, ddmStatusT2, txtTroubleDescT2, reportedDTT2,
      txtClientIDT2, clientName, clientPhone, clientEmail, txtClientAltPhoneT2, txtClientTktT2,
      ddmClientMOCT2, ddmClientOrgT2, ddmPlatformT2, ddmEquipmentT2, ddmEquipmentIdT2, txtCktT2,
      txtDescriptionT2, txtHoursT2, txtMinutesT2, ddmCauseCodeT2, ddmSubCauseCodeT2, ddmRFAComplexityT2,
      txtTroubleResolutionT2, vendorTicket, vendorDDM, vendorName, vendorContPh, vendorEmail,
      vendorWaitingOn, vendorScope, ddmRequestTypeT2, reportedDTWRT2, ddmRegionT2, nodeTxt4EquipNcc,
      showAlert, initializeTier2]);

  const actionLogColumns = [
    { field: 'date', label: 'Date', width: 120 },
    { field: 'userId', label: 'User ID', width: 80 },
    { field: 'hours', label: 'Hours', width: 50 },
    { field: 'minutes', label: 'Min', width: 50 },
    { field: 'description', label: 'Description', width: 500, wrap: true },
  ];

  const renderSelect = (id, value, onChange, options) => (
    <TextField select size="small" id={id} value={value} onChange={onChange} sx={{ width: '100%', minWidth: 0 }}>
      <MenuItem value=""></MenuItem>
      {options.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
    </TextField>
  );

  return (
    <Box id="tier2Div" sx={{ fontSize: 12, lineHeight: '14px', p: '5px', color: 'text.primary' }}>
      {isLoading && <LoadingSpinner />}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>

        {/* ── RFA / Work Request Details ── */}
        <SectionHeader title={tier2Template === 'RFA' ? 'RFA Details' : 'Work Request Details'}>
          <Box sx={{ ...formGrid4Sx, alignItems: 'stretch' }}>
            <Box sx={{ gridColumn: '1', gridRow: '1', display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'flex-start' }}>
              <FieldRow label="Status" required>
                {renderSelect('ddmStatusT2', ddmStatusT2, (e) => setDdmStatusT2(e.target.value), statusOptions)}
              </FieldRow>
            </Box>
            <Box sx={{ gridColumn: '1', gridRow: '2', display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'flex-end' }}>
              <FieldRow label="Reported D/T">
                <DateTimeInput id="txtReportedDTT2" value={reportedDTT2} onChange={setReportedDTT2} showCalendarIcon />
              </FieldRow>
            </Box>
            <Box sx={{ gridColumn: '2 / span 3', gridRow: '1 / span 2', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Box component="span" sx={requiredLabelSx}>Trouble Description<Box component="span" sx={{ color: '#D52B1E', ml: '2px' }}>*</Box></Box>
              <TextField multiline id="txtTroubleDescT2" value={txtTroubleDescT2} onChange={(e) => setTxtTroubleDescT2(e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' }, '& textarea': { fontSize: 12 } }} />
            </Box>
          </Box>
        </SectionHeader>

        {/* ── Client Information ── */}
        <Box>
          <Box sx={{ ...sectionHeaderSx, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography component="span" sx={{ fontSize: 12, fontWeight: 700, color: 'primary.main' }}>Client Information</Typography>
            <Stack direction="row" sx={{ gap: '6px' }}>
              <Button id="btnCreateClientInfo" variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => window.open('#/client-info/add', '_blank', 'width=400,height=300')}>Create Client</Button>
              <Button id="btnEditClientInfo" variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => window.open('#/client-info/edit', '_blank', 'width=400,height=300')}>Edit Client</Button>
            </Stack>
          </Box>
          <Box sx={formGrid4Sx}>
            <FieldRow label="Client ID">
              <Stack direction="row" alignItems="center" sx={{ gap: '6px' }}>
                <TextField size="small" id="txtClientIDT2" value={txtClientIDT2} onChange={(e) => setTxtClientIDT2(e.target.value)} sx={{ flex: 1, minWidth: 0 }} />
                <Button id="btnClientID" variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={handleClientSearch}>Search</Button>
              </Stack>
            </FieldRow>
            <FieldRow label="Client Name">
              <TextField size="small" value={clientName} onChange={(e) => setClientName(e.target.value)} sx={{ width: '100%' }} />
            </FieldRow>
            <FieldRow label="Client Phone">
              <TextField size="small" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} sx={{ width: '100%' }} />
            </FieldRow>
            <FieldRow label="Alt Phone">
              <TextField size="small" id="txtClientAltPhoneT2" value={txtClientAltPhoneT2} onChange={(e) => setTxtClientAltPhoneT2(e.target.value)} sx={{ width: '100%' }} />
            </FieldRow>
            <FieldRow label="Client Email">
              <TextField size="small" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} sx={{ width: '100%' }} />
            </FieldRow>
            <FieldRow label="Client Ticket">
              <TextField size="small" id="txtClientTktT2" value={txtClientTktT2} onChange={(e) => setTxtClientTktT2(e.target.value.slice(0, 50))} sx={{ width: '100%' }} inputProps={{ maxLength: 50 }} />
            </FieldRow>
            <FieldRow label="Method of Contact" required>
              {renderSelect('ddmClientMOCT2', ddmClientMOCT2, (e) => setDdmClientMOCT2(e.target.value), modeOfContactOptions)}
            </FieldRow>
            <FieldRow label="Client Org">
              {renderSelect('ddmClientOrgT2', ddmClientOrgT2, (e) => setDdmClientOrgT2(e.target.value), clientOrgOptions)}
            </FieldRow>
          </Box>
        </Box>

        {/* ── WR Details ── */}
        <Box>
          <Typography component="div" sx={sectionHeaderSx}>WR Details</Typography>
          <Box id="WRTable" sx={formGrid4Sx}>
            <FieldRow label="WR Status" required>
              {renderSelect('ddmWRStatusT2', ddmWRStatusT2, (e) => setDdmWRStatusT2(e.target.value), wrStatusOptions)}
            </FieldRow>
            <FieldRow label="Request Type" required>
              {renderSelect('ddmRequestTypeT2', ddmRequestTypeT2, (e) => setDdmRequestTypeT2(e.target.value), requestTypeOptions)}
            </FieldRow>
            <FieldRow label="Reported D/T WR">
              <DateTimeInput id="txtReportedDTWRT2" value={reportedDTWRT2} onChange={setReportedDTWRT2} showCalendarIcon />
            </FieldRow>
            <FieldRow label="Region">
              {renderSelect('ddmRegionT2', ddmRegionT2, (e) => setDdmRegionT2(e.target.value), regionOptions)}
            </FieldRow>
            <FieldRow label="Node">
              <Stack direction="row" alignItems="center" sx={{ gap: '4px' }}>
                <TextField size="small" id="nodeTxt4EquipNcc" value={nodeTxt4EquipNcc} onChange={(e) => setNodeTxt4EquipNcc(e.target.value.slice(0, 20))} sx={{ flex: 1, minWidth: 0 }} inputProps={{ maxLength: 20 }} />
                <Link href="#" onClick={(e) => { e.preventDefault(); window.open('#/office-search', '_blank', 'width=1150,height=200'); }} sx={{ ml: '6px', cursor: 'pointer', color: 'text.primary', textDecoration: 'none', fontSize: 11, '&:hover': { textDecoration: 'underline' } }}>[Office Search]</Link>
              </Stack>
            </FieldRow>
          </Box>
        </Box>

        {/* ── Equipment ── */}
        <Box>
          <Typography component="div" id="equipSection" sx={sectionHeaderSx}>Equipment</Typography>
          <Box sx={formGrid4Sx}>
            <FieldRow label="Platform">
              {renderSelect('ddmPlatformT2', ddmPlatformT2, (e) => handlePlatformChange(e.target.value), platformOptions)}
            </FieldRow>
            <FieldRow label="Equipment">
              {renderSelect('ddmEquipmentT2', ddmEquipmentT2, (e) => handleEquipmentChange(e.target.value), equipmentOptions)}
            </FieldRow>
            <FieldRow label="Equipment ID">
              {renderSelect('ddmEquipmentIdT2', ddmEquipmentIdT2, (e) => setDdmEquipmentIdT2(e.target.value), equipmentIdOptions)}
            </FieldRow>
            <FieldRow label="Circuit ID">
              <TextField size="small" id="txtCktT2" value={txtCktT2} onChange={(e) => setTxtCktT2(e.target.value)} sx={{ width: '100%' }} />
            </FieldRow>
          </Box>
        </Box>

        {/* ── Action Log Entry ── */}
        <SectionHeader title="Action Log Entry">
          <Box sx={formGrid4Sx}>
            <FieldRow label="Hours">
              <TextField size="small" id="txtHoursT2" value={txtHoursT2} onChange={(e) => setTxtHoursT2(e.target.value.replace(/\D/g, '').slice(0, 2))} sx={{ width: '100%' }} inputProps={{ maxLength: 2 }} />
            </FieldRow>
            <FieldRow label="Minutes">
              <TextField size="small" id="txtMinutesT2" value={txtMinutesT2} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 2); setTxtMinutesT2(v); if (v && parseInt(v, 10) > 59) showAlert('Minutes cannot exceed 59.'); }} sx={{ width: '100%' }} inputProps={{ maxLength: 2 }} />
            </FieldRow>
            <FieldRow label="Work Duration" readOnly>
              <TextField size="small" id="txtWorkDurationT2" value={txtWorkDurationT2} disabled sx={{ width: '100%' }} />
            </FieldRow>
            <Box />
            <Box sx={fullWidthSx}>
              <Box component="span" sx={fieldLabelSx}>Description</Box>
              <TextField multiline minRows={3} id="txtDescriptionT2" value={txtDescriptionT2} onChange={(e) => setTxtDescriptionT2(e.target.value)} sx={{ width: '100%', '& textarea': { fontSize: 12 } }} />
            </Box>
          </Box>
          <Stack direction="row" alignItems="center" onClick={() => setShowActionLog((prev) => !prev)} sx={{ cursor: 'pointer', userSelect: 'none', gap: '6px', mt: '8px', mb: '5px' }}>
            <Box component="span">{showActionLog ? '\u25BC' : '\u25BA'}</Box>
            <Typography component="strong" sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary' }}>View Action Log</Typography>
          </Stack>
          {showActionLog && (
            <DataGrid columns={actionLogColumns} data={actionLogRows} height={200} alternateRows showToolbar showFooter onRightClickMenuItems={(row) => [{ label: 'Void Log', onClick: () => handleVoidActionLog(row.actionId) }]} />
          )}
        </SectionHeader>

        {/* ── Vendor Information ── */}
        <Box>
          <Box id="vendorInfoSection" sx={{ ...sectionHeaderSx, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography component="span" sx={{ fontSize: 12, fontWeight: 700, color: 'primary.main' }}>Vendor Information</Typography>
            <Stack direction="row" sx={{ gap: '6px' }}>
              <Button id="vendorInfoVendorIdCrInfoBtn" variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => window.open('#/vendor-info/create', '_blank')}>Create Vendor Info</Button>
              <Button id="vendorInfoVendorIdUptInfoBtn" variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => window.open('#/vendor-info/edit', '_blank')}>Edit Vendor Info</Button>
            </Stack>
          </Box>
          <Box sx={formGrid4Sx}>
            <FieldRow label="Vendor Ticket">
              <TextField size="small" id="vendorInfoTicketInput" value={vendorTicket} onChange={(e) => setVendorTicket(e.target.value.slice(0, 20))} sx={{ width: '100%' }} inputProps={{ maxLength: 20 }} />
            </FieldRow>
            <FieldRow label="Vendor">
              {renderSelect('vendorInfoVendorDDM', vendorDDM, (e) => setVendorDDM(e.target.value), vendorOptions)}
            </FieldRow>
            <FieldRow label="Vendor Name">
              <TextField size="small" value={vendorName} onChange={(e) => setVendorName(e.target.value)} sx={{ width: '100%' }} />
            </FieldRow>
            <FieldRow label="Contact Phone">
              <TextField size="small" value={vendorContPh} onChange={(e) => setVendorContPh(e.target.value)} sx={{ width: '100%' }} />
            </FieldRow>
            <FieldRow label="Vendor ID">
              <TextField size="small" value={vendorId} onChange={(e) => setVendorId(e.target.value)} sx={{ width: '100%' }} />
            </FieldRow>
            <FieldRow label="Email">
              <TextField size="small" value={vendorEmail} onChange={(e) => setVendorEmail(e.target.value)} sx={{ width: '100%' }} />
            </FieldRow>
            <FieldRow label="Waiting On">
              {renderSelect('vendorInfoVendorWaitingOnDDM', vendorWaitingOn, (e) => setVendorWaitingOn(e.target.value), vendorWaitingOnOptions)}
            </FieldRow>
            <FieldRow label="Scope">
              {renderSelect('vendorInfoVendorScopeDDM', vendorScope, (e) => setVendorScope(e.target.value), vendorScopeOptions)}
            </FieldRow>
          </Box>
        </Box>

        {/* ── Close-Out Details ── */}
        <SectionHeader title="Close-Out Details">
          <Box sx={formGrid4Sx}>
            <FieldRow label="Cause Code">
              {renderSelect('ddmCauseCodeT2', ddmCauseCodeT2, (e) => handleCauseCodeChange(e.target.value), causeCodeOptions)}
            </FieldRow>
            <FieldRow label="Sub Cause Code">
              {renderSelect('ddmSubCauseCodeT2', ddmSubCauseCodeT2, (e) => setDdmSubCauseCodeT2(e.target.value), subCauseCodeOptions)}
            </FieldRow>
            <FieldRow label="RFA Complexity">
              {renderSelect('ddmRFAComplexityT2', ddmRFAComplexityT2, (e) => setDdmRFAComplexityT2(e.target.value), complexityOptions)}
            </FieldRow>
            <Box />
            <Box sx={fullWidthSx}>
              <Box component="span" sx={fieldLabelSx}>Trouble Resolution</Box>
              <TextField multiline minRows={3} id="txtTroubleResolutionT2" value={txtTroubleResolutionT2} onChange={(e) => setTxtTroubleResolutionT2(e.target.value)} sx={{ width: '100%', '& textarea': { fontSize: 12 } }} />
            </Box>
          </Box>
        </SectionHeader>

        {/* ── Submit Bar ── */}
        <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ gap: '8px', py: '8px', borderTop: '1px solid', borderColor: 'divider', mt: '8px' }}>
          <Button id="btnSubmitT2" variant="contained" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={handleSubmitTier2}>Submit</Button>
        </Stack>

      </Box>
    </Box>
  );
};

export default Tier2;
