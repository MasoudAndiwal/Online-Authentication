# Mark Attendance Page - UI Updates Guide

## Changes to Implement

### 1. **Button Styling Updates**

#### Remove Black Borders & Use Primary Colors

**Current Issues:**
- Buttons have black borders
- Inconsistent color usage
- Day Status buttons need better colors

**Updates Needed:**

```typescript
// Day Status Buttons (Sick/Leave) - Use warm colors without borders
<Button
  className="bg-g