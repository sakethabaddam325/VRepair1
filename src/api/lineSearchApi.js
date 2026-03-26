import api from './axiosInstance.js';

const toFormData = (params) =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? '')}`)
    .join('&');

export const refreshLineSearchData = (params) =>
  api.post('/controller/LineSearchController', toFormData(params));

export const getIPServices = (params) =>
  api.post('/controller/LineSearchController', toFormData({ ipServiceReq: 'IPSERVICESREQ', ...params }));

export const refreshETMSSearch = (params) =>
  api.post('/controller/ETMSSearchController', toFormData(params));
