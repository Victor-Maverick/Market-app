
import BackButton from "@/components/BackButton";

const AboutUs =()=>{
    return(
        <div className="bg-black min-h-screen">
            <div className="p-6">
                <BackButton variant="default" text="Go back" className="text-white" />
            </div>
            <div className="flex pt-[100px] justify-center">
                <div className="text-center">
                    <p className="text-white text-2xl mb-4">About Us</p>
                    <p className="text-gray-300">Learn more about our platform</p>
                </div>
            </div>
        </div>
    )
}

export default AboutUs