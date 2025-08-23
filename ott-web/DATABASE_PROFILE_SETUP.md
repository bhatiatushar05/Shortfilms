# Profile System Database Setup

This document outlines the database schema changes required for the Netflix-style profile system.

## Required Tables

### 1. Profiles Table

Create a `profiles` table in your Supabase database with the following structure:

```sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table with proper UUID handling
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL CHECK (length(display_name) >= 1 AND length(display_name) <= 50),
  avatar_id TEXT,
  avatar_image TEXT,
  avatar_gradient TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on user_id to ensure one profile per user
CREATE UNIQUE INDEX profiles_user_id_idx ON profiles(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

### 2. Alternative Schema (If you prefer direct user_id reference)

If you want to use the user's auth ID directly as the profile ID:

```sql
-- Alternative: Direct user_id as primary key
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(display_name) >= 1 AND length(display_name) <= 50),
  avatar_id TEXT,
  avatar_image TEXT,
  avatar_gradient TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

## Schema Details

### Recommended Schema (Option 1):

#### profiles Table Fields:
- **id** (UUID, Primary Key): Auto-generated UUID for the profile record
- **user_id** (UUID, NOT NULL): References auth.users.id, cascades on delete
- **display_name** (TEXT, NOT NULL): User's chosen display name (1-50 characters, UI limits to 20)
- **avatar_id** (TEXT): Identifier for the selected avatar
- **avatar_image** (TEXT): URL of the avatar image
- **avatar_gradient** (TEXT): CSS gradient for avatar background fallback
- **created_at** (TIMESTAMP WITH TIME ZONE): Auto-generated creation timestamp
- **updated_at** (TIMESTAMP WITH TIME ZONE): Auto-updated modification timestamp

#### Key Features:
- **Separate profile ID**: Allows for future profile management features
- **Unique user constraint**: Ensures one profile per user
- **Proper foreign key**: References auth.users table correctly
- **Data validation**: Display name length constraints

### Alternative Schema (Option 2):

#### profiles Table Fields:
- **id** (UUID, Primary Key): Same as user's auth ID, references auth.users.id
- **display_name** (TEXT, NOT NULL): User's chosen display name (1-50 characters)
- **avatar_id** (TEXT): Identifier for the selected avatar
- **avatar_image** (TEXT): URL of the avatar image
- **avatar_gradient** (TEXT): CSS gradient for avatar background fallback
- **created_at** (TIMESTAMP WITH TIME ZONE): Auto-generated creation timestamp
- **updated_at** (TIMESTAMP WITH TIME ZONE): Auto-updated modification timestamp

#### Key Features:
- **Direct user reference**: Profile ID equals user ID
- **Simpler queries**: No need to join on user_id
- **Same security**: RLS policies work identically

## Security

Row Level Security (RLS) is enabled with policies that ensure:
- Users can only view their own profile
- Users can only update their own profile
- Users can only insert their own profile

### RLS Policy Details:

#### Option 1 (Recommended):
```sql
-- Users can view own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update own profile  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Option 2 (Alternative):
```sql
-- Users can view own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Integration Points

The profile system integrates with:

1. **Signup Flow**: Creates profile after user registration
2. **My Space**: Displays profile avatar and name
3. **Settings**: Allows editing profile information
4. **User Session**: Profile data is fetched when user is authenticated

## Avatar System

The avatar system uses a predefined set of profile pictures with fallback gradients:
- 8 different avatar options with unique gradients
- High-quality portrait images from Unsplash
- Gradient fallbacks for reliable display
- Netflix-style circular profile pictures

## Usage

After setting up the database, the profile system will:

1. **During Signup**: Guide users through profile creation
2. **In My Space**: Show personalized profile information
3. **In Settings**: Allow profile editing and avatar changes
4. **Throughout App**: Display consistent profile identity

## Testing

To test the profile system:

1. Create a new account through the signup flow
2. Complete the profile creation step
3. Verify profile appears in My Space
4. Test profile editing in Settings
5. Confirm changes persist across sessions
