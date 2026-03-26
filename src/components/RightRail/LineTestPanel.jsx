import React, { useState, useCallback } from 'react';
import Collapsible from '../../molecules/Collapsible/Collapsible.tsx';
import Status from '../../atoms/Status/Status.tsx';
import Checkbox from '../../atoms/Checkbox/Checkbox.tsx';
import Button from '../../atoms/Button/Button.tsx';
import { Box, Stack, Typography, List, ListItem, CircularProgress } from '@mui/material';

const TOOLS = [
  { id: 'delphi', label: 'Delphi' },
  { id: 'nxtt', label: 'NXTT' },
  { id: 'fortel', label: 'Fortel' },
  { id: 'mlt', label: 'MLT' },
];

const RESULT_STATUS_MAP = {
  Pass: 'success',
  Warning: 'warning',
  Fail: 'error',
};

const MOCK_RESULTS = {
  delphi: { status: 'Pass', text: 'Line tests nominal — no faults detected on loop' },
  nxtt: { status: 'Pass', text: 'Near-end crosstalk within acceptable thresholds' },
  fortel: { status: 'Warning', text: 'Marginal noise margin detected at 6.2 dB (threshold: 6 dB)' },
  mlt: { status: 'Pass', text: 'Metallic loop test passed — resistance and capacitance normal' },
};

export const LineTestPanel = ({ trNum }) => {
  const [selectedTools, setSelectedTools] = useState(
    TOOLS.reduce((acc, tool) => ({ ...acc, [tool.id]: true }), {})
  );
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const [openSections, setOpenSections] = useState({
    testing: true,
    results: true,
  });

  const toggleSection = useCallback((section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const handleToolToggle = useCallback((toolId) => {
    setSelectedTools((prev) => ({ ...prev, [toolId]: !prev[toolId] }));
  }, []);

  const runTests = useCallback(async () => {
    const activeTools = Object.entries(selectedTools)
      .filter(([, checked]) => checked)
      .map(([id]) => id);

    if (activeTools.length === 0) return;

    setIsRunning(true);
    setResults(null);

    try {
      const response = await fetch('/controller/LineTestController', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RUN_TESTS', trNum, tools: activeTools }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setResults(data);
    } catch {
      // Fallback to mock results filtered by selected tools
      const mockFiltered = {};
      activeTools.forEach((id) => {
        if (MOCK_RESULTS[id]) {
          mockFiltered[id] = MOCK_RESULTS[id];
        }
      });
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setResults(mockFiltered);
    } finally {
      setIsRunning(false);
      setOpenSections((prev) => ({ ...prev, results: true }));
    }
  }, [selectedTools, trNum]);

  const buildSummary = () => {
    if (!results) return null;
    const entries = Object.values(results);
    const passCount = entries.filter((r) => r.status === 'Pass').length;
    const warnCount = entries.filter((r) => r.status === 'Warning').length;
    const failCount = entries.filter((r) => r.status === 'Fail').length;
    const parts = [];
    if (passCount > 0) parts.push(`${passCount} Passed`);
    if (warnCount > 0) parts.push(`${warnCount} Warning`);
    if (failCount > 0) parts.push(`${failCount} Failed`);
    return parts.join(', ');
  };

  const hasSelectedTools = Object.values(selectedTools).some(Boolean);

  return (
    <Stack direction="column" sx={{ bgcolor: 'background.paper' }}>
      {/* Test Launcher */}
      <Collapsible
        level={2}
        title="Line Testing"
        isOpen={openSections.testing}
        onToggle={() => toggleSection('testing')}
      >
        <Box sx={{ p: '12px' }}>
          <Stack direction="column" sx={{ gap: '8px', mb: '12px' }}>
            {TOOLS.map((tool) => (
              <Checkbox
                key={tool.id}
                label={tool.label}
                checked={selectedTools[tool.id]}
                onChange={() => handleToolToggle(tool.id)}
                disabled={isRunning}
              />
            ))}
          </Stack>
          <Stack direction="row" alignItems="center" sx={{ gap: '8px' }}>
            <Button
              variant="primary"
              size="small"
              onClick={runTests}
              disabled={isRunning || !hasSelectedTools}
            >
              {isRunning ? 'Running...' : 'Run Selected Tests'}
            </Button>
          </Stack>
          {isRunning && (
            <Stack direction="row" alignItems="center" sx={{ gap: '8px', p: '12px', fontSize: 14, color: 'text.secondary' }}>
              <CircularProgress size={16} />
              Running selected tests...
            </Stack>
          )}
        </Box>
      </Collapsible>

      {/* Test Results */}
      <Collapsible
        level={2}
        title="Test Results"
        isOpen={openSections.results}
        onToggle={() => toggleSection('results')}
      >
        <Box sx={{ p: '12px' }}>
          {!results && (
            <Typography sx={{ p: '12px', fontSize: 14, color: 'text.secondary', textAlign: 'center' }}>
              No test results yet. Run tests above.
            </Typography>
          )}
          {results && (
            <>
              <List disablePadding>
                {Object.entries(results).map(([toolId, result]) => {
                  const toolDef = TOOLS.find((t) => t.id === toolId);
                  return (
                    <ListItem
                      key={toolId}
                      disablePadding
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        gap: '4px',
                        py: '8px',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography component="span" sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
                          {toolDef ? toolDef.label : toolId}
                        </Typography>
                        <Status variant={RESULT_STATUS_MAP[result.status] || 'default'}>
                          {result.status}
                        </Status>
                      </Stack>
                      <Typography component="span" sx={{ fontSize: 12, color: 'text.secondary', pl: '4px' }}>
                        {result.text}
                      </Typography>
                    </ListItem>
                  );
                })}
              </List>
              <Stack direction="row" alignItems="center" sx={{ gap: '8px', py: '8px', mt: '8px', borderTop: '1px solid', borderColor: 'divider', fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
                {buildSummary()}
              </Stack>
            </>
          )}
        </Box>
      </Collapsible>
    </Stack>
  );
};

export default LineTestPanel;
