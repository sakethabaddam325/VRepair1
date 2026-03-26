import api from './axiosInstance.js';

const toFormData = (params) =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? '')}`)
    .join('&');

export const getTier2Data = (params) =>
  api.post('/controller/WLMController', toFormData(params));

export const submitTier2 = (params) =>
  api.post('/controller/WLMController', toFormData({ action: 'UPD', ...params }));

export const searchClientInfo = (params) =>
  api.post('/controller/WLMController', toFormData({ action: 'searchClientInfo', ...params }));

export const voidTier2ActionLog = (params) =>
  api.post('/controller/WLMController', toFormData({ action: 'SEND_VOID_ACTIONLOG', ...params }));

export const loadVendorData = (params) =>
  api.post('/controller/WLMController', toFormData({ action: 'popVendor', ...params }));

export const searchVendorByDDM = (params) =>
  api.post('/controller/WLMController', toFormData({ action: 'vendorAct', dataAction: 'SEARCH', ...params }));

export const searchVendorById = (params) =>
  api.post('/controller/WLMController', toFormData({ action: 'vendorAct', dataAction: 'IDSEARCH', ...params }));

export const loadPlatforms = (params) =>
  api.post('/controller/WLMController', toFormData({ action: 'LOAD_PLATFORM', ...params }));

export const loadEquipment = (params) =>
  api.post('/controller/WLMController', toFormData({ action: 'LOAD_EQUIPMENT', ...params }));

export const loadEquipmentId = (params) =>
  api.post('/controller/WLMController', toFormData({ action: 'LOAD_EQUIPMENT_ID', ...params }));

export const reloadCauseCode = (params) =>
  api.post('/controller/WLMController', toFormData({ action: 'LOAD_CAUSECODE', ...params }));
