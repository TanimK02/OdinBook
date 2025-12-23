import { searchAPI } from "../api.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSearchUsers = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ query, cursor }) => searchAPI.searchUsers(query, cursor),
        onSuccess: (data) => {
            queryClient.setQueryData({ queryKey: ["searchUsers"] }, data);
        },
    });
};

export const useSearchTweets = () => {
    return useMutation({
        mutationFn: ({ query, cursor }) => searchAPI.searchTweets(query, cursor),
    });
};

export const useSearchTweetsAndUsers = () => {
    return useMutation({
        mutationFn: (query) => searchAPI.searchTweetsAndUsers(query),
    });
};