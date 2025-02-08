import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const getPosts = () => api.get("/posts")
export const createPost = (post: any) => api.post("/posts", post)
export const getSavedPosts = () => api.get("/saved_posts")
export const savePost = (postId: string) => api.post(`/saved_posts/${postId}`)
export const unsavePost = (postId: string) => api.delete(`/saved_posts/${postId}`)
export const searchProfiles = (code: string) => api.get(`/profiles/search/${code}`)
export const getFollowing = () => api.get("/profiles/following")
export const followProfile = (profileId: string) => api.post(`/profiles/follow/${profileId}`)
export const unfollowProfile = (profileId: string) => api.post(`/profiles/unfollow/${profileId}`)
export const blacklistProfile = (profileId: string) => api.post(`/blacklist/${profileId}`)
export const removeFromBlacklist = (profileId: string) => api.delete(`/blacklist/${profileId}`)
export const createInteraction = (interaction: any) => api.post("/interactions", interaction)
export const getPostInteractions = (postId: string) => api.get(`/interactions/${postId}`)
export const searchPosts = (query: string) => api.get("/posts/search", { params: { query } })

export default api