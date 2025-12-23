import { searchAPI } from "../api.js";
import { useMutation, useInfiniteQuery } from "@tanstack/react-query";

export const useSearchUsers = ({ query, enabled = true }) => {
    return useInfiniteQuery({
        queryKey: ["searchUsers", query],
        queryFn: ({ pageParam }) => searchAPI.searchUsers(query, pageParam),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: enabled && !!query,
        staleTime: 5 * 60 * 1000,
    });
};

export const useSearchTweets = ({ query, enabled = true }) => {
    return useInfiniteQuery({
        queryKey: ["searchTweets", query],
        queryFn: ({ pageParam }) => searchAPI.searchTweets(query, pageParam),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: enabled && !!query,
        staleTime: 5 * 60 * 1000,
    });
};

export const useSearchTweetsAndUsers = () => {
    return useMutation({
        mutationFn: (query) => searchAPI.searchTweetsAndUsers(query),
    });
};