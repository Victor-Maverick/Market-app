import Image from "next/image";
import shadow from "../../../public/assets/images/shadow.png";
import chatGradient from '../../../public/assets/images/chatGradient.svg';
import { FaPaperPlane } from "react-icons/fa";
import MarketPlaceHeader from "@/components/marketPlaceHeader";

const Chat = () => {
    return (
        <div className="flex flex-col max-h-[992px] pb-25 h-full w-full">
            <MarketPlaceHeader />
            {/* Shadow Bar */}
            <div
                className="h-[45px] w-full"
                style={{
                    backgroundImage: `url(${shadow.src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            ></div>

            {/* Greeting Section */}
            <div className="flex flex-col mt-6 md:mt-25 px-4 md:ml-[300px]">
                <div className="w-full md:w-[371px] h-[130px] flex flex-col gap-[19px]">
                    <Image src={chatGradient} alt={'image'} className="h-[44px] w-[44px]" />
                    <div>
                        <p className="text-[#515151] text-[20px]">Welcome,</p>
                        <p className="text-[24px] font-medium text-[#171719]">What do you want to do today?</p>
                    </div>
                </div>
            </div>

            {/* ChatUI Input and Suggestions */}
            <div className="mt-60 px-4 h-auto md:px-[300px] w-full">
                {/* Input Box */}
                <div className="md:w-[780px] md:h-full group relative">
                    {/* Container background and border that appears when typing */}
                    <div className="absolute inset-0 -z-10 group-focus-within:bg-[#ECFDF6] group-focus-within:px-[2px] group-focus-within:pt-[2px] rounded-[20px]">
                        {/* Border element - no transition to prevent flash */}
                        <div className="absolute inset-0 border-[0.5px] border-transparent group-focus-within:border-[#D1FAE7] rounded-[20px]"></div>
                    </div>

                    <div className="md:group-focus-within:h-[150px] group-focus-within:px-[2px] group-focus-within:pt-[2px] transition-all duration-200">
                        {/* Input container - instant border change */}
                        <div className="flex h-[64px] group-focus-within:h-[93px] items-center border-[2px] border-[#ededed] group-focus-within:border-[0.5px] rounded-[18px] px-4 py-2 w-full max-w-[780px] bg-white transition-[height] duration-200">
                            <input
                                type="text"
                                placeholder="Type here..."
                                className="flex-grow text-[#707070] italic outline-none text-[14px] md:text-base bg-transparent h-full"
                            />
                            <button  className="text-white bg-[#022B23] rounded-full p-2 ml-2">
                                <FaPaperPlane size={16} />
                            </button>
                        </div>

                        {/* Suggestions container - now with left margin when focused */}
                        <div className="flex flex-wrap gap-2 mt-[12px] max-w-[600px] group-focus-within:ml-[10px] transition-all duration-200">
                            {["Vegetables", "Electronics", "Fashion", "Home & Furniture", "Health & Beauty"].map((item, index) => (
                                <button
                                    key={index}
                                    className="bg-[#F5F5F5] group-focus-within:bg-white text-[#525252] text-[14px] px-3 py-1 rounded-[100px] text-sm hover:bg-[#e0e0e0] transition-all duration-200"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
