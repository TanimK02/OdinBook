import { tweetAPI, interactionAPI } from "../api.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateTweet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ content, imageFile, parentTweetId }) =>
            tweetAPI.createTweet(content, imageFile, parentTweetId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tweets"] });
            queryClient.invalidateQueries({ queryKey: ["userTweets"] });
            queryClient.invalidateQueries({ queryKey: ["replies"] });
        },
    });
};

export const useDeleteTweet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tweetId) => tweetAPI.deleteTweet(tweetId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tweets"] });
            queryClient.invalidateQueries({ queryKey: ["userTweets"] });
            queryClient.invalidateQueries({ queryKey: ["tweet"] });
            queryClient.invalidateQueries({ queryKey: ["replies"] });
        },
    });
};

export const useUpdateTweet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tweetId, content, newImages }) =>
            tweetAPI.updateTweet(tweetId, content, newImages),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tweets"] });
            queryClient.invalidateQueries({ queryKey: ["userTweets"] });
            queryClient.invalidateQueries({ queryKey: ["tweet"] });
            queryClient.invalidateQueries({ queryKey: ["replies"] });
        },
    });
};

export const useToggleLike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tweetId) => interactionAPI.toggleLike(tweetId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tweets"] });
            queryClient.invalidateQueries({ queryKey: ["userTweets"] });
            queryClient.invalidateQueries({ queryKey: ["tweet"] });
            queryClient.invalidateQueries({ queryKey: ["replies"] });
        },
    });
};

export const useToggleRetweet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tweetId) => interactionAPI.toggleRetweet(tweetId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tweets"] });
            queryClient.invalidateQueries({ queryKey: ["userTweets"] });
            queryClient.invalidateQueries({ queryKey: ["tweet"] });
            queryClient.invalidateQueries({ queryKey: ["replies"] });
        },
    });
};
