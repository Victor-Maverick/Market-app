import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const logisticsApi = axios.create({
    baseURL: `${API_BASE_URL}`,
    headers: {
        'Content-Type': 'application/json',
    },
});


export interface LogisticsCompany {
    id: number;
    companyName: string;
    companyAddress: string;
    ownerEmail: string;
    ownerName: string;
    fleetNumber: number;
    logoUrl?: string;
    cacImageUrl?: string;
    cacNumber?: string;
    tin?: string;
    status?: 'Active' | 'Inactive' | 'Pending';
}

export interface Vehicle {
    id: number;
    engineNumber: string;
    plateNumber: string;
    type: 'BIKE' | 'TRUCK' | 'VAN';
    status?: string;
}

export interface Rider {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    name: string;
    status: string;
    phone: string;
    vehicle?: Vehicle;
}

export interface LogisticsStats {
    totalPartners: number;
    activePartners: number;
    inactivePartners: number;
    pendingPartners: number;
    totalVehicles: number;
    totalRiders: number;
}

export interface UpdateVehicleRequest {
    engineNumber: string
    plateNumber: string
    type: string
}

export interface VehicleResponse {
    id: number;
    engineNumber: string;
    plateNumber: string;
    type: string;
    riderName: string;
}

export interface  DeliveryResponse{
    id: number;
    orderNumber: string;
    customerName: string;
    contactPhone: string;
    deliveryAddress: string;
    deliveryMethod: string;
    deliveryFee: number;
    grandTotal: number;
    riderName: string;
    riderPhone: string;
    createdAt: string;
    updatedAt: string;
}

export const logisticsService = {
    // Get all logistics companies/partners
    async getAllCompanies(): Promise<LogisticsCompany[]> {
        try {
            const response = await logisticsApi.get('/users/logisticsAll');
            return response.data;
        } catch (error) {
            console.error('Error fetching logistics companies:', error);
            throw error;
        }
    },

    // Get all vehicles
    async getAllVehicles(): Promise<Vehicle[]> {
        try {
            const response = await logisticsApi.get('/logistics/allVehicles');
            return response.data;
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            throw error;
        }
    },


    // Get all company vehicles count
    async getAllCompanyRiders(email: string): Promise<Rider[]> {
        try {
            const response = await logisticsApi.get(`/logistics/allCompanyRiders?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching company vehicles count:', error);
            throw error;
        }
    },

    // Get vehicle count
    async getVehicleCount(): Promise<number> {
        try {
            const response = await logisticsApi.get('/logistics/vehicleCount');
            return response.data;
        } catch (error) {
            console.error('Error fetching vehicle count:', error);
            throw error;
        }
    },

    // Get rider count
    async getRiderCount(): Promise<number> {
        try {
            const response = await logisticsApi.get('/logistics/riderCount');
            return response.data;
        } catch (error) {
            console.error('Error fetching rider count:', error);
            throw error;
        }
    },

    // Get available riders
    async getAvailableRiders(): Promise<Vehicle[]> {
        try {
            const response = await logisticsApi.get('/logistics/get-available-riders');
            return response.data;
        } catch (error) {
            console.error('Error fetching available riders:', error);
            throw error;
        }
    },

    // Update vehicle status
    async updateVehicleStatus(vehicleId: number, status: string): Promise<string> {
        try {
            const response = await logisticsApi.put(`/logistics/update-vehicle-status?vehicleId=${vehicleId}&status=${status}`);
            return response.data;
        } catch (error) {
            console.error('Error updating vehicle status:', error);
            throw error;
        }
    },

    // Get logistics statistics
    async getLogisticsStats(): Promise<LogisticsStats> {
        try {
            const [vehicleCount, riderCount, companies] = await Promise.all([
                this.getVehicleCount(),
                this.getRiderCount(),
                this.getAllCompanies().catch(() => [])
            ]);

            // Calculate stats from the actual companies data
            const totalPartners = companies.length;
            const activePartners = companies.filter(company => company.status === 'Active').length;
            const inactivePartners = companies.filter(company => company.status === 'Inactive').length;
            const pendingPartners = companies.filter(company => company.status === 'Pending' || !company.status).length;

            return {
                totalPartners,
                activePartners,
                inactivePartners,
                pendingPartners,
                totalVehicles: vehicleCount,
                totalRiders: riderCount
            };
        } catch (error) {
            console.error('Error fetching logistics stats:', error);
            // Fallback to default values if API fails
            return {
                totalPartners: 0,
                activePartners: 0,
                inactivePartners: 0,
                pendingPartners: 0,
                totalVehicles: 0,
                totalRiders: 0
            };
        }
    },

    // Approve logistics partner (this endpoint might need to be added to backend)
    async approvePartner(partnerId: number): Promise<void> {
        try {
            // This endpoint needs to be implemented in the backend
            await logisticsApi.post(`/logistics/approve-partner/${partnerId}`);
        } catch (error) {
            console.error('Error approving partner:', error);
            throw error;
        }
    },

    // Reject logistics partner (this endpoint might need to be added to backend)
    async rejectPartner(partnerId: number): Promise<void> {
        try {
            // This endpoint needs to be implemented in the backend
            await logisticsApi.post(`/logistics/reject-partner/${partnerId}`);
        } catch (error) {
            console.error('Error rejecting partner:', error);
            throw error;
        }
    },

    // Delete logistics partner (this endpoint might need to be added to backend)
    async deletePartner(partnerId: number): Promise<void> {
        try {
            // This endpoint needs to be implemented in the backend
            await logisticsApi.delete(`/logistics/partner/${partnerId}`);
        } catch (error) {
            console.error('Error deleting partner:', error);
            throw error;
        }
    },

    // Check if company exists by owner email
    async existsByOwnerEmail(ownerEmail: string): Promise<boolean> {
        try {
            const response = await logisticsApi.get(`/logistics/existsByOwnerEmail?ownerEmail=${ownerEmail}`);
            return response.data;
        } catch (error) {
            console.error('Error checking company existence:', error);
            throw error;
        }
    },

    // Get company by owner email
    async getCompanyByOwnerEmail(ownerEmail: string): Promise<{ id: number; fleetNumber: number }> {
        try {
            const response = await logisticsApi.get(`/logistics/getCompanyByOwnerEmail?ownerEmail=${ownerEmail}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching company by owner email:', error);
            throw error;
        }
    },

    // Get all company vehicles count
    async getAllCompanyOrders(email: string): Promise<DeliveryResponse[]> {
        try {
            const response = await logisticsApi.get(`/logistics/company-orders?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching company vehicles count:', error);
            throw error;
        }
    },

    // Get all company vehicles count
    async getAllCompanyVehiclesCount(email: string): Promise<number> {
        try {
            const response = await logisticsApi.get(`/logistics/allCompanyVehiclesCount?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching company vehicles count:', error);
            throw error;
        }
    },

    // Get all company bikes count
    async getAllCompanyBikesCount(email: string): Promise<number> {
        try {
            const response = await logisticsApi.get(`/logistics/allCompanyBikesCount?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching company bikes count:', error);
            throw error;
        }
    },

    // Get all company trucks count
    async getAllCompanyTrucksCount(email: string): Promise<number> {
        try {
            const response = await logisticsApi.get(`/logistics/allCompanyTrucksCount?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching company trucks count:', error);
            throw error;
        }
    },

    // Get all company riders count
    async getAllCompanyRidersCount(email: string): Promise<number> {
        try {
            const response = await logisticsApi.get(`/logistics/allCompanyRidersCount?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching company riders count:', error);
            throw error;
        }
    },

    // Get all company vehicles
    async getAllCompanyVehicles(email: string): Promise<VehicleResponse[]> {
        try {
            const response = await logisticsApi.get(`/logistics/allCompanyVehicles?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching company vehicles:', error);
            throw error;
        }
    },

    // Get all vehicles for company
    async getAllVehiclesForCompany(email: string): Promise<VehicleResponse[]> {
        try {
            const response = await logisticsApi.get(`/logistics/allVehiclesForCompany?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching company vehicles:', error);
            throw error;
        }
    },

    async deleteVehicle(vehicleId: number): Promise<string> {
        try {
            const response = await logisticsApi.delete(`/logistics/delete-vehicle?vehicleId=${vehicleId}`)
            return response.data
        } catch (error) {
            console.error("Error deleting vehicle:", error)
            throw error
        }
    },

    async editVehicle(vehicleId: number, request: UpdateVehicleRequest): Promise<string> {
        try {
            const response = await logisticsApi.put(`/logistics/editVehicle?vehicleId=${vehicleId}`, request)
            return response.data
        } catch (error) {
            console.error("Error editing vehicle:", error)
            throw error
        }
    },

    async deleteRider(riderId: number): Promise<string> {
        try {
            const response = await logisticsApi.delete(`/logistics/delete-rider?riderId=${riderId}`)
            return response.data
        } catch (error) {
            console.error("Error deleting rider:", error)
            throw error
        }
    },

    // Onboard company
    async onboardCompany(formData: FormData): Promise<{ success: boolean; message: string }> {
        try {
            const response = await logisticsApi.post('/logistics/onboardCompany', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return {
                success: true,
                message: response.data || 'Company onboarded successfully'
            };
        } catch (error) {
            console.error('Error onboarding company:', error);
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data || error.message
                };
            }
            return {
                success: false,
                message: 'Failed to onboard company'
            };
        }
    }
};