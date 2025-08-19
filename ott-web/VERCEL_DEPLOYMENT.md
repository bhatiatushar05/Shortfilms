# Deploying to Vercel

This guide will help you deploy your ShortCinema OTT platform to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **Supabase Project**: Your database should be set up and running

## Step 1: Prepare Your Repository

Make sure your repository is pushed to GitHub/GitLab/Bitbucket with all the latest changes.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `ott-web`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to your project
cd ott-web

# Deploy
vercel

# Follow the prompts to configure your project
```

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add:

### Backend Environment Variables
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-project-name.vercel.app
```

### Frontend Environment Variables
```
VITE_API_URL=https://your-project-name.vercel.app/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 4: Update CORS Origins

After deployment, update the CORS origins in your backend code with your actual Vercel domain:

```javascript
// In backend/server.js
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-actual-project-name.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8000'],
  credentials: true
}));
```

## Step 5: Test Your Deployment

1. **Frontend**: Visit your Vercel domain (e.g., `https://your-project.vercel.app`)
2. **Backend API**: Test endpoints like `https://your-project.vercel.app/api/health`
3. **File Uploads**: Test the upload functionality

## Step 6: Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings > Domains**
2. Add your custom domain
3. Update your DNS records as instructed
4. Update CORS origins and environment variables

## Important Notes

### File Uploads
- Vercel has a 4.5MB payload limit for serverless functions
- For larger files, consider using Supabase Storage or AWS S3
- Update your upload middleware accordingly

### Database Connections
- Ensure your Supabase project allows connections from Vercel's IP ranges
- Consider using connection pooling for production

### Environment Variables
- Never commit sensitive environment variables to Git
- Use Vercel's environment variable system for production secrets

## Troubleshooting

### Common Issues

1. **Build Failures**: Check build logs in Vercel dashboard
2. **API Errors**: Verify environment variables are set correctly
3. **CORS Issues**: Ensure CORS origins include your Vercel domain
4. **Database Connection**: Check Supabase connection settings

### Debug Commands

```bash
# Check Vercel deployment status
vercel ls

# View deployment logs
vercel logs

# Redeploy
vercel --prod
```

## Performance Optimization

1. **Enable Vercel Analytics** for performance monitoring
2. **Use Edge Functions** for global performance
3. **Implement caching** strategies
4. **Optimize images** and assets

## Security Considerations

1. **Rate Limiting**: Already implemented in your backend
2. **CORS**: Properly configured for production
3. **Authentication**: JWT-based auth system in place
4. **File Uploads**: Implement proper validation and sanitization

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Supabase Documentation](https://supabase.com/docs)
