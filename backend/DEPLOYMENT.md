# Holberton Backend - Render Deployment Guide

This backend uses Node.js, Express, and MongoDB. Follow these steps to deploy to Render.

## Prerequisites

1. **MongoDB Atlas Account**: Sign up at https://www.mongodb.com/cloud/atlas
2. **Render Account**: Sign up at https://render.com
3. **GitHub Repository**: Your code should be pushed to GitHub

---

## Step 1: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user (username & password)
4. Whitelist IP: `0.0.0.0/0` (allows connections from anywhere)
5. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your database password
   - Add database name: `mongodb+srv://username:password@cluster.mongodb.net/holberton`

---

## Step 2: Deploy to Render

1. **Login to Render**: Go to https://dashboard.render.com
2. **Create New Web Service**: Click "New +" → "Web Service"
3. **Connect GitHub**: Connect your repository
4. **Configure Service**:
   
   | Setting | Value |
   |---------|-------|
   | **Name** | `holberton-backend` (or your choice) |
   | **Root Directory** | `backend` |
   | **Environment** | `Node` |
   | **Build Command** | `bash build.sh` |
   | **Start Command** | `npm start` |
   | **Plan** | `Free` |

5. **Add Environment Variables**:
   - Click "Advanced" → "Add Environment Variable"
   - Add these variables:
   
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | Any secure random string (e.g., `my-super-secret-jwt-key-2024`) |
   | `NODE_ENV` | `production` |

6. **Deploy**: Click "Create Web Service"

---

## Step 3: Get Your Backend URL

Once deployed, Render will provide a URL like:
```
https://holberton-backend.onrender.com
```

Your API endpoints will be:
- Registration: `https://holberton-backend.onrender.com/api/register`
- Login: `https://holberton-backend.onrender.com/api/login`
- User Profile: `https://holberton-backend.onrender.com/api/me`

---

## Step 4: Update Frontend Configuration

1. Open `frontend/api.js`
2. Update these lines:
   ```javascript
   const USE_BACKEND = true; // Change from false to true
   const BACKEND_URL = "https://holberton-backend.onrender.com/api"; // Add your Render URL
   ```
3. Save the file

---

## Testing Your Deployment

### Test with Browser Console:

1. Open your frontend in a browser
2. Open Developer Tools (F12) → Console
3. Test registration:
   ```javascript
   api.createUser({
     username: "testuser",
     password: "test123",
     name: "Test User"
   }).then(console.log);
   ```

### Test with curl:

```bash
# Register a user
curl -X POST https://holberton-backend.onrender.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","name":"Test User"}'

# Login
curl -X POST https://holberton-backend.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

---

## Important Notes

### Free Tier Limitations
- Render free tier spins down after 15 minutes of inactivity
- First request after inactivity takes 30-60 seconds (cold start)
- For production, consider upgrading to a paid plan

### Environment Variables
- Never commit `.env` file to Git
- All sensitive data should be in Render's environment variables

### Troubleshooting

**Problem**: "Internal Server Error"
- Check Render logs (Dashboard → Your Service → Logs)
- Verify MongoDB connection string is correct
- Ensure JWT_SECRET is set

**Problem**: CORS errors
- The backend already has CORS enabled
- Make sure you're using the correct URL in `api.js`

**Problem**: Database connection failed
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure database user has correct permissions

---

## Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Connection string copied
- [ ] Render account created
- [ ] Web service configured
- [ ] Environment variables added (MONGODB_URI, JWT_SECRET)
- [ ] Service deployed successfully
- [ ] Backend URL copied
- [ ] Frontend `api.js` updated with backend URL
- [ ] `USE_BACKEND` set to `true`
- [ ] Tested registration endpoint
- [ ] Tested login endpoint
- [ ] Application works end-to-end

---

## Next Steps

Once your backend is deployed and working:
1. Deploy your frontend (e.g., to Vercel, Netlify, or GitHub Pages)
2. Update frontend deployment with the correct backend URL
3. Test the full application flow
4. Monitor Render logs for any issues

For questions, check Render documentation: https://render.com/docs
