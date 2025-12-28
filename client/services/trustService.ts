import api from './api';

export const createLossReport = async (data: any) => {
    // We send as JSON. The backend controller handles req.body fields.
    const response = await api.post('/loss-reports', data);
    return response.data;
};

export const getMyLossReports = async () => {
    const response = await api.get('/loss-reports');
    return response.data;
};

export const createClaim = async (itemId: string, lossReportId: string) => {
    const response = await api.post('/claims', { itemId, lossReportId });
    return response.data;
};

export const getMyClaims = async (type: 'filed' | 'received') => {
    const response = await api.get('/claims', { params: { type } });
    return response.data;
};

export const updateClaimStatus = async (claimId: string, status: 'accepted' | 'rejected' | 'returned') => {
    const response = await api.patch(`/claims/${claimId}/status`, { status });
    return response.data;
};
