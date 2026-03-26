import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import TabContainer from '../components/TabContainer.jsx';
import NotesSlidePanel from '../components/NotesSlidePanel.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import CustomerInfoHeader from '../components/CustomerInfoHeader.jsx';
import LoadGroupSearchResults from '../components/LoadGroupSearchResults.jsx';
import { Box, Button } from '@mui/material';
import { useGroupSearch } from '../contexts/GroupSearchContext.jsx';
import { useAppContext } from '../contexts/AppContext.jsx';
import { TAB_IDS, TAB_LABELS } from '../constants/appConstants.js';
import { checkNMAAvailability, getLineTestType } from '../api/propertyApi.js';

const GroupTrouble = lazy(() => import('./GroupTrouble.jsx'));
const ActivityHistory = lazy(() => import('./ActivityHistory.jsx'));
const GroupActivityDetails = lazy(() => import('./GroupActivityDetails.jsx'));
const GroupCloseOut = lazy(() => import('./GroupCloseOut.jsx'));
const Tier2 = lazy(() => import('./Tier2.jsx'));
const TrMailBox = lazy(() => import('./TrMailBox.jsx'));
const DsQueryInventory = lazy(() => import('./DsQueryInventory.jsx'));
const EquipmentCircuitDetails = lazy(() => import('./EquipmentCircuitDetails.jsx'));
const GroupMemberMgmt = lazy(() => import('./GroupMemberMgmt.jsx'));

const ALWAYS_VISIBLE_TABS = [
  TAB_IDS.GROUPTRMGMT,
  TAB_IDS.GROUPACTLOG,
  TAB_IDS.GROUPMEMMGMT,
  TAB_IDS.GROUPACTIVITYDET,
  TAB_IDS.EMAILTAB,
  TAB_IDS.TIER2TAB,
  TAB_IDS.EQUIPDET,
];

const GroupTroubleTabs = ({ trNum: trNumProp } = {}) => {
  const params = useParams();
  const trNum = trNumProp || params.trNum;
  const { sessionUniqueKey, showAlert } = useAppContext();
  const {
    activeSubTab,
    setActiveSubTab,
    groupCloseOutInd,
    tabsFlags,
    isGroupClosed,
    groupRetrieveRspVO,
    groupType: currentGroupType,
  } = useGroupSearch();

  const memberCount = (() => {
    try {
      const trAttached = parseInt(groupRetrieveRspVO?.trAttachedNumber ?? '0', 10) || 0;
      const gpAttached = parseInt(groupRetrieveRspVO?.gpAttached ?? '0', 10) || 0;
      return trAttached + gpAttached;
    } catch {
      return 0;
    }
  })();

  const [loadedTabs, setLoadedTabs] = useState(new Set([TAB_IDS.GROUPTRMGMT]));
  const [notesPanelOpen, setNotesPanelOpen] = useState(false);
  const [tabVisibility, setTabVisibility] = useState(() =>
    Object.fromEntries(Object.values(TAB_IDS).map((id) => [id, ALWAYS_VISIBLE_TABS.includes(id)]))
  );

  useEffect(() => {
    if (tabsFlags && Object.keys(tabsFlags).length > 0) {
      setTabVisibility((prev) => ({ ...prev, ...tabsFlags }));
    }
  }, [tabsFlags]);

  useEffect(() => {
    if (!currentGroupType) return;
    const shouldHideMemberMgmt = currentGroupType === 'VAT' || currentGroupType === 'WBD';
    setTabVisibility((prev) => ({
      ...prev,
      [TAB_IDS.GROUPMEMMGMT]: !shouldHideMemberMgmt,
    }));
  }, [currentGroupType]);

  const handleTabSelect = useCallback(async (tabId) => {
    if (tabId === TAB_IDS.NMADETAILSTAB) {
      try {
        const response = await checkNMAAvailability({ sessionUniqueKey, actionCode: 'CHECK_NMA' });
        if (response.data?.available !== true) {
          showAlert('NMA Details are not available for this ticket.');
          return;
        }
      } catch {
        showAlert('Error checking NMA availability.');
        return;
      }
    }

    if (tabId === TAB_IDS.LINETESTTAB) {
      try {
        const response = await getLineTestType({ sessionUniqueKey });
        if (!response.data?.lineTestType) {
          showAlert('Line Test is not available for this ticket.');
          return;
        }
      } catch {
        showAlert('Error loading Line Test.');
        return;
      }
    }

    if (tabId === TAB_IDS.DIVERSITYCACTAB) {
      showAlert('Loading Diversity CAC...');
    }

    setActiveSubTab(tabId);
    setLoadedTabs((prev) => new Set([...prev, tabId]));
  }, [sessionUniqueKey, showAlert, setActiveSubTab]);

  const handleTabClose = useCallback((tabId) => {
    setTabVisibility((prev) => ({ ...prev, [tabId]: false }));
    if (activeSubTab === tabId) {
      setActiveSubTab(TAB_IDS.GROUPTRMGMT);
    }
  }, [activeSubTab, setActiveSubTab]);

  const dynamicTabLabels = {
    [TAB_IDS.GROUPMEMMGMT]: memberCount > 0
      ? `Member Mgmt (${memberCount})`
      : TAB_LABELS[TAB_IDS.GROUPMEMMGMT],
    [TAB_IDS.GROUPACTLOG]: 'Activity Log / History',
  };

  const visibleTabList = Object.values(TAB_IDS)
    .filter((id) => tabVisibility[id])
    .map((id) => ({
      id,
      label: dynamicTabLabels[id] ?? TAB_LABELS[id],
      isVisible: true,
      closeable: id === TAB_IDS.ADDINVENTORYTAB,
      onClose: id === TAB_IDS.ADDINVENTORYTAB ? handleTabClose : undefined,
      style: id === TAB_IDS.DIVERSITYCACTAB ? { backgroundColor: '#ffff00', color: '#000000' } : {},
    }));

  const renderTabContent = () => {
    if (!loadedTabs.has(activeSubTab)) return null;

    const tabComponentMap = {
      [TAB_IDS.GROUPTRMGMT]: <GroupTrouble trNum={trNum} sessionUniqueKey={sessionUniqueKey} groupCloseOutInd={groupCloseOutInd} />,
      [TAB_IDS.GROUPACTLOG]: <ActivityHistory trNum={trNum} sessionUniqueKey={sessionUniqueKey} />,
      [TAB_IDS.GROUPMEMMGMT]: <GroupMemberMgmt trNum={trNum} sessionUniqueKey={sessionUniqueKey} />,
      [TAB_IDS.GROUPACTIVITYDET]: <GroupActivityDetails trNum={trNum} sessionUniqueKey={sessionUniqueKey} />,
      [TAB_IDS.EMAILTAB]: <TrMailBox trNum={trNum} sessionUniqueKey={sessionUniqueKey} />,
      [TAB_IDS.TIER2TAB]: <Tier2 trNum={trNum} sessionUniqueKey={sessionUniqueKey} />,
      [TAB_IDS.EQUIPDET]: <EquipmentCircuitDetails trNum={trNum} sessionUniqueKey={sessionUniqueKey} useWlnInventory />,
    };

    const Component = tabComponentMap[activeSubTab];
    if (!Component) {
      return (
        <Box sx={{ p: '20px', color: 'grey.500',
 fontSize: 12 }}>
          {TAB_LABELS[activeSubTab] || activeSubTab} — Content not yet migrated.
        </Box>
      );
    }
    return Component;
  };

  return (
    <Box
      id="jgsubtabs"
      sx={{
 fontSize: 12, height: '100%' }}
    >
      {trNum && <LoadGroupSearchResults trNum={trNum} srcType="GTRM" />}

      {trNum && (
        <CustomerInfoHeader
          layoutType="STANDARD"
          trData={groupRetrieveRspVO || {}}
          sessionUniqueKey={sessionUniqueKey}
        />
      )}

      <TabContainer
        tabs={visibleTabList}
        activeTab={activeSubTab}
        onTabSelect={handleTabSelect}
        extraActions={
          <Button
            variant="outlined"
            size="small"
            sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }}
            onClick={() => setNotesPanelOpen(true)}
          >
            📝 Notes
          </Button>
        }
      >
        <Box sx={{ minHeight: '720px', position: 'relative' }}>
          <Suspense fallback={<LoadingSpinner message="Loading tab..." />}>
            {renderTabContent()}
          </Suspense>
        </Box>
      </TabContainer>

      <NotesSlidePanel
        isOpen={notesPanelOpen}
        onClose={() => setNotesPanelOpen(false)}
        trNum={trNum}
        sessionUniqueKey={sessionUniqueKey}
        isGroupTicket
        isTicketClosed={isGroupClosed}
        existingNotes={groupRetrieveRspVO?.troubleNotes || ''}
      />
    </Box>
  );
};

export default GroupTroubleTabs;
