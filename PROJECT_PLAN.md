# DSA Collaborative Web App – Project Plan

## Overview
A web application for you and your friends to solve DSA (Data Structures & Algorithms) problems together or individually, inspired by LeetCode. Includes real-time collaboration, code execution, and submission validation.

---

## Features

### 1. User Authentication
- Simple sign up/login (username + password, or Google OAuth)
- User profile with submission history

### 2. Problem Management
- List of DSA problems (title, description, sample input/output, difficulty)
- Solve problems individually (like LeetCode)
- Solve collaboratively in a room

### 3. Code Editor & Submission
- In-browser code editor (Monaco or CodeMirror)
- Support for at least Python and JavaScript
- “Run Code” for sample cases
- “Submit” for full validation (hidden test cases)
- Store submissions with:
  - Code
  - Result (pass/fail)
  - Submission time
  - Runtime (if possible)
  - Language

### 4. Collaboration
- Create/join rooms for real-time collaborative solving
- Shared code editor and chat

### 5. UI/UX
- Beautiful, clean, modern design (Material UI or Chakra UI)
- Responsive for desktop and mobile

---

## Tech Stack

- **Frontend:** React + TypeScript, Material UI
- **Backend:** Python (FastAPI)
- **Real-time:** Socket.io (python-socketio, socket.io-client)
- **Code Execution:** Dockerized runners for Python/JS, or sandboxed subprocess/execjs
- **Database:** SQLite
- **Authentication:** JWT-based auth

---

## Project Structure

```
dsa/
  backend/
    app/
      main.py
      models.py
      database.py
      routes/
        auth.py
        problems.py
        submissions.py
        collab.py
      code_runner/
        runner.py
    requirements.txt
  frontend/
    src/
      components/
      pages/
      App.tsx
      main.tsx
    package.json
    tsconfig.json
    ...
```

---

## Development Flow

1. Scaffold backend (FastAPI) and frontend (React + MUI)
2. Set up authentication and user model
3. Implement problem listing and viewing
4. Implement code editor and code execution
5. Implement submission validation and history
6. Implement collaborative rooms with real-time code and chat
7. Polish UI for a beautiful, clean look

---

**Use this document as a reference for project flow and requirements.** 