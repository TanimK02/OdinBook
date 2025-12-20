import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "./api.js";
const AuthContext = createContext({ user: null });

export const AuthProvider = ({ children }) => {
    const { data: user, isLoading, isError } = useQuery({
        queryKey: ["user"],
        queryFn: userAPI.getUserInfo,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        retry: false
    });

    if (isLoading) {
        return <div className="loading-screen">Loading...</div>;
    }


    return (
        <AuthContext.Provider value={{ user, isLoading, isError }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};