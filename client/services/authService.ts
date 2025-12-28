import api from './api';

export const loginUser = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const registerUser = async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
};
export const updateProfile = async (userData: { name?: string; email?: string }) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};
