import shadow from "../../../../public/assets/images/marketbg.png";
import Image from "next/image";
import arrowBack from '@/../public/assets/images/arrow-left.svg'

const VirtualView = () => {
    return (
        <div
            className="min-h-screen w-full relative bg-cover bg-center bg-no-repeat bg-fixed"
            style={{
                backgroundImage: `url(${shadow.src})`,
            }}
        >
            {/* Semi-transparent overlay (optional) */}
            <div className="absolute inset-0 bg-black/30 z-0">

            </div>

            {/* Your content - make sure it has relative positioning */}
            <div className="relative z-10">
                <div className={`relative z-10 pt-[67px] pl-[149px]  flex gap-25`}>
                    <div className="flex items-center gap-[8px]">
                        <Image src={arrowBack} alt={'image'}/>
                        <p className="text-white font-medium">Back</p>
                    </div>
                    <div className="w-[866px] h-[56px] flex items-center gap-[8px]">
                        {/* Location Dropdown */}
                        <div className="flex items-center gap-2 bg-[#E4F1F9] rounded-full px-4 py-2">
                            <span className="text-pink-600 text-xl">📍</span>
                            <span className="text-sm font-medium text-gray-800">Wurukum Market, Makurdi</span>
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {/* Line Dropdown */}
                        <div className="flex items-center gap-2 bg-[#E4F1F9] rounded-full px-4 py-2">
                            <span className="text-sm font-medium text-gray-800">Line 2B</span>
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {/* Available Stores Dropdown */}
                        <div className="flex items-center gap-2 bg-[#E4F1F9] rounded-full px-4 py-2">
                            <span className="text-xl text-green-800">🛍️</span>
                            <span className="text-sm font-medium text-gray-800">Available stores (23)</span>
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {/* Search Input */}
                        <div className="flex items-center bg-[#D9D9D9] rounded-full px-4 py-2">
                            <input
                                type="text"
                                placeholder="T-SHIRT"
                                className="bg-transparent outline-none text-sm font-medium text-gray-800 w-[100px]"
                            />
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 16.65A7 7 0 1010 3a7 7 0 006.65 13.65z" />
                            </svg>
                        </div>
                    </div>

                </div>
                <button className="flex items-center mt-[200px] gap-[6px] ml-[318px]  px-2 w-[171px] h-[45px]  rounded-full border border-white text-white bg-white/8 backdrop-blur-sm">
                    <span className="w-[11px] h-[11px] rounded-full border border-white"></span>
                    <span className="text-[14px] font-medium">Inno Boutique Store</span>
                </button>
                <button className="flex items-center mt-[20px] gap-[6px] ml-[498px]  px-2 w-[171px] h-[45px]  rounded-full border border-white text-white bg-white/8 backdrop-blur-sm">
                    <span className="w-[11px] h-[11px] rounded-full border border-white"></span>
                    <span className="text-[14px] font-medium">Inno Boutique Store</span>
                </button>
                <button className="flex items-center mt-[20px] gap-[6px] ml-[278px]  px-2 w-[171px] h-[45px]  rounded-full border border-white text-white bg-white/8 backdrop-blur-sm">
                    <span className="w-[11px] h-[11px] rounded-full border border-white"></span>
                    <span className="text-[14px] font-medium">Inno Boutique Store</span>
                </button>
                <button className="flex items-center mt-[20px] gap-[6px] ml-[498px]  px-2 w-[171px] h-[45px]  rounded-full border border-white text-white bg-white/8 backdrop-blur-sm">
                    <span className="w-[11px] h-[11px] rounded-full border border-white"></span>
                    <span className="text-[14px] font-medium">Inno Boutique Store</span>
                </button>

            </div>
        </div>
    );
};

export default VirtualView;