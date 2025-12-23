import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { userAPI } from "../api.js";

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ identifier, password }) =>
            userAPI.login(identifier, password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userAPI.logout,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
};

export const useRegister = () => {
    return useMutation({
        mutationFn: ({ username, email, password }) =>
            userAPI.register(username, email, password)
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ bio, avatarFile }) =>
            userAPI.updateProfile(bio, avatarFile),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: ({ oldPassword, newPassword }) =>
            userAPI.changePassword(oldPassword, newPassword),
    });
};

export const useUpdateEmail = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ newEmail }) => userAPI.updateEmail(newEmail),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
};

export const useUpdateUsername = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ newUsername }) => userAPI.updateUsername(newUsername),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
};

export const useDeleteAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userAPI.deleteAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
};

export const useGetRandomUsers = (limit = 6) => {
    return useQuery({
        queryKey: ["randomUsers", limit],
        queryFn: () => userAPI.getRandomUsers(limit),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};  