import api from './axiosInstance.js';

const toFormData = (params) =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? '')}`)
    .join('&');

export const sendEmailOperation = (params) =>
  api.post('/controller/EmailController', toFormData(params));

export const uploadEmailAttachment = (formData) =>
  api.post('/controller/EmailAttachmentUploadController', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const downloadAttachment = (params) =>
  api.get('/controller/AttachmentDownloadController', { params });

export const lookupEmailId = (params) =>
  api.post('/controller/LossOfDiversityController', toFormData({ action: 'LOOKUP', ...params }));
