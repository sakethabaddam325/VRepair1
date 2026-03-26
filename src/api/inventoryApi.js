import api from './axiosInstance.js';

const apiPrefix = () => import.meta.env.VITE_API_PREFIX || '/vRepairOne';

const toFormData = (params) =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? '')}`)
    .join('&');

export const getInitialETMS = (params) =>
  api.post('/controller/ETMSInventoryController', toFormData({ action: 'GET_INITIAL_ETMS', ...params }));

export const addProduct = (params) =>
  api.post('/controller/ETMSInventoryController', toFormData({ action: 'ADD_PRODUCT', ...params }));

export const deleteProduct = (params) =>
  api.post('/controller/ETMSInventoryController', toFormData({ action: 'DELETE_PRODUCT', ...params }));

export const updateProduct = (params) =>
  api.post('/controller/ETMSInventoryController', toFormData({ action: 'UPDATE_PRODUCT', ...params }));

export const getProductDetails = (params) =>
  api.post('/controller/ETMSInventoryController', toFormData({ action: 'GET_PRODUCT_DETAILS', ...params }));

export const changePrimaryProduct = (params) =>
  api.post('/controller/ETMSInventoryController', toFormData({ action: 'CHANGE_PRIMARY', ...params }));

export const loadETMSHistoryDetails = (params) =>
  api.post('/controller/ETMSHistorySearchController', toFormData({ action: 'LOAD_ETMS_HISTORY_DETAILS', ...params }));

export const getETMSHistoryGrid = (params) =>
  api.post('/controller/ETMSHistorySearchController', toFormData({ action: 'ETMS_HISTORY_DETAILS', ...params }));

export const getEquipmentCircuitDetails = (params) =>
  api.post('/controller/ETMSInventoryController', toFormData({ ...params }));

export const changePrimaryNE = (params) =>
  api.post('/controller/ETMSInventoryController', toFormData({ action: 'CHANGE_PRIMARY_NE', ...params }));

export const getIPServices = (params) =>
  api.post('/controller/ETMSInventoryController', toFormData({ action: 'GET_IP_SERVICES', ...params }));

/**
 * POST wlnGroupEquipElementDetails — group equipment / circuit element details (WLN).
 * Query: applicationId, userId, searchType, groupTroubleNum
 */
export const getWlnGroupEquipElementDetails = ({
  applicationId = import.meta.env.VITE_APPLICATION_ID || '1',
  userId = 'GONDCH7',
  searchType = 'T',
  groupTroubleNum = '',
} = {}) => {
  const qs = new URLSearchParams({
    applicationId: String(applicationId),
    userId: String(userId ?? 'GONDCH7'),
    searchType: String(searchType ?? 'T'),
    groupTroubleNum: String(groupTroubleNum ?? ''),
  }).toString();
  return api.post(`${apiPrefix()}/controller/wlnGroupEquipElementDetails?${qs}`, '');
};
