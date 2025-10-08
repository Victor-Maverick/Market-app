"use client"
import LogisticsCompanyGuard from "@/components/LogisticsCompanyGuard"
import DashboardHeader from "@/components/dashboardHeader"
import LogisticsDashboardOptions from "@/components/logisticsDashboardOptions"
import flag from "@/../public/assets/images/flag-2.svg"
import Image from "next/image"
import arrowUp from "@/../public/assets/images/arrow-up.svg"
import truck from "@/../public/assets/images/truck.svg"
import formatCircle from "@/../public/assets/images/format-circle.svg"
import bike from "@/../public/assets/images/bike.svg"
import truckIcon from "@/../public/assets/images/truckIcon.svg"
import trashImg from "../../../../../public/assets/images/trash-2.svg"
import editImg from "@/../public/assets/images/edit-2.svg"
import addImg from "@/../public/assets/images/add.svg"
import arrowBack from "@/../public/assets/images/arrowBack.svg"
import arrowFoward from "@/../public/assets/images/arrowFoward.svg"
import { useState, useEffect } from "react"
import { OnboardFleetModal } from "@/components/onboardFleetModal"
import FleetOnboardSuccessModal from "@/components/fleetOnboardSuccessModal"
import OnboardRiderModal from "@/components/onboardRiderModal"
import DeleteConfirmationModal from "../../../../components/DeleteConfirmationModal"
import axios from "axios"
import type { NewVehicleData } from "@/types/vehicle"
import { useSession } from "next-auth/react"
import {
    logisticsService,
    type Vehicle,
    type VehicleResponse,
    type UpdateVehicleRequest,
} from "@/services/logisticsService"
import { SkeletonLoader } from "@/components/LoadingSkeletons";
import { useRouter, useSearchParams } from "next/navigation"

interface AddVehicleResponse {
    id: string
    plateNumber: string
    engineNumber: string
    type: string
}

interface UpdateFleetResponse {
    ownerEmail: string
}

interface Rider {
    id: number
    firstName?: string
    lastName?: string
    email?: string
    name: string
    status: string
    phone: string
    vehicle?: Vehicle
}

const FleetTableRow = ({
                           vehicle,
                           isLast,
                           onEdit,
                           onDelete,
                       }: {
    vehicle: VehicleResponse
    isLast: boolean
    onEdit: (vehicle: VehicleResponse) => void
    onDelete: (vehicle: VehicleResponse) => void
}) => {
    const vehicleImage = vehicle.type.toLowerCase() === "bike" ? bike : truckIcon
    const vehicleName = vehicle.type.toLowerCase() === "bike" ? "Bike" : "Truck"

    return (
        <div className={`flex h-[72px] ${!isLast ? "border-b border-[#EAECF0]" : ""}`}>
            <div className="flex items-center w-[570px] px-[24px] gap-[12px]">
                <input type="checkbox" className="w-[20px] h-[20px] rounded-[6px] border border-[#D0D5DD] accent-[#6941C6]" />
                <div className="bg-[#ededed] flex justify-center items-center rounded-full h-[40px] w-[40px] overflow-hidden mt-[2px]">
                    <Image
                        src={vehicleImage || "/placeholder.svg"}
                        alt={"vehicle image"}
                        width={26}
                        height={26}
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <p className="text-[14px] font-medium text-[#101828]">{vehicleName}</p>
                    <p className="text-[12px] text-[#667085]">ID: #{vehicle.id}</p>
                </div>
            </div>
            <div className="flex justify-center items-center w-[140px]">
                <p className="text-[14px] font-medium text-[#101828]">{vehicle.plateNumber}</p>
            </div>
            <div className="flex items-center w-[156px] px-[16px]">
                <p className="text-[14px] font-medium text-[#101828]">{vehicle.engineNumber}</p>
            </div>
            <div className="flex flex-col gap-[4px] justify-center w-[290px] px-[20px]">
                <p className="text-[14px] font-medium text-[#101828]">{vehicle.riderName ? vehicle.riderName : "none"}</p>
            </div>
            <div className="flex w-[116px] gap-[16px] p-[20px]">
                <Image
                    src={trashImg || "/placeholder.svg"}
                    alt={"delete"}
                    className="cursor-pointer hover:opacity-70"
                    onClick={() => onDelete(vehicle)}
                />
                <Image
                    src={editImg || "/placeholder.svg"}
                    alt={"edit"}
                    className="cursor-pointer hover:opacity-70"
                    onClick={() => onEdit(vehicle)}
                />
            </div>
        </div>
    )
}

const RiderTableRow = ({
                           rider,
                           isLast,
                           onDelete,
                       }: {
    rider: Rider
    isLast: boolean
    onDelete: (rider: Rider) => void
}) => {
    return (
        <div className={`flex h-[72px] ${!isLast ? "border-b border-[#EAECF0]" : ""}`}>
            <div className="flex items-center w-[570px] px-[24px] gap-[12px]">
                <input type="checkbox" className="w-[20px] h-[20px] rounded-[6px] border border-[#D0D5DD] accent-[#6941C6]" />
                <div className="flex flex-col">
                    <p className="text-[14px] font-medium text-[#101828]">{rider.name}</p>
                    <p className="text-[12px] text-[#667085]">ID: #{rider.id}</p>
                </div>
            </div>
            <div className="flex justify-center items-center w-[140px]">
                <p className="text-[14px] font-medium text-[#101828]">{rider.phone}</p>
            </div>
            <div className="flex items-center w-[156px] px-[16px]">
                <p className="text-[14px] font-medium text-[#101828]">{rider.email}</p>
            </div>
            <div className="flex flex-col gap-[4px] justify-center w-[290px] px-[20px]">
                <p className="text-[14px] font-medium text-[#101828]">{rider.status}</p>
            </div>
            <div className="flex w-[116px] gap-[16px] p-[20px]">
                <Image
                    src={trashImg || "/placeholder.svg"}
                    alt={"delete"}
                    className="cursor-pointer hover:opacity-70"
                    onClick={() => onDelete(rider)}
                />
                <Image src={editImg || "/placeholder.svg"} alt={"edit"} className="opacity-50 cursor-not-allowed" />
            </div>
        </div>
    )
}

const logisticsApi = axios.create({
    baseURL: "https://digitalmarket.benuestate.gov.ng/api/logistics",
    headers: {
        "Content-Type": "application/json",
    },
})

type BackendVehicleType = "BIKE" | "TRUCK"

const mapToBackendType = (frontendType: "Bike" | "Truck"): BackendVehicleType => {
    return frontendType.toUpperCase() as BackendVehicleType
}

const Fleet = () => {
    const { data: session } = useSession()
    const [isFleetModalOpen, setIsFleetModalOpen] = useState(false)
    const [isRiderModalOpen, setIsRiderModalOpen] = useState(false)
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
    const [fleetData, setFleetData] = useState<VehicleResponse[]>([])
    const [ridersData, setRidersData] = useState<Rider[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialTab = (searchParams.get("tab") as "fleet" | "riders") || "fleet"
    const [activeTab, setActiveTab] = useState<"fleet" | "riders">(initialTab)
    const itemsPerPage = 8
    const totalPages = Math.ceil(activeTab === "fleet" ? fleetData.length : ridersData.length / itemsPerPage)

    const [loading, setLoading] = useState(true)
    const [totalFleetCount, setTotalFleetCount] = useState(0)
    const [bikesCount, setBikesCount] = useState(0)
    const [trucksCount, setTrucksCount] = useState(0)
    const [ridersCount, setRidersCount] = useState(0)
    const [companyVehicles, setCompanyVehicles] = useState<VehicleResponse[]>([])

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<{ type: "vehicle" | "rider"; item: VehicleResponse | Rider } | null>(
        null,
    )
    const [editingVehicle, setEditingVehicle] = useState<VehicleResponse | null>(null)
    const [editFormData, setEditFormData] = useState<UpdateVehicleRequest>({
        engineNumber: "",
        plateNumber: "",
        type: "",
    })

    const handleTabChange = (tab: "fleet" | "riders") => {
        setActiveTab(tab)
        setCurrentPage(1) // Reset to first page when switching tabs
        router.replace(`/logistics/dashboard/fleet?tab=${tab}`, { scroll: false })
    }

    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.email) {
                try {
                    const [totalFleet, bikes, trucks, riders, vehicles, companyVehicles, ridersData] = await Promise.all([
                        logisticsService.getAllCompanyVehiclesCount(session.user.email),
                        logisticsService.getAllCompanyBikesCount(session.user.email),
                        logisticsService.getAllCompanyTrucksCount(session.user.email),
                        logisticsService.getAllCompanyRidersCount(session.user.email),
                        logisticsService.getAllCompanyVehicles(session.user.email),
                        logisticsService.getAllVehiclesForCompany(session.user.email),
                        logisticsService.getAllCompanyRiders(session.user.email),
                    ])
                    setTotalFleetCount(totalFleet)
                    console.log("Fleet count: ",totalFleetCount);
                    setBikesCount(bikes)
                    setTrucksCount(trucks)
                    setRidersCount(riders)
                    setFleetData(vehicles)
                    setCompanyVehicles(companyVehicles)
                    setRidersData(ridersData)
                } catch (error) {
                    console.error("Error fetching data:", error)
                } finally {
                    setLoading(false)
                }
            }
        }

        fetchData()
    }, [session])

    const handleSubmitVehicles = async (vehicles: NewVehicleData[]) => {
        if (!session?.user?.email) return

        try {
            const ownerEmail = session.user.email
            const onboardPromises = vehicles.map((vehicle) =>
                logisticsApi.post<AddVehicleResponse>("/onboardVehicle", {
                    ownerEmail,
                    engineNumber: vehicle.engineNumber,
                    plateNumber: vehicle.plateNumber,
                    type: mapToBackendType(vehicle.type),
                }),
            )

            await Promise.all(onboardPromises)

            await logisticsApi.post<UpdateFleetResponse>("/updateFleetNumber", {
                ownerEmail,
                fleetNumber: vehicles.length,
            })

            const [totalFleet, bikes, trucks, riders, vehiclesData] = await Promise.all([
                logisticsService.getAllCompanyVehiclesCount(session.user.email),
                logisticsService.getAllCompanyBikesCount(session.user.email),
                logisticsService.getAllCompanyTrucksCount(session.user.email),
                logisticsService.getAllCompanyRidersCount(session.user.email),
                logisticsService.getAllCompanyVehicles(session.user.email),
            ])

            setTotalFleetCount(totalFleet)
            setBikesCount(bikes)
            setTrucksCount(trucks)
            setRidersCount(riders)
            setFleetData(vehiclesData)
            setIsSuccessModalOpen(true)
        } catch (error) {
            console.error("Fleet onboarding failed:", error)
            let errorMessage = "Failed to onboard fleet"
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || error.message
            }
            alert(errorMessage)
        } finally {
            setIsFleetModalOpen(false)
        }
    }

    const handleOpenFleetModal = () => {
        setIsFleetModalOpen(true)
    }

    const handleCloseFleetModal = () => {
        setIsFleetModalOpen(false)
    }

    const handleOpenRiderModal = () => {
        setIsRiderModalOpen(true)
    }

    const handleCloseRiderModal = () => {
        setIsRiderModalOpen(false)
    }

    const handleRiderSuccess = async () => {
        if (session?.user?.email) {
            try {
                const [riders, ridersData] = await Promise.all([
                    logisticsService.getAllCompanyRidersCount(session.user.email),
                    logisticsService.getAllCompanyRiders(session.user.email),
                ])
                setRidersCount(riders)
                setRidersData(ridersData)
                console.log("Rider onboarded successfully!")
            } catch (error) {
                console.error("Error refreshing riders count:", error)
            }
        }
    }

    const handleSuccessModalClose = () => {
        setIsSuccessModalOpen(false)
    }

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    const handlePageClick = (page: number) => {
        setCurrentPage(page)
    }

    const handleEditVehicle = (vehicle: VehicleResponse) => {
        setEditingVehicle(vehicle)
        setEditFormData({
            engineNumber: vehicle.engineNumber,
            plateNumber: vehicle.plateNumber,
            type: vehicle.type,
        })
    }

    const handleDeleteVehicle = (vehicle: VehicleResponse) => {
        setItemToDelete({ type: "vehicle", item: vehicle })
        setDeleteModalOpen(true)
    }

    const handleDeleteRider = (rider: Rider) => {
        setItemToDelete({ type: "rider", item: rider })
        setDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return

        try {
            if (itemToDelete.type === "vehicle") {
                const vehicle = itemToDelete.item as VehicleResponse
                await logisticsService.deleteVehicle(vehicle.id)

                if (session?.user?.email) {
                    const [totalFleet, bikes, trucks, vehicles, companyVehicles] = await Promise.all([
                        logisticsService.getAllCompanyVehiclesCount(session.user.email),
                        logisticsService.getAllCompanyBikesCount(session.user.email),
                        logisticsService.getAllCompanyTrucksCount(session.user.email),
                        logisticsService.getAllCompanyVehicles(session.user.email),
                        logisticsService.getAllVehiclesForCompany(session.user.email),
                    ])
                    setTotalFleetCount(totalFleet)
                    setBikesCount(bikes)
                    setTrucksCount(trucks)
                    setFleetData(vehicles)
                    setCompanyVehicles(companyVehicles)
                }
            } else if (itemToDelete.type === "rider") {
                const rider = itemToDelete.item as Rider
                await logisticsService.deleteRider(rider.id)

                if (session?.user?.email) {
                    const [riders, ridersData] = await Promise.all([
                        logisticsService.getAllCompanyRidersCount(session.user.email),
                        logisticsService.getAllCompanyRiders(session.user.email),
                    ])
                    setRidersCount(riders)
                    setRidersData(ridersData)
                }
            }

            setDeleteModalOpen(false)
            setItemToDelete(null)
        } catch (error) {
            console.error("Error deleting item:", error)
            alert("Failed to delete item. Please try again.")
        }
    }

    const handleSaveEdit = async () => {
        if (!editingVehicle) return

        try {
            await logisticsService.editVehicle(editingVehicle.id, editFormData)

            if (session?.user?.email) {
                const [vehicles, companyVehicles] = await Promise.all([
                    logisticsService.getAllCompanyVehicles(session.user.email),
                    logisticsService.getAllVehiclesForCompany(session.user.email),
                ])
                setFleetData(vehicles)
                setCompanyVehicles(companyVehicles)
            }

            setEditingVehicle(null)
        } catch (error) {
            console.error("Error editing vehicle:", error)
            alert("Failed to edit vehicle. Please try again.")
        }
    }

    const handleCancelEdit = () => {
        setEditingVehicle(null)
        setEditFormData({
            engineNumber: "",
            plateNumber: "",
            type: "",
        })
    }

    const startIndex = (currentPage - 1) * itemsPerPage
    const currentFleetItems = companyVehicles.slice(startIndex, startIndex + itemsPerPage)
    const currentRiderItems = ridersData.slice(startIndex, startIndex + itemsPerPage)

    return (
        <LogisticsCompanyGuard>
            <DashboardHeader />
            <LogisticsDashboardOptions />
            <div className="flex flex-col py-[30px] px-25">
                <div className="flex flex-col gap-[12px]">
                    <p className="text-[#022B23] text-[16px] font-medium">Fleet management</p>
                    <div className="flex justify-between items-center">
                        <div className="flex h-[100px] gap-[20px]">
                            <div className="flex border-[0.5px] flex-col gap-[12px] p-[12px] border-[#E4E4E7] rounded-[14px] h-full w-[246px]">
                                <div className="flex items-center text-[#71717A] text-[12px] font-medium gap-[8px]">
                                    <Image src={flag || "/placeholder.svg"} alt={"image"} />
                                    <p>Total Fleet</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-[#18181B] text-[16px] font-medium">{loading ? "..." : fleetData.length}</p>
                                    <div className="flex gap-[4px] items-center">
                                        <Image src={arrowUp || "/placeholder.svg"} alt={"image"} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-[0.5px] flex-col gap-[12px] p-[12px] border-[#E4E4E7] rounded-[14px] h-full w-[246px]">
                                <div className="flex items-center text-[#71717A] text-[12px] font-medium gap-[8px]">
                                    <Image src={formatCircle || "/placeholder.svg"} alt={"image"} />
                                    <p>Bikes</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-[#18181B] text-[16px] font-medium">{loading ? "..." : bikesCount}</p>
                                    <div className="flex gap-[4px] items-center">
                                        <Image src={arrowUp || "/placeholder.svg"} alt={"image"} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-[0.5px] flex-col gap-[12px] p-[12px] border-[#E4E4E7] rounded-[14px] h-full w-[246px]">
                                <div className="flex items-center text-[#71717A] text-[12px] font-medium gap-[8px]">
                                    <Image src={truck || "/placeholder.svg"} alt={"image"} />
                                    <p>Trucks</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-[#18181B] text-[16px] font-medium">{loading ? "..." : trucksCount}</p>
                                    <div className="flex gap-[4px] items-center">
                                        <Image src={arrowUp || "/placeholder.svg"} alt={"image"} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            onClick={handleOpenFleetModal}
                            className="flex items-center w-[164px] gap-[9px] cursor-pointer bg-[#022B23] h-[52px] rounded-[12px] text-[#C6EB5F] p-[16px]"
                        >
                            <p>Add new fleet</p>
                            <Image src={addImg || "/placeholder.svg"} alt={"image"} />
                        </div>
                    </div>
                    <div className="flex gap-[20px] items-center">
                        <div className="flex h-[100px] gap-[20px]">
                            <div className="flex border-[0.5px] flex-col gap-[12px] p-[12px] border-[#E4E4E7] rounded-[14px] h-full w-[246px]">
                                <div className="flex items-center text-[#71717A] text-[12px] font-medium gap-[8px]">
                                    <Image src={truck || "/placeholder.svg"} alt={"image"} />
                                    <p>Riders</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-[#18181B] text-[16px] font-medium">{loading ? "..." : ridersCount}</p>
                                    <p
                                        className="text-[#18181B] cursor-pointer text-[12px] underline"
                                        onClick={() => handleTabChange("riders")}
                                    >
                                        view riders
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div
                            onClick={handleOpenRiderModal}
                            className="flex items-center w-[164px] gap-[9px] cursor-pointer bg-[#022B23] h-[52px] rounded-[12px] text-[#C6EB5F] p-[16px]"
                        >
                            <p>Add new Rider</p>
                            <Image src={addImg || "/placeholder.svg"} alt={"image"} />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col mt-[60px] rounded-[24px] border-[1px] border-[#EAECF0]">
                    <div className="flex border-b border-[#ededed] mb-6 px-[100px]">
                        <div className="w-[273px] h-[52px] gap-[24px] flex items-end">
                            <p
                                className={`py-2 text-[#11151F] cursor-pointer text-[14px] ${activeTab === "fleet" ? "font-medium border-b-2 border-[#C6EB5F]" : "text-gray-500"}`}
                                onClick={() => handleTabChange("fleet")}
                            >
                                Fleet
                            </p>
                            <p
                                className={`py-2 text-[#11151F] cursor-pointer text-[14px] ${activeTab === "riders" ? "font-medium border-b-2 border-[#C6EB5F]" : "text-gray-500"}`}
                                onClick={() => handleTabChange("riders")}
                            >
                                Riders
                            </p>
                        </div>
                    </div>

                    {activeTab === "fleet" && (
                        <>
                            <div className="my-[20px] mx-[20px] flex justify-between">
                                <div className="flex items-center gap-[8px]">
                                    <p className="text-[#101828] text-[18px] font-medium">Company fleet</p>
                                    <span className="flex text-[18px] text-[#6941C6] font-medium items-center justify-center h-[22px] w-[32px] rounded-[16px] bg-[#F9F5FF]">
                    {companyVehicles.length}
                  </span>
                                </div>
                            </div>
                            <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                                <div className="flex items-center px-[24px] w-[600px] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Vehicle ID</p>
                                </div>
                                <div className="flex items-center px-[10px] w-[140px] py-[12px] gap-[4px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Plate Number</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[156px] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Engine number</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[278px] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Rider</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[116px] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Actions</p>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                {currentFleetItems.map((product, index) =>
                                    editingVehicle?.id === product.id ? (
                                        <div
                                            key={product.id}
                                            className={`flex h-[72px] ${index !== currentFleetItems.length - 1 ? "border-b border-[#EAECF0]" : ""}`}
                                        >
                                            <div className="flex items-center w-[570px] px-[24px] gap-[12px]">
                                                <input
                                                    type="checkbox"
                                                    className="w-[20px] h-[20px] rounded-[6px] border border-[#D0D5DD] accent-[#6941C6]"
                                                />
                                                <div className="bg-[#ededed] flex justify-center items-center rounded-full h-[40px] w-[40px] overflow-hidden mt-[2px]">
                                                    <Image
                                                        src={product.type.toLowerCase() === "bike" ? bike : truckIcon}
                                                        alt={"vehicle image"}
                                                        width={26}
                                                        height={26}
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-[14px] font-medium text-[#101828]">
                                                        {product.type.toLowerCase() === "bike" ? "Bike" : "Truck"}
                                                    </p>
                                                    <p className="text-[12px] text-[#667085]">ID: #{product.id}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-center items-center w-[140px]">
                                                <input
                                                    type="text"
                                                    value={editFormData.plateNumber}
                                                    onChange={(e) => setEditFormData({ ...editFormData, plateNumber: e.target.value })}
                                                    className="text-[14px] font-medium text-[#101828] border border-gray-300 rounded px-2 py-1 w-full"
                                                />
                                            </div>
                                            <div className="flex items-center w-[156px] px-[16px]">
                                                <input
                                                    type="text"
                                                    value={editFormData.engineNumber}
                                                    onChange={(e) => setEditFormData({ ...editFormData, engineNumber: e.target.value })}
                                                    className="text-[14px] font-medium text-[#101828] border border-gray-300 rounded px-2 py-1 w-full"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-[4px] justify-center w-[290px] px-[20px]">
                                                <p className="text-[14px] font-medium text-[#101828]">
                                                    {product.riderName ? product.riderName : "none"}
                                                </p>
                                            </div>
                                            <div className="flex w-[116px] gap-[8px] p-[20px]">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                >
                                                    Done
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <FleetTableRow
                                            key={product.id}
                                            vehicle={product}
                                            isLast={index === currentFleetItems.length - 1}
                                            onEdit={handleEditVehicle}
                                            onDelete={handleDeleteVehicle}
                                        />
                                    ),
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === "riders" && (
                        <>
                            <div className="my-[20px] mx-[20px] flex justify-between">
                                <div className="flex items-center gap-[8px]">
                                    <p className="text-[#101828] text-[18px] font-medium">Company Riders</p>
                                    <span className="flex text-[18px] text-[#6941C6] font-medium items-center justify-center h-[22px] w-[32px] rounded-[16px] bg-[#F9F5FF]">
                    {ridersData.length}
                  </span>
                                </div>
                            </div>
                            <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                                <div className="flex items-center px-[24px] w-[600px] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Rider ID</p>
                                </div>
                                <div className="flex items-center px-[10px] w-[140px] py-[12px] gap-[4px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Phone</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[156px] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Email</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[278px] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Status</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[116px] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Actions</p>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                {currentRiderItems.map((rider, index) => (
                                    <RiderTableRow
                                        key={rider.id}
                                        rider={rider}
                                        isLast={index === currentRiderItems.length - 1}
                                        onDelete={handleDeleteRider}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="h-[68px] border-t-[1px] justify-between flex items-center border-[#EAECF0] px-[24px] py-[12px]">
                        <div
                            onClick={handlePrevious}
                            className={`flex text-[#344054] text-[14px] font-medium gap-[8px] justify-center items-center border-[#D0D5DD] border-[1px] cursor-pointer hover:shadow-md shadow-sm w-[114px] rounded-[8px] px-[14px] py-[8px] h-[36px] ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <Image src={arrowBack || "/placeholder.svg"} alt={"image"} />
                            <p>Previous</p>
                        </div>
                        <div className="flex gap-[2px]">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <div
                                    key={index + 1}
                                    onClick={() => handlePageClick(index + 1)}
                                    className={`flex justify-center items-center w-[36px] h-[36px] rounded-[8px] text-[14px] font-medium cursor-pointer ${
                                        currentPage === index + 1
                                            ? "bg-[#ecfdf6] text-[#022B23]"
                                            : "bg-white text-[#022B23] hover:shadow-md"
                                    }`}
                                >
                                    {index + 1}
                                </div>
                            ))}
                        </div>
                        <div
                            onClick={handleNext}
                            className={`flex text-[#344054] text-[14px] gap-[8px] font-medium justify-center items-center border-[#D0D5DD] border-[1px] cursor-pointer hover:shadow-md shadow-sm w-[88px] rounded-[8px] px-[14px] py-[8px] h-[36px] ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <p>Next</p>
                            <Image src={arrowFoward || "/placeholder.svg"} alt={"image"} />
                        </div>
                    </div>
                </div>
            </div>

            <OnboardFleetModal isOpen={isFleetModalOpen} onClose={handleCloseFleetModal} onSubmit={handleSubmitVehicles} />

            <OnboardRiderModal isOpen={isRiderModalOpen} onClose={handleCloseRiderModal} onSuccess={handleRiderSuccess} />

            <FleetOnboardSuccessModal isOpen={isSuccessModalOpen} onClose={handleSuccessModalClose} />

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false)
                    setItemToDelete(null)
                }}
                onDelete={handleConfirmDelete}
                title={`Sure you want to delete this ${itemToDelete?.type}?`}
                message={`Be sure you want to delete this ${itemToDelete?.type} as this action cannot be undone`}
                confirmText="Delete"
            />
        </LogisticsCompanyGuard>
    )
}

export default Fleet
