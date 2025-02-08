-- Create enum types
CREATE TYPE emoji_type AS ENUM ("😀", "😍", "🎨", "👍", "🔥", "💖", "🌟", "👏", "💬");

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    code CHAR(6) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create hashtags table
CREATE TABLE hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL
);

-- Create post_hashtags junction table
CREATE TABLE post_hashtags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    hashtag_id UUID REFERENCES hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, hashtag_id)
);

-- Create follows table
CREATE TABLE follows (
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    followed_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followed_id)
);

-- Create blacklist table
CREATE TABLE blacklist (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, blocked_id)
);

-- Create saved_posts table
CREATE TABLE saved_posts (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

-- Create interactions table
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    x_coordinate INTEGER NOT NULL,
    y_coordinate INTEGER NOT NULL,
    emoji emoji_type,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_post_hashtags_post_id ON post_hashtags(post_id);
CREATE INDEX idx_post_hashtags_hashtag_id ON post_hashtags(hashtag_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_followed_id ON follows(followed_id);
CREATE INDEX idx_blacklist_user_id ON blacklist(user_id);
CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_interactions_post_id ON interactions(post_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$
 language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_posts_modtime
BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_interactions_modtime
BEFORE UPDATE ON interactions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
-- Note: These are basic policies and may need to be adjusted based on your specific security requirements

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: Users can read posts of people they follow and their own, create their own posts, and update/delete their own posts
CREATE POLICY "Users can read followed posts" ON posts FOR SELECT
USING (
    auth.uid() = user_id OR
    user_id IN (SELECT followed_id FROM follows WHERE follower_id = auth.uid())
);
CREATE POLICY "Users can create own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Hashtags: Everyone can read and create hashtags
CREATE POLICY "Hashtags are viewable by everyone" ON hashtags FOR SELECT USING (true);
CREATE POLICY "Users can create hashtags" ON hashtags FOR INSERT WITH CHECK (true);

-- Post_hashtags: Users can read all, create for own posts
CREATE POLICY "Post hashtags are viewable by everyone" ON post_hashtags FOR SELECT USING (true);
CREATE POLICY "Users can create post hashtags" ON post_hashtags FOR INSERT
WITH CHECK (auth.uid() = (SELECT user_id FROM posts WHERE id = post_hashtags.post_id));

-- Follows: Users can read and manage their own follows
CREATE POLICY "Users can read own follows" ON follows FOR SELECT USING (auth.uid() = follower_id);
CREATE POLICY "Users can manage follows" ON follows FOR ALL USING (auth.uid() = follower_id);

-- Blacklist: Users can read and manage their own blacklist
CREATE POLICY "Users can read own blacklist" ON blacklist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage blacklist" ON blacklist FOR ALL USING (auth.uid() = user_id);

-- Saved_posts: Users can read and manage their own saved posts
CREATE POLICY "Users can read own saved posts" ON saved_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage saved posts" ON saved_posts FOR ALL USING (auth.uid() = user_id);

-- Interactions: Users can read interactions on posts they can see, and manage their own interactions
CREATE POLICY "Users can read visible interactions" ON interactions FOR SELECT
USING (
    auth.uid() = user_id OR
    post_id IN (SELECT id FROM posts WHERE user_id = auth.uid() OR user_id IN (SELECT followed_id FROM follows WHERE follower_id = auth.uid()))
);
CREATE POLICY "Users can manage own interactions" ON interactions FOR ALL USING (auth.uid() = user_id);