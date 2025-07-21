# API Documentation: Code Execution & Submissions

## POST /api/submissions/run
Run code against the sample test case (no DB write).

**Request:**
```
POST /api/submissions/run
Authorization: Bearer <token>
Content-Type: application/json
{
  "problem_id": 1,
  "code": "def solution():\n    return 42\nif __name__ == '__main__':\n    print(solution())",
  "language": "python"
}
```
**Response:**
```
{
  "id": -1,
  "user_id": 1,
  "problem_id": 1,
  "code": "...",
  "language": "python",
  "result": "pass",
  "runtime": "0.12",
  "submission_time": "2025-07-21T15:00:00",
  "test_case_results": [
    {
      "input": "",
      "expected": "42",
      "output": "42",
      "passed": true,
      "execution_time": 0.12,
      "error": null
    }
  ],
  "execution_time": 0.12,
  "memory_usage": 0,
  "overall_status": "pass",
  "error_message": null
}
```

---

## POST /api/submissions/
Submit code for all test cases (stores in DB).

**Request:**
```
POST /api/submissions/
Authorization: Bearer <token>
Content-Type: application/json
{
  "problem_id": 1,
  "code": "...",
  "language": "python"
}
```
**Response:**
```
{
  "id": 123,
  "user_id": 1,
  "problem_id": 1,
  "code": "...",
  "language": "python",
  "result": "pass",
  "runtime": "0.45",
  "submission_time": "2025-07-21T15:00:00",
  "test_case_results": [ ... ],
  "execution_time": 0.45,
  "memory_usage": 0,
  "overall_status": "pass",
  "error_message": null
}
```

---

## GET /api/submissions/problem/{problem_id}
Get all submissions for a problem by the current user.

**Request:**
```
GET /api/submissions/problem/1
Authorization: Bearer <token>
```
**Response:**
```
[
  {
    "id": 123,
    "user_id": 1,
    "problem_id": 1,
    ...
  },
  ...
]
```

---

## GET /health
Health check endpoint.

**Request:**
```
GET /health
```
**Response:**
```
{"status": "ok"}
``` 