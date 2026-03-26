import React, { useState, useCallback, useEffect } from 'react';
import DateTimeInput from '../components/DateTimeInput.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Button } from '@mui/material';
import { useAppContext } from '../contexts/AppContext.jsx';
import { useGroupSearch } from '../contexts/GroupSearchContext.jsx';
import { Box, Stack, Typography, TextField, MenuItem, Checkbox, FormControlLabel } from '@mui/material';

const fieldLabelSx = {
  fontSize: '11px',
  fontWeight: 400,
  color: 'text.primary',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  lineHeight: '14px',
};

const fieldLabelRequiredSx = { ...fieldLabelSx, color: '#D52B1E' };

const textInputSx = { width: '100%', minWidth: 0 };
const selectSx = { width: '100%', minWidth: 0 };

const formGrid4Sx = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr',
  gap: '16px 12px',
  p: '8px',
  alignItems: 'start',
};

const FieldRow = ({ label, children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
    <Box component="span" sx={fieldLabelSx}>{label}</Box>
    {children}
  </Box>
);

const CheckboxCol = ({ id, checked, onChange, label }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
    <Box sx={{ height: '14px' }} />
    <FormControlLabel
      control={<Checkbox id={id} checked={checked} onChange={onChange} size="small" sx={{ p: 0, mr: '4px' }} />}
      label={label}
      sx={{ m: 0, alignItems: 'center', '& .MuiFormControlLabel-label': { fontSize: '12px' } }}
    />
  </Box>
);

const EventSummary = ({ trNum, sessionUniqueKey }) => {
  const { showAlert } = useAppContext();
  const { setGroupFieldsUpdated } = useGroupSearch();

  const [isLoading, setIsLoading] = useState(false);

  const [eventLocation, setEventLocation] = useState('');
  const [unplannedOutage, setUnplannedOutage] = useState(false);
  const [outageBridge, setOutageBridge] = useState('');
  const [oasisFlashId, setOasisFlashId] = useState('');
  const [flashEndDT, setFlashEndDT] = useState('');
  const [iptvProvisionedFlag, setIptvProvisionedFlag] = useState(false);
  const [outageSystemCalendar, setOutageSystemCalendar] = useState(false);

  const [custImpact, setCustImpact] = useState('');
  const [eventLocCode, setEventLocCode] = useState('');
  const [eventTypeCode, setEventTypeCode] = useState('');
  const [networkElement, setNetworkElement] = useState('');
  const [significanceCode, setSignificanceCode] = useState('');
  const [eventRecognizedUser, setEventRecognizedUser] = useState('');
  const [eventServiceCategory, setEventServiceCategory] = useState('');
  const [eventServiceAffected, setEventServiceAffected] = useState('');
  const [systemComponent, setSystemComponent] = useState('');
  const [fixedOwner, setFixedOwner] = useState('');
  const [workType, setWorkType] = useState('');
  const [responsibleOrg, setResponsibleOrg] = useState('');
  const [initiative, setInitiative] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [activityType, setActivityType] = useState('');
  const [activityStatus, setActivityStatus] = useState('');
  const [closureElement, setClosureElement] = useState('');
  const [closureComponent, setClosureComponent] = useState('');

  const [optionSets, setOptionSets] = useState({
    custImpact: [], eventLocCode: [], eventTypeCode: [], networkElement: [], significanceCode: [],
    eventRecognizedUser: [], eventServiceCategory: [], eventServiceAffected: [], systemComponent: [],
    fixedOwner: [], workType: [], responsibleOrg: [], initiative: [], equipmentType: [],
    activityType: [], activityStatus: [], closureElement: [], closureComponent: [],
  });

  const triggerFieldChanged = useCallback(() => {
    setGroupFieldsUpdated(true);
  }, [setGroupFieldsUpdated]);

  const renderSelect = useCallback((id, value, setter, optionsKey) => (
    <TextField
      select
      size="small"
      variant="outlined"
      id={id}
      value={value}
      onChange={(e) => { setter(e.target.value); triggerFieldChanged(); }}
      sx={selectSx}
    >
      <MenuItem value=""></MenuItem>
      {optionSets[optionsKey]?.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
      ))}
    </TextField>
  ), [optionSets, triggerFieldChanged]);

  const renderField = useCallback((label, id, value, setter, optionsKey, required = false) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
      <Typography component="span" sx={required ? fieldLabelRequiredSx : fieldLabelSx}>{label}</Typography>
      {renderSelect(id, value, setter, optionsKey)}
    </Box>
  ), [renderSelect]);

  return (
    <Box id="eventSummaryDiv" sx={{ fontSize: 12, lineHeight: '14px', color: 'text.primary', p: '5px' }}>
      {isLoading && <LoadingSpinner />}

      <SectionHeader title="Event Summary">
        <Box sx={formGrid4Sx}>
          <FieldRow label="Event Location">
            <TextField size="small" id="eventLocation" value={eventLocation} onChange={(e) => { setEventLocation(e.target.value); triggerFieldChanged(); }} sx={textInputSx} />
          </FieldRow>
          <CheckboxCol id="unplannedOutage" checked={unplannedOutage} onChange={(e) => { setUnplannedOutage(e.target.checked); triggerFieldChanged(); }} label="Unplanned Outage" />
          <FieldRow label="Outage Bridge">
            <TextField size="small" id="outageBridge" value={outageBridge} onChange={(e) => { setOutageBridge(e.target.value); triggerFieldChanged(); }} sx={textInputSx} />
          </FieldRow>
          {renderField('Customer Impact', 'custImpact', custImpact, setCustImpact, 'custImpact')}

          {renderField('Event Location Code', 'eventLocCode', eventLocCode, setEventLocCode, 'eventLocCode')}
          {renderField('Event Type Code', 'eventTypeCode', eventTypeCode, setEventTypeCode, 'eventTypeCode')}
          {renderField('Network Element', 'networkElement', networkElement, setNetworkElement, 'networkElement')}
          {renderField('Significance Code', 'significanceCode', significanceCode, setSignificanceCode, 'significanceCode')}

          {renderField('Event Recognized User', 'eventRecognizedUser', eventRecognizedUser, setEventRecognizedUser, 'eventRecognizedUser')}
          {renderField('Event Service Category', 'eventServiceCategory', eventServiceCategory, setEventServiceCategory, 'eventServiceCategory')}
          {renderField('Event Service Affected', 'eventServiceAffected', eventServiceAffected, setEventServiceAffected, 'eventServiceAffected')}
          {renderField('System Component', 'systemComponent', systemComponent, setSystemComponent, 'systemComponent')}

          {renderField('Fixed Owner', 'fixedOwner', fixedOwner, setFixedOwner, 'fixedOwner')}
          {renderField('Work Type', 'workType', workType, setWorkType, 'workType')}
          {renderField('Responsible Org', 'responsibleOrg', responsibleOrg, setResponsibleOrg, 'responsibleOrg')}
          {renderField('Initiative', 'initiative', initiative, setInitiative, 'initiative')}

          {renderField('Equipment Type', 'equipmentType', equipmentType, setEquipmentType, 'equipmentType')}
          {renderField('Activity Type', 'activityType', activityType, setActivityType, 'activityType')}
          {renderField('Activity Status', 'activityStatus', activityStatus, setActivityStatus, 'activityStatus')}
          {renderField('Closure Element', 'closureElement', closureElement, setClosureElement, 'closureElement')}

          {renderField('Closure Component', 'closureComponent', closureComponent, setClosureComponent, 'closureComponent')}
        </Box>
      </SectionHeader>

      <SectionHeader title="OASIS Flash Information">
        <Box sx={formGrid4Sx}>
          <FieldRow label="OASIS Flash ID">
            <TextField size="small" id="oasisFalshId" value={oasisFlashId} onChange={(e) => { setOasisFlashId(e.target.value); triggerFieldChanged(); }} sx={textInputSx} inputProps={{ maxLength: 13 }} />
          </FieldRow>
          <FieldRow label="Flash End Date/Time">
            <DateTimeInput id="flashEndDT" value={flashEndDT} onChange={(val) => { setFlashEndDT(val); triggerFieldChanged(); }} showCalendarIcon />
          </FieldRow>
          <CheckboxCol id="outageSystemCalendar" checked={outageSystemCalendar} onChange={(e) => { setOutageSystemCalendar(e.target.checked); triggerFieldChanged(); }} label="Outage System Calendar" />
          <CheckboxCol id="iptvProvisionedFlag" checked={iptvProvisionedFlag} onChange={(e) => { setIptvProvisionedFlag(e.target.checked); triggerFieldChanged(); }} label="IPTV Provisioned" />
        </Box>
      </SectionHeader>

      <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ gap: '8px', p: '10px', mt: '4px', borderTop: '1px solid', borderColor: 'divider' }}>
        <Button size="small" variant="contained" onClick={() => { setIsLoading(true); setTimeout(() => { showAlert('Event Summary data saved successfully.'); setIsLoading(false); setGroupFieldsUpdated(false); }, 500); }}>
          ✏ Submit
        </Button>
        <Button size="small" variant="outlined" onClick={() => showAlert('Event Summary cancelled.')}>
          ✕ Cancel
        </Button>
      </Stack>
    </Box>
  );
};

export default EventSummary;
