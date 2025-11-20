"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/authService';
import CrimeReportForm from '@/components/CrimeReportForm';

const ReportPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const user = await getCurrentUser();
            if (!user) {
                router.push('/login');
            } else {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    const handleSuccess = () => {
        router.push('/crimes');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-8 sm:px-6 lg:px-8 relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-10 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 -right-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-black/50 backdrop-blur-3xl"></div>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto relative space-y-8">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-20 h-20 relative mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-ping"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-purple-500/30 animate-pulse delay-75"></div>
                        <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/20 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Report a Crime</h1>
                    <p className="text-gray-400 max-w-lg">
                        Help make our community safer by reporting incidents. Your information will be handled with confidentiality.
                    </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => router.push('/profile')}
                        className="group relative px-6 py-3 bg-black/30 hover:bg-black/50 rounded-xl border border-gray-800
                            transition-all duration-300 flex items-center gap-2"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl 
                            blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
                        <div className="relative flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-white">View Profile</span>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/crimes')}
                        className="group relative px-6 py-3 bg-black/30 hover:bg-black/50 rounded-xl border border-gray-800
                            transition-all duration-300 flex items-center gap-2"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl 
                            blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
                        <div className="relative flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span className="text-white">View All Crimes</span>
                        </div>
                    </button>
                </div>

                {/* Form Container */}
                <div className="bg-black/30 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 shadow-2xl 
                    transform transition-all duration-300 hover:scale-[1.01]">
                    <CrimeReportForm onSuccess={handleSuccess} />
                </div>
            </div>
        </div>
    );
};

export default ReportPage;