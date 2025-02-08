# ----- REQUIRED IMPORTS -----

import os
import db
import uuid
from typing import List, Optional
from dotenv import load_dotenv
from typing import Union, Dict
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

# ----- DATA CLASSES -----

class Profile(BaseModel):
    id: str
    username: str
    display_name: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    code: str

class Post(BaseModel):
    id: str
    user_id: str
    image_url: str
    caption: Optional[str]

class Hashtag(BaseModel):
    id: str
    name: str

class Interaction(BaseModel):
    id: str
    user_id: str
    post_id: str
    x_coordinate: int
    y_coordinate: int
    emoji: Optional[str]
    comment: Optional[str]

# ----- INITIALISATION CODE -----

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

PROFILES_TABLE = "profiles"
POSTS_TABLE = "posts"
HASHTAGS_TABLE = "hashtags"
POST_HASHTAGS_TABLE = "post_hashtags"
FOLLOWS_TABLE = "follows"
BLACKLIST_TABLE = "blacklist"
SAVED_POSTS_TABLE = "saved_posts"
INTERACTIONS_TABLE = "interactions"

# ----- FRONTEND ENDPOINTS -----

def get_supabase()->Client:
    """
    creates and returns the supabase client
    """
    supabase_credentials = db.get_supabase_credentials() 
    supabase_url, supabase_key = supabase_credentials[0], supabase_credentials[1]
    supabase_client = create_client(supabase_url, supabase_key)
    return supabase_client 

@app.get("/posts", response_model=List[Post])
async def get_posts(current_user_id: str = "current_user_id"):
    """
    FUA: Integrate with Clerk authentication to get the current user ID
    """
    supabase = get_supabase()
    response = supabase.table(POSTS_TABLE).select("*").execute()
    return response.data

@app.post("/posts", response_model=Post)
async def create_post(post: Post, current_user_id: str = "current_user_id"):
    """
    FUA: Integrate with Clerk authentication to get the current user ID
    """
    supabase = get_supabase()
    post.id = str(uuid.uuid4())
    post.user_id = current_user_id
    response = supabase.table(POSTS_TABLE).insert(post.dict()).execute()
    return response.data[0]

@app.get("/saved_posts", response_model=List[Post])
async def get_saved_posts(current_user_id: str = "current_user_id"):
    """
    FUA: Integrate with Clerk authentication to get the current user ID
    """
    supabase = get_supabase()
    response = supabase.table(SAVED_POSTS_TABLE).select("post_id").eq("user_id", current_user_id).execute()
    post_ids = [item["post_id"] for item in response.data]
    posts_response = supabase.table(POSTS_TABLE).select("*").in_("id", post_ids).execute()
    return posts_response.data

@app.post("/saved_posts/{post_id}")
async def save_post(post_id: str, current_user_id: str = "current_user_id"):
    """
    FUA: Integrate with Clerk authentication to get the current user ID
    """
    supabase = get_supabase()
    response = supabase.table(SAVED_POSTS_TABLE).insert({
        "user_id": current_user_id,
        "post_id": post_id
    }).execute()
    return {"message": f"Post {post_id} saved successfully"}

@app.delete("/saved_posts/{post_id}")
async def unsave_post(post_id: str, current_user_id: str = "current_user_id"):
    """
    FUA: Integrate with Clerk authentication to get the current user ID
    """
    supabase = get_supabase()
    response = supabase.table(SAVED_POSTS_TABLE).delete().eq("user_id", current_user_id).eq("post_id", post_id).execute()
    return {"message": f"Post {post_id} unsaved successfully"}

@app.get("/profiles/search/{code}", response_model=List[Profile])
async def search_profiles(code: str):
    supabase = get_supabase()
    response = supabase.table(PROFILES_TABLE).select("*").ilike("code", f"%{code}%").execute()
    return response.data

@app.get("/profiles/following", response_model=List[Profile])
async def get_following(current_user_id: str = "current_user_id"):
    """
    FUA: Integrate with Clerk authentication to get the current user ID
    """
    supabase = get_supabase()
    response = supabase.table(FOLLOWS_TABLE).select("followed_id").eq("follower_id", current_user_id).execute()
    following_ids = [item["followed_id"] for item in response.data]
    profiles_response = supabase.table(PROFILES_TABLE).select("*").in_("id", following_ids).execute()
    return profiles_response.data

@app.post("/profiles/follow/{profile_id}")
async def follow_profile(profile_id: str, current_user_id: str = "current_user_id"):
    """
    FUA: Integrate with Clerk authentication to get the current user ID
    """
    supabase = get_supabase()
    response = supabase.table(FOLLOWS_TABLE).insert({
        "follower_id": current_user_id,
        "followed_id": profile_id
    }).execute()
    return {"message": f"Profile {profile_id} followed successfully"}

@app.post("/profiles/unfollow/{profile_id}")
async def unfollow_profile(profile_id: str, current_user_id: str = "current_user_id"):
    """
    FUA: Integrate with Clerk authentication to get the current user ID
    """
    supabase = get_supabase()
    response = supabase.table(FOLLOWS_TABLE).delete().eq("follower_id", current_user_id).eq("followed_id", profile_id).execute()
    return {"message": f"Profile {profile_id} unfollowed successfully"}

@app.post("/blacklist/{profile_id}")
async def blacklist_profile(profile_id: str, current_user_id: str = "current_user_id"):
    """
    FUA: Integrate with Clerk authentication to get the current user ID
    """
    supabase = get_supabase()
    response = supabase.table(BLACKLIST_TABLE).insert({
        "user_id": current_user_id,
        "blocked_id": profile_id
    }).execute()
    return {"message": f"Profile {profile_id} blacklisted successfully"}

@app.delete("/blacklist/{profile_id}")
async def remove_from_blacklist(profile_id: str, current_user_id: str = "current_user_id"):
    """
    FUA: Integrate with Clerk authentication to get the current user ID
    """
    supabase = get_supabase()
    response = supabase.table(BLACKLIST_TABLE).delete().eq("user_id", current_user_id).eq("blocked_id", profile_id).execute()
    return {"message": f"Profile {profile_id} removed from blacklist successfully"}

@app.post("/interactions", response_model=Interaction)
async def create_interaction(interaction: Interaction, current_user_id: str = "current_user_id"):
    """
    FUA: Integrate with Clerk authentication to get the current user ID
    """
    supabase = get_supabase()
    interaction.id = str(uuid.uuid4())
    interaction.user_id = current_user_id
    response = supabase.table(INTERACTIONS_TABLE).insert(interaction.dict()).execute()
    return response.data[0]

@app.get("/interactions/{post_id}", response_model=List[Interaction])
async def get_post_interactions(post_id: str):
    supabase = get_supabase()
    response = supabase.table(INTERACTIONS_TABLE).select("*").eq("post_id", post_id).execute()
    return response.data

@app.post("/hashtags", response_model=Hashtag)
async def create_hashtag(hashtag: Hashtag):
    supabase = get_supabase()
    hashtag.id = str(uuid.uuid4())
    response = supabase.table(HASHTAGS_TABLE).insert(hashtag.dict()).execute()
    return response.data[0]

@app.get("/posts/search", response_model=List[Post])
async def search_posts(query: str, current_user_id: str = "current_user_id"):
    """
    FUA: Integrate with Clerk authentication to get the current user ID
    """
    supabase = get_supabase()
    # Search by username or code
    profiles_response = supabase.table(PROFILES_TABLE).select("id").or_(f"username.ilike.%{query}%,code.ilike.%{query}%").execute()
    profile_ids = [item["id"] for item in profiles_response.data]
    
    # Search by hashtag
    hashtags_response = supabase.table(HASHTAGS_TABLE).select("id").ilike("name", f"%{query}%").execute()
    hashtag_ids = [item["id"] for item in hashtags_response.data]
    post_hashtags_response = supabase.table(POST_HASHTAGS_TABLE).select("post_id").in_("hashtag_id", hashtag_ids).execute()
    post_ids_from_hashtags = [item["post_id"] for item in post_hashtags_response.data]
    
    # Combine results
    all_post_ids = list(set(profile_ids + post_ids_from_hashtags))
    
    # Get posts
    posts_response = supabase.table(POSTS_TABLE).select("*").in_("id", all_post_ids).execute()
    return posts_response.data