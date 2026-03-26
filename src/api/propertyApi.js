import api from './axiosInstance.js';

const toFormData = (params) =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? '')}`)
    .join('&');

export const updatePropertyUBICode = (params) =>
  api.post('/controller/PropertyUBICodeController', toFormData(params));

export const flagUnflagTicket = (params) =>
  api.post('/controller/MyFlaggedListController', toFormData({ actionCode: 'FLAG_UNFLAG_TKT_REQ', ...params }));

export const checkNMAAvailability = (params) =>
  api.post('/controller/FacilitySearchController', toFormData(params));

export const getLineTestType = (params) =>
  api.post('/controller/LineTestController', toFormData(params));
