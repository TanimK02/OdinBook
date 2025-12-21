import { createContext, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "./api.js";
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
        return <div className="loading-screen">Loading... If taking too long, usually due to server waking up from sleep.</div>;
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

