# ----- REQUIRED IMPORTS -----

import os
import uuid
from typing import List, Optional
from dotenv import load_dotenv
from typing import Union, Dict
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

# ----- HELPER FUNCTIONS -----

def get_supabase_credentials():
    """
    returns the supabase credentials from the .env file
    """
    load_dotenv()
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL or SUPABASE_KEY not found in .env file")
    return supabase_url, supabase_key