import api from './api';

export const getItems = async (params?: {
    status?: string;
    category?: string;
    search?: string;
    sort?: string;
    sortBy?: string;
}) => {
    const response = await api.get('/items', { params });
    return response.data;
};

export const getItemById = async (id: string) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
};

export const createItem = async (itemData: any) => {
    const response = await api.post('/items', itemData);
    return response.data;
};

export const getMyItems = async () => {
    const response = await api.get('/items/me');
    return response.data;
};

export const updateItemStatus = async (id: string, state: string) => {
    const response = await api.patch(`/items/${id}/status`, { state });
    return response.data;
};

export const deleteItem = async (id: string) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
};
