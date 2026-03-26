import React, { useState, useEffect, useCallback } from 'react';
import DataGrid from '../components/DataGrid.jsx';
import AssociatedHistoryGrid from '../components/AssociatedHistoryGrid.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useAppContext } from '../contexts/AppContext.jsx';
import { loadGroupHistoryGrids, loadGroupHistoryIPModules, copyGroupHistory, fetchWlnGroupHistory } from '../api/groupTroubleApi.js';
import { mapHistoryResponse } from '../utils/historyMapper.js';
import { useGroupSearch } from '../contexts/GroupSearchContext.jsx';

import { loadETMSHistoryDetails, getETMSHistoryGrid } from '../api/inventoryApi.js';
import { TICKET_STATUSES } from '../constants/appConstants.js';
import { Box, Stack, Typography, TextField, MenuItem } from '@mui/material';

/**
 * Toggle: set to true  → use old GroupHistoryController (form POST)
 *         set to false → call real API POST /wlnGroupHistory (query params)
 */
const USE_MOCK = false;

const filterSelectSx = { width: '180px', '& .MuiInputBase-input': { fontSize: 11 } };

const GroupTroubleHistory = ({ trNum, sessionUniqueKey, isIP = false, sourceLink = 'GTRM' }) => {
  const { showAlert, userID } = useAppContext();
  const { groupType, groupRetrieveRspVO } = useGroupSearch();
  const [isLoading, setIsLoading] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [assoHistoryRows, setAssoHistoryRows] = useState([]);
  const [etmsHistoryRows, setEtmsHistoryRows] = useState([]);
  const [filterDDMValue, setFilterDDMValue] = useState('');
  const [filterOptions, setFilterOptions] = useState([]);
  const [viewSummary, setViewSummary] = useState(false);
  const [viewSummaryAssc, setViewSummaryAssc] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [productDDMOptions, setProductDDMOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [showETMSHistory, setShowETMSHistory] = useState(false);
  const [productCounts, setProductCounts] = useState('');

  useEffect(() => {
    if (sourceLink === 'ETMS') {
      setShowETMSHistory(true);
      loadETMSHistory();
    } else if (isIP) {
      loadIPModuleHistory();
    } else {
      loadHistory();
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      let response;
      if (USE_MOCK) {
        response = await loadGroupHistoryGrids(sessionUniqueKey);
      } else {
        try {
          response = await fetchWlnGroupHistory({
            userId:          userID || 'GONDCH7', // fallback to hardcoded user for non-authenticated contexts; should be overridden by caller
            groupTroubleNum: trNum,
            historyOption:   isIP ? 'I' : 'T',
            groupType:       groupRetrieveRspVO?.groupType ?? '',
            groupName:       groupRetrieveRspVO?.groupName ?? '',
            regionId:        groupRetrieveRspVO?.regionId  ?? '',
          });
        } catch (apiErr) {
          console.error('[History] Real API failed, falling back:', apiErr);
          response = await loadGroupHistoryGrids(sessionUniqueKey);
        }
      }
      const { historyRows: hr, assoHistoryRows: ahr, filterOptions: fo } = mapHistoryResponse(response.data);
      setHistoryRows(hr);
      setAssoHistoryRows(ahr);
      if (fo.length > 0) setFilterOptions(fo);
    } catch {
      showAlert('Error loading History. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionUniqueKey, showAlert, userID, trNum, isIP, groupType, groupRetrieveRspVO]);

  const loadIPModuleHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await loadGroupHistoryIPModules(sessionUniqueKey);
      if (response.data) {
        setHistoryRows(Array.isArray(response.data.historyRows) ? response.data.historyRows : []);
        setProductDDMOptions(Array.isArray(response.data.products) ? response.data.products : []);
      }
    } catch {
      showAlert('Error loading IP Module History.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionUniqueKey, showAlert]);

  const loadETMSHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const initResponse = await loadETMSHistoryDetails({ sSessionUniqueKey: sessionUniqueKey });
      if (initResponse.data) {
        setProductDDMOptions(Array.isArray(initResponse.data.productDDM) ? initResponse.data.productDDM : []);
        setProductCounts(initResponse.data.productCount || '');
        if (initResponse.data.primaryProduct) {
          setSelectedProduct(initResponse.data.primaryProduct.elementID || '');
        }
      }
    } catch {
      showAlert('Error loading ETMS History.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionUniqueKey, showAlert]);

  const handleCopyHistory = useCallback(async (copyTrNum) => {
    try {
      const response = await copyGroupHistory(sessionUniqueKey, copyTrNum);
      if (response.data?.success) {
        showAlert('History copied successfully.');
        loadHistory();
      } else {
        showAlert(response.data?.message || 'Error copying history.');
      }
    } catch {
      showAlert('Error copying history. Please try again.');
    }
  }, [sessionUniqueKey, showAlert, loadHistory]);

  const handleRowDoubleClick = useCallback((row) => {
    if (!row.trNum) return;
    const trNumber = String(row.trNum);
    if (trNumber.length > 13) {
      showAlert('Navigating to SOI: ' + trNumber);
    } else if (row.historyOption === 'ETMS') {
      showAlert('Navigating to ETMS ticket: ' + trNumber);
    } else if (row.trType === 'GTRM' || row.trType === 'GTRE') {
      showAlert('Navigating to Group TR: ' + trNumber);
    } else {
      showAlert('Navigating to TR: ' + trNumber);
    }
  }, [showAlert]);

  const contextMenuItems = useCallback((row) => {
    return [
      {
        label: 'Copy',
        onClick: () => {
          const status = row.stat || '';
          if (status === TICKET_STATUSES.OPEN || status === TICKET_STATUSES.CANCELLED) {
            showAlert('Cannot copy a ticket with status: ' + status);
            return;
          }
          if (selectedItems.length > 0) {
            showAlert('Copying multiple items: ' + selectedItems.join('|'));
          } else {
            handleCopyHistory(row.trNum);
          }
        },
      },
    ];
  }, [selectedItems, showAlert, handleCopyHistory]);

  const getVisibleColumns = useCallback(() => {
    const allColumns = [
      { field: 'checkbox', label: '', width: 30, formatter: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Checkbox
            checked={selectedItems.includes(row.trNum)}
            onChange={(e) => {
              setSelectedItems((prev) =>
                e.target.checked ? [...prev, row.trNum] : prev.filter((t) => t !== row.trNum)
              );
            }}
          />
        </Box>
      )},
      { field: 'trNum', label: 'TR# / ORD #', width: 90 },
      { field: 'grpName', label: 'GROUP NAME', width: 190 },
      { field: 'repDate', label: 'RPTD DATE', width: 120 },
      { field: 'resDate', label: 'RESTORED DATE', width: 120 },
      { field: 'closedDate', label: 'CLOSED DATE', width: 120 },
      { field: 'stat', label: 'STAT', width: 50 },
      { field: 'trType', label: 'TYPE', width: 40 },
      { field: 'priority', label: 'PRI', width: 40 },
      ...(!viewSummary ? [
        { field: 'dispCode', label: 'DISP', width: 65 },
        { field: 'causeAnalysis', label: 'CAUSE', width: 65 },
        { field: 'outOfSvc', label: 'OS', width: 40 },
        { field: 'exclReason', label: 'EXC', width: 50 },
        { field: 'dspClosedID', label: 'CLOSED ID', width: 60 },
        { field: 'dspTech', label: 'DSP TECH', width: 80 },
        { field: 'l1Disp', label: 'L1 DISP', width: 60 },
        { field: 'l1Cause', label: 'L1 CAUSE', width: 60 },
      ] : []),
      ...(viewSummary ? [
        { field: 'summary', label: 'SUMMARY/CLOSE OUT DESC', width: 250, wrap: true },
        { field: 'troubleNarrative', label: 'TROUBLE NARRATIVE', width: 250, wrap: true },
      ] : []),
      { field: 'closedByCenter', label: 'CLOSED BY CENTER', width: 100 },
    ];
    return allColumns;
  }, [viewSummary, selectedItems]);

  const filteredHistoryRows = useCallback(() => {
    let rows = historyRows;
    if (filterDDMValue) {
      rows = rows.filter((r) => r.grpName === filterDDMValue);
    }
    return rows;
  }, [historyRows, filterDDMValue]);

  return (
    <Box sx={{
 fontSize: 12, p: '5px' }}>
      {isLoading && <LoadingSpinner />}

      {/* Filter Toolbar */}
      <Stack direction="row" alignItems="center" sx={{ gap: '10px', mb: '5px' }}>
        <Typography component="span" sx={{ fontSize: 11, lineHeight: '13.2px', color: 'text.primary' }}>
          Filter:
        </Typography>
        <TextField select size="small" id="filterDDM" value={filterDDMValue} onChange={(e) => setFilterDDMValue(e.target.value)} sx={filterSelectSx}>
          <MenuItem value="">ALL</MenuItem>
          {filterOptions.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
        </TextField>

        {isIP && (
          <>
            <Typography component="span" sx={{ fontSize: 11, lineHeight: '13.2px', color: 'text.primary' }}>
              Product:
            </Typography>
            <TextField select size="small" id="historyProductDDM" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} sx={{ ...filterSelectSx, width: '200px' }}>
              {productDDMOptions.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
            </TextField>
          </>
        )}

        <FormControlLabel
          control={<Checkbox checked={viewSummary} onChange={(e) => setViewSummary(e.target.checked)} size="small" />}
          label="View Summary"
          sx={{ '& .MuiFormControlLabel-label': { fontSize: 11 } }}
        />
      </Stack>

      <Box sx={{ mb: '8px' }}>
        <DataGrid columns={getVisibleColumns()} data={filteredHistoryRows()} height={250} showCheckboxColumn={false} onRowDoubleClick={handleRowDoubleClick} onRightClickMenuItems={contextMenuItems} defaultSortField="repDate" defaultSortDir="desc" alternateRows showToolbar showFooter />
      </Box>

      <Stack direction="row" alignItems="center" sx={{ gap: '8px', mb: '5px' }}>
        <Typography component="span" sx={{
 fontSize: 11, fontWeight: 700, color: 'text.primary' }}>
          Associated History
        </Typography>
        <FormControlLabel
          control={<Checkbox checked={viewSummaryAssc} onChange={(e) => setViewSummaryAssc(e.target.checked)} size="small" />}
          label="View Summary"
          sx={{ '& .MuiFormControlLabel-label': { fontSize: 11 } }}
        />
      </Stack>

      <AssociatedHistoryGrid rows={assoHistoryRows} viewSummary={viewSummaryAssc} sessionUniqueKey={sessionUniqueKey} onCopyRequest={(asscTrNum) => showAlert('Copy requested for: ' + asscTrNum)} />

      {showETMSHistory && (
        <Box id="etmsHistoryDiv" sx={{ mt: '10px' }}>
          <Stack direction="row" alignItems="center" sx={{ gap: '8px', mb: '5px' }}>
            <Typography component="span" sx={{
 fontSize: 11, fontWeight: 700, color: 'text.primary' }}>
              ETMS History
            </Typography>
            <TextField select size="small" id="etmsHistoryProductDDM" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} sx={{ ...filterSelectSx, width: '200px' }}>
              {productDDMOptions.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
            </TextField>
            <Typography id="productCounts" component="span" sx={{
 fontSize: 11, color: 'text.primary' }}>
              {productCounts}
            </Typography>
          </Stack>
          <Box id="etmsHistoryDetailsGrid" sx={{ width: '1030px', height: '450px', border: '1px solid', borderColor: 'divider', borderRadius: '3px' }}>
            <DataGrid
              columns={[
                { field: 'trNum', label: 'TR#', width: 90 },
                { field: 'status', label: 'Status', width: 80 },
                { field: 'openDate', label: 'Open Date', width: 100 },
                { field: 'closeDate', label: 'Close Date', width: 100 },
                { field: 'description', label: 'Description', width: 400, wrap: true },
              ]}
              data={etmsHistoryRows}
              height={430}
              onRowDoubleClick={(row) => showAlert('Navigate to ETMS ticket: ' + row.trNum)}
              showToolbar
              showFooter
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GroupTroubleHistory;
