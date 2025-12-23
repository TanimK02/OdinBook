import { createContext, useContext, useState, CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "./api.js";
import { ClockLoader } from "react-spinners";
const AuthContext = createContext({ user: null });

export const AuthProvider = ({ children }) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["user"],
        queryFn: userAPI.getUserInfo,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
        retry: false
    });

    if (isLoading) {
        return <div className="loading-screen">
            <ClockLoader color="#1d9bf0" size={150} />
            <div>Server is waking up... This may take a moment.</div>
        </div>;
    }
    const user = isError ? null : data;

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

