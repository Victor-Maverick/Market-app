import { StaticImageData } from "next/image";

export interface FullVehicle {
    id: number;
    vehicleId: string;
    image: string | StaticImageData;
    name: string;
    status: "active" | "inactive";
    engineNumber: string;
    type: "Bike" | "Truck";
    plateNumber: string;
}

export interface NewVehicleData {
    type: "Bike" | "Truck";
    plateNumber: string;
    engineNumber: string;
}