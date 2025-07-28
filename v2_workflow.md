# V2 Easy Features Implementation Workflow

This document outlines the implementation workflow for the easy features identified in `implementation_difficulty.md`. Each feature includes detailed backend and frontend requirements with integration points.

## 🟢 **EASY FEATURES IMPLEMENTATION**

---

### 1. **Problem Bookmarking** (1-2 days)

#### **Backend Implementation**
- **Database Changes:**
  - Add `bookmarks` table with columns: `id`, `user_id`, `problem_id`, `created_at`
  - Add unique constraint on `(user_id, problem_id)` to prevent duplicates
  
- **API Endpoints:**
  ```python
  # backend/app/api/routes/bookmarks.py
  POST /api/bookmarks/{problem_id}    # Add bookmark
  DELETE /api/bookmarks/{problem_id}  # Remove bookmark
  GET /api/bookmarks                  # Get user's bookmarks
  GET /api/problems/{id}/bookmarked   # Check if problem is bookmarked
  ```

- **Database Model:**
  ```python
  # backend/app/db/models.py
  class Bookmark(Base):
      __tablename__ = "bookmarks"
      id = Column(Integer, primary_key=True, index=True)
      user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
      created_at = Column(DateTime, default=datetime.datetime.utcnow)
      
      user = relationship("User", backref="bookmarks")
      problem = relationship("Problem", backref="bookmarked_by")
  ```

#### **Frontend Implementation**
- **Components:**
  - Add bookmark toggle button to `ProblemCard` component
  - Add bookmark icon to `ProblemDetailPage` header
  - Create `BookmarkedProblems` page/section in dashboard
  
- **State Management:**
  - Add bookmark status to problem objects
  - Create bookmark context or use existing auth context
  - Implement optimistic updates for better UX

- **Integration:**
  - Extend existing `ProblemsPage` to show bookmark status
  - Add bookmark filter to problems list
  - Update `DashboardPage` to show bookmarked problems count

---

### 2. **High Contrast Themes** (1 day)

#### **Backend Implementation**
- **User Preferences:**
  - Add `theme_preference` column to `users` table: `'light' | 'dark' | 'high-contrast'`
  - Update profile API to save/retrieve theme preference

- **API Endpoints:**
  ```python
  # Extend existing profile endpoints
  PUT /api/profile/preferences  # Save theme preference
  GET /api/profile             # Include theme preference
  ```

#### **Frontend Implementation**
- **Theme System Extension:**
  ```typescript
  // frontend/src/theme.ts
  export const highContrastTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#FFFF00' },      // Bright yellow
      secondary: { main: '#00FFFF' },    // Bright cyan
      background: {
        default: '#000000',              // Pure black
        paper: '#1A1A1A',
      },
      text: {
        primary: '#FFFFFF',              // Pure white
        secondary: '#FFFF00',            // Bright yellow
      },
      error: { main: '#FF0000' },        // Pure red
      success: { main: '#00FF00' },      // Pure green
    }
  });
  ```

- **Context Updates:**
  ```typescript
  // frontend/src/contexts/ThemeContext.tsx
  type ThemeMode = 'light' | 'dark' | 'high-contrast';
  
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  ```

- **Integration:**
  - Update `ThemeToggle` component to cycle through 3 themes
  - Add theme preference to user settings
  - Ensure all components respect high contrast colors

---

### 3. **Font Size Customization** (1 day)

#### **Backend Implementation**
- **User Preferences:**
  - Add `font_size` column to `users` table: `'small' | 'medium' | 'large' | 'extra-large'`
  - Update profile API to handle font size preference

#### **Frontend Implementation**
- **CSS Variables:**
  ```css
  /* frontend/src/index.css */
  :root {
    --font-size-small: 0.875rem;
    --font-size-medium: 1rem;
    --font-size-large: 1.125rem;
    --font-size-extra-large: 1.25rem;
  }
  
  [data-font-size="small"] { --base-font-size: var(--font-size-small); }
  [data-font-size="medium"] { --base-font-size: var(--font-size-medium); }
  [data-font-size="large"] { --base-font-size: var(--font-size-large); }
  [data-font-size="extra-large"] { --base-font-size: var(--font-size-extra-large); }
  ```

- **Context Implementation:**
  ```typescript
  // frontend/src/contexts/FontSizeContext.tsx
  interface FontSizeContextType {
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    setFontSize: (size: string) => void;
  }
  ```

- **Integration:**
  - Add font size selector to settings/profile page
  - Apply font size to Monaco Editor options
  - Update document root attribute on font size change

---

### 4. **Multiple Themes Extension** (1 day)

#### **Backend Implementation**
- **No backend changes needed** - extends existing theme preference system

#### **Frontend Implementation**
- **Additional Themes:**
  ```typescript
  // frontend/src/theme.ts
  export const blueTheme = createAdvancedTheme('dark', '#2563EB');    // Blue accent
  export const greenTheme = createAdvancedTheme('dark', '#059669');   // Green accent
  export const purpleTheme = createAdvancedTheme('dark', '#7C3AED');  // Purple accent
  ```

- **Theme Selection:**
  ```typescript
  // frontend/src/contexts/ThemeContext.tsx
  type ThemeVariant = 'default' | 'blue' | 'green' | 'purple' | 'high-contrast';
  
  const themeMap = {
    'default-light': theme,
    'default-dark': darkTheme,
    'blue-dark': blueTheme,
    'green-dark': greenTheme,
    'purple-dark': purpleTheme,
    'high-contrast': highContrastTheme,
  };
  ```

- **Integration:**
  - Add theme picker component to settings
  - Save theme preference to localStorage and backend
  - Update theme toggle to show current theme name

---

### 5. **Keyboard Shortcuts** (2 days)

#### **Backend Implementation**
- **No backend changes needed** - purely frontend feature

#### **Frontend Implementation**
- **Shortcut System:**
  ```typescript
  // frontend/src/hooks/useKeyboardShortcuts.ts
  interface ShortcutConfig {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    action: () => void;
    description: string;
  }
  
  const shortcuts: ShortcutConfig[] = [
    { key: 'r', ctrlKey: true, action: runCode, description: 'Run Code' },
    { key: 's', ctrlKey: true, action: submitCode, description: 'Submit Code' },
    { key: 'b', ctrlKey: true, action: toggleBookmark, description: 'Toggle Bookmark' },
    { key: '/', ctrlKey: true, action: focusSearch, description: 'Focus Search' },
    { key: 't', ctrlKey: true, action: toggleTheme, description: 'Toggle Theme' },
  ];
  ```

- **Components:**
  - Create `KeyboardShortcutsHelp` modal component
  - Add shortcut indicators to buttons (e.g., "Run (Ctrl+R)")
  - Implement global shortcut listener

- **Integration:**
  - Add shortcuts to `ProblemDetailPage` for code actions
  - Add shortcuts to `ProblemsPage` for navigation
  - Add help shortcut (Ctrl+?) to show all shortcuts

---

### 6. **Achievement Badges** (2-3 days)

#### **Backend Implementation**
- **Database Changes:**
  ```python
  # backend/app/db/models.py
  class Achievement(Base):
      __tablename__ = "achievements"
      id = Column(Integer, primary_key=True, index=True)
      name = Column(String, nullable=False)
      description = Column(Text, nullable=False)
      icon = Column(String, nullable=False)  # Icon name/path
      condition_type = Column(String, nullable=False)  # 'first_solve', 'streak', 'count'
      condition_value = Column(Integer, nullable=True)  # Threshold value
      xp_reward = Column(Integer, default=0)
      
  class UserAchievement(Base):
      __tablename__ = "user_achievements"
      id = Column(Integer, primary_key=True, index=True)
      user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
      earned_at = Column(DateTime, default=datetime.datetime.utcnow)
      
      user = relationship("User", backref="earned_achievements")
      achievement = relationship("Achievement")
  ```

- **Achievement Logic:**
  ```python
  # backend/app/utils/achievements.py
  def check_achievements(user_id: int, event_type: str, db: Session):
      # Check for new achievements based on user actions
      # Award achievements and XP
      pass
  ```

- **API Endpoints:**
  ```python
  GET /api/achievements              # Get all available achievements
  GET /api/achievements/user         # Get user's earned achievements
  POST /api/achievements/check       # Trigger achievement check (internal)
  ```

#### **Frontend Implementation**
- **Components:**
  - `AchievementBadge` component for displaying badges
  - `AchievementModal` for showing earned achievement
  - `AchievementsPage` for viewing all achievements
  
- **Achievement System:**
  ```typescript
  // frontend/src/types/achievements.ts
  interface Achievement {
    id: number;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedAt?: string;
    progress?: number;
    total?: number;
  }
  ```

- **Integration:**
  - Show achievement notifications after problem solve
  - Display achievement badges in user profile
  - Add achievements section to dashboard

---

### 7. **Streak Tracking** (2 days)

#### **Backend Implementation**
- **Database Changes:**
  ```python
  # Add to User model
  class User(Base):
      # ... existing fields ...
      current_streak = Column(Integer, default=0)
      longest_streak = Column(Integer, default=0)
      last_solve_date = Column(DateTime, nullable=True)
  ```

- **Streak Logic:**
  ```python
  # backend/app/utils/streak_calculator.py
  def update_user_streak(user_id: int, db: Session):
      user = db.query(User).filter(User.id == user_id).first()
      today = datetime.date.today()
      
      if user.last_solve_date:
          last_solve = user.last_solve_date.date()
          if last_solve == today:
              return  # Already solved today
          elif last_solve == today - datetime.timedelta(days=1):
              user.current_streak += 1
          else:
              user.current_streak = 1
      else:
          user.current_streak = 1
      
      user.longest_streak = max(user.longest_streak, user.current_streak)
      user.last_solve_date = datetime.datetime.utcnow()
      db.commit()
  ```

#### **Frontend Implementation**
- **Components:**
  - `StreakDisplay` component for dashboard
  - `StreakCalendar` component showing solve history
  - Streak fire icon with animation

- **Integration:**
  - Update streak after successful submission
  - Show streak in user profile and dashboard
  - Add streak-based achievements

---

### 8. **Level System with Titles** (1 day)

#### **Backend Implementation**
- **Level Calculation:**
  ```python
  # backend/app/utils/level_calculator.py
  def calculate_level(total_xp: int) -> tuple[int, str]:
      levels = [
          (0, "Novice"),
          (500, "Apprentice"),
          (1500, "Practitioner"),
          (3000, "Expert"),
          (6000, "Master"),
          (10000, "Grandmaster"),
      ]
      
      for i, (xp_threshold, title) in enumerate(reversed(levels)):
          if total_xp >= xp_threshold:
              level = len(levels) - i
              return level, title
      
      return 1, "Novice"
  ```

- **API Updates:**
  ```python
  # Include level info in profile responses
  {
    "user": {...},
    "level": 3,
    "title": "Practitioner",
    "xp_to_next_level": 1500,
    "total_xp": 1500
  }
  ```

#### **Frontend Implementation**
- **Components:**
  - `LevelDisplay` component with progress bar
  - `TitleBadge` component for showing user title
  
- **Integration:**
  - Show level and title in user profile
  - Display level progress in dashboard
  - Add level-up animations and notifications

---

### 9. **Bonus XP Events** (1 day)

#### **Backend Implementation**
- **Event System:**
  ```python
  # backend/app/db/models.py
  class XPEvent(Base):
      __tablename__ = "xp_events"
      id = Column(Integer, primary_key=True, index=True)
      name = Column(String, nullable=False)
      multiplier = Column(Float, default=1.0)  # 2.0 = double XP
      start_date = Column(DateTime, nullable=False)
      end_date = Column(DateTime, nullable=False)
      active = Column(Boolean, default=True)
  ```

- **XP Calculation Update:**
  ```python
  # backend/app/utils/xp_calculator.py
  def calculate_xp_with_events(base_xp: int, db: Session) -> int:
      active_events = db.query(XPEvent).filter(
          XPEvent.active == True,
          XPEvent.start_date <= datetime.datetime.utcnow(),
          XPEvent.end_date >= datetime.datetime.utcnow()
      ).all()
      
      multiplier = 1.0
      for event in active_events:
          multiplier *= event.multiplier
      
      return int(base_xp * multiplier)
  ```

#### **Frontend Implementation**
- **Components:**
  - `XPEventBanner` component for active events
  - `XPMultiplierIndicator` in submission results
  
- **Integration:**
  - Show active XP events in dashboard
  - Highlight bonus XP in submission notifications
  - Add event countdown timers

---

### 10. **Popular Problems Tracking** (1 day)

#### **Backend Implementation**
- **Database Changes:**
  ```python
  # Add to Problem model
  class Problem(Base):
      # ... existing fields ...
      view_count = Column(Integer, default=0)
      solve_count = Column(Integer, default=0)
      attempt_count = Column(Integer, default=0)
  ```

- **Tracking Logic:**
  ```python
  # Update counters on problem view/solve/attempt
  def increment_problem_view(problem_id: int, db: Session):
      db.query(Problem).filter(Problem.id == problem_id).update(
          {Problem.view_count: Problem.view_count + 1}
      )
      db.commit()
  ```

- **API Endpoints:**
  ```python
  GET /api/problems/popular     # Get most popular problems
  GET /api/problems/trending    # Get trending problems (recent activity)
  ```

#### **Frontend Implementation**
- **Components:**
  - `PopularProblems` section in dashboard
  - `TrendingBadge` for trending problems
  
- **Integration:**
  - Track problem views automatically
  - Show popular problems in dashboard
  - Add "Popular" and "Trending" filters to problems page

---

### 11. **Time Spent Coding** (1 day)

#### **Backend Implementation**
- **Database Changes:**
  ```python
  # backend/app/db/models.py
  class CodingSession(Base):
      __tablename__ = "coding_sessions"
      id = Column(Integer, primary_key=True, index=True)
      user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
      problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
      start_time = Column(DateTime, nullable=False)
      end_time = Column(DateTime, nullable=True)
      duration_seconds = Column(Integer, nullable=True)
      
      user = relationship("User", backref="coding_sessions")
      problem = relationship("Problem")
  ```

- **Session Tracking:**
  ```python
  POST /api/sessions/start      # Start coding session
  PUT /api/sessions/end         # End coding session
  GET /api/sessions/stats       # Get user's coding time stats
  ```

#### **Frontend Implementation**
- **Session Management:**
  ```typescript
  // frontend/src/hooks/useCodingTimer.ts
  export const useCodingTimer = (problemId: number) => {
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    
    const startSession = () => {
      setStartTime(new Date());
      // API call to start session
    };
    
    const endSession = () => {
      // API call to end session
      setStartTime(null);
    };
  };
  ```

- **Integration:**
  - Auto-start timer when user opens problem
  - Show elapsed time in problem detail page
  - Display coding time stats in profile

---

### 12. **Success Rate by Difficulty** (1 day)

#### **Backend Implementation**
- **Analytics Endpoint:**
  ```python
  # backend/app/api/routes/analytics.py
  @router.get("/success-rate")
  def get_success_rate(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
      stats = db.query(
          Problem.difficulty,
          func.count(Submission.id).label('total_attempts'),
          func.sum(case((Submission.overall_status == 'pass', 1), else_=0)).label('successful_attempts')
      ).join(Submission).filter(Submission.user_id == user.id).group_by(Problem.difficulty).all()
      
      return [
          {
              "difficulty": stat.difficulty,
              "success_rate": (stat.successful_attempts / stat.total_attempts * 100) if stat.total_attempts > 0 else 0,
              "total_attempts": stat.total_attempts,
              "successful_attempts": stat.successful_attempts
          }
          for stat in stats
      ]
  ```

#### **Frontend Implementation**
- **Components:**
  - `SuccessRateChart` component using Chart.js or similar
  - `DifficultyStats` component for profile page
  
- **Integration:**
  - Show success rate in user profile
  - Display difficulty-based recommendations
  - Add success rate to dashboard stats

---

## 🔄 **Implementation Order & Dependencies**

### **Phase 1 (Week 1):**
1. Problem bookmarking (foundational feature)
2. High contrast themes (extends existing theme system)
3. Font size customization (user preference system)

### **Phase 2 (Week 2):**
4. Multiple themes extension (builds on theme system)
5. Keyboard shortcuts (enhances UX)
6. Popular problems tracking (simple analytics)

### **Phase 3 (Week 3):**
7. Achievement badges (gamification foundation)
8. Streak tracking (builds on XP system)
9. Level system with titles (extends XP system)

### **Phase 4 (Week 4):**
10. Bonus XP events (extends achievement system)
11. Time spent coding (analytics feature)
12. Success rate by difficulty (analytics feature)

---

## 🧪 **Testing Strategy**

### **Backend Testing:**
- Unit tests for new API endpoints
- Database migration tests
- XP calculation and achievement logic tests

### **Frontend Testing:**
- Component rendering tests
- User interaction tests (bookmarking, theme switching)
- Keyboard shortcut functionality tests

### **Integration Testing:**
- End-to-end user flows
- Theme persistence across sessions
- Achievement earning workflows

---

## 📊 **Success Metrics**

- **User Engagement:** Increased session duration and return visits
- **Feature Adoption:** Percentage of users using new features
- **Accessibility:** Improved accessibility scores with high contrast themes
- **Gamification:** User progression through levels and achievement earning

This workflow provides a structured approach to implementing all easy features while maintaining code quality and user experience standards.