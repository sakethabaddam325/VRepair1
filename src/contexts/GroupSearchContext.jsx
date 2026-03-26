import React, { createContext, useContext, useState, useCallback } from 'react';

const GroupSearchContext = createContext(null);

export const GroupSearchProvider = ({ children }) => {
  const [groupSearchResultsVO, setGroupSearchResultsVO] = useState(null);
  const [groupRetrieveRspVO, setGroupRetrieveRspVO] = useState(null);
  const [groupTroubleReportNum, setGroupTroubleReportNum] = useState('');
  const [srcType, setSrcType] = useState('');
  const [centerID, setCenterID] = useState('');
  const [groupCloseOutInd, setGroupCloseOutInd] = useState('N');
  const [extNarrativeInd, setExtNarrativeInd] = useState('N');
  const [isGroupClosed, setIsGroupClosed] = useState(false);
  const [groupType, setGroupType] = useState('');
  const [troubleRptStatus, setTroublRptStatus] = useState('');
  const [tabsFlags, setTabsFlags] = useState({});
  const [reloadFlagHistory, setReloadFlagHistory] = useState(false);
  const [syncMailBox, setSyncMailBox] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('GROUPTRMGMT');
  const [groupFieldsUpdated, setGroupFieldsUpdated] = useState(false);

  const resetGroupData = useCallback(() => {
    setGroupSearchResultsVO(null);
    setGroupRetrieveRspVO(null);
    setGroupTroubleReportNum('');
    setIsGroupClosed(false);
    setGroupFieldsUpdated(false);
  }, []);

  return (
    <GroupSearchContext.Provider
      value={{
        groupSearchResultsVO,
        setGroupSearchResultsVO,
        groupRetrieveRspVO,
        setGroupRetrieveRspVO,
        groupTroubleReportNum,
        setGroupTroubleReportNum,
        srcType,
        setSrcType,
        centerID,
        setCenterID,
        groupCloseOutInd,
        setGroupCloseOutInd,
        extNarrativeInd,
        setExtNarrativeInd,
        isGroupClosed,
        setIsGroupClosed,
        groupType,
        setGroupType,
        troubleRptStatus,
        setTroublRptStatus,
        tabsFlags,
        setTabsFlags,
        reloadFlagHistory,
        setReloadFlagHistory,
        syncMailBox,
        setSyncMailBox,
        activeSubTab,
        setActiveSubTab,
        groupFieldsUpdated,
        setGroupFieldsUpdated,
        resetGroupData,
      }}
    >
      {children}
    </GroupSearchContext.Provider>
  );
};

export const useGroupSearch = () => {
  const context = useContext(GroupSearchContext);
  if (!context) throw new Error('useGroupSearch must be used within GroupSearchProvider');
  return context;
};

export default GroupSearchContext;
