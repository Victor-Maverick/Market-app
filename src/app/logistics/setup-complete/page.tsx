'use client'
import DashboardHeader from "@/components/dashboardHeader";
import DashboardSubHeader from "@/components/dashboardSubHeader";
import Image from "next/image";
import arrow from "../../../../public/assets/images/arrow-right.svg";
import doneImg from "../../../../public/assets/images/logDashImg.png";
import limeArrow from "../../../../public/assets/images/green arrow.png";
import dashImg from "../../../../public/assets/images/Logistics-rafiki.svg";
import {useState} from "react";
import { useOnboarding } from "@/context/LogisticsOnboardingContext";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

const Setup_Complete = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { onboardingData, submitOnboarding } = useOnboarding();
    const router = useRouter();

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [toastMessage, setToastMessage] = useState("");
    const [toastSubMessage, setToastSubMessage] = useState("");

    const showSuccessToast = (message: string, subMessage: string) => {
        setToastType("success");
        setToastMessage(message);
        setToastSubMessage(subMessage);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const showErrorToast = (message: string, subMessage: string) => {
        setToastType("error");
        setToastMessage(message);
        setToastSubMessage(subMessage);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const handleCloseToast = () => setShowToast(false);

    const validateOnboardingData = (): string | null => {
        const { companyInfo, documents, bankInfo } = onboardingData;

        if (!companyInfo.companyName) return "Company name is required";
        if (!companyInfo.ownerName) return "Owner name is required";
        if (!companyInfo.companyAddress) return "Company address is required";
        if (!companyInfo.taxIdNumber) return "Tax ID number is required";
        if (!documents.cacNumber) return "CAC number is required";
        if (!documents.cacImage) return "CAC document is required";
        if (!bankInfo.bankName) return "Bank name is required";
        if (!bankInfo.accountNumber) return "Account number is required";

        return null;
    };

    const handleSubmit = async () => {
        const validationError = validateOnboardingData();
        if (validationError) {
            showErrorToast("Validation Error", validationError);
            return;
        }

        setIsSubmitting(true);

        try {
            await submitOnboarding();
            showSuccessToast(
                "Company Onboarded Successfully",
                "Your logistics company has been set up successfully!"
            );

            // Redirect after successful submission
            setTimeout(() => router.push("/logistics/dashboard/main"), 2000);
        } catch (error) {
            console.error("Onboarding error:", error);
            showErrorToast(
                "Submission Failed",
                error instanceof Error ? error.message : "Failed to submit onboarding. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {showToast && (
                <Toast
                    type={toastType}
                    message={toastMessage}
                    subMessage={toastSubMessage}
                    onClose={handleCloseToast}
                />
            )}

            <DashboardHeader />
            <DashboardSubHeader
                welcomeText={"Manage your logistics company"}
                description={"Get started by setting up your company"}
                image={dashImg}
                textColor={"#DD6A02"}
                background={"#FFFAEB"}
            />

            <div className="h-[44px] gap-[8px] border-b-[0.5px] px-25 border-[#ededed] flex items-center">
                <Image src={arrow} alt="arrow image" className="cursor-pointer" />
                <p className="text-[14px] font-normal">
                    <span className="cursor-pointer">Logistics company //</span>
                    <span className="cursor-pointer"> License //</span>
                    <span className="cursor-pointer"> Bank Details //</span>
                    <span className="cursor-pointer font-medium"> Complete</span>
                </p>
            </div>

            <div className="flex ml-[366px] w-auto mt-16 gap-25">
                <div className="flex flex-col gap-15 h-auto">
                    <div className="flex flex-col w-[268px] h-[67px] gap-[10px]">
                        <p className="text-[#022B23] text-[16px] font-medium">Setup complete</p>
                        <p className="text-[#707070] font-medium text-[14px]">
                            Your setup is complete and pending approval, you&#39;ll be notified when approved.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col w-[400px] h-auto gap-[38px]">
                    <div className="flex flex-col items-center h-[218px] w-full justify-center">
                        <Image src={doneImg} alt="setup complete image" />
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`flex mb-[20px] gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] ${
                                isSubmitting ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:bg-[#033a30]"
                            } transition-colors w-full`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <p className="text-[#C6EB5F] font-semibold text-[14px]">Submitting...</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-[#C6EB5F] font-semibold text-[14px]">Complete Setup</p>
                                    <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Setup_Complete;