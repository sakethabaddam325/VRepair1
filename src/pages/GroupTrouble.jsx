import React, { useState, useEffect, useCallback, useRef } from 'react';
import DateTimeInput from '../components/DateTimeInput.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import Modal from '../components/Modal.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Button, Checkbox, TextField, MenuItem } from '@mui/material';
import { useAppContext } from '../contexts/AppContext.jsx';
import { useGroupSearch } from '../contexts/GroupSearchContext.jsx';
import { submitGroupTrouble } from '../api/groupTroubleApi.js';
import { formatServiceTN } from '../utils/dateUtils.js';
import { isValidDate, getCurrentDateTime } from '../utils/dateUtils.js';
import { isAsciiOnly } from '../utils/stringUtils.js';
import { isValidPhone, isValidOasisFlashId } from '../utils/validationUtils.js';
import EventSummary from './EventSummary.jsx';
import GroupCloseOut from './GroupCloseOut.jsx';
import { Box, Stack } from '@mui/material';

/* ── Shared sx presets (mapped from GroupTrouble.module.css) ── */
const fieldLabelSx = {
  fontSize: '11px',
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

const textInputSx = {
  width: '100%',
  minWidth: 0,
  '& .MuiOutlinedInput-root': {
    borderRadius: '3px',
    bgcolor: 'background.paper',
    '& .MuiOutlinedInput-input': {
      fontSize: '12px',
      lineHeight: '14px',
      py: '3px',
      px: '6px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'grey.400',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'grey.500',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
    },
    '&.Mui-disabled, &.Mui-disabled .MuiOutlinedInput-input': {
      bgcolor: 'grey.100',
      color: 'text.disabled',
      cursor: 'default',
    },
  },
};

const selectSx = {
  width: '100%',
  minWidth: 0,
  '& .MuiOutlinedInput-root': {
    borderRadius: '3px',
    bgcolor: 'background.paper',
    '& .MuiSelect-select': {
      fontSize: '12px',
      lineHeight: '14px',
      py: '3px',
      px: '6px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'grey.400',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'grey.500',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
    },
  },
};

const selectRequiredSx = {
  ...selectSx,
  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
    borderColor: '#D52B1E',
  },
};

const oasisLinkSx = { color: 'info.main', cursor: 'pointer', textDecoration: 'underline', mr: '4px', fontSize: 12 };
const oasisLinkDisabledSx = { color: 'text.disabled', cursor: 'default', textDecoration: 'none', mr: '4px', fontSize: 12 };

const modalFooterSx = { display: 'flex', justifyContent: 'flex-end', pt: '4px' };

/** Select options when backend returns a code (e.g. OTHER) but no full dropdown list — one MenuItem = selected value. */
const optionsForCode = (code) => {
  const v = code == null || code === '' ? '' : String(code);
  return v ? [{ value: v, label: v }] : [{ value: '', label: '' }];
};

const normalizeSelectOption = (opt) => {
  if (opt != null && typeof opt === 'object' && ('value' in opt || 'label' in opt)) {
    const v = opt.value != null ? String(opt.value) : String(opt.label ?? '');
    const l = opt.label != null ? String(opt.label) : v;
    return { value: v, label: l };
  }
  const s = String(opt ?? '');
  return { value: s, label: s };
};

/** Exception Code: use server LOV when present; ensure current value has a MenuItem; else single-option list. */
const buildExceptionCodeOptions = (vo, excCode) => {
  const raw = vo.exceptionCodeOptions;
  if (Array.isArray(raw) && raw.length > 0) {
    const opts = raw.map(normalizeSelectOption);
    if (excCode && !opts.some((o) => o.value === excCode)) {
      opts.push({ value: excCode, label: excCode });
    }
    return opts;
  }
  return optionsForCode(excCode);
};

const buildWscOptionsList = (vo, wscVal) => {
  const raw = vo.wscOptions;
  if (Array.isArray(raw) && raw.length > 0) {
    const opts = raw.map(normalizeSelectOption);
    if (wscVal && !opts.some((o) => o.value === wscVal)) {
      opts.push({ value: wscVal, label: wscVal });
    }
    return opts;
  }
  return wscVal ? [{ value: wscVal, label: wscVal }] : [];
};

const buildSeverityOptionsList = (vo, sev) => {
  const raw = vo.severityOptions;
  if (Array.isArray(raw) && raw.length > 0) {
    const opts = raw.map(normalizeSelectOption);
    if (sev && !opts.some((o) => o.value === sev)) {
      opts.push({ value: sev, label: sev });
    }
    return opts;
  }
  return sev ? [{ value: sev, label: sev }] : [];
};

const buildOutageCatOptions = (vo, code) => {
  const raw = vo.outageCatOptions;
  if (Array.isArray(raw) && raw.length > 0) {
    const opts = raw.map(normalizeSelectOption);
    if (code && !opts.some((o) => o.value === code)) {
      opts.push({ value: code, label: code });
    }
    return opts;
  }
  return optionsForCode(code);
};

/* ── Subcomponent: form grid field pair ── */
const FieldRow = ({ label, required = false, readOnly = false, children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
    <Box component="label" sx={required ? requiredLabelSx : readOnly ? readOnlyLabelSx : fieldLabelSx}>
      {label}{required && <Box component="span" sx={{ color: '#D52B1E', ml: '2px' }}>*</Box>}
    </Box>
    {children}
  </Box>
);

const InputField = ({ maxLength, sx, readOnly, inputProps, ...props }) => (
  <TextField
    {...props}
    variant="outlined"
    size="small"
    InputProps={readOnly ? { readOnly: true } : undefined}
    inputProps={{
      ...(maxLength !== undefined ? { maxLength } : {}),
      ...(inputProps || {}),
    }}
    sx={{ ...textInputSx, ...(sx || {}) }}
  />
);

const SelectField = ({ sx, options = [], ...props }) => (
  <TextField
    {...props}
    select
    variant="outlined"
    size="small"
    sx={{ ...selectSx, ...(sx || {}) }}
  >
    {options.map((opt) => (
      <MenuItem key={opt.value} value={opt.value}>
        {opt.label}
      </MenuItem>
    ))}
  </TextField>
);

const GroupTrouble = ({ trNum, sessionUniqueKey, groupCloseOutInd }) => {
  const { showAlert, defaultUserDateFormat } = useAppContext();
  const { groupSearchResultsVO, groupRetrieveRspVO, setGroupFieldsUpdated, groupType } = useGroupSearch();

  const [isLoading, setIsLoading] = useState(false);
  const [emailPopupOpen, setEmailPopupOpen] = useState(false);
  const [extNarrativeOpen, setExtNarrativeOpen] = useState(false);

  const [eventIdTxt, setEventIdTxt] = useState('');
  const [etmsTktNum, setEtmsTktNum] = useState('');
  const [rootCauseTxt, setRootCauseTxt] = useState('');
  const [numberCustAftd, setNumberCustAftd] = useState('');
  const [attachedTrsCheck, setAttachedTrsCheck] = useState(false);
  const [trAttached, setTrAttached] = useState('');
  const [trRestored, setTrRestored] = useState('');

  const [wscCode, setWscCode] = useState('');
  const [wscOptions, setWscOptions] = useState([]);
  const [oasisFlashId, setOasisFlashId] = useState('');
  const [mastersId, setMastersId] = useState('');
  const [custProvTxt, setCustProvTxt] = useState('');

  const [assignedUser, setAssignedUser] = useState('');
  const [assignedUserOptions, setAssignedUserOptions] = useState([]);
  const [reassignAllowed, setReassignAllowed] = useState('');
  const [morningCall, setMorningCall] = useState('');
  const [gpAttached, setGpAttached] = useState('');

  const [repByName, setRepByName] = useState('');
  const [repBy, setRepBy] = useState('');
  const [repByExt, setRepByExt] = useState('');
  const [otherRepTxt, setOtherRepTxt] = useState('');

  const [contactInfoName, setContactInfoName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [contactInfoExt, setContactInfoExt] = useState('');
  const [otherContactTxt, setOtherContactTxt] = useState('');

  const [whiteboard, setWhiteboard] = useState('');
  const [troubleNarrative, setTroubleNarrative] = useState('');
  const [reasonForGroup, setReasonForGroup] = useState('');

  const [oos, setOos] = useState('');
  const [custAffected, setCustAffected] = useState('');
  const [estRestoral, setEstRestoral] = useState('');
  const [exceptionCode, setExceptionCode] = useState('');
  const [exceptionCodeOptions, setExceptionCodeOptions] = useState([{ value: '', label: '' }]);
  const [groupSeverity, setGroupSeverity] = useState('');
  const [severityOptions, setSeverityOptions] = useState([]);
  const [outageCatDDM, setOutageCatDDM] = useState('');
  const [outageCatOptions, setOutageCatOptions] = useState([{ value: '', label: '' }]);
  const [groupSymptomType, setGroupSymptomType] = useState('');
  const [symptomTypeOptions, setSymptomTypeOptions] = useState([{ value: '', label: '' }]);
  const [lodDDM, setLodDDM] = useState('N');
  const [lovDDM, setLovDDM] = useState('N');
  const [oasisExcludeDDM, setOasisExcludeDDM] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [serviceTypeOptions, setServiceTypeOptions] = useState([{ value: '', label: '' }]);
  const [priorityDDM, setPriorityDDM] = useState('');
  const [priorityOptions, setPriorityOptions] = useState([{ value: '', label: '' }]);
  const [slaText, setSlaText] = useState('');
  const [groupComponent, setGroupComponent] = useState('');
  const [groupSubComponent, setGroupSubComponent] = useState('');
  const [groupVendor, setGroupVendor] = useState('');

  const [grouptrbleSummaryStatus, setGrouptrbleSummaryStatus] = useState('');
  const [grouptrbleKeywords, setGrouptrbleKeywords] = useState('');
  const [extendedNarrativeText, setExtendedNarrativeText] = useState('');

  const [ss1Select, setSs1Select] = useState('');
  const [ss2Select, setSs2Select] = useState('');
  const [ss3Select, setSs3Select] = useState('');
  const [activeReferralCenters, setActiveReferralCenters] = useState('');
  const [referredTRCount, setReferredTRCount] = useState('');
  const [parentGroupTr, setParentGroupTr] = useState('');

  const [statusData, setStatusData] = useState([]);

  const [oasisFlashEnabled, setOasisFlashEnabled] = useState(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  const triggerFieldChanged = useCallback(() => {
    setGroupFieldsUpdated(true);
    setIsSubmitEnabled(true);
  }, [setGroupFieldsUpdated]);

  const validateNonASCII = useCallback((value) => {
    if (!isAsciiOnly(value)) {
      showAlert('Non-ASCII characters are not allowed. Please remove special characters.');
      return false;
    }
    return true;
  }, [showAlert]);

  const handleTroubleNarrativeChange = useCallback((e) => {
    const val = e.target.value;
    if (val.length > 150) return;
    if (!validateNonASCII(val)) return;
    setTroubleNarrative(val);
    triggerFieldChanged();
  }, [validateNonASCII, triggerFieldChanged]);

  const linkEnabler = useCallback((value) => value && value.trim().length > 0, []);

  const updateSLA = useCallback((priority) => {
    const slaMappings = { 'P1': 'P1', 'P2': 'P2', 'P3': 'P3', 'P4': 'P4' };
    setSlaText(slaMappings[priority] || '');
  }, []);

  const lastHydrateVersionRef = useRef(null);

  useEffect(() => {
    const vo = groupRetrieveRspVO;
    if (!vo || !trNum) return;
    const normalizeTr = (v) => String(v ?? '').trim().toUpperCase().replace(/^EVT-/, '');
    if (vo.troubleReportNum && normalizeTr(vo.troubleReportNum) !== normalizeTr(trNum)) return;
    if (vo._hydrateVersion == null) return;
    if (lastHydrateVersionRef.current === vo._hydrateVersion) return;
    lastHydrateVersionRef.current = vo._hydrateVersion;

    const p = (v) => (v == null || v === undefined ? '' : String(v));

    setEventIdTxt(p(vo.eventId));
    setEtmsTktNum(p(vo.etmsTktNum));
    setRootCauseTxt(p(vo.rootCause));
    setNumberCustAftd(p(vo.numberCustAftd || vo.custAffected));
    const trAtt = parseInt(p(vo.trAttachedNumber), 10) || 0;
    setAttachedTrsCheck(trAtt > 0);
    setTrAttached(p(vo.trAttachedNumber));
    setTrRestored(p(vo.trRestored));
    const wscVal = p(vo.wsc);
    setWscCode(wscVal);
    setWscOptions(buildWscOptionsList(vo, wscVal));
    setOasisFlashId(p(vo.oasisFlashId));
    setMastersId(p(vo.mastarsId));
    if (Array.isArray(vo.assignedUserOptions) && vo.assignedUserOptions.length) setAssignedUserOptions(vo.assignedUserOptions);
    setAssignedUser(p(vo.assignedUser));
    setReassignAllowed(p(vo.reassignAllowed));
    setMorningCall(p(vo.morningCall));
    setGpAttached(p(vo.gpAttached));
    setRepByName(p(vo.reportedByName));
    setRepBy(vo.reportedByPhone ? formatServiceTN(p(vo.reportedByPhone)) : '');
    setRepByExt(p(vo.reportedByExt));
    setOtherRepTxt(p(vo.reportedByOther));
    setContactInfoName(p(vo.contactName));
    setContactInfo(vo.contactPhone ? formatServiceTN(p(vo.contactPhone)) : '');
    setContactInfoExt(p(vo.contactExt));
    setOtherContactTxt(p(vo.contactOther));
    setWhiteboard(p(vo.whiteboard));
    setTroubleNarrative(p(vo.troubleNarrative));
    setReasonForGroup(p(vo.reasonForGroup));
    setOos(p(vo.oos));
    setCustAffected(p(vo.customerAffected));
    setEstRestoral(p(vo.estRestoralDate));
    const excCode = p(vo.exceptionCode ?? vo.EXCEPTIONCODE);
    setExceptionCode(excCode);
    setExceptionCodeOptions(buildExceptionCodeOptions(vo, excCode));
    const sev = p(vo.severity);
    setGroupSeverity(sev);
    setSeverityOptions(buildSeverityOptionsList(vo, sev));
    const pr = p(vo.priority);
    setPriorityDDM(pr);
    if (Array.isArray(vo.priorityOptions) && vo.priorityOptions.length > 0) {
      let opts = [{ value: '', label: '' }, ...vo.priorityOptions.map(normalizeSelectOption)];
      if (pr && !opts.some((o) => o.value === pr)) {
        opts = [...opts, { value: pr, label: pr }];
      }
      setPriorityOptions(opts);
    } else {
      setPriorityOptions(pr ? [{ value: '', label: '' }, { value: pr, label: pr }] : [{ value: '', label: '' }]);
    }
    if (p(vo.sla)) setSlaText(p(vo.sla));
    else if (['P1', 'P2', 'P3', 'P4'].includes(pr)) updateSLA(pr);
    const oc = p(vo.outageCat);
    setOutageCatDDM(oc);
    setOutageCatOptions(buildOutageCatOptions(vo, oc));
    const symptomCode = p(vo.symptomType);
    setGroupSymptomType(symptomCode);
    setSymptomTypeOptions(optionsForCode(symptomCode));
    const svcCode = p(vo.serviceType);
    setServiceType(svcCode);
    setServiceTypeOptions(optionsForCode(svcCode));
    setGroupComponent(p(vo.component));
    setGroupSubComponent(p(vo.subComponent));
    setGroupVendor(p(vo.vendor));
    setLodDDM(p(vo.lod) || 'N');
    setLovDDM(p(vo.lov) || 'N');
    setOasisExcludeDDM(p(vo.oasisExclude));
    setGrouptrbleSummaryStatus(p(vo.summaryStatus));
    setGrouptrbleKeywords(p(vo.keywords));
    setSs1Select(p(vo.ss1));
    setSs2Select(p(vo.ss2));
    setSs3Select(p(vo.ss3));
    setActiveReferralCenters(p(vo.activeReferralCenters));
    setReferredTRCount(p(vo.referredTRCount));
    setParentGroupTr(p(vo.parentGroupTr));
    setStatusData(Array.isArray(vo.statusData) ? vo.statusData : []);

    setGroupFieldsUpdated(false);
    setIsSubmitEnabled(false);
  }, [groupRetrieveRspVO, trNum, setGroupFieldsUpdated, updateSLA]);

  useEffect(() => {
    lastHydrateVersionRef.current = null;
  }, [trNum]);

  const checkRequiredFieldsFilled = useCallback(() => {
    const missing = [];
    if (!priorityDDM) missing.push('Priority');
    if (!slaText) missing.push('SLA');
    if (!oasisExcludeDDM) missing.push('Oasis Exclude');
    if (custAffected === 'Y' && !numberCustAftd) missing.push('Customer Affected Count');
    return missing;
  }, [priorityDDM, slaText, oasisExcludeDDM, custAffected, numberCustAftd]);

  const handleSubmit = useCallback(async () => {
    const missing = checkRequiredFieldsFilled();
    if (missing.length > 0) {
      showAlert(`Please fill in all required fields: ${missing.join(', ')}`);
      return;
    }
    if (oasisFlashId && !isValidOasisFlashId(oasisFlashId)) {
      showAlert('OASIS Flash ID must be exactly 13 characters.');
      return;
    }
    if (repBy && !isValidPhone(repBy)) {
      showAlert('Reported By phone number must have at least 10 digits.');
      return;
    }
    if (contactInfo && !isValidPhone(contactInfo)) {
      showAlert('Contact phone number must have at least 10 digits.');
      return;
    }
    if (estRestoral && !isValidDate(estRestoral)) {
      showAlert('Estimated Restoral date is invalid. Please use MM/DD/YYYY HH:MM format.');
      return;
    }

    setIsLoading(true);
    try {
      const formValues = new URLSearchParams({
        sessionUniqueKey, groupTroubleReportNum: trNum, eventIdTxt, numberCustAftd, wscCode,
        oasisFalshId: oasisFlashId, mastersID: mastersId, assignedUser, reassignAllowed,
        morningCall, repByName, repBy: repBy.replace(/\D/g, ''), repByExt, otherRepTxt,
        contactInfoName, contactInfo: contactInfo.replace(/\D/g, ''), contactInfoExt, otherContactTxt,
        whiteboard, troubleNarrative, oos, custAffected, estRestoral, exceptionCode, groupSeverity,
        outageCatDDM, groupSymptomType, lodDDM, lovDDM, oasisExcludeDDM, serviceType, priorityDDM,
        slaText, groupComponent, groupSubComponent, groupVendor, grouptrbleSummaryStatus,
        grouptrbleKeywords, ss1Select, ss2Select, ss3Select,
      }).toString();

      await submitGroupTrouble({ actionCode: 'UPDATE', formValues, sessionUniqueKey });
      showAlert('Group Trouble Report updated successfully.');
      setGroupFieldsUpdated(false);
      setIsSubmitEnabled(false);
    } catch (error) {
      showAlert('Error submitting Group Trouble Report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    checkRequiredFieldsFilled, oasisFlashId, repBy, contactInfo, estRestoral, sessionUniqueKey, trNum,
    eventIdTxt, numberCustAftd, wscCode, mastersId, assignedUser, reassignAllowed, morningCall,
    repByName, repByExt, otherRepTxt, contactInfoName, contactInfoExt, otherContactTxt, whiteboard,
    troubleNarrative, oos, custAffected, exceptionCode, groupSeverity, outageCatDDM, groupSymptomType,
    lodDDM, lovDDM, oasisExcludeDDM, serviceType, priorityDDM, slaText, groupComponent, groupSubComponent,
    groupVendor, grouptrbleSummaryStatus, grouptrbleKeywords, ss1Select, ss2Select, ss3Select,
    showAlert, setGroupFieldsUpdated,
  ]);

  /* ─── Render ─── */
  const formGrid4Sx = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '12px 12px',
    p: '8px',
    alignItems: 'start',
  };

  return (
    <Box id="groupTroubleDiv" sx={{
fontSize: '12px', lineHeight: '14px', p: '6px', color: 'text.primary' }}>
      {isLoading && <LoadingSpinner />}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Section 1 */}
          <SectionHeader title="Group Trouble Information">
            <Box sx={formGrid4Sx}>
              <FieldRow label="Event ID"><InputField type="text" id="eventIdTxt" name="eventIdTxt" value={eventIdTxt} onChange={(e) => { setEventIdTxt(e.target.value); triggerFieldChanged(); }} maxLength={32} /></FieldRow>
              <FieldRow label="ETMS Tkt#" readOnly><InputField type="text" id="etmsTktNum" value={etmsTktNum} readOnly /></FieldRow>

              <FieldRow label="Root Cause" readOnly><InputField type="text" id="rootCauseTxt" value={rootCauseTxt} readOnly maxLength={10} /></FieldRow>
              <FieldRow label="# Cust Aftd"><InputField type="text" id="numberCustAftd" value={numberCustAftd} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 7); setNumberCustAftd(v); triggerFieldChanged(); }} maxLength={7} /></FieldRow>

              <FieldRow label="Trs Attached" readOnly>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Checkbox checked={attachedTrsCheck} onChange={(e) => { setAttachedTrsCheck(e.target.checked); triggerFieldChanged(); }} size="small" sx={{ p: '2px' }} />
                  <InputField type="text" id="trAttached" value={trAttached} disabled />
                </Box>
              </FieldRow>
              <FieldRow label="Trs Restored" readOnly><InputField type="text" id="trRestored" value={trRestored} disabled /></FieldRow>

              <FieldRow label="WSC">
                <SelectField
                  id="wscCode"
                  value={wscCode}
                  onChange={(e) => { setWscCode(e.target.value); triggerFieldChanged(); }}
                  options={[
                    { value: '', label: '' },
                    ...wscOptions.map((opt) => ({ value: opt.value, label: opt.label })),
                  ]}
                />
              </FieldRow>

              <FieldRow label="OASIS Flash ID" required>
                <Box>
                  <Box component="span" sx={linkEnabler(oasisFlashId) ? oasisLinkSx : oasisLinkDisabledSx} onClick={() => oasisFlashEnabled && window.open('', '_blank')}>
                    {oasisFlashId || '\u00A0'}
                  </Box>
                  {oasisFlashEnabled && (
                    <InputField type="text" id="oasisFalshId" value={oasisFlashId} onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setOasisFlashId(v); triggerFieldChanged(); }} maxLength={13} />
                  )}
                </Box>
              </FieldRow>
              <FieldRow label="MASTARS ID"><InputField type="text" id="mastersID" value={mastersId} onChange={(e) => { setMastersId(e.target.value); triggerFieldChanged(); }} maxLength={10} /></FieldRow>

              <FieldRow label="Assigned User">
                <SelectField
                  id="assignedUser"
                  value={assignedUser}
                  onChange={(e) => { setAssignedUser(e.target.value); triggerFieldChanged(); }}
                  options={[
                    { value: '', label: '' },
                    ...assignedUserOptions.map((opt) => ({ value: opt.value, label: opt.label })),
                  ]}
                />
              </FieldRow>
              <FieldRow label="Reassign Allowed">
                <SelectField
                  id="reassignAllowed"
                  value={reassignAllowed}
                  onChange={(e) => { setReassignAllowed(e.target.value); triggerFieldChanged(); }}
                  options={[
                    { value: '', label: '' },
                    { value: 'Y', label: 'Y' },
                    { value: 'N', label: 'N' },
                  ]}
                />
              </FieldRow>

              <FieldRow label="Morning Call"><InputField type="text" id="morningCall" value={morningCall} onChange={(e) => { setMorningCall(e.target.value); triggerFieldChanged(); }} maxLength={20} /></FieldRow>
              <FieldRow label="GP Attached" readOnly><InputField type="text" id="gpAttached" value={gpAttached} readOnly /></FieldRow>
            </Box>
          </SectionHeader>

          {/* Section 2: Reported By */}
          <SectionHeader title="Reported By">
            <Box sx={formGrid4Sx}>
              <FieldRow label="Name"><InputField type="text" id="repByName" value={repByName} onChange={(e) => { setRepByName(e.target.value); triggerFieldChanged(); }} maxLength={20} /></FieldRow>
              <FieldRow label="Phone"><InputField type="text" id="repBy" value={repBy} onChange={(e) => setRepBy(formatServiceTN(e.target.value))} onBlur={() => triggerFieldChanged()} maxLength={12} /></FieldRow>
              <FieldRow label="Ext"><InputField type="text" id="repByExt" value={repByExt} onChange={(e) => { setRepByExt(e.target.value.replace(/\D/g, '').slice(0, 7)); triggerFieldChanged(); }} maxLength={7} /></FieldRow>
              <FieldRow label="Other"><InputField type="text" id="otherRepTxt" value={otherRepTxt} onChange={(e) => { setOtherRepTxt(e.target.value.slice(0, 50)); triggerFieldChanged(); }} maxLength={50} /></FieldRow>
            </Box>
          </SectionHeader>

          {/* Section 3: Contact Information */}
          <SectionHeader title="Contact Information">
            <Box sx={formGrid4Sx}>
              <FieldRow label="Name"><InputField type="text" id="contactInfoName" value={contactInfoName} onChange={(e) => { setContactInfoName(e.target.value); triggerFieldChanged(); }} maxLength={20} /></FieldRow>
              <FieldRow label="Phone"><InputField type="text" id="contactInfo" value={contactInfo} onChange={(e) => setContactInfo(formatServiceTN(e.target.value))} onBlur={() => triggerFieldChanged()} maxLength={12} /></FieldRow>
              <FieldRow label="Ext"><InputField type="text" id="contactInfoExt" value={contactInfoExt} onChange={(e) => { setContactInfoExt(e.target.value.replace(/\D/g, '').slice(0, 7)); triggerFieldChanged(); }} maxLength={7} /></FieldRow>
              <FieldRow label="Other"><InputField type="text" id="otherContactTxt" value={otherContactTxt} onChange={(e) => { setOtherContactTxt(e.target.value.slice(0, 50)); triggerFieldChanged(); }} maxLength={50} /></FieldRow>
            </Box>
          </SectionHeader>

          {/* Section 4: Trouble Details */}
          <SectionHeader title="Trouble Details">
            <Box sx={formGrid4Sx}>
              <FieldRow label="Whiteboard">
                <InputField type="text" id="whiteboard" value={whiteboard} onChange={(e) => { setWhiteboard(e.target.value); triggerFieldChanged(); }} maxLength={10} />
              </FieldRow>

              <FieldRow label="Reason For Group" readOnly>
                <InputField type="text" id="reasonForGroup" value={reasonForGroup} readOnly />
              </FieldRow>

              <FieldRow label="OOS"><SelectField id="oos" value={oos} onChange={(e) => { setOos(e.target.value); triggerFieldChanged(); }} options={[{ value: '', label: '' }, { value: 'Y', label: 'Y' }, { value: 'N', label: 'N' }]} /></FieldRow>
              <FieldRow label="Cust Affected"><SelectField id="custAffected" value={custAffected} onChange={(e) => { setCustAffected(e.target.value); triggerFieldChanged(); }} options={[{ value: '', label: '' }, { value: 'Y', label: 'Y' }, { value: 'N', label: 'N' }]} /></FieldRow>

              <FieldRow label="Est Restoral">
                <DateTimeInput id="estRestoral" value={estRestoral} onChange={(val) => { setEstRestoral(val); triggerFieldChanged(); }} showCalendarIcon />
              </FieldRow>

              <FieldRow label="Exception Code">
                <SelectField id="exceptionCode" value={exceptionCode} onChange={(e) => { setExceptionCode(e.target.value); triggerFieldChanged(); }} options={exceptionCodeOptions} />
              </FieldRow>

              <FieldRow label="Severity"><SelectField id="groupSeverity" value={groupSeverity} onChange={(e) => { setGroupSeverity(e.target.value); triggerFieldChanged(); }} options={[{ value: '', label: '' }, ...severityOptions.map((opt) => ({ value: opt.value, label: opt.label }))]} /></FieldRow>
              <FieldRow label="Priority" required><SelectField id="priorityDDM" value={priorityDDM} onChange={(e) => { setPriorityDDM(e.target.value); updateSLA(e.target.value); triggerFieldChanged(); }} sx={selectRequiredSx} options={priorityOptions} /></FieldRow>

              <FieldRow label="SLA" required><InputField type="text" id="slaText" value={slaText} onChange={(e) => setSlaText(e.target.value.replace(/\D/g, '').slice(0, 8))} maxLength={8} /></FieldRow>
              <FieldRow label="Outage Cat"><SelectField id="outageCatDDM" value={outageCatDDM} onChange={(e) => { setOutageCatDDM(e.target.value); triggerFieldChanged(); }} options={outageCatOptions} /></FieldRow>

              <FieldRow label="Symptom Type"><SelectField id="groupSymptomType" value={groupSymptomType} onChange={(e) => { setGroupSymptomType(e.target.value); triggerFieldChanged(); }} options={symptomTypeOptions} /></FieldRow>
              <FieldRow label="Service Type"><SelectField id="serviceType" value={serviceType} onChange={(e) => { setServiceType(e.target.value); triggerFieldChanged(); }} options={serviceTypeOptions} /></FieldRow>

              <FieldRow label="Component"><SelectField id="groupComponent" value={groupComponent} onChange={(e) => { setGroupComponent(e.target.value); triggerFieldChanged(); }} options={[{ value: '', label: '' }]} /></FieldRow>
              <FieldRow label="Sub-Component"><SelectField id="groupSubComponent" value={groupSubComponent} onChange={(e) => { setGroupSubComponent(e.target.value); triggerFieldChanged(); }} options={[{ value: '', label: '' }]} /></FieldRow>

              <FieldRow label="Vendor"><SelectField id="groupVendor" value={groupVendor} onChange={(e) => { setGroupVendor(e.target.value); triggerFieldChanged(); }} options={[{ value: '', label: '' }]} /></FieldRow>
              <FieldRow label="LOD"><SelectField id="lodDDM" value={lodDDM} onChange={(e) => { setLodDDM(e.target.value); triggerFieldChanged(); }} options={[{ value: 'Y', label: 'Y' }, { value: 'N', label: 'N' }]} /></FieldRow>

              <FieldRow label="LOV"><SelectField id="lovDDM" value={lovDDM} onChange={(e) => { setLovDDM(e.target.value); triggerFieldChanged(); }} options={[{ value: 'Y', label: 'Y' }, { value: 'N', label: 'N' }]} /></FieldRow>
              <FieldRow label="OASIS Exclude" required><SelectField id="oasisExcludeDDM" value={oasisExcludeDDM} onChange={(e) => { setOasisExcludeDDM(e.target.value); triggerFieldChanged(); }} sx={selectRequiredSx} options={[{ value: '', label: '' }, { value: 'Y', label: 'Y' }, { value: 'N', label: 'N' }]} /></FieldRow>

              <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <Box component="label" sx={fieldLabelSx} htmlFor="troubleNarrative">Trouble Narrative</Box>
                  <TextField
                    multiline
                    rows={4}
                    value={troubleNarrative}
                    onChange={handleTroubleNarrativeChange}
                    inputProps={{ maxLength: 150 }}
                    size="small"
                    fullWidth
                    sx={{ '& textarea': { textTransform: 'uppercase', fontSize: 12 } }}
                    helperText={`${troubleNarrative.length}/150`}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <Box component="label" sx={fieldLabelSx} htmlFor="grouptrbleSummaryStatus">Status Summary</Box>
                  <TextField
                    multiline
                    rows={4}
                    value={grouptrbleSummaryStatus}
                    onChange={(e) => { setGrouptrbleSummaryStatus(e.target.value); triggerFieldChanged(); }}
                    inputProps={{ maxLength: 2000 }}
                    size="small"
                    fullWidth
                    sx={{ '& textarea': { fontSize: 12 } }}
                    helperText={`${grouptrbleSummaryStatus.length}/2000`}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <Box component="label" sx={fieldLabelSx} htmlFor="grouptrbleKeywords">Keywords</Box>
                  <TextField
                    multiline
                    rows={4}
                    value={grouptrbleKeywords}
                    onChange={(e) => { if (e.target.value.length <= 250) { setGrouptrbleKeywords(e.target.value); triggerFieldChanged(); } }}
                    inputProps={{ maxLength: 250 }}
                    size="small"
                    fullWidth
                    sx={{ '& textarea': { fontSize: 12 } }}
                    helperText={`${grouptrbleKeywords.length}/250`}
                  />
                </Box>
              </Box>
            </Box>
          </SectionHeader>

          {/* Section 5: Status */}
          <SectionHeader title="Status">
            <Box sx={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '10px', p: '4px', alignItems: 'start', '@media (max-width: 900px)': { gridTemplateColumns: '1fr' } }}>
              {/* Status Timeline */}
              <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: '160px', overflowY: 'auto', py: '4px' }}>
                {statusData.map((row, i) => {
                  const isLast = i === statusData.length - 1;
                  const isCurrent = row.x === '●';
                  return (
                    <Box key={i} sx={{ display: 'flex', gap: '8px', minHeight: '32px', fontWeight: isCurrent ? 700 : 'normal' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '16px', flexShrink: 0 }}>
                        <Box component="span" sx={{ width: '10px', height: '10px', borderRadius: '50%', bgcolor: isCurrent ? 'secondary.main' : 'grey.300', border: '2px solid', borderColor: isCurrent ? 'secondary.main' : 'grey.300', flexShrink: 0, boxShadow: isCurrent ? '0 0 0 3px rgba(206, 17, 38, 0.15)' : 'none' }} />
                        {!isLast && <Box component="span" sx={{ flex: 1, width: '2px', bgcolor: 'grey.300', minHeight: '12px' }} />}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px', pb: '4px',
 fontSize: 11 }}>
                        <Box component="span" sx={{ fontWeight: 700, color: 'text.primary', minWidth: '32px' }}>{row.stat}</Box>
                        <Box component="span" sx={{ color: 'grey.800' }}>{row.dateTime}</Box>
                        <Box component="span" sx={{ color: 'grey.500', fontSize: '10px' }}>{row.id}</Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* SS / Referral fields */}
              <Box sx={formGrid4Sx}>
                <FieldRow label="SS1"><SelectField id="ss1Select" value={ss1Select} onChange={(e) => { setSs1Select(e.target.value); triggerFieldChanged(); }} options={[{ value: '', label: '' }]} /></FieldRow>
                <FieldRow label="SS2"><SelectField id="ss2Select" value={ss2Select} onChange={(e) => { setSs2Select(e.target.value); triggerFieldChanged(); }} options={[{ value: '', label: '' }]} /></FieldRow>
                <FieldRow label="SS3"><SelectField id="ss3Select" value={ss3Select} onChange={(e) => { setSs3Select(e.target.value); triggerFieldChanged(); }} options={[{ value: '', label: '' }]} /></FieldRow>
                <FieldRow label="Ref'd Wkgrps"><SelectField id="activeReferralCenters" value={activeReferralCenters} onChange={(e) => setActiveReferralCenters(e.target.value)} options={[{ value: '', label: '' }]} /></FieldRow>
                <FieldRow label="Referral Count" readOnly><InputField type="text" id="referredTRCount" value={referredTRCount} readOnly /></FieldRow>
                <FieldRow label="Parent Group TR#" readOnly><InputField type="text" id="parentGroupTr" value={parentGroupTr} readOnly /></FieldRow>
              </Box>
            </Box>
          </SectionHeader>

          {/* Event Summary / Group Close Out */}
          <SectionHeader title={groupCloseOutInd === 'Y' ? 'Group Close Out' : 'Event Summary Details'}>
            {groupCloseOutInd === 'Y'
              ? <GroupCloseOut trNum={trNum} sessionUniqueKey={sessionUniqueKey} />
              : <EventSummary trNum={trNum} sessionUniqueKey={sessionUniqueKey} />
            }
          </SectionHeader>
      </Box>

      {/* Extended Narrative Modal */}
      <Modal
        isOpen={extNarrativeOpen}
        onClose={() => setExtNarrativeOpen(false)}
        title="Extended Narrative"
        width={650}
        footer={
          <Box sx={modalFooterSx}>
            <Button size="small" variant="contained" onClick={() => setExtNarrativeOpen(false)}>OK</Button>
          </Box>
        }
      >
        <TextField
          multiline
          rows={4}
          value={extendedNarrativeText}
          onChange={(e) => { if (e.target.value.length <= 500) setExtendedNarrativeText(e.target.value); }}
          inputProps={{ maxLength: 500 }}
          size="small"
          fullWidth
          sx={{ '& textarea': { fontSize: 12, resize: 'vertical' } }}
          helperText={`${extendedNarrativeText.length}/500`}
        />
      </Modal>
    </Box>
  );
};

export default GroupTrouble;
