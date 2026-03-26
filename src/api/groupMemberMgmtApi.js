import api from './axiosInstance.js';

const toFormData = (params) =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? '')}`)
    .join('&');

// Consolidated into Ticket-Retrive-Response.json → no longer needed as a separate API call
// export const loadMemberMgmt = (params) =>
//   api.post('/controller/GrpMemberMgmtController', toFormData({ action: 'LOAD_MEMBER_MGMT', ...params }));

export const attachTrToGroup = (params) =>
  api.post('/controller/GrpMemberMgmtController', toFormData({ action: 'ATTACH_TR', ...params }));

export const detachTrFromGroup = (params) =>
  api.post('/controller/GrpMemberMgmtController', toFormData({ action: 'DETACH_TR', ...params }));

export const attachGroupToGroup = (params) =>
  api.post('/controller/GrpMemberMgmtController', toFormData({ action: 'ATTACH_GROUP', ...params }));

export const detachGroupFromGroup = (params) =>
  api.post('/controller/GrpMemberMgmtController', toFormData({ action: 'DETACH_GROUP', ...params }));

export const searchTrForAttach = (params) =>
  api.post('/controller/LineSearchController', toFormData({ target: 'SEARCH', srcLink: 'GTRM', searchType: 'MEMBER_CNTRL', ...params }));

// Count is now derived from attachedTrs.length + attachedGroups.length in the component
// export const getMemberCount = (params) =>
//   api.post('/controller/GrpMemberMgmtController', toFormData({ action: 'GET_MEMBER_COUNT', ...params }));

