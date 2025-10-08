
interface AddVehicleRequest {
    companyId: number;
    engineNumber: string;
    plateNumber: string;
    type: string;
}

interface AddVehicleResponse {
    id: string;
    engineNumber: string;
    plateNumber: string;
    type: string;
    status: string;
}

interface UpdateFleetNumberRequest {
    ownerEmail: string;
    fleetNumber: number;
}

export const onboardVehicle = async (vehicle: AddVehicleRequest): Promise<AddVehicleResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/onboardVehicle`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicle),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to onboard vehicle');
    }

    return response.json();
};

export const updateFleetNumber = async (data: UpdateFleetNumberRequest): Promise<void> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/updateFleetNumber`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update fleet number');
    }
};