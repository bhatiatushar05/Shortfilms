# 🔑 Get Supabase Service Role Key

## 📋 **Step-by-Step Instructions:**

### **1. Go to Supabase Dashboard**
- Visit: https://supabase.com/dashboard
- Sign in to your account
- Select your project: `zefhgbbaohovxngsxwlv`

### **2. Navigate to API Settings**
- Click on **Settings** (gear icon) in the left sidebar
- Click on **API** in the settings menu

### **3. Copy Service Role Key**
- Look for **"service_role"** key (NOT the anon key)
- Click the **copy** button next to it
- The key starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **4. Add to Backend .env File**
- Open `ott-web/backend/.env`
- Add this line:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **5. Run the Fix Script**
```bash
cd ott-web/backend
node fix-rls-policies.js
```

## 🎯 **What This Will Fix:**

- ✅ **Banned users** will be blocked at login
- ✅ **Active users** will have full access  
- ✅ **No more permission denied errors**
- ✅ **Perfect synchronization** with admin dashboard
- ✅ **Bulletproof security** with proper RLS policies

## 🚨 **Important:**

- **NEVER share** the service role key publicly
- **NEVER commit** it to version control
- **Only use** it for admin operations like this
- The service role key has **full database access**

## 🔧 **Alternative (Manual SQL):**

If you prefer to run SQL manually:
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy contents of `fix-rls-policies.sql`
3. Paste and run the SQL commands

**Let me know when you have the service role key and I'll run the fix!** 🚀

