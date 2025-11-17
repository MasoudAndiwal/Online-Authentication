# 🎨 Sick/Leave Cell Styling Update

## ✅ **Updated Styling Applied**

### **Changes Made:**
- **Background Color**: Changed from colored backgrounds to **white** (`#FFFFFF`)
- **Font Size**: Increased from **12** to **36**
- **Font Weight**: Remains **bold**
- **Alignment**: Remains **center** (horizontal and vertical)

### **Before:**
```typescript
firstCell.font = { bold: true, size: 12 };
firstCell.fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: dayStatus === 'SICK' ? 'FFFFEAA7' : 'FFE17055' } // Yellow/Orange
};
```

### **After:**
```typescript
firstCell.font = { bold: true, size: 36 };
firstCell.fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFFFFF' } // White background
};
```

## 🎯 **Visual Result:**

### **مریض (Sick) Cells:**
- ✅ **White background** instead of light yellow
- ✅ **Large font size 36** instead of 12
- ✅ **Bold text** maintained
- ✅ **Centered alignment** maintained
- ✅ **Merged 6 cells** per day maintained

### **رخصت (Leave) Cells:**
- ✅ **White background** instead of light orange
- ✅ **Large font size 36** instead of 12
- ✅ **Bold text** maintained
- ✅ **Centered alignment** maintained
- ✅ **Merged 6 cells** per day maintained

## 📊 **Expected Appearance:**

```
Before: [مریض] (small text, colored background)
After:  [مریض] (large text, white background)
```

The sick/leave status will now be much more prominent with the larger font size while maintaining a clean white background that matches the rest of the report.

## ✅ **Ready for Testing**

The styling update is complete and ready for testing:
- ✅ White background for both sick and leave cells
- ✅ Font size 36 for better visibility
- ✅ All other functionality preserved
- ✅ No TypeScript errors
- ✅ Proper cell merging maintained