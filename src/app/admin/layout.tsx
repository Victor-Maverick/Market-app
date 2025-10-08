'use client';
import { Sidebar } from "@/components/sideBar";
import { ReactNode, useState } from "react";
import { Header } from "@/components/adminDashboardHeader";
import { Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex flex-col h-screen w-full">
            <Header />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`
                    fixed md:relative z-50 md:z-auto
                    transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    h-full
                `}>
                    <Sidebar />
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto w-full md:w-auto">
                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center justify-between p-4 border-b border-[#ededed]">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <span className="text-[14px] font-medium text-[#022B23]">Admin Dashboard</span>
                        <div className="w-8" /> {/* Spacer for centering */}
                    </div>

                    <div className="">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}