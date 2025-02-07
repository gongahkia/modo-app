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

class Drawing(BaseModel):
    id: str
    imageUrl: str
    author: str
    isGif: bool = False

class SavedPost(BaseModel):
    id: str
    imageUrl: str
    author: str
    isGif: bool = False

class User(BaseModel):
    id: str
    username: str
    userCode: str

# ----- INITIALISATION CODE -----

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

"""
Cross-Origin Resource Sharing (CORS) 
is a security mechanism that allows web apps
to access resources from domains other than the one
serving the application

REQURIED FOR OFFICIAL DEPLOYMENT
"""

DRAWINGS_TABLE = "drawings"
SAVED_POSTS_TABLE = "saved_posts"
USERS_TABLE = "users"
FOLLOWERS_TABLE = "followers"

# ----- FRONTEND ENDPOINTS -----

def get_supabase()->Client:
    """
    creates and returns the supabase client
    """
    supabase_credentials = db.get_supabase_credentials() 
    supabase_url, supabase_key = supabase_credentials[0], supabase_credentials[1]
    supabase_client = create_client(supabase_url, supabase_key)
    return supabase_client 

@app.get("/drawings", response_model=List[Drawing])
async def get_drawings():
    supabase = get_supabase()
    response = supabase.table(DRAWINGS_TABLE).select("*").execute()
    return response.data

@app.get("/saved_posts", response_model=List[SavedPost])
async def get_saved_posts():
    supabase = get_supabase()
    response = supabase.table(SAVED_POSTS_TABLE).select("*").execute()
    return response.data

@app.post("/saved_posts", response_model=SavedPost)
async def create_saved_post(post: SavedPost):
    supabase = get_supabase()
    response = supabase.table(SAVED_POSTS_TABLE).insert(post.dict()).execute()
    return response.data[0]

@app.delete("/saved_posts/{post_id}")
async def delete_saved_post(post_id: str):
    supabase = get_supabase()
    response = supabase.table(SAVED_POSTS_TABLE).delete().eq("id", post_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted successfully"}

@app.post("/drawings", response_model=Drawing)
async def create_drawing(drawing: Drawing):
    supabase = get_supabase()
    drawing.id = str(uuid.uuid4())
    response = supabase.table(DRAWINGS_TABLE).insert(drawing.dict()).execute()
    return response.data[0]

@app.get("/users/search/{code}", response_model=List[User])
async def search_users(code: str):
    supabase = get_supabase()
    response = supabase.table(USERS_TABLE).select("*").ilike("userCode", f"%{code}%").execute()
    return response.data

@app.get("/users/following", response_model=List[User])
async def get_following(current_user_id: str = "current_user_id"):
    """
    FUA need to change this function and integrate clerk authentication with it

    assuming you have auth implemented and current user id available, change the above 
    optional argument to the acual user ID retrieved from clerk's auth
    """
    supabase = get_supabase()
    response = supabase.table(FOLLOWERS_TABLE).select("followed_user_id").eq("follower_user_id", current_user_id).execute()
    following_ids = [item["followed_user_id"] for item in response.data]
    users_response = supabase.table(USERS_TABLE).select("*").in_("id", following_ids).execute()
    return users_response.data

@app.post("/users/follow/{user_id}")
async def follow_user(user_id: str, current_user_id: str = "current_user_id"):
    """
    FUA need to change this function and integrate clerk authentication with it

    assuming you have auth implemented and current user id available, change the above 
    optional argument to the acual user ID retrieved from clerk's auth
    """
    supabase = get_supabase()
    response = supabase.table(FOLLOWERS_TABLE).insert({
        "follower_user_id": current_user_id,
        "followed_user_id": user_id
    }).execute()
    return {"message": f"User {user_id} followed successfully"}

@app.post("/users/unfollow/{user_id}")
async def unfollow_user(user_id: str, current_user_id: str = "current_user_id"):
    """
    FUA need to change this function and integrate clerk authentication with it

    assuming you have auth implemented and current user id available, change the above 
    optional argument to the acual user ID retrieved from clerk's auth
    """
    supabase = get_supabase()
    response = supabase.table(FOLLOWERS_TABLE).delete().eq("follower_user_id", current_user_id).eq("followed_user_id", user_id).execute()
    return {"message": f"User {user_id} unfollowed successfully"}