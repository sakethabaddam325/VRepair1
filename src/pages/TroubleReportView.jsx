import React, { useState, useCallback } from 'react';
import { Box, Stack, Typography, Button, Checkbox, FormControlLabel } from '@mui/material';

const MOCK_STATUS_ENTRIES = [
  { x: '', stat: 'NM', dateTime: '01/12/2022 01:38 AM', id: '' },
  { x: '', stat: 'AP', dateTime: '05/21/2023 08:57 AM', id: '' },
];

const WSC_OPTIONS = ['', 'OUT-OUT', 'OUT-IN', 'IN-OUT', 'IN-IN'];
const OOS_OPTIONS = ['', 'Y', 'N'];
const CUST_AFTD_OPTIONS = ['', 'Y', 'N'];
const SEVERITY_OPTIONS = ['', '1', '2', '3', '4'];
const OUTAGE_CAT_OPTIONS = ['', 'TESTING', 'PLANNED', 'UNPLANNED', 'EMERGENCY'];
const EXCEPTION_OPTIONS = ['', 'DISPATCH TO PPM', 'NO DISPATCH', 'CUSTOMER REQUEST'];
const SYMPTOM_OPTIONS = ['', 'OTHER', 'NO DIAL TONE', 'STATIC', 'INTERMITTENT'];
const SERVICE_TYPE_OPTIONS = ['', 'OTHER', 'POTS', 'DSL', 'FIBER', 'VOIP'];
const LOD_OPTIONS = ['', 'Y', 'N'];
const LOV_OPTIONS = ['', 'Y', 'N'];
const OASIS_EXCLUDE_OPTIONS = ['', 'Y', 'N'];
const PRIORITY_OPTIONS = ['', '1', '2', '3', '4', '5'];
const COMPONENT_OPTIONS = ['', 'CABLE', 'EQUIPMENT', 'POWER', 'SOFTWARE'];
const SUB_COMPONENT_OPTIONS = ['', 'SUB-A', 'SUB-B', 'SUB-C'];
const VENDOR_OPTIONS = ['', 'VENDOR-A', 'VENDOR-B', 'VENDOR-C'];
const REASON_CODE_OPTIONS = ['', 'F - FAILURE', 'M - MAINTENANCE', 'T - TEST', 'C - CUSTOMER'];
const COSTING_OPTIONS = ['', 'N/A', 'YES', 'NO'];
const ALARM_CLRD_OPTIONS = ['', 'Y', 'N'];
const SS_OPTIONS = ['', 'SS-OPT-1', 'SS-OPT-2', 'SS-OPT-3'];
const REFD_WKGPS_OPTIONS = ['', '0', '1', '2', '3'];

/* ── Shared sx ── */
const lblSx = { fontSize: '11px', fontWeight: 'bold', color: 'grey.800', whiteSpace: 'nowrap', alignSelf: 'center' };
const lblFlashSx = { ...lblSx, color: '#D52B1E' };
const inpSx = {
  height: '26px', py: '2px', px: '4px',
 fontSize: 11,
  color: 'text.primary', border: '1px solid', borderColor: 'divider',
  borderRadius: '3px', bgcolor: 'background.paper', outline: 'none',
  minWidth: 0, transition: 'border-color 0.15s ease',
  '&:focus': { borderColor: 'primary.main' },
};
const selSx = {
  height: '22px', py: 0, px: '2px',
 fontSize: '11px',
  color: 'text.primary', border: '1px solid', borderColor: 'divider',
  borderRadius: '2px', bgcolor: 'background.paper', outline: 'none', minWidth: 0, cursor: 'pointer',
  '&:focus': { borderColor: 'primary.main' },
};
const selRequiredSx = { ...selSx, borderColor: 'secondary.main' };
const textareaSx = {
  width: '100%',
 fontSize: '11px',
  color: 'text.primary', border: '1px solid', borderColor: 'divider',
  borderRadius: '2px', bgcolor: 'background.paper', p: '4px', resize: 'vertical', outline: 'none',
  '&:focus': { borderColor: 'primary.main' },
};
const sectionHeaderSx = {
  fontSize: '11px', fontWeight: 'bold', color: 'primary.main',
  py: '4px', pb: '2px', borderBottom: '1px solid', borderColor: 'divider',
  my: '4px', textTransform: 'uppercase',
};

const Sel = ({ value, options, onChange, sx: extraSx, required }) => (
  <Box component="select" value={value} onChange={(e) => onChange(e.target.value)} sx={{ ...(required ? selRequiredSx : selSx), ...extraSx }}>
    {options.map((o) => <option key={o} value={o}>{o || '\u2014'}</option>)}
  </Box>
);

const Inp = ({ value, onChange, placeholder, sx: extraSx, readOnly }) => (
  <Box component="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly} sx={{ ...inpSx, ...extraSx }} />
);

const TroubleReportView = () => {
  const [form, setForm] = useState({
    eventId: '', extTR: '', rootCause: '', custAftd: '2',
    trAttached: false, trAttachedCount: '0',
    wsc: 'OUT-OUT', flashId: '', kirkeId: '', custProv: '',
    trRestored: '0', gpAttached: '0',
    reportedName: '', reportedPhone: '', reportedExt: '',
    contactName: '', contactPhone: '', contactExt: '',
    otherReported: '', otherContact: '', whiteboard: '',
    troubleNarrative: 'Automation Testing',
    reasonCode: 'F - FAILURE',
    oos: 'Y', custAftdDrop: 'N', estRestoral: '05/09/2022 03:30 PM',
    exceptionCode: 'DISPATCH TO PPM',
    severity: '4', outageCat: 'TESTING',
    symptomType: 'OTHER', lod: 'Y', lov: 'Y', oasisExclude: 'Y',
    serviceType: 'OTHER', priority: '', sla: '',
    component: '', statusComment: '',
    subComponent: '', keywords: '',
    vendor: '',
    noAttachPPMT: false, autoClose: false, coIsolation: '', metricsExclude: false,
    ecmpLag: '', alarmClrd: '', costingRestored: 'N/A', alarmClrdDT: '',
    rpaStatus: '',
    dispatchCenter: '', dispatchLocation: '', dispatchRemarks: '',
    ss1: '', ss2: '', ss3: '', refdWkgps: '', refdCount: '0', groupTR: '',
    chronic: '0', esc: false, nmaTkt: '',
  });

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(() => {}, [form]);

  return (
    <Box sx={{ p: '4px 8px',
 fontSize: '11px', lineHeight: 1.4, color: 'text.primary' }}>
      {/* Flags Row */}
      <Stack direction="row" alignItems="center" sx={{ gap: '12px', py: '4px', borderBottom: '1px solid', borderColor: 'divider', mb: '4px', flexWrap: 'wrap' }}>
        <FormControlLabel control={<Checkbox checked={false} onChange={() => {}} size="small" />} label={`Chronic ${form.chronic}`} />
        <FormControlLabel control={<Checkbox checked={form.trAttached} onChange={(e) => updateField('trAttached', e.target.checked)} size="small" />} label="TR Attached" />
        <FormControlLabel control={<Checkbox checked={form.noAttachPPMT} onChange={(e) => updateField('noAttachPPMT', e.target.checked)} size="small" />} label="No Attach PPMT" />
        <FormControlLabel control={<Checkbox checked={form.autoClose} onChange={(e) => updateField('autoClose', e.target.checked)} size="small" />} label="Auto-Close" />
        <FormControlLabel control={<Checkbox checked={form.metricsExclude} onChange={(e) => updateField('metricsExclude', e.target.checked)} size="small" />} label="Metrics Exclude" />
        <Box component="span" sx={{ fontSize: '11px', fontWeight: 'bold', color: 'grey.800' }}>ESC</Box>
        <Box component="span" sx={{ fontSize: '11px', fontWeight: 'bold', color: 'grey.800' }}>NMA Tkt#:</Box>
        <Inp value={form.nmaTkt} onChange={(v) => updateField('nmaTkt', v)} sx={{ width: '80px' }} />
      </Stack>

      {/* Main Two-Column Layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '8px' }}>
        {/* Left Column */}
        <Box sx={{ minWidth: 0 }}>
          {/* Top Fields Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr', gap: '3px 6px', alignItems: 'center', py: '4px' }}>
            <Box component="label" sx={lblSx}>Event ID:</Box>
            <Inp value={form.eventId} onChange={(v) => updateField('eventId', v)} />
            <Box component="label" sx={lblSx}>Ext TR#:</Box>
            <Inp value={form.extTR} onChange={(v) => updateField('extTR', v)} />
            <Box component="label" sx={lblSx}>Root Cause:</Box>
            <Inp value={form.rootCause} onChange={(v) => updateField('rootCause', v)} />
            <Box component="label" sx={lblSx}>#Cust Aftd:</Box>
            <Inp value={form.custAftd} onChange={(v) => updateField('custAftd', v)} sx={{ width: '60px' }} />
            <Box component="label" sx={lblSx}>WSC:</Box>
            <Sel value={form.wsc} options={WSC_OPTIONS} onChange={(v) => updateField('wsc', v)} />
            <Box component="label" sx={lblFlashSx}>Flash ID:</Box>
            <Inp value={form.flashId} onChange={(v) => updateField('flashId', v)} />
            <Box component="label" sx={lblSx}>KIRKE ID:</Box>
            <Inp value={form.kirkeId} onChange={(v) => updateField('kirkeId', v)} />
            <Box component="label" sx={lblSx}>#Cust Prov:</Box>
            <Inp value={form.custProv} onChange={(v) => updateField('custProv', v)} sx={{ width: '60px' }} />
          </Box>

          {/* Counters */}
          <Stack direction="row" alignItems="center" sx={{ gap: '16px', py: '4px', borderBottom: '1px solid', borderColor: 'divider' }}>
            {[
              { label: '#TR Attached:', val: form.trAttachedCount },
              { label: '#TR Restored:', val: form.trRestored },
              { label: '#GP Attached:', val: form.gpAttached },
            ].map(({ label, val }) => (
              <Box key={label} component="span" sx={{ fontSize: '11px', color: 'grey.800' }}>
                {label} <Box component="b">{val}</Box>
              </Box>
            ))}
          </Stack>

          {/* Reported By / Contact */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto', gap: '4px 6px', alignItems: 'center', py: '4px' }}>
            {[
              { lbl: 'Reported By:', name: 'reportedName', phone: 'reportedPhone', ext: 'reportedExt' },
              { lbl: 'Contact:', name: 'contactName', phone: 'contactPhone', ext: 'contactExt' },
            ].map(({ lbl, name, phone, ext }) => (
              <React.Fragment key={lbl}>
                <Box component="label" sx={lblSx}>{lbl}</Box>
                <Inp value={form[name]} onChange={(v) => updateField(name, v)} placeholder="Name" />
                <Inp value={form[phone]} onChange={(v) => updateField(phone, v)} placeholder="Phone" sx={{ width: '120px' }} />
                <Inp value={form[ext]} onChange={(v) => updateField(ext, v)} placeholder="x" sx={{ width: '60px' }} />
                <Button variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }}>List</Button>
              </React.Fragment>
            ))}
          </Box>

          {/* Other / Whiteboard */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr auto auto', gap: '4px 6px', alignItems: 'center', py: '4px', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box component="label" sx={lblSx}>Other:</Box>
            <Inp value={form.otherReported} onChange={(v) => updateField('otherReported', v)} />
            <Box component="label" sx={lblSx}>Other:</Box>
            <Inp value={form.otherContact} onChange={(v) => updateField('otherContact', v)} />
            <Box component="label" sx={lblSx}>Whiteboard #:</Box>
            <Inp value={form.whiteboard} onChange={(v) => updateField('whiteboard', v)} sx={{ width: '120px' }} />
          </Box>

          {/* Trouble Info */}
          <Typography component="div" sx={sectionHeaderSx}>TROUBLE INFO</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
            {/* Narrative */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Box component="label" sx={lblSx}>Trouble Report Narrative:</Box>
              <Box component="textarea" value={form.troubleNarrative} onChange={(e) => updateField('troubleNarrative', e.target.value)} rows={4} sx={textareaSx} />
            </Box>
            {/* Trouble Fields */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr', gap: '3px 4px', alignItems: 'center' }}>
              <Box component="label" sx={lblSx}>Reason Code:</Box>
              <Box sx={{ gridColumn: 'span 3' }}><Sel value={form.reasonCode} options={REASON_CODE_OPTIONS} onChange={(v) => updateField('reasonCode', v)} /></Box>
              <Box component="label" sx={lblSx}>OOS:</Box>
              <Sel value={form.oos} options={OOS_OPTIONS} onChange={(v) => updateField('oos', v)} sx={{ width: '50px' }} />
              <Box component="label" sx={lblSx}>Cust Aftd:</Box>
              <Sel value={form.custAftdDrop} options={CUST_AFTD_OPTIONS} onChange={(v) => updateField('custAftdDrop', v)} sx={{ width: '50px' }} />
              <Box component="label" sx={lblSx}>Est Restoral:</Box>
              <Box sx={{ gridColumn: 'span 3' }}><Inp value={form.estRestoral} onChange={(v) => updateField('estRestoral', v)} sx={{ width: '140px' }} /></Box>
              <Box component="label" sx={lblSx}>Exception Code:</Box>
              <Box sx={{ gridColumn: 'span 3' }}><Sel value={form.exceptionCode} options={EXCEPTION_OPTIONS} onChange={(v) => updateField('exceptionCode', v)} /></Box>
              <Box component="label" sx={lblSx}>Severity:</Box>
              <Sel value={form.severity} options={SEVERITY_OPTIONS} onChange={(v) => updateField('severity', v)} sx={{ width: '50px' }} />
              <Box component="label" sx={lblSx}>Outage Category:</Box>
              <Sel value={form.outageCat} options={OUTAGE_CAT_OPTIONS} onChange={(v) => updateField('outageCat', v)} />
              <Box component="label" sx={lblSx}>Symptom Type:</Box>
              <Sel value={form.symptomType} options={SYMPTOM_OPTIONS} onChange={(v) => updateField('symptomType', v)} />
              <Box component="label" sx={lblSx}>LOD:</Box>
              <Sel value={form.lod} options={LOD_OPTIONS} onChange={(v) => updateField('lod', v)} sx={{ width: '50px' }} />
              <Box component="label" sx={lblSx}>LOV:</Box>
              <Sel value={form.lov} options={LOV_OPTIONS} onChange={(v) => updateField('lov', v)} sx={{ width: '50px' }} />
              <Box component="label" sx={lblSx}>OASIS Exclude:</Box>
              <Sel value={form.oasisExclude} options={OASIS_EXCLUDE_OPTIONS} onChange={(v) => updateField('oasisExclude', v)} sx={{ width: '50px' }} />
              <Box component="label" sx={lblSx}>Service Type:</Box>
              <Sel value={form.serviceType} options={SERVICE_TYPE_OPTIONS} onChange={(v) => updateField('serviceType', v)} />
              <Box component="label" sx={lblSx}>Priority:</Box>
              <Sel value={form.priority} options={PRIORITY_OPTIONS} onChange={(v) => updateField('priority', v)} required sx={{ width: '50px' }} />
              <Box component="label" sx={lblSx}>SLA:</Box>
              <Inp value={form.sla} onChange={(v) => updateField('sla', v)} sx={{ width: '120px' }} />
              <Box component="label" sx={lblSx}>Component:</Box>
              <Sel value={form.component} options={COMPONENT_OPTIONS} onChange={(v) => updateField('component', v)} />
              <Box component="label" sx={lblSx}>Status Comment:</Box>
              <Box component="textarea" value={form.statusComment} onChange={(e) => updateField('statusComment', e.target.value)} rows={2} sx={{ ...textareaSx, maxHeight: '48px' }} />
              <Box component="label" sx={lblSx}>Sub Component:</Box>
              <Sel value={form.subComponent} options={SUB_COMPONENT_OPTIONS} onChange={(v) => updateField('subComponent', v)} />
              <Box component="label" sx={lblSx}>Keywords:</Box>
              <Inp value={form.keywords} onChange={(v) => updateField('keywords', v)} />
              <Box component="label" sx={lblSx}>Vendor:</Box>
              <Sel value={form.vendor} options={VENDOR_OPTIONS} onChange={(v) => updateField('vendor', v)} />
            </Box>
          </Box>
        </Box>

        {/* Right Column (Status) */}
        <Box sx={{ minWidth: 0, borderLeft: '1px solid', borderColor: 'divider', pl: '8px' }}>
          <Typography component="div" sx={sectionHeaderSx}>STATUS</Typography>
          {/* Status Table */}
          <Box sx={{ my: '4px' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '20px 40px 1fr 40px', gap: '4px', fontSize: '10px', fontWeight: 'bold', color: 'primary.main', py: '2px', borderBottom: '1px solid', borderColor: 'divider' }}>
              {['X', 'STAT', 'DATE/TIME', 'ID'].map((h) => (<Box component="span" key={h}>{h}</Box>))}
            </Box>
            {MOCK_STATUS_ENTRIES.map((entry, i) => (
              <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '20px 40px 1fr 40px', gap: '4px', fontSize: '10px', color: 'text.primary', py: '2px', borderBottom: '1px solid', borderColor: 'grey.50' }}>
                <Box component="span">{entry.x}</Box>
                <Box component="span">{entry.stat}</Box>
                <Box component="span">{entry.dateTime}</Box>
                <Box component="span">{entry.id}</Box>
              </Box>
            ))}
          </Box>
          {/* Status Fields */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3px 6px', alignItems: 'center', py: '6px' }}>
            <Box component="label" sx={lblSx}>SS1:</Box>
            <Sel value={form.ss1} options={SS_OPTIONS} onChange={(v) => updateField('ss1', v)} />
            <Box component="label" sx={lblSx}>SS2:</Box>
            <Sel value={form.ss2} options={SS_OPTIONS} onChange={(v) => updateField('ss2', v)} />
            <Box component="label" sx={lblSx}>SS3:</Box>
            <Sel value={form.ss3} options={SS_OPTIONS} onChange={(v) => updateField('ss3', v)} />
            <Box component="label" sx={lblSx}>Ref'd Wkgps/#:</Box>
            <Stack direction="row" sx={{ gap: '4px', alignItems: 'center' }}>
              <Sel value={form.refdWkgps} options={REFD_WKGPS_OPTIONS} onChange={(v) => updateField('refdWkgps', v)} sx={{ width: '50px' }} />
              <Inp value={form.refdCount} onChange={(v) => updateField('refdCount', v)} sx={{ width: '60px' }} />
            </Stack>
            <Box component="label" sx={lblSx}>Group TR#:</Box>
            <Inp value={form.groupTR} onChange={(v) => updateField('groupTR', v)} />
          </Box>
        </Box>
      </Box>

      {/* Bottom: Details + Dispatch */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', mt: '4px' }}>
        {/* Details */}
        <Box sx={{ minWidth: 0 }}>
          <Typography component="div" sx={sectionHeaderSx}>DETAILS</Typography>
          <Stack direction="row" alignItems="center" sx={{ gap: '8px', py: '4px', flexWrap: 'wrap' }}>
            <Box component="label" sx={lblSx}>#CO Isolation:</Box>
            <Inp value={form.coIsolation} onChange={(v) => updateField('coIsolation', v)} sx={{ width: '120px' }} />
          </Stack>
          {[
            [{ lbl: 'ECMP/LAG:', field: 'ecmpLag', isSel: false, width: '120px' }, { lbl: 'Alarm Clrd:', field: 'alarmClrd', isSel: true, opts: ALARM_CLRD_OPTIONS }],
            [{ lbl: 'Costing Restored:', field: 'costingRestored', isSel: true, opts: COSTING_OPTIONS }, { lbl: 'Alarm Clrd D/T:', field: 'alarmClrdDT', isSel: false, width: '140px' }],
            [{ lbl: 'RPA Status:', field: 'rpaStatus', isSel: false, width: '120px' }],
          ].map((row, ri) => (
            <Stack key={ri} direction="row" alignItems="center" sx={{ gap: '6px', py: '2px', flexWrap: 'wrap' }}>
              {row.map(({ lbl, field, isSel, opts, width }) => (
                <React.Fragment key={lbl}>
                  <Box component="label" sx={lblSx}>{lbl}</Box>
                  {isSel
                    ? <Sel value={form[field]} options={opts} onChange={(v) => updateField(field, v)} sx={{ width: '50px' }} />
                    : <Inp value={form[field]} onChange={(v) => updateField(field, v)} sx={{ width: width || '120px' }} />
                  }
                </React.Fragment>
              ))}
            </Stack>
          ))}
        </Box>

        {/* Dispatch */}
        <Box sx={{ minWidth: 0 }}>
          <Typography component="div" sx={sectionHeaderSx}>DISPATCH</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr', gap: '3px 6px', alignItems: 'center', py: '4px' }}>
            <Box component="label" sx={lblSx}>Center:</Box>
            <Inp value={form.dispatchCenter} onChange={(v) => updateField('dispatchCenter', v)} />
            <Box component="label" sx={lblSx}>Location:</Box>
            <Inp value={form.dispatchLocation} onChange={(v) => updateField('dispatchLocation', v)} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', py: '4px' }}>
            <Box component="label" sx={lblSx}>Remarks:</Box>
            <Box component="textarea" value={form.dispatchRemarks} onChange={(e) => updateField('dispatchRemarks', e.target.value)} rows={3} sx={textareaSx} />
          </Box>
          <Stack direction="row" justifyContent="flex-end" sx={{ py: '4px' }}>
            <Button variant="contained" size="small" onClick={handleSubmit}>Submit</Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default TroubleReportView;
