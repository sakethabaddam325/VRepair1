import React, { useState, useCallback } from 'react';
import Modal from './Modal.jsx';
import { useAppContext } from '../contexts/AppContext.jsx';
import { flagUnflagTicket, updatePropertyUBICode } from '../api/propertyApi.js';
import { refreshLineSearchData } from '../api/lineSearchApi.js';
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const headerBtnSx = {
  fontSize: '10px',
  lineHeight: '14px',
  py: '2px',
  px: '10px',
  borderRadius: '12px',
  color: '#333',
  borderColor: '#666',
  bgcolor: 'transparent',
  textTransform: 'none',
  fontWeight: 700,
  fontFamily: '"Verizon-NHG-eDS", "Verizon-NHG-eTX", "Helvetica Neue", Arial, sans-serif',
  minWidth: 0,
  '&:hover': {
    borderColor: '#333',
    bgcolor: 'rgba(0,0,0,0.04)',
  },
};

const headerBtnDisabledSx = {
  ...headerBtnSx,
  color: '#999',
  borderColor: '#BBB',
  bgcolor: '#E8E8E8',
};

const headerBtnSubmitSx = {
  ...headerBtnSx,
  color: '#fff',
  bgcolor: '#666',
  borderColor: '#666',
  '&:hover': {
    bgcolor: '#555',
    borderColor: '#555',
  },
};

const LAYOUT_TYPES = {
  FP: 'FP',
  IP: 'IP',
  EA: 'EA',
  DS: 'DS',
  VOL: 'VOL',
  GROUP: 'GROUP',
  SPL: 'SPL',
  LR: 'LR',
  STANDARD: 'STANDARD',
};

const metadataLabelSx = {
  fontWeight: 400,
  fontSize: '10px',
  color: '#747676',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  lineHeight: '12px',
  letterSpacing: '0.2px',
};

const metadataValueSx = {
  fontSize: '12px',
  color: '#000',
  fontWeight: 700,
  lineHeight: '16px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const metadataGridSx = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: '6px 16px',
  width: '100%',
  fontSize: '12px',
  lineHeight: '16px',
};

const metadataGridGroupSx = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: '6px 16px',
  width: '100%',
  fontSize: '12px',
  lineHeight: '16px',
};

/** Reported D/T — `refreshDT` may be set without `reportedDate` (e.g. WLN REPORTED_DATE_GROUP). */
const pickReportedDateFromTrData = (td) => {
  if (!td || typeof td !== 'object') return '';
  const v = td.reportedDate ?? td.refreshDT ?? '';
  return v == null || v === '' ? '' : String(v);
};

const CustomerInfoHeader = ({
  layoutType = LAYOUT_TYPES.STANDARD,
  trData = {},
  onRefresh,
  onClear,
  sessionUniqueKey,
}) => {
  const { showAlert } = useAppContext();
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [ubiCodeModalOpen, setUbiCodeModalOpen] = useState(false);
  const [ubiCode, setUbiCode] = useState('');

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      try {
        await refreshLineSearchData({ sessionUniqueKey, actionCode: 'REFRESH' });
      } catch {
        showAlert('Error refreshing data. Please try again.');
      }
    }
  }, [onRefresh, sessionUniqueKey, showAlert]);

  const handleClear = useCallback(() => {
    if (window.confirm('Any unsaved data will be lost. Do you wish to continue?')) {
      if (onClear) onClear();
    }
  }, [onClear]);

  const handleFlagUnflag = useCallback(async () => {
    try {
      const response = await flagUnflagTicket({
        sessionUniqueKey,
        actionCode: 'FLAG_UNFLAG_TKT_REQ',
        trNum: trData.trNum,
      });
      if (response.data) {
        showAlert(response.data.message || 'Flag status updated successfully.');
      }
    } catch {
      showAlert('Error updating flag status. Please try again.');
    }
  }, [sessionUniqueKey, trData.trNum, showAlert]);

  const handleUpdateUBI = useCallback(async () => {
    try {
      await updatePropertyUBICode({ sessionUniqueKey, propertyUBICode: ubiCode });
      setUbiCodeModalOpen(false);
      showAlert('UBI Code updated successfully.');
      handleRefresh();
    } catch {
      showAlert('Error updating UBI Code. Please try again.');
    }
  }, [ubiCode, sessionUniqueKey, showAlert, handleRefresh]);

  const renderReadonlyValue = (value) => (
    <Typography
      component="span"
      variant="body2"
      sx={{ lineHeight: (theme) => theme.typography.body2.lineHeight, color: 'text.primary' }}
    >
      {value || '\u00A0'}
    </Typography>
  );

  /**
   * Shows `value` in the cell; if empty, falls back to `tooltipText` (e.g. full name when id is blank).
   * Tooltip only when both differ (short id vs full name) — avoids an empty cell with a hover-only name
   * and reduces stray popovers. Read-only grid: no focus-triggered tooltip.
   */
  const renderTooltipValue = (value, tooltipText) => {
    const v = value == null || value === '' ? '' : String(value);
    const t = tooltipText == null || tooltipText === '' ? '' : String(tooltipText);
    const display = v || t;
    const showTip = Boolean(v && t && t !== v);

    const inner = (
      <Typography
        component="span"
        sx={{ ...metadataValueSx, cursor: showTip ? 'help' : 'default' }}
      >
        {display || '\u00A0'}
      </Typography>
    );

    if (!showTip) return inner;

    return (
      <Tooltip
        title={t}
        arrow
        placement="top"
        disableInteractive
        disableFocusListener
        enterTouchDelay={400}
      >
        {inner}
      </Tooltip>
    );
  };

  const renderFPLayout = () => (
    <Box sx={metadataGridSx}>
      {renderLabelValue('Trouble Report#', trData.trNum)}
      {renderLabelValue('Service Type', trData.serviceType)}
      {renderLabelValue('Line Status', trData.lineStatus)}
      {renderLabelValue('Reported D/T', pickReportedDateFromTrData(trData))}
      {renderLabelValue('Time Zone', trData.timeZone)}
      {renderLabelValue('Circuit ID/TN', trData.circuitId)}

      {renderLabelValue('Product Type', trData.productType)}
      {renderLabelValue('National?', trData.national)}
      {renderLabelValue('Maint Ctr', trData.maintCtr)}
      {renderLabelValue('Rate', trData.rate)}
      {renderLabelValue('EA Svcs', trData.eaSvcs)}
      {renderLabelValue('Created By', trData.createdBy)}

      {renderLabelValue('ILEC/Trans. CktID', trData.ilecTransCktId)}
      {renderLabelValue('Assigned', trData.assigned)}
      {renderLabelValue('Locked', trData.locked)}
      {renderLabelValue('VzB Circuit ID', trData.vzbCircuitId)}
      {renderLabelValue('Conn. Type', trData.connType)}
      {renderLabelValue('Service Info', trData.serviceInfo)}

      {renderLabelValue('Refresh D/T', trData.refreshDT)}
      <Box />
      <Box />
      <Box />
      <Box />
      <Box />
    </Box>
  );

  const renderLabelValue = (label, value) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
      <Box component="span" sx={metadataLabelSx}>{label}</Box>
      <Box component="span" sx={metadataValueSx}>{value || '\u00A0'}</Box>
    </Box>
  );

  const renderGroupLayout = () => (
    <Box sx={metadataGridGroupSx}>
      {/* Row 1 — matches SIT top row */}
      {renderLabelValue('Activity Status List', trData.status || 'PP')}
      {renderLabelValue('Application', 'VREPAIR')}
      {renderLabelValue('Created By', trData.createdBy)}
      {renderLabelValue('Reported Date', pickReportedDateFromTrData(trData))}
      {renderLabelValue('Assigned User', trData.assigned)}
      {renderLabelValue('Severity', trData.severity || trData.groupSeverity)}

      {/* Row 2 — matches SIT second row */}
      {renderLabelValue('Maintenance Center', trData.maintCtr)}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0, gridColumn: 'span 2' }}>
        <Box component="span" sx={{ ...metadataLabelSx, color: '#D52B1E' }}>Trouble Description</Box>
        <Box component="span" sx={metadataValueSx}>{trData.troubleNarrative || trData.troubleDesc || '\u00A0'}</Box>
      </Box>
      <Box />
      <Box />
      <Box />
    </Box>
  );

  const renderStandardLayout = () => (
    <Box sx={metadataGridGroupSx}>
      {/* Row 1 */}
      {renderLabelValue('TR#', trData.trNum)}
      {renderLabelValue('Line Status', trData.lineStatus)}
      {renderLabelValue('Reported D/T', pickReportedDateFromTrData(trData))}
      {renderLabelValue('Circuit ID/TN', trData.circuitId)}
      {renderLabelValue('Expert Care', trData.expertCare)}
      {renderLabelValue('Suspend', trData.suspend)}

      {/* Row 2 */}
      {renderLabelValue('Maint Center', trData.maintCtr)}
      {renderLabelValue('Class Of SVC', trData.classOfSvc)}
      {renderLabelValue('Deny', trData.deny)}
      {renderLabelValue('Locked', trData.locked)}
      {renderLabelValue('Assigned', trData.assigned)}
      {renderLabelValue('Service Info', trData.serviceInfo)}

      {/* Row 3 */}
      {renderLabelValue('Refresh D/T', trData.refreshDT)}
      <Box />
      <Box />
      <Box />
      <Box />
      <Box />
    </Box>
  );

  const renderLayout = () => {
    const layoutMap = {
      [LAYOUT_TYPES.FP]: renderFPLayout,
      [LAYOUT_TYPES.GROUP]: renderGroupLayout,
      [LAYOUT_TYPES.STANDARD]: renderStandardLayout,
      [LAYOUT_TYPES.IP]: renderStandardLayout,
      [LAYOUT_TYPES.EA]: renderStandardLayout,
      [LAYOUT_TYPES.DS]: renderStandardLayout,
      [LAYOUT_TYPES.VOL]: renderStandardLayout,
      [LAYOUT_TYPES.SPL]: renderStandardLayout,
      [LAYOUT_TYPES.LR]: renderStandardLayout,
    };
    return (layoutMap[layoutType] || renderStandardLayout)();
  };

  return (
    <Box
      id="customerInfoHolder"
      sx={{ fontSize: '12px', bgcolor: 'background.default', mb: '4px' }}
    >
      <Accordion
        expanded={isHeaderExpanded}
        onChange={() => setIsHeaderExpanded((prev) => !prev)}
        disableGutters
        elevation={0}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          component="div"
          role="button"
          tabIndex={0}
          sx={{
            cursor: 'pointer',
            '& .MuiAccordionSummary-content': {
              my: 0,
              alignItems: 'center',
              minHeight: 0,
              ml: 0.5,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Typography
              component="span"
              sx={{ fontWeight: 700, fontSize: '12px', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {trData.trNum ? `EVT-${trData.trNum}` : 'Customer Info'}
            </Typography>

            <Stack direction="row" sx={{ gap: '4px', flexShrink: 0, alignItems: 'center' }}>
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); }} sx={headerBtnSx}>
                Group Fixed
              </Button>
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); }} sx={headerBtnSx}>
                Add Remarks&nbsp;▾
              </Button>
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); }} sx={headerBtnDisabledSx} disabled>
                Copy to New&nbsp;▾
              </Button>
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); handleRefresh(); }} sx={headerBtnSx}>
                Refresh
              </Button>
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); handleFlagUnflag(); }} sx={headerBtnSx}>
                I want to
              </Button>
              <Button size="small" variant="contained" onClick={(e) => { e.stopPropagation(); handleClear(); }} sx={headerBtnSubmitSx}>
                Submit
              </Button>
            </Stack>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: '8px 10px' }}>
          {renderLayout()}
        </AccordionDetails>
      </Accordion>

      <Modal
        isOpen={ubiCodeModalOpen}
        onClose={() => setUbiCodeModalOpen(false)}
        title="Update UBI Code"
        width={350}
        footer={
          <Stack direction="row" justifyContent="flex-end" sx={{ gap: 1 }}>
            <Button size="small" variant="contained" onClick={handleUpdateUBI}>
              Update
            </Button>
            <Button size="small" variant="outlined" onClick={() => setUbiCodeModalOpen(false)}>
              Cancel
            </Button>
          </Stack>
        }
      >
        <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
          <Typography
            variant="subtitle2"
            component="label"
            sx={{ fontSize: (theme) => theme.typography.body2.fontSize, color: 'text.primary' }}
          >
            UBI Code:
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            value={ubiCode}
            onChange={(e) => setUbiCode(e.target.value)}
            sx={{ width: 200 }}
          />
        </Stack>
      </Modal>

    </Box>
  );
};

export default CustomerInfoHeader;
