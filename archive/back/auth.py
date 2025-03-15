# ----- REQUIRED IMPORTS -----

import os
from fastapi import Depends, HTTPException, status
from fastapi.security import SecurityScopes, HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import Dict

# ----- HELPER FUNCTIONS -----

class User(BaseModel):
    id: str
    email: str

class JWTBearer(HTTPBearer):
    async def __call__(
        self, security_scopes: SecurityScopes, credentials: HTTPAuthorizationCredentials | None = None
    ) -> str:
        if credentials is None:
            if security_scopes.scopes:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required",
                    headers={"WWW-Authenticate": f'Bearer scope="{security_scopes.scopes[0]}"'},
                )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = credentials.credentials
        try:
            payload = verify_token(token) # Replace verify_token with your verification function
            return payload
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

def verify_token(token: str) -> Dict:
    """
    verifies the jwt and returns the payload.
    """
    PUBLIC_KEY = os.environ.get("CLERK_PEM_PUBLIC_KEY")
    try:
        decoded_key = jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"])
        return decoded_key
    except Exception as e:
        raise e

def get_current_user(payload: Dict = Depends(JWTBearer())):
    """
    returns the current user based on the jwt payload.
    """
    return User(id = payload.get("sub"), email = payload.get("email")) 