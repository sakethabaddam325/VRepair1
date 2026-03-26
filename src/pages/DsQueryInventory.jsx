import React, { useState, useCallback } from 'react';
import InventoryTabs from './InventoryTabs.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { useAppContext } from '../contexts/AppContext.jsx';
import { refreshLineSearchData } from '../api/lineSearchApi.js';
import { Box, Stack, Typography, Button } from '@mui/material';

const SEARCH_TYPES = [
  { value: 'CIRCUIT', label: 'Circuit' },
  { value: 'DSL', label: 'DSL' },
  { value: 'NETWORK ELEMENT', label: 'Network Element' },
  { value: 'SERVICEPROVIDER', label: 'Service Provider' },
  { value: 'CENTRALOFFICE', label: 'Central Office' },
];

const fieldLabelSx = { fontSize: 11,
  fontWeight: 400,
  whiteSpace: 'nowrap',
  color: 'text.primary',
  userSelect: 'none',
  alignSelf: 'center',
};

const textInputSx = { fontSize: 12,
  lineHeight: '14px',
  py: '4px',
  px: '5px',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '3px',
  color: 'text.primary',
  bgcolor: 'background.paper',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  width: '250px',
  minWidth: 0,
  '&:focus': { borderColor: 'grey.900' },
};

const selectSx = { fontSize: 12,
  lineHeight: '14px',
  py: '4px',
  px: '5px',
  pr: '24px',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '3px',
  color: 'text.primary',
  bgcolor: 'background.paper',
  appearance: 'none',
  cursor: 'pointer',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  width: '200px',
  minWidth: 0,
  '&:focus': { borderColor: 'grey.900' },
};

const DsQueryInventory = ({ trNum, sessionUniqueKey }) => {
  const { showAlert } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState('CIRCUIT');
  const [circuitId, setCircuitId] = useState('');
  const [dslTn, setDslTn] = useState('');
  const [networkElement, setNetworkElement] = useState('');
  const [serviceProvider, setServiceProvider] = useState('');
  const [centralOffice, setCentralOffice] = useState('');
  const [eqptHierarchies, setEqptHierarchies] = useState('');
  const [eqptType, setEqptType] = useState('');

  const [searchResults, setSearchResults] = useState([]);
  const [relatedCircuits, setRelatedCircuits] = useState([]);
  const [dslamDetails, setDslamDetails] = useState({});
  const [resultCount, setResultCount] = useState(0);

  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const buildSearchParams = useCallback(() => {
    const params = { sessionUniqueKey, trNum, searchType, eqptHierarchies, eqptType };
    if (searchType === 'CIRCUIT') params.circuitId = circuitId;
    else if (searchType === 'DSL') params.dslTn = dslTn;
    else if (searchType === 'NETWORK ELEMENT') params.networkElement = networkElement;
    else if (searchType === 'SERVICEPROVIDER') params.serviceProvider = serviceProvider;
    else if (searchType === 'CENTRALOFFICE') params.centralOffice = centralOffice;
    return params;
  }, [sessionUniqueKey, trNum, searchType, eqptHierarchies, eqptType, circuitId, dslTn, networkElement, serviceProvider, centralOffice]);

  const handleSearch = useCallback(async () => {
    const params = buildSearchParams();
    const hasSearchInput = circuitId || dslTn || networkElement || serviceProvider || centralOffice;
    if (!hasSearchInput && searchType !== 'CENTRALOFFICE') {
      showAlert('Please enter a search value.');
      return;
    }
    setIsLoading(true);
    setShowLoadingOverlay(true);
    try {
      const response = await refreshLineSearchData({ ...params, actionCode: 'INVENTORY_SEARCH' });
      if (response.data) {
        const results = Array.isArray(response.data.results) ? response.data.results : [];
        setSearchResults(results);
        setResultCount(results.length);
        if (response.data.relatedCircuits) setRelatedCircuits(response.data.relatedCircuits);
      }
    } catch {
      showAlert('Error performing inventory search. Please try again.');
    } finally {
      setIsLoading(false);
      setShowLoadingOverlay(false);
    }
  }, [buildSearchParams, circuitId, dslTn, networkElement, serviceProvider, centralOffice, searchType, showAlert]);

  const handleGetCircuitDetails = useCallback(async (circuitName, pType) => {
    setIsLoading(true);
    try {
      const response = await refreshLineSearchData({ sessionUniqueKey, circuitId: circuitName, pType, actionCode: 'GET_CIRCUIT_DETAILS' });
      if (response.data) showAlert('Circuit details loaded: ' + circuitName);
    } catch {
      showAlert('Error loading circuit details.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionUniqueKey, showAlert]);

  const handleGetNetworkElementDetails = useCallback((details) => {
    setDslamDetails(details);
  }, []);

  const handleClear = useCallback(() => {
    setCircuitId('');
    setDslTn('');
    setNetworkElement('');
    setServiceProvider('');
    setCentralOffice('');
    setSearchResults([]);
    setRelatedCircuits([]);
    setResultCount(0);
  }, []);

  const renderSearchFields = () => {
    const fieldMap = { CIRCUIT: { label: 'Circuit ID', value: circuitId, onChange: (e) => setCircuitId(e.target.value.toUpperCase()), placeholder: 'Enter Circuit ID', width: '250px' },
      DSL: { label: 'DSL TN', value: dslTn, onChange: (e) => setDslTn(e.target.value), placeholder: 'NXX/NXX/XXXX', width: '200px' },
      'NETWORK ELEMENT': { label: 'Network Element', value: networkElement, onChange: (e) => setNetworkElement(e.target.value.toUpperCase()), placeholder: 'Enter NE Name', width: '250px' },
      SERVICEPROVIDER: { label: 'Service Provider', value: serviceProvider, onChange: (e) => setServiceProvider(e.target.value.toUpperCase()), placeholder: '', width: '250px' },
      CENTRALOFFICE: { label: 'Central Office', value: centralOffice, onChange: (e) => setCentralOffice(e.target.value.toUpperCase()), placeholder: '', width: '250px' },
    };

    const field = fieldMap[searchType];
    if (!field) return null;

    return (
      <>
        <Box component="span" sx={fieldLabelSx}>{field.label}</Box>
        <Box component="input" type="text" value={field.value} onChange={field.onChange} placeholder={field.placeholder} sx={{ ...textInputSx, width: field.width }} />
      </>
    );
  };

  return (
    <Box
      id="dsQueryInventoryDiv"
      sx={{ fontSize: 12, lineHeight: '14px', p: '5px', color: 'text.primary' }}
    >
      {isLoading && <LoadingSpinner />}
      {showLoadingOverlay && (
        <Stack
          id="transDivTop"
          justifyContent="center"
          alignItems="center"
          sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(255,255,255,0.7)', zIndex: 9998 }}
        >
          <Typography component="span" sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>
            Loading inventory data...
          </Typography>
        </Stack>
      )}

      <SectionHeader title="Inventory Search">
        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', alignItems: 'center', p: '4px' }}>
          <Box component="span" sx={fieldLabelSx}>Search Type</Box>
          <Box
            component="select"
            id="searchTypeDDM"
            value={searchType}
            onChange={(e) => {
              setSearchType(e.target.value);
              setCircuitId(''); setDslTn(''); setNetworkElement(''); setServiceProvider(''); setCentralOffice('');
            }}
            sx={selectSx}
          >
            {SEARCH_TYPES.map((st) => (<option key={st.value} value={st.value}>{st.label}</option>))}
          </Box>

          {renderSearchFields()}

          <Box sx={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px', pt: '8px' }}>
            <Button size="small" variant="contained" onClick={handleSearch}>Search</Button>
            <Button size="small" variant="outlined" onClick={handleClear}>Clear</Button>
            {resultCount > 0 && (
              <Typography component="span" sx={{ fontSize: 11, color: 'text.primary', ml: '8px' }}>
                {resultCount} result(s) found
              </Typography>
            )}
          </Box>

          <input type="hidden" id="eqptHierarchies" value={eqptHierarchies} />
          <input type="hidden" id="eqpttype" value={eqptType} />
        </Box>
      </SectionHeader>

      <InventoryTabs
        sessionUniqueKey={sessionUniqueKey}
        onGetCircuitDetails={handleGetCircuitDetails}
        onGetNetworkElementDetails={handleGetNetworkElementDetails}
        gridData={searchResults}
        relatedCircuitData={relatedCircuits}
        searchType={searchType}
      />
    </Box>
  );
};

export default DsQueryInventory;
