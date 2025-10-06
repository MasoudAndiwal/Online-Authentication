# Select Component Testing Guide

## Quick Test Commands

```powershell
# Clean build cache
Remove-Item -Recurse -Force .next

# Start dev server
npm run dev
```

## Manual Testing Steps

### 1. Add Student Page (`/user-management/add-student`)

#### Step 3: Academic Details
1. **Program/Major Select**
   - Click the select field
   - Verify dropdown appears with styled options
   - Select "computer science"
   - Verify it displays in the trigger
   - Verify green focus ring appears

2. **Class Name Select**
   - Click the select field
   - Verify dropdown appears
   - Select "class A"
   - Verify selection displays correctly

3. **Time Slot Select**
   - Click the select field
   - Verify dropdown shows both options with descriptions
   - Select "Morning (8:30 AM - 12:30 PM)"
   - Verify selection displays correctly
   - Verify description text appears below

#### Expected Behavior
- ✅ Dropdown appears as a styled portal (not plain text)
- ✅ Options have hover states
- ✅ Selected option shows check icon
- ✅ Smooth animations
- ✅ Green focus ring on focus
- ✅ Proper spacing and typography

### 2. Teachers List Page (`/user-management/teachers`)

#### Filter Section
1. **Department Filter**
   - Click "Department" select
   - Verify "All Departments" + department list appears
   - Select a department
   - Verify filter applies to teacher list

2. **Subject Filter**
   - Click "Subject" select
   - Verify subject list appears
   - Select a subject
   - Verify filter applies

3. **Status Filter**
   - Click "Status" select
   - Verify "Active" and "Inactive" options appear
   - Select a status
   - Verify filter applies

#### Expected Behavior
- ✅ All three selects work independently
- ✅ Orange focus ring (not green)
- ✅ Filter icon visible on left side
- ✅ Active filters display below
- ✅ Teacher cards filter correctly

## Visual Checklist

### Trigger Button Should Have:
- [ ] White background
- [ ] Slate-200 border
- [ ] Rounded corners (rounded-lg)
- [ ] 48px height
- [ ] ChevronDown icon on right
- [ ] Proper padding (px-3 py-2)

### Dropdown Should Have:
- [ ] White background
- [ ] Shadow (shadow-md)
- [ ] Rounded corners
- [ ] Appears above other content (z-50)
- [ ] Smooth fade-in animation
- [ ] Scroll if many options

### Options Should Have:
- [ ] Hover state (accent background)
- [ ] Check icon when selected
- [ ] Proper text alignment
- [ ] Adequate padding
- [ ] Cursor pointer

### Focus State Should Have:
- [ ] Colored border (green or orange)
- [ ] Colored ring glow
- [ ] Smooth transition

## Keyboard Testing

1. **Tab Navigation**
   - Press Tab to focus select
   - Verify focus ring appears
   - Press Tab again to move to next field

2. **Dropdown Navigation**
   - Focus select and press Enter/Space
   - Use Arrow Up/Down to navigate options
   - Press Enter to select
   - Press Escape to close without selecting

3. **Expected Behavior**
   - [ ] Tab focuses the select
   - [ ] Enter/Space opens dropdown
   - [ ] Arrow keys navigate options
   - [ ] Enter selects option
   - [ ] Escape closes dropdown

## Mobile Testing (if available)

1. **Touch Interaction**
   - Tap select to open
   - Scroll through options
   - Tap option to select
   - Verify dropdown closes

2. **Expected Behavior**
   - [ ] Dropdown opens on tap
   - [ ] Options are touch-friendly (48px min)
   - [ ] Smooth scrolling
   - [ ] No accidental selections

## Error State Testing

### Add Student Page
1. Try to submit form without selecting required fields
2. Verify red border appears on empty selects
3. Verify error message displays below
4. Select an option
5. Verify error clears

## Common Issues & Solutions

### Issue: Dropdown doesn't appear
**Solution**: Check browser console for errors. Ensure @radix-ui/react-select is installed.

### Issue: Dropdown appears but no styling
**Solution**: Verify CustomSelect is imported, not Select.

### Issue: Options show as plain text
**Solution**: This was the original problem. Verify you're using CustomSelect component.

### Issue: Can't select options
**Solution**: Check onValueChange is properly connected to state setter.

### Issue: Z-index problems
**Solution**: SelectContent uses Portal, should appear above everything. Check for conflicting z-index values.

## Success Criteria

✅ All selects render with proper shadcn styling
✅ Dropdowns appear as portals with animations
✅ Options are selectable and display correctly
✅ Focus states work properly
✅ Keyboard navigation works
✅ Form validation works with selects
✅ No console errors
✅ Mobile-friendly (if testing on mobile)

## If Issues Persist

1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console for errors
4. Verify @radix-ui/react-select is installed:
   ```powershell
   npm list @radix-ui/react-select
   ```
5. Reinstall if needed:
   ```powershell
   npm install @radix-ui/react-select
   ```
