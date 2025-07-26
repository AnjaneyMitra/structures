# V3 Medium Features Implementation Workflow

This document outlines the implementation workflow for the medium difficulty features identified in `implementation_difficulty.md`. Building on the completed V2 easy features, V3 focuses on enhanced functionality that provides substantial value to users.

## 🟡 **MEDIUM FEATURES IMPLEMENTATION**

---

### 1. **Problem Categories/Tags** (1-2 weeks)

#### **Backend Implementation**
- **Database Changes:**
  ```python
  # backend/app/db/models.py
  class Category(Base):
      __tablename__ = "categories"
      id = Column(Integer, primary_key=True, index=True)
      name = Column(String, unique=True, nullable=False)  # "Array", "Dynamic Programming", etc.
      description = Column(Text, nullable=True)
      color = Column(String, nullable=True)  # Hex color for UI
      icon = Column(String, nullable=True)   # Icon name
      created_at = Column(DateTime, default=datetime.datetime.utcnow)

  # Many-to-many relationship table
  problem_categories = Table(
      'problem_categories',
      Base.metadata,
      Column('problem_id', Integer, ForeignKey('problems.id'), primary_key=True),
      Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
  )

  # Update Problem model
  class Problem(Base):
      # ... existing fields ...
      categories = relationship("Category", secondary=problem_categories, backref="problems")
  ```

- **API Endpoints:**
  ```python
  # backend/app/api/routes/categories.py
  GET /api/categories                    # Get all categories
  POST /api/categories                   # Create category (admin)
  PUT /api/categories/{id}               # Update category (admin)
  DELETE /api/categories/{id}            # Delete category (admin)
  GET /api/categories/{id}/problems      # Get problems by category
  POST /api/problems/{id}/categories     # Add categories to problem (admin)
  DELETE /api/problems/{id}/categories/{category_id}  # Remove category (admin)
  ```

#### **Frontend Implementation**
- **Components:**
  - `CategoryFilter` component for problems page
  - `CategoryBadge` component for displaying tags
  - `CategoryManager` component for admin panel
  - `CategorySelector` for problem creation/editing

- **Features:**
  - Multi-select category filtering
  - Category-based problem recommendations
  - Visual category indicators with colors/icons
  - Category-based progress tracking

---

### 2. **Problem Hints System** (1-2 weeks)

#### **Backend Implementation**
- **Database Changes:**
  ```python
  # backend/app/db/models.py
  class Hint(Base):
      __tablename__ = "hints"
      id = Column(Integer, primary_key=True, index=True)
      problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
      content = Column(Text, nullable=False)
      order = Column(Integer, nullable=False)  # Hint sequence
      xp_penalty = Column(Integer, default=5)  # XP reduction for using hint
      created_at = Column(DateTime, default=datetime.datetime.utcnow)
      
      problem = relationship("Problem", backref="hints")

  class UserHint(Base):
      __tablename__ = "user_hints"
      id = Column(Integer, primary_key=True, index=True)
      user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      hint_id = Column(Integer, ForeignKey("hints.id"), nullable=False)
      revealed_at = Column(DateTime, default=datetime.datetime.utcnow)
      
      user = relationship("User")
      hint = relationship("Hint")
  ```

- **API Endpoints:**
  ```python
  # backend/app/api/routes/hints.py
  GET /api/problems/{id}/hints           # Get available hints (count only)
  POST /api/problems/{id}/hints/{order}  # Reveal specific hint
  GET /api/problems/{id}/hints/revealed  # Get user's revealed hints
  POST /api/hints                        # Create hint (admin)
  PUT /api/hints/{id}                    # Update hint (admin)
  DELETE /api/hints/{id}                 # Delete hint (admin)
  ```

#### **Frontend Implementation**
- **Components:**
  - `HintSystem` component with progressive reveal
  - `HintButton` with confirmation dialog
  - `HintPanel` showing revealed hints
  - `HintEditor` for admin hint management

- **Features:**
  - Progressive hint revelation (1, 2, 3...)
  - XP penalty warning before revealing
  - Hint usage tracking in user stats
  - Visual hint indicators

---

### 3. **Editorial Solutions** (1-2 weeks)

#### **Backend Implementation**
- **Database Changes:**
  ```python
  # backend/app/db/models.py
  class Editorial(Base):
      __tablename__ = "editorials"
      id = Column(Integer, primary_key=True, index=True)
      problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
      title = Column(String, nullable=False)
      content = Column(Text, nullable=False)  # Rich text/markdown
      approach = Column(String, nullable=True)  # "Brute Force", "Optimal", etc.
      time_complexity = Column(String, nullable=True)  # "O(n)", "O(log n)", etc.
      space_complexity = Column(String, nullable=True)
      code_solution = Column(Text, nullable=True)  # Code example
      language = Column(String, nullable=True)  # Programming language
      author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
      created_at = Column(DateTime, default=datetime.datetime.utcnow)
      updated_at = Column(DateTime, default=datetime.datetime.utcnow)
      
      problem = relationship("Problem", backref="editorials")
      author = relationship("User")

  class UserEditorialView(Base):
      __tablename__ = "user_editorial_views"
      id = Column(Integer, primary_key=True, index=True)
      user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      editorial_id = Column(Integer, ForeignKey("editorials.id"), nullable=False)
      viewed_at = Column(DateTime, default=datetime.datetime.utcnow)
  ```

- **API Endpoints:**
  ```python
  # backend/app/api/routes/editorials.py
  GET /api/problems/{id}/editorials      # Get problem editorials
  GET /api/editorials/{id}               # Get specific editorial
  POST /api/editorials                   # Create editorial (admin/author)
  PUT /api/editorials/{id}               # Update editorial
  DELETE /api/editorials/{id}            # Delete editorial
  POST /api/editorials/{id}/view         # Track editorial view
  ```

#### **Frontend Implementation**
- **Components:**
  - `EditorialViewer` with rich text rendering
  - `EditorialEditor` with markdown support
  - `EditorialList` showing multiple approaches
  - `ComplexityBadge` for time/space complexity

- **Features:**
  - Rich text/markdown editorial content
  - Multiple solution approaches per problem
  - Code syntax highlighting
  - Editorial access control (solve first, or premium)

---

### 4. **Custom Test Case Creation** (1-2 weeks)

#### **Backend Implementation**
- **Database Changes:**
  ```python
  # backend/app/db/models.py
  class CustomTestCase(Base):
      __tablename__ = "custom_test_cases"
      id = Column(Integer, primary_key=True, index=True)
      user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
      input = Column(Text, nullable=False)
      expected_output = Column(Text, nullable=False)
      description = Column(String, nullable=True)  # User's note
      is_public = Column(Boolean, default=False)   # Share with community
      created_at = Column(DateTime, default=datetime.datetime.utcnow)
      
      user = relationship("User")
      problem = relationship("Problem")
  ```

- **API Endpoints:**
  ```python
  # backend/app/api/routes/custom_tests.py
  GET /api/problems/{id}/custom-tests    # Get user's custom tests
  POST /api/problems/{id}/custom-tests   # Create custom test
  PUT /api/custom-tests/{id}             # Update custom test
  DELETE /api/custom-tests/{id}          # Delete custom test
  POST /api/custom-tests/{id}/run        # Run code against custom test
  GET /api/custom-tests/public           # Get public custom tests
  ```

#### **Frontend Implementation**
- **Components:**
  - `CustomTestCreator` form component
  - `CustomTestList` showing user's tests
  - `CustomTestRunner` for testing code
  - `TestCaseValidator` for input validation

- **Features:**
  - Create custom input/output test cases
  - Test code against custom cases
  - Share test cases with community
  - Import/export test cases

---

### 5. **Global Leaderboards** (1-2 weeks)

#### **Backend Implementation**
- **Database Changes:**
  ```python
  # backend/app/db/models.py
  class LeaderboardEntry(Base):
      __tablename__ = "leaderboard_entries"
      id = Column(Integer, primary_key=True, index=True)
      user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      leaderboard_type = Column(String, nullable=False)  # "global", "weekly", "monthly"
      score = Column(Integer, nullable=False)
      rank = Column(Integer, nullable=False)
      period_start = Column(DateTime, nullable=True)  # For time-based boards
      period_end = Column(DateTime, nullable=True)
      updated_at = Column(DateTime, default=datetime.datetime.utcnow)
      
      user = relationship("User")

  # Add to User model
  class User(Base):
      # ... existing fields ...
      global_rank = Column(Integer, nullable=True)
      weekly_rank = Column(Integer, nullable=True)
      monthly_rank = Column(Integer, nullable=True)
  ```

- **API Endpoints:**
  ```python
  # backend/app/api/routes/leaderboards.py
  GET /api/leaderboards/global           # Global leaderboard
  GET /api/leaderboards/weekly           # Weekly leaderboard
  GET /api/leaderboards/monthly          # Monthly leaderboard
  GET /api/leaderboards/friends          # Friends leaderboard
  GET /api/leaderboards/{type}/rank/{user_id}  # Get user's rank
  POST /api/leaderboards/refresh         # Refresh rankings (admin)
  ```

- **Background Tasks:**
  ```python
  # backend/app/utils/leaderboard_updater.py
  def update_global_leaderboard():
      # Recalculate rankings based on total XP
      pass

  def update_weekly_leaderboard():
      # Calculate weekly XP gains
      pass

  def update_monthly_leaderboard():
      # Calculate monthly XP gains
      pass
  ```

#### **Frontend Implementation**
- **Components:**
  - `GlobalLeaderboard` with pagination
  - `LeaderboardCard` showing user position
  - `LeaderboardTabs` for different time periods
  - `RankBadge` component for displaying ranks

- **Features:**
  - Real-time rank updates
  - Multiple leaderboard types (global, weekly, monthly)
  - Friends-only leaderboard
  - Rank change indicators

---

### 6. **Friend Challenges** (1-2 weeks)

#### **Backend Implementation**
- **Database Changes:**
  ```python
  # backend/app/db/models.py
  class Challenge(Base):
      __tablename__ = "challenges"
      id = Column(Integer, primary_key=True, index=True)
      challenger_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      challenged_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
      status = Column(String, default="pending")  # pending, accepted, completed, expired
      message = Column(Text, nullable=True)
      time_limit = Column(Integer, nullable=True)  # Minutes
      created_at = Column(DateTime, default=datetime.datetime.utcnow)
      expires_at = Column(DateTime, nullable=True)
      completed_at = Column(DateTime, nullable=True)
      
      challenger = relationship("User", foreign_keys=[challenger_id])
      challenged = relationship("User", foreign_keys=[challenged_id])
      problem = relationship("Problem")

  class ChallengeResult(Base):
      __tablename__ = "challenge_results"
      id = Column(Integer, primary_key=True, index=True)
      challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False)
      user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=True)
      completion_time = Column(Integer, nullable=True)  # Seconds
      status = Column(String, nullable=False)  # completed, failed, timeout
      completed_at = Column(DateTime, default=datetime.datetime.utcnow)
      
      challenge = relationship("Challenge")
      user = relationship("User")
      submission = relationship("Submission")
  ```

- **API Endpoints:**
  ```python
  # backend/app/api/routes/challenges.py
  POST /api/challenges                   # Create challenge
  GET /api/challenges/received           # Get received challenges
  GET /api/challenges/sent               # Get sent challenges
  POST /api/challenges/{id}/accept       # Accept challenge
  POST /api/challenges/{id}/decline      # Decline challenge
  GET /api/challenges/{id}/status        # Get challenge status
  POST /api/challenges/{id}/complete     # Submit solution
  ```

#### **Frontend Implementation**
- **Components:**
  - `ChallengeCreator` for sending challenges
  - `ChallengeList` showing active challenges
  - `ChallengeTimer` for timed challenges
  - `ChallengeResults` showing outcomes

- **Features:**
  - Send challenges to friends
  - Timed challenge mode
  - Challenge notifications
  - Challenge history and statistics

---

### 7. **Discussion Forums** (2 weeks)

#### **Backend Implementation**
- **Database Changes:**
  ```python
  # backend/app/db/models.py
  class ForumCategory(Base):
      __tablename__ = "forum_categories"
      id = Column(Integer, primary_key=True, index=True)
      name = Column(String, nullable=False)
      description = Column(Text, nullable=True)
      order = Column(Integer, default=0)
      created_at = Column(DateTime, default=datetime.datetime.utcnow)

  class ForumThread(Base):
      __tablename__ = "forum_threads"
      id = Column(Integer, primary_key=True, index=True)
      category_id = Column(Integer, ForeignKey("forum_categories.id"), nullable=False)
      problem_id = Column(Integer, ForeignKey("problems.id"), nullable=True)  # Optional problem link
      author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      title = Column(String, nullable=False)
      content = Column(Text, nullable=False)
      is_pinned = Column(Boolean, default=False)
      is_locked = Column(Boolean, default=False)
      view_count = Column(Integer, default=0)
      reply_count = Column(Integer, default=0)
      created_at = Column(DateTime, default=datetime.datetime.utcnow)
      updated_at = Column(DateTime, default=datetime.datetime.utcnow)
      
      category = relationship("ForumCategory")
      author = relationship("User")
      problem = relationship("Problem")

  class ForumReply(Base):
      __tablename__ = "forum_replies"
      id = Column(Integer, primary_key=True, index=True)
      thread_id = Column(Integer, ForeignKey("forum_threads.id"), nullable=False)
      author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      content = Column(Text, nullable=False)
      parent_id = Column(Integer, ForeignKey("forum_replies.id"), nullable=True)  # For threading
      is_solution = Column(Boolean, default=False)  # Mark as solution
      upvotes = Column(Integer, default=0)
      downvotes = Column(Integer, default=0)
      created_at = Column(DateTime, default=datetime.datetime.utcnow)
      updated_at = Column(DateTime, default=datetime.datetime.utcnow)
      
      thread = relationship("ForumThread", backref="replies")
      author = relationship("User")
      parent = relationship("ForumReply", remote_side=[id])

  class ForumVote(Base):
      __tablename__ = "forum_votes"
      id = Column(Integer, primary_key=True, index=True)
      user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      reply_id = Column(Integer, ForeignKey("forum_replies.id"), nullable=False)
      vote_type = Column(String, nullable=False)  # "up" or "down"
      created_at = Column(DateTime, default=datetime.datetime.utcnow)
  ```

- **API Endpoints:**
  ```python
  # backend/app/api/routes/forums.py
  GET /api/forums/categories             # Get forum categories
  GET /api/forums/categories/{id}/threads # Get threads in category
  GET /api/forums/threads/{id}           # Get thread with replies
  POST /api/forums/threads               # Create new thread
  POST /api/forums/threads/{id}/replies  # Reply to thread
  PUT /api/forums/replies/{id}           # Edit reply
  DELETE /api/forums/replies/{id}        # Delete reply
  POST /api/forums/replies/{id}/vote     # Vote on reply
  POST /api/forums/replies/{id}/solution # Mark as solution
  ```

#### **Frontend Implementation**
- **Components:**
  - `ForumHome` with category listing
  - `ThreadList` with pagination
  - `ThreadView` with nested replies
  - `ReplyEditor` with markdown support
  - `VoteButtons` for upvote/downvote

- **Features:**
  - Threaded discussions
  - Markdown support for posts
  - Voting system for replies
  - Solution marking
  - Problem-specific discussions

---

### 8. **Code Snippets and Templates** (1 week)

#### **Backend Implementation**
- **Database Changes:**
  ```python
  # backend/app/db/models.py
  class CodeSnippet(Base):
      __tablename__ = "code_snippets"
      id = Column(Integer, primary_key=True, index=True)
      user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      title = Column(String, nullable=False)
      description = Column(Text, nullable=True)
      code = Column(Text, nullable=False)
      language = Column(String, nullable=False)
      category = Column(String, nullable=True)  # "template", "utility", "algorithm"
      is_public = Column(Boolean, default=False)
      tags = Column(JSON, nullable=True)  # Array of tags
      usage_count = Column(Integer, default=0)
      created_at = Column(DateTime, default=datetime.datetime.utcnow)
      updated_at = Column(DateTime, default=datetime.datetime.utcnow)
      
      user = relationship("User")

  class SnippetUsage(Base):
      __tablename__ = "snippet_usage"
      id = Column(Integer, primary_key=True, index=True)
      user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      snippet_id = Column(Integer, ForeignKey("code_snippets.id"), nullable=False)
      used_at = Column(DateTime, default=datetime.datetime.utcnow)
  ```

- **API Endpoints:**
  ```python
  # backend/app/api/routes/snippets.py
  GET /api/snippets                      # Get user's snippets
  GET /api/snippets/public               # Get public snippets
  GET /api/snippets/templates            # Get code templates
  POST /api/snippets                     # Create snippet
  PUT /api/snippets/{id}                 # Update snippet
  DELETE /api/snippets/{id}              # Delete snippet
  POST /api/snippets/{id}/use            # Track snippet usage
  GET /api/snippets/search               # Search snippets
  ```

#### **Frontend Implementation**
- **Components:**
  - `SnippetManager` for organizing snippets
  - `SnippetEditor` with syntax highlighting
  - `SnippetBrowser` for discovering public snippets
  - `TemplateSelector` for quick insertion

- **Features:**
  - Personal code snippet library
  - Public snippet sharing
  - Code templates for common patterns
  - Quick insertion into editor
  - Snippet search and categorization

---

## 🔄 **Implementation Order & Dependencies**

### **Phase 1 (Weeks 1-2): Foundation**
1. **Problem Categories/Tags** - Enhances problem organization
2. **Code Snippets and Templates** - Improves coding efficiency

### **Phase 2 (Weeks 3-4): User Engagement**
3. **Problem Hints System** - Helps users learn progressively
4. **Custom Test Case Creation** - Empowers user testing

### **Phase 3 (Weeks 5-6): Social Features**
5. **Global Leaderboards** - Adds competitive element
6. **Friend Challenges** - Enhances social interaction

### **Phase 4 (Weeks 7-8): Content & Community**
7. **Editorial Solutions** - Provides learning resources
8. **Discussion Forums** - Builds community engagement

---

## 🧪 **Testing Strategy**

### **Backend Testing**
- API endpoint testing for all new routes
- Database relationship and constraint testing
- Performance testing for leaderboard queries
- Real-time feature testing (challenges, forums)

### **Frontend Testing**
- Component rendering and interaction tests
- User flow testing for complex features
- Real-time update testing
- Mobile responsiveness testing

### **Integration Testing**
- End-to-end user workflows
- Real-time collaboration features
- Notification system testing
- Performance under load

---

## 📊 **Success Metrics**

### **User Engagement**
- **Problem Categories**: Increased problem discovery and completion rates
- **Hints System**: Reduced abandonment rate, improved learning progression
- **Custom Tests**: Higher code quality, more thorough testing

### **Social Features**
- **Leaderboards**: Increased daily active users, longer session times
- **Friend Challenges**: Higher user retention, social network growth
- **Forums**: Community engagement, knowledge sharing metrics

### **Content Quality**
- **Editorial Solutions**: Improved understanding, reduced help requests
- **Code Snippets**: Faster problem solving, code reuse metrics

---

## 🚀 **Technical Considerations**

### **Performance Optimizations**
- **Leaderboard Caching**: Redis caching for frequently accessed rankings
- **Forum Pagination**: Efficient query optimization for large discussions
- **Real-time Updates**: WebSocket optimization for live features

### **Scalability Preparations**
- **Database Indexing**: Proper indexes for search and filtering
- **API Rate Limiting**: Prevent abuse of social features
- **Content Moderation**: Basic moderation tools for forums

### **Security Enhancements**
- **Input Validation**: Sanitization for user-generated content
- **Permission Checks**: Proper authorization for admin features
- **Spam Prevention**: Rate limiting and content filtering

---

This V3 workflow builds upon the solid foundation of V2's easy features, adding substantial value through enhanced problem organization, social interaction, and community building features. Each feature is designed to increase user engagement and provide a more comprehensive coding practice platform.