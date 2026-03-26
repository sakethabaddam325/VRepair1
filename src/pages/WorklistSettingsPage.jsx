import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext.jsx';
import { getWorklistSettings, updateWorklistSettings, getMyWorklists } from '../api/worklistApi.js';
import { Box, Stack, Typography, FormControl, Select, MenuItem, Button, Switch, CircularProgress, Alert, Paper, RadioGroup, FormControlLabel, Radio, FormLabel, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FONT_COLOR_OPTIONS = [
  { id: 'default', label: 'Default (Black)' },
  { id: 'dark-grey', label: 'Dark Grey' },
  { id: 'navy', label: 'Navy' },
];

const HIGHLIGHT_COLOR_OPTIONS = [
  { id: '#FFF9C4', label: 'Yellow' },
  { id: '#E3F2FD', label: 'Blue' },
  { id: '#E8F5E9', label: 'Green' },
  { id: '#FFF3E0', label: 'Orange' },
  { id: '#FCE4EC', label: 'Pink' },
  { id: 'none', label: 'None' },
];

const TEXT_COLOR_OPTIONS = [
  { id: '#1A1A1A', label: 'Dark (Default)' },
  { id: '#333333', label: 'Medium Dark' },
  { id: '#0D47A1', label: 'Navy Blue' },
];

const ESC_LEVEL_COLORS = [
  { id: '#FF5252', label: 'Red' },
  { id: '#FF9800', label: 'Orange' },
  { id: '#FFC107', label: 'Amber' },
  { id: '#4CAF50', label: 'Green' },
  { id: '#2196F3', label: 'Blue' },
];

const TAB_OPTIONS = [
  { label: 'My Worklist (NDS)', value: 'myWorklist' },
  { label: 'DS View', value: 'dsView' },
  { label: 'UAS View', value: 'uasView' },
];

const DEFAULT_SETTINGS = {
  boldFont: false,
  highlightColor: '#FFF9C4',
  textColor: '#1A1A1A',
  escLevel1: '#FF5252',
  escLevel2: '#FF9800',
  escLevel3: '#FFC107',
  priorityOverride1: false,
  priorityOverride2: false,
  priorityOverride3: false,
  tabOption: 'myWorklist',
  ebStatusNds: true,
  ebStatusDs: false,
  defaultWorklistId: '',
};

const fieldLabelSx = {
  fontSize: 12,
  fontWeight: 500,
  color: 'grey.900',
};

export default function WorklistSettingsPage() {
  const { addToast } = useAppContext();

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [worklists, setWorklists] = useState([]);

  const [sections, setSections] = useState({
    display: true,
    escalation: true,
    layout: true,
    defaultWl: true,
  });

  const toggleSection = (key) =>
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, worklistsRes] = await Promise.all([
        getWorklistSettings(),
        getMyWorklists(),
      ]);
      const s = settingsRes.data || {};
      setSettings((prev) => ({ ...prev, ...s }));
      setWorklists(worklistsRes.data || []);
    } catch {
      addToast('Failed to load settings', 'danger');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateWorklistSettings(settings);
      addToast('Settings saved successfully', 'success');
    } catch {
      addToast('Failed to save settings', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    addToast('Settings reset to defaults', 'info');
  };

  const worklistItems = worklists.map((wl) => ({ id: wl.id, label: wl.name }));

  const selectedWl = worklists.find((wl) => wl.id === settings.defaultWorklistId);
  const previewItems = [
    { label: 'Bold Font', value: settings.boldFont ? 'Enabled' : 'Disabled' },
    { label: 'Highlight Color', value: HIGHLIGHT_COLOR_OPTIONS.find((o) => o.id === settings.highlightColor)?.label || settings.highlightColor },
    { label: 'Text Color', value: TEXT_COLOR_OPTIONS.find((o) => o.id === settings.textColor)?.label || settings.textColor },
    { label: 'Esc Level 1', value: ESC_LEVEL_COLORS.find((o) => o.id === settings.escLevel1)?.label || settings.escLevel1 },
    { label: 'Esc Level 2', value: ESC_LEVEL_COLORS.find((o) => o.id === settings.escLevel2)?.label || settings.escLevel2 },
    { label: 'Esc Level 3', value: ESC_LEVEL_COLORS.find((o) => o.id === settings.escLevel3)?.label || settings.escLevel3 },
    { label: 'Tab Option', value: TAB_OPTIONS.find((o) => o.value === settings.tabOption)?.label || settings.tabOption },
    { label: 'Default Worklist', value: selectedWl?.name || '(none)' },
  ];

  if (loading) {
    return (
      <Stack justifyContent="center" alignItems="center" sx={{ p: '32px' }}>
        <CircularProgress size={20} />
      </Stack>
    );
  }

  return (
    <Box sx={{ p: '16px 24px',
 }}>
      <Box sx={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Settings Sections */}
        <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Section 1: Display Appearance */}
          <Accordion expanded={sections.display} onChange={() => toggleSection('display')} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle2" fontWeight={700}>Display Appearance</Typography></AccordionSummary>
            <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', p: '16px' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                <Stack direction="column" sx={{ gap: '4px' }}>
                  <Typography component="span" sx={fieldLabelSx}>Bold Font Color</Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={settings.boldFont ? 'bold' : 'default'}
                      onChange={(e) => updateSetting('boldFont', e.target.value !== 'default')}
                    >
                      {FONT_COLOR_OPTIONS.map((opt) => (
                        <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <Stack direction="column" sx={{ gap: '4px' }}>
                  <Typography component="span" sx={fieldLabelSx}>Highlight Color</Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={settings.highlightColor}
                      onChange={(e) => updateSetting('highlightColor', e.target.value)}
                    >
                      {HIGHLIGHT_COLOR_OPTIONS.map((opt) => (
                        <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <Stack direction="column" sx={{ gap: '4px' }}>
                  <Typography component="span" sx={fieldLabelSx}>Text Color</Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={settings.textColor}
                      onChange={(e) => updateSetting('textColor', e.target.value)}
                    >
                      {TEXT_COLOR_OPTIONS.map((opt) => (
                        <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
            </Box>
            </AccordionDetails>
          </Accordion>

          {/* Section 2: Priority & Escalation Indicators */}
          <Accordion expanded={sections.escalation} onChange={() => toggleSection('escalation')} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle2" fontWeight={700}>Priority &amp; Escalation Indicators</Typography></AccordionSummary>
            <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', p: '16px' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Escalation Level 1', key: 'escLevel1' },
                  { label: 'Escalation Level 2', key: 'escLevel2' },
                  { label: 'Escalation Level 3', key: 'escLevel3' },
                ].map(({ label, key }) => (
                  <Stack key={key} direction="column" sx={{ gap: '4px' }}>
                    <Typography component="span" sx={fieldLabelSx}>{label}</Typography>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={settings[key]}
                        onChange={(e) => updateSetting(key, e.target.value)}
                      >
                        {ESC_LEVEL_COLORS.map((opt) => (
                          <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Priority Override Level 1', key: 'priorityOverride1' },
                  { label: 'Priority Override Level 2', key: 'priorityOverride2' },
                  { label: 'Priority Override Level 3', key: 'priorityOverride3' },
                ].map(({ label, key }) => (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Typography component="span" sx={fieldLabelSx}>{label}</Typography>
                    <Switch
                      checked={settings[key]}
                      onChange={() => updateSetting(key, !settings[key])}
                      inputProps={{ 'aria-label': label }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
            </AccordionDetails>
          </Accordion>

          {/* Section 3: Layout Options */}
          <Accordion expanded={sections.layout} onChange={() => toggleSection('layout')} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle2" fontWeight={700}>Layout Options</Typography></AccordionSummary>
            <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', p: '16px' }}>
              <FormControl>
                <FormLabel sx={{ fontSize: 12, fontWeight: 500, mb: '4px' }}>NDS / DS / UAS Tab Option</FormLabel>
                <RadioGroup
                  row
                  name="tabOption"
                  value={settings.tabOption}
                  onChange={(e) => updateSetting('tabOption', e.target.value)}
                >
                  {TAB_OPTIONS.map((opt) => (
                    <FormControlLabel key={opt.value} value={opt.value} control={<Radio size="small" />} label={opt.label} />
                  ))}
                </RadioGroup>
              </FormControl>
              <Box sx={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {[
                  { label: 'EB Status — NDS', key: 'ebStatusNds', ariaLabel: 'EB Status NDS' },
                  { label: 'EB Status — DS', key: 'ebStatusDs', ariaLabel: 'EB Status DS' },
                ].map(({ label, key, ariaLabel }) => (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Typography component="span" sx={fieldLabelSx}>{label}</Typography>
                    <Switch
                      checked={settings[key]}
                      onChange={() => updateSetting(key, !settings[key])}
                      inputProps={{ 'aria-label': ariaLabel }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
            </AccordionDetails>
          </Accordion>

          {/* Section 4: Default Worklist */}
          <Accordion expanded={sections.defaultWl} onChange={() => toggleSection('defaultWl')} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle2" fontWeight={700}>Default Worklist</Typography></AccordionSummary>
            <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', p: '16px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Typography component="span" sx={fieldLabelSx}>Select Default Worklist</Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={settings.defaultWorklistId}
                    onChange={(e) => updateSetting('defaultWorklistId', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value=""><em>Search worklists</em></MenuItem>
                    {worklistItems.map((item) => (
                      <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {selectedWl && (
                <Alert severity="info">{`"${selectedWl.name}" will open automatically when you log in.`}</Alert>
              )}
            </Box>
            </AccordionDetails>
          </Accordion>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: '12px', pt: '8px' }}>
            <Button variant="contained" size="medium" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button variant="outlined" size="medium" onClick={handleReset}>
              Reset to Defaults
            </Button>
          </Box>
        </Box>

        {/* Live Preview Panel */}
        <Box sx={{ flex: 1, minWidth: 260, position: 'sticky', top: '16px' }}>
          <Typography component="h3" sx={{ fontSize: 20, fontWeight: 700, color: 'grey.900', m: '0 0 12px' }}>
            Live Preview
          </Typography>
          <Paper elevation={0} variant="outlined" sx={{ p: '16px' }}>
            {previewItems.map(({ label, value }) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: '4px', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography component="span" sx={{ fontSize: 12, fontWeight: 500, color: 'text.secondary' }}>{label}</Typography>
                <Typography component="span" sx={{ fontSize: 12, color: 'text.primary' }}>{value}</Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
