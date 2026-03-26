import { useEffect, useRef } from 'react';
import { useGroupSearch } from '../contexts/GroupSearchContext.jsx';
import { useAppContext } from '../contexts/AppContext.jsx';
import { loadGroupSearchResults, fetchWlnGroupTicketMapped } from '../api/groupTroubleApi.js';
import { getHardcodedGroupRetrieveRspVO } from '../mocks/hardcodedWlnGroupTicketSample.js';

/** Paint static sample before `LOAD_GROUP_RESULTS` returns. Set VITE_USE_HARDCODED_GROUP_RETRIEVE=false to skip. */
function shouldApplyHardcodedFirst() {
  const raw = import.meta.env.VITE_USE_HARDCODED_GROUP_RETRIEVE;
  const normalized = String(raw ?? '').trim().replace(/^['"]|['"]$/g, '').toLowerCase();
  return normalized !== 'false';
}

/**
 * Data-loading gateway component — mirrors the role of loadGroupSearchResults.jsp.
 * Fetches group trouble report data for a given TR number, then hydrates GroupSearchContext.
 * Renders nothing; purely a side-effect orchestrator.
 */
const LoadGroupSearchResults = ({ trNum, srcType = 'GTRM' }) => {
  const { sessionUniqueKey, showAlert, setLoginId, setUserID, userID, loginId } = useAppContext();
  const {
    setGroupSearchResultsVO,
    setGroupRetrieveRspVO,
    setGroupTroubleReportNum,
    setSrcType,
    setCenterID,
    setGroupCloseOutInd,
    setExtNarrativeInd,
    setIsGroupClosed,
    setGroupType,
    setTroublRptStatus,
    setTabsFlags,
    setSyncMailBox,
    setGroupFieldsUpdated,
  } = useGroupSearch();

  const prevTrNumRef = useRef(null);

  useEffect(() => {
    if (!trNum || trNum === prevTrNumRef.current) return;
    prevTrNumRef.current = trNum;

    if (shouldApplyHardcodedFirst()) {
      const vo = getHardcodedGroupRetrieveRspVO(trNum);
      setGroupRetrieveRspVO({ ...vo, _hydrateVersion: Date.now() });
      setGroupTroubleReportNum(trNum);
    }

    const fetchResults = async () => {
      try {
        // const response = await loadGroupSearchResults({
        //   sessionUniqueKey,
        //   trNum,
        //   srcType,
        // });

        // const data = response?.data;
        // if (!data) return;

        // const rsp = data.resultData ?? data;

        // if (rsp.groupSearchResultsVO) {
        //   setGroupSearchResultsVO(rsp.groupSearchResultsVO);
        // }

        // if (rsp.groupRetrieveRspVO) {
        //   setGroupRetrieveRspVO({
        //     ...rsp.groupRetrieveRspVO,
        //     _hydrateVersion: Date.now(),
        //   });
        // }

        // if (rsp.groupTroubleReportNum ?? rsp.trNum) {
        //   setGroupTroubleReportNum(rsp.groupTroubleReportNum ?? rsp.trNum);
        // }

        // if (rsp.srcType ?? srcType) {
        //   setSrcType(rsp.srcType ?? srcType);
        // }

        // if (rsp.centerID !== undefined) {
        //   setCenterID(rsp.centerID);
        // }

        // if (rsp.groupCloseOutInd !== undefined) {
        //   setGroupCloseOutInd(rsp.groupCloseOutInd);
        // }

        // if (rsp.extNarrativeInd !== undefined) {
        //   setExtNarrativeInd(rsp.extNarrativeInd);
        // }

        // if (rsp.isGroupClosed !== undefined) {
        //   setIsGroupClosed(rsp.isGroupClosed === true || rsp.isGroupClosed === 'true');
        // }

        // if (rsp.groupType !== undefined) {
        //   setGroupType(rsp.groupType);
        // }

        // if (rsp.troubleRptStatus !== undefined) {
        //   setTroublRptStatus(rsp.troubleRptStatus);
        // }

        // if (rsp.tabsFlags && typeof rsp.tabsFlags === 'object') {
        //   setTabsFlags(rsp.tabsFlags);
        // }

        // if (rsp.syncMailBox !== undefined) {
        //   setSyncMailBox(rsp.syncMailBox === true || rsp.syncMailBox === 'true');
        // }

        // if (rsp.loginId) {
        //   setLoginId(rsp.loginId);
        //   setUserId(rsp.loginId);
        // }

        // setGroupFieldsUpdated(false);

        /* Always fetch WLN ticket details — required for Activity Details and Member Management tabs */
        if (trNum) {
          try {
            const wlnMapped = await fetchWlnGroupTicketMapped({
              applicationId: import.meta.env.VITE_APPLICATION_ID || '1',
              userId: userID || loginId || 'GONDCH7', // fallback to hardcoded user for non-authenticated contexts; should be overridden by caller
              searchType: 'T',
              groupTroubleNum: trNum,
            });
            if (wlnMapped) {
              setGroupRetrieveRspVO((prev) => ({
                ...(prev || {}),
                ...wlnMapped,
                _hydrateVersion: Date.now(),
              }));
              setGroupTroubleReportNum(wlnMapped.troubleReportNum || trNum);
            }
          } catch {
            /* Non-fatal: LOAD_GROUP_RESULTS data still applies */
          }
        }

      } catch {
        showAlert('Error loading group trouble report data. Please verify the TR number and try again.');
      }
    };

    fetchResults();
  }, [
    trNum,
    srcType,
    sessionUniqueKey,
    showAlert,
    setGroupSearchResultsVO,
    setGroupRetrieveRspVO,
    setGroupTroubleReportNum,
    setSrcType,
    setCenterID,
    setGroupCloseOutInd,
    setExtNarrativeInd,
    setIsGroupClosed,
    setGroupType,
    setTroublRptStatus,
    setTabsFlags,
    setSyncMailBox,
    setGroupFieldsUpdated,
    setLoginId,
    userID,
    loginId,
  ]);

  return null;
};

export default LoadGroupSearchResults;
