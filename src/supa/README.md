# DB details 

Currently hosted on Supabase.

## Architecture 

```mermaid
erDiagram
    PROFILES {
        UUID id PK
        TEXT username UK
        TEXT display_name
        TEXT bio
        TEXT avatar_url
        CHAR(6) code UK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    POSTS {
        UUID id PK
        UUID user_id FK
        TEXT image_url
        TEXT caption
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    HASHTAGS {
        UUID id PK
        TEXT name UK
    }
    POST_HASHTAGS {
        UUID post_id PK,FK
        UUID hashtag_id PK,FK
    }
    FOLLOWS {
        UUID follower_id PK,FK
        UUID followed_id PK,FK
        TIMESTAMP created_at
    }
    BLACKLIST {
        UUID user_id PK,FK
        UUID blocked_id PK,FK
        TIMESTAMP created_at
    }
    SAVED_POSTS {
        UUID user_id PK,FK
        UUID post_id PK,FK
        TIMESTAMP created_at
    }
    INTERACTIONS {
        UUID id PK
        UUID user_id FK
        UUID post_id FK
        INTEGER x_coordinate
        INTEGER y_coordinate
        emoji_type emoji
        TEXT comment
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    PROFILES ||--o{ POSTS : "creates"
    PROFILES ||--o{ FOLLOWS : "follows"
    PROFILES ||--o{ FOLLOWS : "is followed by"
    PROFILES ||--o{ BLACKLIST : "blacklists"
    PROFILES ||--o{ BLACKLIST : "is blacklisted by"
    PROFILES ||--o{ SAVED_POSTS : "saves"
    PROFILES ||--o{ INTERACTIONS : "creates"
    POSTS ||--o{ POST_HASHTAGS : "has"
    POSTS ||--o{ SAVED_POSTS : "is saved as"
    POSTS ||--o{ INTERACTIONS : "has"
    HASHTAGS ||--o{ POST_HASHTAGS : "is used in"
```

## Overview

### PROFILES
* Stores user profile information
* Primary Key: `id` (UUID)
* Unique constraints: `username`, `code`

### POSTS
* Stores user posts
* Primary Key: `id` (UUID)
* Foreign Key: `user_id` references PROFILES(id)

### HASHTAGS
* Stores unique hashtags
* Primary Key: `id` (UUID)
* Unique constraint: `name`

### POST_HASHTAGS
* Junction table linking posts to hashtags
* Composite Primary Key: (`post_id`, `hashtag_id`)
* Foreign Keys: `post_id` references POSTS(id), `hashtag_id` references HASHTAGS(id)

### FOLLOWS
* Represents follower relationships between users
* Composite Primary Key: (`follower_id`, `followed_id`)
* Foreign Keys: Both `follower_id` and `followed_id` reference PROFILES(id)

### BLACKLIST
* Represents blocked user relationships
* Composite Primary Key: (`user_id`, `blocked_id`)
* Foreign Keys: Both `user_id` and `blocked_id` reference PROFILES(id)

### SAVED_POSTS
* Represents posts saved by users
* Composite Primary Key: (`user_id`, `post_id`)
* Foreign Keys: `user_id` references PROFILES(id), `post_id` references POSTS(id)

### INTERACTIONS
* Stores user interactions with posts (emoji reactions and comments)
* Primary Key: `id` (UUID)
* Foreign Keys: `user_id` references PROFILES(id), `post_id` references POSTS(id)

## Key Relationships
* A user (PROFILE) can create multiple POSTS
* A user can follow multiple users and be followed by multiple users (FOLLOWS)
* A user can blacklist multiple users and be blacklisted by multiple users (BLACKLIST)
* A user can save multiple posts (SAVED_POSTS)
* A post can have multiple hashtags (POST_HASHTAGS)
* A post can have multiple interactions (INTERACTIONS)

## Enum Types
* `emoji_type`: Defines the allowed emoji reactions ('❤️', '😂', '😮', '😢', '😡', '👍')

## Indexes
* `idx_posts_user_id` on POSTS(user_id)
* `idx_post_hashtags_post_id` on POST_HASHTAGS(post_id)
* `idx_post_hashtags_hashtag_id` on POST_HASHTAGS(hashtag_id)
* `idx_follows_follower_id` on FOLLOWS(follower_id)
* `idx_follows_followed_id` on FOLLOWS(followed_id)
* `idx_blacklist_user_id` on BLACKLIST(user_id)
* `idx_saved_posts_user_id` on SAVED_POSTS(user_id)
* `idx_interactions_post_id` on INTERACTIONS(post_id)

## Row Level Security (RLS)
RLS is enabled on all tables with policies to ensure data privacy and security. Key policies include:
* Users can view all profiles but only update their own
* Users can read posts of people they follow and their own
* Users can manage their own follows, blacklist, and saved posts
* Users can read interactions on posts they can see and manage their own interactions

## Triggers
* `update_profiles_modtime`: Updates the `updated_at` timestamp on PROFILES
* `update_posts_modtime`: Updates the `updated_at` timestamp on POSTS
* `update_interactions_modtime`: Updates the `updated_at` timestamp on INTERACTIONS
