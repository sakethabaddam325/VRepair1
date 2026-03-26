import api from './axiosInstance.js';

export const getMyWorklists = () =>
  api.get('/api/worklists/my');

export const getAllWorklists = () =>
  api.get('/api/worklists/all');

export const deleteWorklist = (id) =>
  api.delete(`/api/worklists/${encodeURIComponent(id)}`);

export const setDefaultWorklist = (id) =>
  api.put(`/api/worklists/${encodeURIComponent(id)}/default`);

export const getWorklistSettings = () =>
  api.get('/api/settings/worklist');

export const updateWorklistSettings = (settings) =>
  api.put('/api/settings/worklist', settings);

export const getWorklistTickets = (worklistId, page = 1, pageSize = 200) =>
  api.get(`/api/tickets/${encodeURIComponent(worklistId)}`, { params: { page, pageSize } });

export const bulkTicketAction = (trNums, action, payload = {}) =>
  api.post('/api/tickets/bulk-action', { trNums, action, payload }, {
    headers: { 'Content-Type': 'application/json' },
  });
