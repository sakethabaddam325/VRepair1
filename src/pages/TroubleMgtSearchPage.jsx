import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTabsContext } from '../contexts/TabsContext.jsx';
import { Box, Stack, Typography, FormControl, Select, MenuItem, Button, Divider, Tooltip, TextField, Checkbox, FormControlLabel, RadioGroup, Radio, FormLabel, Accordion, AccordionSummary, AccordionDetails, Alert, ButtonBase } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/* ═══════════════════════════════════════════════════════════════════
   Search Type definitions — grouped by category toggle tabs
   Matches legacy dropdown exactly (11 search types)
   ═══════════════════════════════════════════════════════════════════ */
const SEARCH_TYPE_GROUPS = [
  {
    category: 'Trouble Report No.',
    options: [
      { value: 'tr-number', label: 'Trouble Report Number' },
    ],
  },
  {
    category: 'By Line',
    options: [
      { value: 'tn-special', label: 'TN / Special Circuit' },
      { value: 'hsi-service', label: 'HSI Service' },
    ],
  },
  {
    category: 'By Circuit / Equipment',
    options: [
      { value: 'message-carrier', label: 'Message / Carrier' },
      { value: 'broadcast-video', label: 'Broadcast Video Circuit' },
      { value: 'ont-search', label: 'ONT Search' },
      { value: 'fast-packet', label: 'Fast Packet' },
      { value: 'enterprise-advance', label: 'Enterprise Advance' },
      { value: 'ip-nnmc', label: 'IP-NNMC' },
    ],
  },
  {
    category: 'By Location',
    options: [
      { value: 'service-address', label: 'Service Address Search' },
      { value: 'misc-search', label: 'Miscellaneous Search' },
    ],
  },
];

const TAB_ITEMS = SEARCH_TYPE_GROUPS.map((g) => ({ label: g.category }));
const ALL_SEARCH_TYPES = SEARCH_TYPE_GROUPS.flatMap((g) => g.options);

/* ─── Dropdown option sets ─── */
const RECORD_TYPES = [
  { value: 'fiber', label: 'Fiber' },
  { value: 'copper', label: 'Copper' },
  { value: 'coax', label: 'Coax' },
  { value: 'wireless', label: 'Wireless' },
];

const SERVICES = [
  { value: '', label: 'Select a service...' },
  { value: 'pots', label: 'POTS' },
  { value: 'dsl', label: 'DSL' },
  { value: 'fios', label: 'FiOS' },
  { value: 'special', label: 'Special' },
];

const REGIONS = [
  { value: '', label: 'Select a region...' },
  { value: 'ne', label: 'Northeast' },
  { value: 'se', label: 'Southeast' },
  { value: 'mw', label: 'Midwest' },
  { value: 'sw', label: 'Southwest' },
  { value: 'w', label: 'West' },
];

const STATES = [
  { value: '', label: 'Select a state...' },
  { value: 'NY', label: 'New York' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'VA', label: 'Virginia' },
  { value: 'MD', label: 'Maryland' },
  { value: 'FL', label: 'Florida' },
  { value: 'TX', label: 'Texas' },
  { value: 'CA', label: 'California' },
];

/* ═══════════════════════════════════════════════════════════════════
   Initial form state
   ═══════════════════════════════════════════════════════════════════ */
const INITIAL_FIELDS = {
  telephoneNumber1: '', extension1: '', recordType: 'fiber', service: '', dpa: '',
  hsi: false, lineInUse: false, oofLd: false, pfx1: '', svcMod1: '',
  telephoneNumber2: '', extension2: '', segment1: '', groupAccessCode: '',
  pfx2: '', svcMod2: '', serialSfx: '', company: '', segment2: '', region: '',
  circuitId: '', cac: '', trNumber: '', street: '', city: '', state: '',
  zipCode: '', equipmentId: '', segment: '', telephoneNumber: '', extension: '', identifier: '',
};

/* ═══════════════════════════════════════════════════════════════════
   CanvasSelect
   ═══════════════════════════════════════════════════════════════════ */
const CanvasSelect = ({ id, label, required, value, onChange, options }) => (
  <Stack direction="column" sx={{ gap: '4px' }}>
    <Typography component="label" htmlFor={id} sx={{ fontSize: 12, fontWeight: 500, color: required ? 'error.main' : 'text.primary' }}>
      {label}{required && ' *'}
    </Typography>
    <FormControl size="small" fullWidth>
      <Select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </Stack>
);

/* ═══════════════════════════════════════════════════════════════════
   Validation helpers
   ═══════════════════════════════════════════════════════════════════ */
const getRequiredFields = (searchType) => {
  switch (searchType) {
    case 'tn-special': return ['telephoneNumber1'];
    case 'hsi-service': return ['telephoneNumber'];
    case 'service-address': return ['street', 'city', 'state'];
    case 'tr-number': return ['serialSfx'];
    default: return ['identifier'];
  }
};

/* ═══════════════════════════════════════════════════════════════════
   Recent Searches
   ═══════════════════════════════════════════════════════════════════ */
const RECENT_KEY = 'vrepair_recent_searches';
const MAX_RECENT = 5;
const loadRecent = () => {
  try { return JSON.parse(sessionStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
};
const saveRecent = (entry) => {
  const list = loadRecent().filter(
    (r) => !(r.type === entry.type && r.identifier === entry.identifier),
  );
  list.unshift(entry);
  sessionStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
};

/* ═══════════════════════════════════════════════════════════════════
   Info tooltip icon
   ═══════════════════════════════════════════════════════════════════ */
const InfoTip = ({ content }) => (
  <Tooltip title={content} placement="top">
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'help',
        color: 'grey.300',
        transition: 'color 0.15s ease',
        '&:hover': { color: 'primary.main' },
      }}
    >
      <InfoOutlinedIcon fontSize="small" />
    </Box>
  </Tooltip>
);

/* ═══════════════════════════════════════════════════════════════════
   TN / Special Circuit — accordion field groups
   ═══════════════════════════════════════════════════════════════════ */
const TnSpecialFields = ({ f, set, setSelect, toggleFlag, errors }) => {
  const [openSections, setOpenSections] = useState({ primary: true });
  const toggle = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Stack direction="column" sx={{ gap: '16px', pb: '24px' }}>
      <Accordion expanded={openSections.primary !== false} onChange={() => toggle('primary')} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle2">Primary Telephone Line</Typography></AccordionSummary>
        <AccordionDetails>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '16px', rowGap: '16px' }}>
          <CanvasSelect id="record-type" label="Record Type" value={f.recordType} onChange={setSelect('recordType')} options={RECORD_TYPES} />
          <Stack direction="column" sx={{ gap: '4px' }}>
            <Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'error.main' }}>Telephone Number *</Typography>
            <TextField size="small" fullWidth placeholder="###-###-####" value={f.telephoneNumber1} onChange={set('telephoneNumber1')} error={!!errors.telephoneNumber1} helperText={errors.telephoneNumber1 || ''} />
          </Stack>
          <Stack direction="column" sx={{ gap: '4px' }}>
            <Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>Extension</Typography>
            <TextField size="small" fullWidth placeholder="e.g. 001" value={f.extension1} onChange={set('extension1')} />
          </Stack>
          <Stack direction="column" sx={{ gap: '4px' }}>
            <Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>DPA</Typography>
            <TextField size="small" fullWidth placeholder="e.g. 12345" value={f.dpa} onChange={set('dpa')} />
          </Stack>
          <CanvasSelect id="service" label="Service" value={f.service} onChange={setSelect('service')} options={SERVICES} />
          <Box />
          <Stack direction="column" sx={{ gap: '4px', gridColumn: 'span 2' }}>
            <Typography component="span" sx={{ fontSize: 12, fontWeight: 700, color: 'grey.800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Line Flags
            </Typography>
            <Stack direction="row" alignItems="center" sx={{ gap: '8px' }}>
              <FormControlLabel control={<Checkbox checked={f.hsi} onChange={(e) => toggleFlag('hsi', e.target.checked)} size="small" />} label="HSI" />
              <FormControlLabel control={<Checkbox checked={f.lineInUse} onChange={(e) => toggleFlag('lineInUse', e.target.checked)} size="small" />} label="Line In Use" />
              <FormControlLabel control={<Checkbox checked={f.oofLd} onChange={(e) => toggleFlag('oofLd', e.target.checked)} size="small" />} label="OOF LD" />
              <Stack direction="row" sx={{ gap: '4px', alignItems: 'center' }}>
                <InfoTip content="High Speed Internet" />
                <InfoTip content="Out of Frame / Loss of Data" />
              </Stack>
            </Stack>
          </Stack>
        </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={openSections.secondary || false} onChange={() => toggle('secondary')} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle2">Secondary Line / PFX</Typography></AccordionSummary>
        <AccordionDetails>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '16px', rowGap: '16px' }}>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>PFX</Typography><TextField size="small" fullWidth placeholder="e.g. 01" value={f.pfx1} onChange={set('pfx1')} /></Stack>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>SVC/MOD</Typography><TextField size="small" fullWidth placeholder="e.g. A1" value={f.svcMod1} onChange={set('svcMod1')} /></Stack>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>Telephone Number *</Typography><TextField size="small" fullWidth placeholder="###-###-####" value={f.telephoneNumber2} onChange={set('telephoneNumber2')} /></Stack>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>Extension</Typography><TextField size="small" fullWidth placeholder="e.g. 001" value={f.extension2} onChange={set('extension2')} /></Stack>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>Segment</Typography><TextField size="small" fullWidth placeholder="e.g. 01" value={f.segment1} onChange={set('segment1')} /></Stack>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>Group Access Code</Typography><TextField size="small" fullWidth placeholder="e.g. GAC-5678" value={f.groupAccessCode} onChange={set('groupAccessCode')} /></Stack>
        </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={openSections.equipment || false} onChange={() => toggle('equipment')} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle2">Equipment / Serial Details</Typography></AccordionSummary>
        <AccordionDetails>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '16px', rowGap: '16px' }}>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>PFX</Typography><TextField size="small" fullWidth placeholder="e.g. 01" value={f.pfx2} onChange={set('pfx2')} /></Stack>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>SVC/MOD</Typography><TextField size="small" fullWidth placeholder="e.g. A1" value={f.svcMod2} onChange={set('svcMod2')} /></Stack>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'error.main' }}>Serial Number / SFX *</Typography><TextField size="small" fullWidth placeholder="e.g. 001234/A" value={f.serialSfx} onChange={set('serialSfx')} error={!!errors.serialSfx} helperText={errors.serialSfx || ''} /></Stack>
          <Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>Segment</Typography><TextField size="small" fullWidth placeholder="e.g. 01" value={f.segment2} onChange={set('segment2')} /></Stack>
          <Box sx={{ gridColumn: 'span 2' }}><Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>Company</Typography><TextField size="small" fullWidth placeholder="e.g. Verizon" value={f.company} onChange={set('company')} /></Stack></Box>
          <Box sx={{ gridColumn: 'span 2' }}><CanvasSelect id="region" label="Region" value={f.region} onChange={setSelect('region')} options={REGIONS} /></Box>
        </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={openSections.circuit || false} onChange={() => toggle('circuit')} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle2">Circuit Identification</Typography></AccordionSummary>
        <AccordionDetails>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '16px', rowGap: '16px' }}>
          <Box sx={{ gridColumn: 'span 2' }}><Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>Circuit ID</Typography><TextField size="small" fullWidth placeholder="e.g. DHEC/123456" value={f.circuitId} onChange={set('circuitId')} /></Stack></Box>
          <Box sx={{ gridColumn: 'span 2' }}><Stack direction="column" sx={{ gap: '4px' }}><Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>Customer Access Code</Typography><TextField size="small" fullWidth placeholder="e.g. A1B2C3" value={f.cac} onChange={set('cac')} /></Stack></Box>
        </Box>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
};

const HsiServiceFields = ({ f, set, errors }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '16px', rowGap: '16px' }}>
    <Stack direction="column" sx={{ gap: '4px' }}>
      <Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'error.main' }}>Telephone Number *</Typography>
      <TextField size="small" fullWidth placeholder="###-###-####" value={f.telephoneNumber} onChange={set('telephoneNumber')} error={!!errors.telephoneNumber} helperText={errors.telephoneNumber || ''} />
    </Stack>
    <Stack direction="column" sx={{ gap: '4px' }}>
      <Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>Extension</Typography>
      <TextField size="small" fullWidth placeholder="e.g. 001" value={f.extension} onChange={set('extension')} />
    </Stack>
  </Box>
);

const TrNumberFields = ({ f, set, errors }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '16px', rowGap: '16px' }}>
    <Box sx={{ gridColumn: 'span 2' }}>
      <Stack direction="column" sx={{ gap: '4px' }}>
        <Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'error.main' }}>Trouble Report Number *</Typography>
        <TextField size="small" fullWidth placeholder="e.g. NYI1127246" value={f.serialSfx} onChange={set('serialSfx')} error={!!errors.serialSfx} helperText={errors.serialSfx || ''} />
      </Stack>
    </Box>
  </Box>
);

const ServiceAddressFields = ({ f, set, setSelect, errors }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '16px', rowGap: '16px', '& > *': { minWidth: 0 } }}>
    <Box sx={{ gridColumn: 'span 1' }}>
      <Stack direction="column" sx={{ gap: '4px' }}>
        <Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'error.main' }}>Street Address *</Typography>
        <TextField size="small" fullWidth placeholder="e.g. 123 Main Street" value={f.street} onChange={set('street')} error={!!errors.street} helperText={errors.street || ''} />
      </Stack>
    </Box>
    <Box sx={{ gridColumn: 'span 1' }}>
      <Stack direction="column" sx={{ gap: '4px' }}>
        <Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'error.main' }}>City *</Typography>
        <TextField size="small" fullWidth placeholder="e.g. New York" value={f.city} onChange={set('city')} error={!!errors.city} helperText={errors.city || ''} />
      </Stack>
    </Box>
    <Box sx={{ gridColumn: 'span 1' }}><CanvasSelect id="state" label="State" required value={f.state} onChange={setSelect('state')} options={STATES} /></Box>
    <Box sx={{ gridColumn: 'span 1' }}>
      <Stack direction="column" sx={{ gap: '4px' }}>
        <Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>ZIP Code</Typography>
        <TextField size="small" fullWidth placeholder="e.g. 10001" value={f.zipCode} onChange={set('zipCode')} />
      </Stack>
    </Box>
  </Box>
);

const SINGLE_FIELD_CONFIG = {
  'message-carrier': { label: 'Message / Carrier ID', placeholder: 'e.g. MSG-001234' },
  'broadcast-video': { label: 'Broadcast Video Circuit ID', placeholder: 'e.g. BVC-001234' },
  'ont-search': { label: 'ONT ID', placeholder: 'e.g. ONT-001234' },
  'fast-packet': { label: 'Fast Packet ID', placeholder: 'e.g. FP-001234' },
  'enterprise-advance': { label: 'Enterprise Advance ID', placeholder: 'e.g. EA-001234' },
  'ip-nnmc': { label: 'IP-NNMC ID', placeholder: 'e.g. NNMC-001234' },
  'misc-search': { label: 'Search Identifier', placeholder: 'Enter search value' },
};

const SingleFieldGroup = ({ searchType, f, set, errors }) => {
  const cfg = SINGLE_FIELD_CONFIG[searchType];
  if (!cfg) return null;
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '16px', rowGap: '16px' }}>
      <Box sx={{ gridColumn: 'span 2' }}>
        <Stack direction="column" sx={{ gap: '4px' }}>
          <Typography component="label" sx={{ fontSize: 12, fontWeight: 500, color: 'error.main' }}>{cfg.label} *</Typography>
          <TextField size="small" fullWidth placeholder={cfg.placeholder} value={f.identifier} onChange={set('identifier')} error={!!errors.identifier} helperText={errors.identifier || ''} />
        </Stack>
      </Box>
    </Box>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════════ */
export default function TroubleMgtSearchPage() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [searchType, setSearchType] = useState('tr-number');
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [errors, setErrors] = useState({});
  const [visible, setVisible] = useState(true);
  const [showSwitchWarning, setShowSwitchWarning] = useState(false);
  const [pendingSwitchType, setPendingSwitchType] = useState('');
  const [pendingCategoryIndex, setPendingCategoryIndex] = useState(null);
  const [recentSearches, setRecentSearches] = useState(loadRecent);
  const [recentOpen, setRecentOpen] = useState(false);
  const { openTab } = useTabsContext();
  const navigate = useNavigate();
  const fieldGroupRef = useRef(null);

  const activeGroup = SEARCH_TYPE_GROUPS[categoryIndex];

  const set = useCallback(
    (field) => (e) => {
      const value = e?.target ? e.target.value : e;
      setFields((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const setSelect = useCallback(
    (field) => (val) => {
      setFields((prev) => ({ ...prev, [field]: val }));
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const toggleFlag = useCallback((val, checked) => {
    setFields((prev) => ({ ...prev, [val]: checked }));
  }, []);

  const hasFilledFields = useCallback(() => {
    return Object.entries(fields).some(([key, val]) => {
      if (key === 'recordType') return false;
      if (typeof val === 'boolean') return val;
      return typeof val === 'string' && val.trim() !== '';
    });
  }, [fields]);

  const doSwitch = useCallback((val, catIdx) => {
    setVisible(false);
    setTimeout(() => {
      if (catIdx !== null && catIdx !== undefined) setCategoryIndex(catIdx);
      setSearchType(val);
      setFields(INITIAL_FIELDS);
      setErrors({});
      setShowSwitchWarning(false);
      setPendingSwitchType('');
      setPendingCategoryIndex(null);
      setVisible(true);
    }, 150);
  }, []);

  const handleSearchTypeChange = useCallback(
    (val) => {
      if (val === searchType) return;
      if (searchType && hasFilledFields()) {
        setPendingSwitchType(val);
        setShowSwitchWarning(true);
      } else {
        doSwitch(val, null);
      }
    },
    [searchType, hasFilledFields, doSwitch],
  );

  const handleCategoryChange = useCallback(
    (idx) => {
      if (idx === categoryIndex) return;
      if (searchType && hasFilledFields()) {
        setPendingCategoryIndex(idx);
        setPendingSwitchType('');
        setShowSwitchWarning(true);
      } else {
        setCategoryIndex(idx);
        const group = SEARCH_TYPE_GROUPS[idx];
        setSearchType(group.options[0].value);
        setFields(INITIAL_FIELDS);
        setErrors({});
      }
    },
    [categoryIndex, searchType, hasFilledFields],
  );

  const confirmSwitch = () => {
    if (pendingCategoryIndex !== null) {
      setCategoryIndex(pendingCategoryIndex);
      const group = SEARCH_TYPE_GROUPS[pendingCategoryIndex];
      doSwitch(group.options[0].value, pendingCategoryIndex);
    } else {
      doSwitch(pendingSwitchType, null);
    }
  };
  const cancelSwitch = () => {
    setShowSwitchWarning(false);
    setPendingSwitchType('');
    setPendingCategoryIndex(null);
  };

  useEffect(() => {
    if (visible && searchType && fieldGroupRef.current) {
      const firstInput = fieldGroupRef.current.querySelector('input:not([readonly]), select');
      if (firstInput) firstInput.focus();
    }
  }, [visible, searchType]);

  const getIdentifier = useCallback(() => {
    switch (searchType) {
      case 'tn-special': return fields.telephoneNumber1.trim();
      case 'hsi-service': return fields.telephoneNumber.trim();
      case 'tr-number': return fields.serialSfx.trim();
      case 'service-address': return fields.street.trim();
      default: return fields.identifier.trim();
    }
  }, [searchType, fields]);

  const handleSearch = () => {
    const nextErrors = {};
    getRequiredFields(searchType).forEach((key) => {
      const val = fields[key];
      const empty = val == null || (typeof val === 'string' && val.trim() === '');
      if (empty) nextErrors[key] = 'This field is required';
    });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    const id = getIdentifier();
    if (!id) {
      setErrors((prev) => ({ ...prev, identifier: 'Enter a value to search' }));
      return;
    }
    setErrors({});
    navigate('/ticket/' + encodeURIComponent(id));
    const typeLabel = ALL_SEARCH_TYPES.find((t) => t.value === searchType)?.label || '';
    saveRecent({ type: searchType, typeLabel, identifier: id });
    setRecentSearches(loadRecent());
  };
  const handleClear = () => { setFields(INITIAL_FIELDS); setErrors({}); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  const handleRecentClick = (entry) => {
    const encoded = encodeURIComponent(entry.identifier);
    openTab('tr-' + entry.identifier, entry.identifier, '/group-trouble/' + encoded);
    navigate('/group-trouble/' + encoded);
  };

  const renderFieldGroup = () => {
    if (!searchType) return null;
    const props = { f: fields, set, setSelect, toggleFlag, errors };
    switch (searchType) {
      case 'tn-special': return <TnSpecialFields {...props} />;
      case 'hsi-service': return <HsiServiceFields {...props} />;
      case 'tr-number': return <TrNumberFields {...props} />;
      case 'service-address': return <ServiceAddressFields {...props} />;
      default: return <SingleFieldGroup searchType={searchType} {...props} />;
    }
  };

  const typeLabel = ALL_SEARCH_TYPES.find((t) => t.value === searchType)?.label || '';

  return (
    <Stack
      direction="row"
      justifyContent="center"
      sx={{
        flex: 1,
        bgcolor: 'background.default',
        pt: '24px',
        px: '24px',
        overflowY: 'auto',
      }}
      onKeyDown={handleKeyDown}
    >
      <Stack direction="column" sx={{ width: '100%', gap: '16px', pb: '80px' }}>
        {/* ─── Page Header ─── */}
        <Box sx={{ pt: '8px' }}>
          <Typography variant="h4" component="h1" sx={{
 fontSize: 20, fontWeight: 700, color: 'text.primary', m: '0 0 4px 0', lineHeight: 1.3 }}>
            TRE Search
          </Typography>
          <Typography variant="body1" component="p" sx={{
 fontSize: 14, color: 'grey.500', m: 0 }}>
            Search for trouble reports using the criteria below.
          </Typography>
        </Box>

        {/* ─── Recent Searches ─── */}
        {recentSearches.length > 0 && (
          <Accordion expanded={recentOpen} onChange={() => setRecentOpen(!recentOpen)} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle2">{`Recent Searches (${recentSearches.length})`}</Typography></AccordionSummary>
            <AccordionDetails>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: '8px', py: '4px' }}>
              {recentSearches.map((entry, idx) => (
                <ButtonBase
                  key={`${entry.identifier}-${idx}`}
                  onClick={() => handleRecentClick(entry)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    py: '4px',
                    px: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '22px',
                    bgcolor: 'background.default',
                    fontSize: 11,
                    color: 'text.primary',
                    transition: 'background 0.15s ease, border-color 0.15s ease',
                    '&:hover': { bgcolor: 'action.hover', borderColor: 'grey.500' },
                  }}
                >
                  <Typography component="span" sx={{ fontWeight: 700, color: 'grey.500', fontSize: 'inherit' }}>{entry.typeLabel}</Typography>
                  <Typography component="span" sx={{ color: 'text.primary', fontSize: 'inherit' }}>{entry.identifier}</Typography>
                </ButtonBase>
              ))}
            </Stack>
            </AccordionDetails>
          </Accordion>
        )}

        <Divider />

        {/* ═══ Flow container ═══ */}
        <Stack direction="column" sx={{ gap: 0 }}>
          {/* ── Step 1 — Search Type ── */}
          <Box
            sx={{
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              py: '24px',
              px: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              borderRadius: '6px 6px 0 0',
              borderBottom: 'none',
            }}
          >
            <Stack direction="row" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '20px', overflow: 'hidden', mb: '8px', alignSelf: 'flex-start' }}>
              {TAB_ITEMS.map((tab, idx) => (
                <Box
                  key={tab.label}
                  component="button"
                  onClick={() => handleCategoryChange(idx)}
                  sx={{
                    px: '14px', py: '8px', fontSize: 12, fontWeight: categoryIndex === idx ? 700 : 400,
                    border: 'none', cursor: 'pointer', transition: 'background 0.12s ease',
                    bgcolor: categoryIndex === idx ? 'grey.900' : 'transparent',
                    color: categoryIndex === idx ? '#fff' : 'text.secondary',
                    fontFamily: '"Verizon-NHG-eDS","Verizon-NHG-eTX","Helvetica Neue",Arial,sans-serif',
                  }}
                >
                  {tab.label}
                </Box>
              ))}
            </Stack>

            {activeGroup.options.length > 1 && (
              <FormControl>
                <RadioGroup
                  row
                  name="search-type"
                  value={searchType}
                  onChange={(e) => handleSearchTypeChange(e.target.value)}
                >
                  {activeGroup.options.map((opt) => (
                    <FormControlLabel key={opt.value} value={opt.value} control={<Radio size="small" />} label={opt.label} />
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          </Box>

          {/* ── Connector ── */}
          <Box sx={{ height: 0, borderLeft: '2px solid', borderColor: 'divider', ml: '32px' }} />

          {/* ── Step 2 — Contextual Fields ── */}
          <Box
            ref={fieldGroupRef}
            sx={{
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              py: '24px',
              px: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              borderRadius: '0 0 6px 6px',
              transition: 'opacity 0.15s ease, transform 0.15s ease',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(8px)',
              pointerEvents: visible ? 'auto' : 'none',
            }}
          >
            {showSwitchWarning && (
              <>
                <Alert severity="warning" onClose={cancelSwitch}>Switching search type will clear your current entries.</Alert>
                <Stack direction="row" justifyContent="flex-end" sx={{ gap: '8px' }}>
                  <Button variant="outlined" size="small" onClick={cancelSwitch}>Cancel</Button>
                  <Button variant="contained" size="small" onClick={confirmSwitch}>Continue</Button>
                </Stack>
              </>
            )}

            {!showSwitchWarning && (
              <>
                {!searchType ? (
                  <Stack direction="column" alignItems="center" sx={{ gap: '12px', py: '32px', px: '16px' }}>
                    <SearchIcon sx={{ fontSize: 48, color: '#D8DADA' }} />
                    <Typography variant="body1" component="p" sx={{
 fontSize: 14, color: 'grey.300', m: 0, textAlign: 'center' }}>
                      Select a search type above to load the relevant fields.
                    </Typography>
                  </Stack>
                ) : (
                  renderFieldGroup()
                )}
              </>
            )}
          </Box>
        </Stack>

        {/* ─── Sticky Action Buttons ─── */}
        {searchType && !showSwitchWarning && (
          <Stack
            direction="row"
            justifyContent="flex-end"
            sx={{
              position: 'sticky',
              bottom: 0,
              gap: '8px',
              py: '12px',
              px: '24px',
              bgcolor: 'background.default',
              borderTop: '1px solid',
              borderColor: 'divider',
              borderRadius: '0 0 6px 6px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              zIndex: 10,
            }}
          >
            <Button variant="outlined" size="medium" onClick={handleClear}>Clear</Button>
            <Button variant="contained" size="medium" onClick={handleSearch}>Search</Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
