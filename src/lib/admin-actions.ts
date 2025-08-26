import axios from 'axios';

export const getUsers = async () => {
  const { data } = await axios.get('/api/admin/users');
  return data;
};

export const updateUser = async (userData: any) => {
  const { data } = await axios.put(`/api/admin/users/${userData.id}`, userData);
  return data;
};

export const deleteUser = async (userId: string) => {
  await axios.delete(`/api/admin/users/${userId}`);
};
