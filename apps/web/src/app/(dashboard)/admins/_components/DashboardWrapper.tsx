import React from "react"

export default function DashboardWrapper({ children } : { children: React.ReactNode }) {
    return (
        <div className="w-full h-screen overflow-y-scroll p-4 sm:p-8 lg:px-10 lg:py-6">
            { children }
        </div>
    )
};

