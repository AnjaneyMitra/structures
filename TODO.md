# TODO: Code Running & Test Case Validation Implementation

## Phase 1: Backend Infrastructure

### 1.1 Test Case Management
- [x] **Add TestCase model to database schema**
  - [x] Create TestCase model with input, output, problem_id
  - [x] Add relationship between Problem and TestCase
  - [x] Update database migrations

- [x] **Update Problem seed data**
  - [x] Add test cases to problems_seed.json
  - [x] Update seed script to include test cases
  - [x] Test seeding with new test case data

### 1.2 Code Execution Engine
- [x] **Create secure code execution service**
  - [x] Implement Python code execution with subprocess
  - [x] Add timeout handling (5 seconds)
  - [x] Add memory limit handling
  - [x] Handle syntax errors gracefully
  - [x] Handle runtime exceptions

- [ ] **Support multiple languages**
  - [x] Python execution (priority)
  - [ ] JavaScript execution (Node.js)
  - [ ] Extensible language support system

### 1.3 Submission System Enhancement
- [x] **Update Submission model**
  - [x] Add test_case_results field (JSON)
  - [x] Add execution_time field
  - [x] Add memory_usage field
  - [x] Add overall_status field (pass/fail/partial)

- [x] **Implement test case validation**
  - [x] Create test case execution logic
  - [x] Implement input/output comparison
  - [x] Handle different data types (strings, numbers, arrays)
  - [x] Add sample vs full test case execution

## Phase 2: API Endpoints

### 2.1 Code Execution Endpoints
- [x] **Run Code Endpoint**
  - [x] POST /api/submissions/run (sample test case)
  - [x] Validate input parameters
  - [x] Execute code safely
  - [x] Return execution results

- [x] **Submit Solution Endpoint**
  - [x] POST /api/submissions/submit (all test cases)
  - [x] Execute against all test cases
  - [x] Store submission with results
  - [x] Return comprehensive results

### 2.2 Test Case Management Endpoints
- [ ] **Admin Test Case Endpoints**
  - [ ] POST /api/problems/{id}/test-cases (add test case)
  - [ ] GET /api/problems/{id}/test-cases (list test cases)
  - [ ] PUT /api/test-cases/{id} (update test case)
  - [ ] DELETE /api/test-cases/{id} (delete test case)

## Phase 3: Frontend Integration

### 3.1 Code Editor Enhancements
- [x] **Add execution buttons**
  - [x] "Run Code" button (sample test case)
  - [x] "Submit Solution" button (all test cases)
  - [x] Loading states for both buttons
  - [x] Disable buttons during execution

- [x] **Results display component**
  - [x] Show execution status (success/error)
  - [x] Display test case results
  - [x] Show execution time
  - [x] Show memory usage
  - [x] Syntax error highlighting

### 3.2 Test Case Results UI
- [x] **Test case results panel**
  - [x] List all test cases with pass/fail status
  - [x] Show input/output for failed cases
  - [x] Color coding (green for pass, red for fail)
  - [x] Expandable details for each test case

- [x] **Execution feedback**
  - [x] Real-time execution progress
  - [x] Error messages for syntax/runtime errors
  - [x] Success messages for passed tests

### 3.3 Submission History Updates
- [ ] **Enhanced submission history**
  - [ ] Show test case breakdown
  - [ ] Display execution time and memory
  - [ ] Add status filtering (pass/fail)
  - [ ] Show detailed results for each submission

## Phase 4: Security & Optimization

### 4.1 Security Measures
- [x] **Code execution security**
  - [x] Sandboxed execution environment
  - [x] Prevent file system access
  - [x] Limit network access
  - [x] Prevent infinite loops

- [x] **Input validation**
  - [x] Validate code length limits
  - [x] Sanitize user inputs
  - [x] Prevent malicious code execution

### 4.2 Performance Optimization
- [ ] **Execution optimization**
  - [ ] Implement code execution caching
  - [ ] Optimize test case execution
  - [ ] Add rate limiting for submissions

## Phase 5: Testing & Documentation

### 5.1 Testing
- [ ] **Unit tests**
  - [ ] Test code execution engine
  - [ ] Test test case validation
  - [ ] Test submission system

- [ ] **Integration tests**
  - [ ] Test full submission flow
  - [ ] Test error handling
  - [ ] Test security measures

### 5.2 Documentation
- [ ] **API documentation**
  - [ ] Document new endpoints
  - [ ] Add request/response examples
  - [ ] Update OpenAPI specs

## Implementation Order:
1. ✅ Backend test case management (database models)
2. ✅ Code execution engine
3. ✅ API endpoints
4. ✅ Frontend integration (core features)
5. 🔄 Security & optimization
6. Testing & documentation

## Files to Modify:
- ✅ `backend/app/db/models.py` - Add TestCase model
- ✅ `backend/app/db/schemas.py` - Add TestCase schemas
- ✅ `backend/app/api/routes/submissions.py` - Update submission logic
- ✅ `backend/app/db/problems_seed.json` - Add test cases
- ✅ `frontend/src/pages/ProblemDetailPage.tsx` - Add execution UI
- 🔄 `frontend/src/pages/ProfilePage.tsx` - Update submission history 