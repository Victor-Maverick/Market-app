import axios from 'axios';

export interface StatsData {
    vendors: number;
    stores: number;
    buyers: number;
}

export const statsService = {
    async getHomePageStats(): Promise<StatsData> {
        try {
            const [vendorsRes, shopsRes, usersRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getAllVendorsCount`),
                axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/all`),
                axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/allCount`)
            ]);

            return {
                vendors: vendorsRes.data || 0,
                stores: Array.isArray(shopsRes.data) ? shopsRes.data.length : 0,
                buyers: usersRes.data || 0
            };
        } catch (error) {
            console.error('Error fetching stats data:', error);
            throw error;
        }
    }
};