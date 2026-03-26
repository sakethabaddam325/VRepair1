import React, { useState, useCallback, useRef } from 'react';
import TabContainer from '../components/TabContainer.jsx';
import RelatedCircuitsTable from './RelatedCircuitsTable.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAppContext } from '../contexts/AppContext.jsx';
import { INVENTORY_TABS } from '../constants/appConstants.js';
import { Box, Typography } from '@mui/material';

const DSLAM_DEFAULTS = {
  VENDOR: '', EQUIPMENT: '', HIERARCHY_LEVEL: '', NODE_NAME: '',
  ADDR_1: '', ADDR_2: '', ZIP: '', CONFIG_TYPE: '', MODEL: '', PPM_IND: '',
};

const InventoryTabs = ({
  sessionUniqueKey,
  onGetCircuitDetails,
  onGetNetworkElementDetails,
  gridData,
  relatedCircuitData = [],
  searchType = 'CIRCUIT',
}) => {
  const { showAlert } = useAppContext();
  const [activeTab, setActiveTab] = useState(INVENTORY_TABS.PARTIAL_LISTING);
  const [loadedTabs, setLoadedTabs] = useState(new Set([INVENTORY_TABS.PARTIAL_LISTING]));
  const [tabVisibility, setTabVisibility] = useState({
    [INVENTORY_TABS.PARTIAL_LISTING]: true,
    [INVENTORY_TABS.DSL_CIRCUITS]: false,
    [INVENTORY_TABS.RELATED_CIRCUITS]: false,
    [INVENTORY_TABS.CIRCUIT_DETAILS]: false,
    [INVENTORY_TABS.NETWORK_ELEMENT]: false,
    [INVENTORY_TABS.BACKUP_CIRCUIT]: false,
  });

  const [dslamDetails, setDslamDetails] = useState(DSLAM_DEFAULTS);
  const [relatedCircuits, setRelatedCircuits] = useState(relatedCircuitData);
  const [dslTabLabel, setDslTabLabel] = useState('DSL Circuits');
  const [isLoading, setIsLoading] = useState(false);

  const handleTabSelect = useCallback((tabId) => {
    setActiveTab(tabId);
    setLoadedTabs((prev) => new Set([...prev, tabId]));
  }, []);

  const checkForTabDisplay = useCallback((data, gridname, count) => {
    const handlers = {
      'DSL': () => {
        setDslTabLabel(count > 1 ? 'DSL Circuits (Partial)' : 'DSL Circuits');
        setTabVisibility((prev) => ({ ...prev, [INVENTORY_TABS.DSL_CIRCUITS]: true }));
        setActiveTab(count > 1 ? INVENTORY_TABS.PARTIAL_LISTING : INVENTORY_TABS.DSL_CIRCUITS);
      },
      'CKTOTHER': () => {
        setTabVisibility((prev) => ({ ...prev, [INVENTORY_TABS.CIRCUIT_DETAILS]: true }));
        setActiveTab(count > 1 ? INVENTORY_TABS.PARTIAL_LISTING : INVENTORY_TABS.CIRCUIT_DETAILS);
      },
      'CENTRALOFFICE': () => {
        setTabVisibility((prev) => ({ ...prev, [INVENTORY_TABS.CIRCUIT_DETAILS]: true }));
        setActiveTab(count > 1 ? INVENTORY_TABS.PARTIAL_LISTING : INVENTORY_TABS.CIRCUIT_DETAILS);
      },
      'NETWORK ELEMENT': () => {
        if (data?.dslamDetails) {
          setDslamDetails(data.dslamDetails);
          if (onGetNetworkElementDetails) onGetNetworkElementDetails(data.dslamDetails);
        }
        setTabVisibility((prev) => ({ ...prev, [INVENTORY_TABS.NETWORK_ELEMENT]: true }));
        setActiveTab(count > 1 ? INVENTORY_TABS.PARTIAL_LISTING : INVENTORY_TABS.NETWORK_ELEMENT);
      },
      'SERVICEPROVIDER': () => {
        setTabVisibility((prev) => ({ ...prev, [INVENTORY_TABS.CIRCUIT_DETAILS]: true }));
        setActiveTab(count > 1 ? INVENTORY_TABS.PARTIAL_LISTING : INVENTORY_TABS.CIRCUIT_DETAILS);
      },
    };
    if (handlers[gridname]) handlers[gridname]();
  }, [onGetNetworkElementDetails]);

  const relatedCircuitTabDisplay = useCallback((circuits) => {
    setRelatedCircuits(circuits);
    setTabVisibility((prev) => ({ ...prev, [INVENTORY_TABS.RELATED_CIRCUITS]: true }));
  }, []);

  const showRelatedTab = useCallback((count) => {
    setTabVisibility((prev) => ({ ...prev, [INVENTORY_TABS.RELATED_CIRCUITS]: count > 0 }));
  }, []);

  const handleAddItem = useCallback(() => {
    if (searchType === 'CIRCUIT') {
      setTabVisibility((prev) => ({ ...prev, [INVENTORY_TABS.CIRCUIT_DETAILS]: true }));
      setActiveTab(INVENTORY_TABS.CIRCUIT_DETAILS);
    } else {
      setTabVisibility((prev) => ({ ...prev, [INVENTORY_TABS.NETWORK_ELEMENT]: true }));
      setActiveTab(INVENTORY_TABS.NETWORK_ELEMENT);
    }
  }, [searchType]);

  const handleUndoAddItem = useCallback(() => {
    setTabVisibility((prev) => ({
      ...prev,
      [INVENTORY_TABS.NETWORK_ELEMENT]: false,
      [INVENTORY_TABS.CIRCUIT_DETAILS]: false,
    }));
    setActiveTab(INVENTORY_TABS.PARTIAL_LISTING);
  }, []);

  const visibleTabs = [
    { id: INVENTORY_TABS.PARTIAL_LISTING, label: 'Partial Listing', isVisible: tabVisibility[INVENTORY_TABS.PARTIAL_LISTING] },
    { id: INVENTORY_TABS.DSL_CIRCUITS, label: dslTabLabel, isVisible: tabVisibility[INVENTORY_TABS.DSL_CIRCUITS] },
    { id: INVENTORY_TABS.RELATED_CIRCUITS, label: 'Related Circuits', isVisible: tabVisibility[INVENTORY_TABS.RELATED_CIRCUITS] },
    { id: INVENTORY_TABS.CIRCUIT_DETAILS, label: 'Circuit Details', isVisible: tabVisibility[INVENTORY_TABS.CIRCUIT_DETAILS] },
    { id: INVENTORY_TABS.NETWORK_ELEMENT, label: 'Network Element', isVisible: tabVisibility[INVENTORY_TABS.NETWORK_ELEMENT] },
    { id: INVENTORY_TABS.BACKUP_CIRCUIT, label: 'Backup Circuit', isVisible: tabVisibility[INVENTORY_TABS.BACKUP_CIRCUIT] },
  ];

  const renderTabContent = () => {
    const placeholderSx = { p: '10px', fontSize: 12 };
    const placeholderTextSx = { color: 'text.disabled', fontStyle: 'italic' };

    switch (activeTab) {
      case INVENTORY_TABS.PARTIAL_LISTING:
        return (
          <Box id="inventoryPartialListingFrame" sx={placeholderSx}>
            <Typography component="div" sx={placeholderTextSx}>Partial listing results will display here.</Typography>
          </Box>
        );
      case INVENTORY_TABS.DSL_CIRCUITS:
        return (
          <Box id="dslCircuitFrame" sx={placeholderSx}>
            <Typography component="div" sx={placeholderTextSx}>DSL Circuit Details will display here.</Typography>
          </Box>
        );
      case INVENTORY_TABS.RELATED_CIRCUITS:
        return (
          <RelatedCircuitsTable
            gridData={relatedCircuits}
            onViewDetails={(circuitName, pType) => { if (onGetCircuitDetails) onGetCircuitDetails(circuitName, pType); }}
            sessionUniqueKey={sessionUniqueKey}
          />
        );
      case INVENTORY_TABS.CIRCUIT_DETAILS:
        return (
          <Box id="circuitDetailsFrame" sx={placeholderSx}>
            <Typography component="div" sx={placeholderTextSx}>Circuit Details will display here.</Typography>
          </Box>
        );
      case INVENTORY_TABS.NETWORK_ELEMENT:
        return (
          <Box id="networkElementFrame" sx={placeholderSx}>
            <Box component="fieldset" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '3px', p: '8px', m: 0 }}>
              <Box component="legend" sx={{ color: 'info.main', fontWeight: 700, fontSize: 12, px: '4px' }}>Network Element Details</Box>
              <Box component="table" sx={{ fontSize: 11 }}>
                <Box component="tbody">
                  {Object.entries(dslamDetails).map(([key, value]) => (
                    <Box component="tr" key={key}>
                      <Box component="td" sx={{ fontWeight: 700, pr: '8px', whiteSpace: 'nowrap', color: 'text.primary' }}>{key}</Box>
                      <Box component="td">{value || '\u00A0'}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        );
      case INVENTORY_TABS.BACKUP_CIRCUIT:
        return (
          <Box id="backUpCitcuitsFrame" sx={placeholderSx}>
            <Typography component="div" sx={placeholderTextSx}>Backup Circuit Grid will display here.</Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box id="jssubtabs" sx={{
 fontSize: 12, lineHeight: '14px', color: 'text.primary' }}>
      {isLoading && <LoadingSpinner />}
      <TabContainer tabs={visibleTabs} activeTab={activeTab} onTabSelect={handleTabSelect}>
        <Box sx={{ minHeight: '370px' }}>
          {renderTabContent()}
        </Box>
      </TabContainer>
    </Box>
  );
};

export { };
export default InventoryTabs;
