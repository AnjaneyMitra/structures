# Local Development Setup: Frontend & Backend

This guide explains how to run your frontend and backend locally, how to configure API URLs, and how to switch between local and deployed backends for testing.

---

## 1. Local Frontend + Local Backend
- **Run backend locally** (e.g., `localhost:8000`).
- **Run frontend locally** (e.g., `localhost:3000`).
- **Set your frontend API URLs to point to your local backend.**
- **Result:** All development and testing is local.

**Example .env:**
```
REACT_APP_API_URL=http://localhost:8000/api
```

---

## 2. Local Frontend + Deployed Backend
- **Run frontend locally** (e.g., `localhost:3000`).
- **Use your deployed backend** (e.g., `https://structures-production.up.railway.app`).
- **Set your frontend API URLs to point to the deployed backend.**
- **Result:** You can test frontend changes locally, but data comes from production.

**Example .env:**
```
REACT_APP_API_URL=https://structures-production.up.railway.app/api
```

---

## 3. Deployed Frontend + Deployed Backend
- This is your production setup.

---

## How to Switch Between Them
- Use environment variables (like `.env` or `.env.local`) in your frontend to control which backend you talk to.
- In your code, use:
  ```js
  const API_URL = process.env.REACT_APP_API_URL;
  axios.get(`${API_URL}/rooms/`)
  ```
- Change the value in your `.env` file to switch between local and deployed backends.

---

## Notes
- You **can** run both your local frontend and backend at the same time.
- You can also have your local frontend talk to your deployed backend if you want to test frontend changes with production data.
- Make sure to restart your frontend dev server after changing `.env` files.

---

**You can refer to this file any time you need to remember how to set up your local dev environment!** 