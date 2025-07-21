# Deployment Guide for DSA App

This guide explains how to deploy your full-stack app (React frontend + FastAPI backend with Docker) for public use.

---

## 1. Prepare the Backend (FastAPI + Docker)

- Ensure your backend exposes the correct port (default: 8000 for FastAPI).
- Make sure CORS is enabled for your frontend domain.
- You already have a `Dockerfile` and `docker-compose.yml` in `backend/`.

---

## 2. Prepare the Frontend (React)

- Build the React app for production:
  ```sh
  cd frontend
  npm install
  npm run build
  ```
- This creates a `build/` directory with static files.
- **Option 1:** Serve these files with Nginx (recommended for production).
- **Option 2:** Use a static hosting service (Netlify, Vercel, S3, etc).

---

## 3. Dockerize the Frontend (if serving with Nginx)

Create a `Dockerfile` in `frontend/`:
```Dockerfile
# frontend/Dockerfile
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 4. Update docker-compose.yml

Add a service for the frontend:
```yaml
# backend/docker-compose.yml
version: '3'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    # ... other backend config

  frontend:
    build:
      context: ../frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```
- Adjust ports as needed.
- Make sure the frontend is configured to call the backend at the correct URL (e.g., `http://backend:8000` inside Docker, or your public domain outside).

---

## 5. Environment Variables & CORS

- Set environment variables for API URLs in both frontend and backend.
- In FastAPI, set CORS to allow your frontend domain.

---

## 6. Deploy to a Cloud Provider

- **Option 1: VPS (e.g., DigitalOcean, AWS EC2)**
  - SSH into your server.
  - Install Docker and Docker Compose.
  - Copy your project files to the server.
  - Run `docker-compose up -d` in the backend directory.

- **Option 2: PaaS (e.g., Render, Railway, Heroku)**
  - Push your code to their platform.
  - Configure build and start commands for both services.

- **Option 3: Static Hosting for Frontend + API Hosting for Backend**
  - Deploy frontend build to Netlify/Vercel.
  - Deploy backend to Render/Railway/Heroku.
  - Set frontend API URL to point to backend’s public URL.

---

## 7. Set Up Domain and HTTPS

- Buy a domain (if you don’t have one).
- Point DNS to your server or hosting provider.
- Use Let’s Encrypt or your provider’s SSL to enable HTTPS.

---

## Which Option Should You Choose?

- **For simplicity:** Use Render, Railway, or Heroku for backend, and Netlify or Vercel for frontend.
- **For full control:** Use a VPS (DigitalOcean, AWS EC2, etc) and run Docker Compose.

---

**Proceed step by step. Start with Step 1 below.** 