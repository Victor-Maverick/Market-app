import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface UpdateSectionRequest {
  name: string;
}

export const marketService = {
  updateSection: async (id: number, data: UpdateSectionRequest): Promise<void> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/market-sections/update/${id}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.status !== 200) {
        throw new Error('Failed to update section');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating market section:', error);
      throw error;
    }
  },
};