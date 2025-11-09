# Accessibility Testing Checklist

## Quick Testing Guide for Task 8.2

### ✅ Keyboard Navigation Tests

#### Test 1: Skip Links
1. Load the teacher dashboard page
2. Press **Tab** once
3. **Expected**: Skip link appears at top-left with orange background
4. Press **Enter** on each skip link
5. **Expected**: Focus jumps to the target section

#### Test 2: Class Grid Navigation
1. Navigate to "My Classes" section
2. Press **Tab** until a class card is focused
3. Use **Arrow Keys** to navigate between cards
4. **Expected**: Focus moves between cards with visible orange outline
5. Press **Enter** on a focused card
6. **Expected**: Class details page opens

#### Test 3: Button Keyboard Access
1. Press **Tab** to navigate through all buttons
2. **Expected**: All buttons receive focus with orange outline
3. Press **Enter** or **Space** on focused buttons
4. **Expected**: Button actions execute correctly

#### Test 4: No Keyboard Traps
1. Navigate through entire page with **Tab**
2. **Expected**: Can reach all interactive elements
3. **Expected**: Can navigate backwards with **Shift+Tab**
4. **Expected**: No elements trap focus

---

### 🔊 Screen Reader Tests

#### Test 5: NVDA/VoiceOver Announcements
1. Enable screen reader (NVDA on Windows, VoiceOver on Mac)
2. Load the dashboard page
3. **Expected**: Hears "Teacher Dashboard" and page structure
4. Navigate through metric cards
5. **Expected**: Hears metric name, value, and trend
6. Navigate through class cards
7. **Expected**: Hears class name, student count, attendance rate, next session

#### Test 6: Dynamic Content Announcements
1. Keep screen reader active
2. Click "Mark Attendance" button
3. **Expected**: Hears "Opening attendance marking interface"
4. Navigate to different sections
5. **Expected**: Hears appropriate announcements for each action

#### Test 7: ARIA Labels
1. Use screen reader to explore buttons
2. **Expected**: Each button announces its purpose
3. Example: "Quick action: Mark attendance for your classes"
4. Navigate through cards
5. **Expected**: Cards announce comprehensive information

---

### 🎨 Visual Accessibility Tests

#### Test 8: Focus Indicators
1. Navigate with keyboard
2. **Expected**: Orange outline (3px) visible on all focused elements
3. **Expected**: Outline has 2px offset for clarity
4. **Expected**: Outline has rounded corners

#### Test 9: Color Contrast
1. Use browser DevTools or contrast checker
2. Check all text against backgrounds
3. **Expected**: Normal text has 4.5:1 contrast minimum
4. **Expected**: Large text has 3:1 contrast minimum
5. **Expected**: Interactive elements have 3:1 contrast minimum

#### Test 10: Reduced Motion
1. Enable "Reduce Motion" in OS settings
   - **Windows**: Settings > Ease of Access > Display > Show animations
   - **macOS**: System Preferences > Accessibility > Display > Reduce motion
2. Reload the dashboard
3. **Expected**: Animations are disabled or minimal
4. **Expected**: Count-up animations show final value immediately
5. **Expected**: Transitions are instant

---

### 📱 Responsive Accessibility Tests

#### Test 11: Mobile Keyboard Navigation
1. Test on mobile device or emulator
2. Use external keyboard if available
3. **Expected**: All keyboard shortcuts work
4. **Expected**: Touch targets are at least 44px
5. **Expected**: Focus indicators are visible

#### Test 12: Tablet Navigation
1. Test on tablet device
2. Use keyboard navigation
3. **Expected**: Grid adjusts columns appropriately
4. **Expected**: Arrow key navigation works with new column count

---

### 🔍 Semantic HTML Tests

#### Test 13: Landmark Regions
1. Use screen reader landmark navigation
2. **Expected**: Can navigate to main content
3. **Expected**: Can navigate to regions (metrics, quick actions, classes)
4. **Expected**: Proper heading hierarchy (H1 > H2 > H3)

#### Test 14: ARIA Roles
1. Inspect elements with DevTools
2. **Expected**: Cards have role="article"
3. **Expected**: Grid has role="list"
4. **Expected**: Grid items have role="listitem"
5. **Expected**: Main content has role="main"

---

### 🧪 Automated Testing

#### Test 15: axe DevTools
1. Install axe DevTools browser extension
2. Run scan on dashboard page
3. **Expected**: No critical or serious issues
4. **Expected**: All WCAG AA criteria pass

#### Test 16: Lighthouse Audit
1. Open Chrome DevTools
2. Run Lighthouse audit (Accessibility category)
3. **Expected**: Score of 95+ out of 100
4. **Expected**: No accessibility errors

#### Test 17: WAVE Extension
1. Install WAVE browser extension
2. Run scan on dashboard page
3. **Expected**: No errors
4. **Expected**: Proper use of ARIA
5. **Expected**: Proper heading structure

---

## Test Results Template

### Test Session Information
- **Date**: _______________
- **Tester**: _______________
- **Browser**: _______________
- **Screen Reader**: _______________
- **OS**: _______________

### Results

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Skip Links | ⬜ Pass / ⬜ Fail | |
| 2 | Class Grid Navigation | ⬜ Pass / ⬜ Fail | |
| 3 | Button Keyboard Access | ⬜ Pass / ⬜ Fail | |
| 4 | No Keyboard Traps | ⬜ Pass / ⬜ Fail | |
| 5 | Screen Reader Announcements | ⬜ Pass / ⬜ Fail | |
| 6 | Dynamic Content | ⬜ Pass / ⬜ Fail | |
| 7 | ARIA Labels | ⬜ Pass / ⬜ Fail | |
| 8 | Focus Indicators | ⬜ Pass / ⬜ Fail | |
| 9 | Color Contrast | ⬜ Pass / ⬜ Fail | |
| 10 | Reduced Motion | ⬜ Pass / ⬜ Fail | |
| 11 | Mobile Keyboard | ⬜ Pass / ⬜ Fail | |
| 12 | Tablet Navigation | ⬜ Pass / ⬜ Fail | |
| 13 | Landmark Regions | ⬜ Pass / ⬜ Fail | |
| 14 | ARIA Roles | ⬜ Pass / ⬜ Fail | |
| 15 | axe DevTools | ⬜ Pass / ⬜ Fail | |
| 16 | Lighthouse | ⬜ Pass / ⬜ Fail | |
| 17 | WAVE Extension | ⬜ Pass / ⬜ Fail | |

### Overall Assessment
- **Total Tests**: 17
- **Passed**: ___
- **Failed**: ___
- **Pass Rate**: ___%

### Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Recommendations
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## Quick Reference: Keyboard Shortcuts

### Navigation
- **Tab**: Next element
- **Shift + Tab**: Previous element
- **Enter/Space**: Activate

### Class Grid
- **Arrow Keys**: Navigate cards
- **Home**: First in row
- **End**: Last in row
- **Page Up/Down**: Move 3 rows

### Skip Links
- **Tab** (from load): Show skip links
- **Enter**: Jump to section

---

## Common Issues and Solutions

### Issue: Focus not visible
**Solution**: Check CSS for `outline: none` - remove it

### Issue: Screen reader not announcing
**Solution**: Verify ARIA labels and live regions are present

### Issue: Keyboard trap
**Solution**: Check modal focus trap implementation

### Issue: Skip links not working
**Solution**: Verify target IDs match href values

### Issue: Reduced motion not working
**Solution**: Check CSS media query and JavaScript detection

---

## Resources

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Checklist](https://webaim.org/standards/wcag/checklist)
- [A11y Project](https://www.a11yproject.com/)

### Keyboard Testing
- [Keyboard Testing Guide](https://webaim.org/articles/keyboard/)
- [Focus Management](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)

---

**Last Updated**: [Current Date]
**Version**: 1.0.0
**Status**: ✅ Ready for Testing
