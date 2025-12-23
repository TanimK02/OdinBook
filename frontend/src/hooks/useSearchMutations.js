import { searchAPI } from "../api.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSearchUsers = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (query) => searchAPI.searchUsers(query),
        onSuccess: (users) => {
            queryClient.setQueryData({ queryKey: ["searchUsers"] }, users);
        },
    });
};

export const useSearchTweets = () => {
    return useMutation({
        mutationFn: (query) => searchAPI.searchTweets(query),
    });
};

export const useSearchTweetsAndUsers = () => {
    return useMutation({
        mutationFn: (query) => searchAPI.searchTweetsAndUsers(query),
    });
};