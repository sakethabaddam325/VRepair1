import api from './axiosInstance.js';
import { mapWlnGroupTicketToRetrieveVo } from '../utils/wlnGroupTicketMapper.js';

const apiPrefix = () => import.meta.env.VITE_API_PREFIX || '/vRepairOne';

/**
 * POST wlnGroupTicketRetrieve — trouble info / trouble details for group TR.
 * Query: applicationId, userId, searchType (e.g. T), groupTroubleNum
 */
export const retrieveWlnGroupTicket = ({
  applicationId = import.meta.env.VITE_APPLICATION_ID || '1',
  userId = 'GONDCH7', // fallback to hardcoded user for non-authenticated contexts; should be overridden by caller
  searchType = 'T',
  groupTroubleNum,
}) => {
  const qs = new URLSearchParams({
    applicationId: String(applicationId),
    userId: String(userId ?? ''),
    searchType: String(searchType),
    groupTroubleNum: String(groupTroubleNum ?? ''),
  }).toString();
  const url = `${apiPrefix()}/controller/wlnGroupTicketRetrieve?${qs}`;
  return api.post(url, '');
};

/**
 * Calls wlnGroupTicketRetrieve and returns mapped `groupRetrieveRspVO` fields, or null if unusable.
 */
export async function fetchWlnGroupTicketMapped({
  applicationId = import.meta.env.VITE_APPLICATION_ID || '1',
  userId = 'GONDCH7', // fallback to hardcoded user for non-authenticated contexts; should be overridden by caller
  searchType = 'T',
  groupTroubleNum,
}) {
  const wlnRes = await retrieveWlnGroupTicket({
    applicationId,
    userId,
    searchType,
    groupTroubleNum,
  });
  let payload = wlnRes?.data;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      return null;
    }
  }
  if (payload?.resultData && typeof payload.resultData === 'object') {
    payload = payload.resultData;
  }
  if (
    !payload ||
    typeof payload !== 'object' ||
    !(payload.GROUP_TROUBLE_NUM || payload.StatusCode === 'SUCCESS')
  ) {
    return null;
  }
  return mapWlnGroupTicketToRetrieveVo(payload);
}

const toFormData = (params) =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? '')}`)
    .join('&');

export const loadGroupSearchResults = (params) =>
  api.post('/controller/GroupSearchController', toFormData({ actionCode: 'LOAD_GROUP_RESULTS', ...params }));

export const loadGroupHistoryGrids = (sessionUniqueKey) =>
  api.post('/controller/GroupHistoryController', toFormData({ actionCode: 'LOAD_GRIDS', sessionUniqueKey }));

/**
 * POST /wlnGroupHistory — real Group History API.
 * All parameters passed as URL query strings.
 *
 * @param {object} p
 * @param {string} p.userId
 * @param {string} p.groupTroubleNum
 * @param {string} [p.historyOption]  - default 'T'
 * @param {string} [p.groupType]
 * @param {string} [p.groupName]
 * @param {string} [p.regionId]
 */
export const fetchWlnGroupHistory = ({
  userId = 'GONDCH7', // fallback to hardcoded user for non-authenticated contexts; should be overridden by caller
  groupTroubleNum = '',
  historyOption = 'T',
  groupType = '',
  groupName = '',
  regionId = '',
}) => {
  const qs = new URLSearchParams({
    userId:           String(userId),
    groupTroubleNum:  String(groupTroubleNum),
    historyOption:    String(historyOption),
    groupType:        String(groupType),
    groupName:        String(groupName),
    regionId:         String(regionId),
  }).toString();
  return api.post(`${apiPrefix()}/controller/wlnGroupHistory?${qs}`, '');
};

export const loadGroupHistoryIPModules = (sessionUniqueKey, actionCode = 'LOAD_GRID_IPMODULES') =>
  api.post('/controller/GroupHistoryController', toFormData({ actionCode, sessionUniqueKey }));

export const copyGroupHistory = (sessionUniqueKey, copyTr) =>
  api.post('/controller/GroupHistoryController', toFormData({ actionCode: 'COPY_HISTORY', COPYTR: copyTr, sessionUniqueKey }));

export const loadGroupActivityLog = (params) =>
  api.post('/controller/GroupActivityLogController', toFormData(params));

/**
 * POST /wlnGroupActivityLog — real Activity Log API.
 * All parameters are passed as URL query strings (no form body).
 *
 * @param {object} p
 * @param {string} p.groupTroubleNum  - required, e.g. "MAAA04LK91"
 * @param {string} [p.type]           - optional filter type
 * @param {number} [p.activitySeqNum] - pagination cursor, default 0
 * @param {string} [p.userId]         - logged-in user ID
 * @param {string} [p.searchType]     - always "ACTIVITY"
 */
export const fetchWlnGroupActivityLog = ({
  groupTroubleNum,
  type = '',
  activitySeqNum = 0,
  userId = 'GONDCH7', // fallback to hardcoded user for non-authenticated contexts; should be overridden by caller
  searchType = 'ACTIVITY',
}) => {
  const qs = new URLSearchParams({
    groupTroubleNum: String(groupTroubleNum ?? ''),
    type:            String(type ?? ''),
    activitySeqNum:  String(activitySeqNum ?? 0),
    userId:          String(userId ?? ''),
    searchType,
  }).toString();
  return api.post(`${apiPrefix()}/controller/wlnGroupActivityLog?${qs}`, '');
};

export const getActivityLog = (params) =>
  api.post('/controller/ActivityLogController', toFormData(params));

export const voidActivityRemark = (params) =>
  api.post('/controller/ActivityLogController', toFormData({ func: 'VOIDREMARKS', ...params }));

export const getGroupActivityDetails = (sessionUniqueKey) =>
  api.post('/controller/ActivityDetailsController', toFormData({ actionCode: 'GTRM', sessionUniqueKey }));

export const submitActivityDetails = (params) =>
  api.post('/controller/ActivityDetailsController', toFormData(params));

export const loadFunctionPanelForTR = (params) =>
  api.post('/controller/FunctionPanelLoadController', toFormData(params));

export const loadFunctionPanelForGroup = (params) =>
  api.post('/controller/FunctionPanelLoadController', toFormData(params));

export const submitGroupTrouble = (params) =>
  api.post('/controller/GroupTroubleEntryController', toFormData(params));

export const loadWbdStates = (params) =>
  api.post('/controller/GroupTroubleEntryController', toFormData({ actionCode: 'LOAD_STATES', ...params }));

export const loadWbdCoCllis = (params) =>
  api.post('/controller/GroupTroubleEntryController', toFormData({ actionCode: 'LOAD_CO_CLLI', ...params }));
