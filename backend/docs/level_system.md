# Level System Documentation

## Overview
The Level System with Titles is a gamification feature that provides users with progression milestones based on their total XP earned from solving problems.

## Level Structure

| Level | Title        | XP Required | XP Range    |
|-------|-------------|-------------|-------------|
| 1     | Novice      | 0           | 0-499       |
| 2     | Apprentice  | 500         | 500-1499    |
| 3     | Practitioner| 1500        | 1500-2999   |
| 4     | Expert      | 3000        | 3000-5999   |
| 5     | Master      | 6000        | 6000-9999   |
| 6     | Grandmaster | 10000       | 10000+      |

## XP Earning
- **Easy Problems**: 50 XP
- **Medium Problems**: 100 XP  
- **Hard Problems**: 150 XP

XP is only awarded once per problem (first successful submission).

## API Endpoints

### Level Information
- `GET /api/levels/all` - Get all available levels and titles
- `GET /api/levels/progress` - Get current user's level progress
- `GET /api/levels/user/{user_id}/progress` - Get specific user's level progress

### Testing Endpoints
- `GET /api/levels/test/{xp_amount}` - Test level calculation for given XP
- `POST /api/levels/debug/set-xp/{xp_amount}` - Set current user's XP (debug only)

### Updated Endpoints
- `GET /api/profile/` - Now includes level and title information
- `GET /api/friends/leaderboard` - Now includes level and title for each user
- `GET /api/friends/` - Friend list now includes level information
- `POST /api/submissions/` - Returns level-up information when user levels up

## Response Schemas

### UserLevelProgress
```json
{
  "level": 2,
  "title": "Apprentice",
  "total_xp": 750,
  "xp_to_next_level": 750,
  "level_start_xp": 500,
  "level_end_xp": 1500,
  "progress_percentage": 25.0
}
```

### Level Up Information (in submission response)
```json
{
  "level_up_info": {
    "leveled_up": true,
    "old_level": 1,
    "old_title": "Novice",
    "new_level": 2,
    "new_title": "Apprentice"
  }
}
```

## Implementation Details

### Level Calculator (`backend/app/utils/level_calculator.py`)
- `calculate_level(total_xp)` - Returns (level, title) tuple
- `get_xp_for_next_level(total_xp)` - Returns XP needed for next level
- `get_level_progress(total_xp)` - Returns detailed progress information
- `get_all_levels()` - Returns information about all available levels

### Database Changes
No database schema changes required. The system uses existing `total_xp` field from the `users` table.

### Integration Points
1. **Submissions**: Level-up detection when XP is awarded
2. **Profile**: Display current level and progress
3. **Leaderboard**: Show levels alongside XP rankings
4. **Friends**: Include level information in friend lists

## Usage Examples

### Check User's Current Level
```python
from app.utils.level_calculator import calculate_level, get_level_progress

user_xp = 750
level, title = calculate_level(user_xp)
progress = get_level_progress(user_xp)

print(f"User is level {level} ({title})")
print(f"Progress: {progress['progress_percentage']:.1f}%")
```

### Detect Level Up
```python
old_level, _ = calculate_level(old_xp)
new_level, new_title = calculate_level(new_xp)

if new_level > old_level:
    print(f"Level up! Now {new_title} (Level {new_level})")
```

## Testing
Use the debug endpoints to test different XP amounts:
- `GET /api/levels/test/750` - See what level 750 XP gives
- `POST /api/levels/debug/set-xp/1500` - Set your XP to 1500 to test level 3

## Future Enhancements
- Level-based achievements
- Level-specific rewards or unlocks
- Seasonal level resets
- Prestige system for max level users