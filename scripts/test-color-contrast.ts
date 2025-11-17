/**
 * Color Contrast Testing Script
 * Run this script to validate all color combinations in the dashboard
 * 
 * Usage: npx tsx scripts/test-color-contrast.ts
 */

import { validateDashboardColors } from '../lib/accessibility/color-contrast';

console.log('\n🎨 Student Dashboard Color Contrast Report\n');
console.log('=' .repeat(80));
console.log('\nWCAG 2.1 Level AA Requirements:');
console.log('  - Normal text: 4.5:1 minimum');
console.log('  - Large text (18pt+ or 14pt+ bold): 3:1 minimum\n');
console.log('=' .repeat(80));
console.log('\n');

const results = validateDashboardColors();

// Group results by status
const passing = results.filter(r => r.meetsAA);
const failing = results.filter(r => !r.meetsAA);

// Display passing combinations
console.log(`✅ Passing Combinations (${passing.length}/${results.length}):\n`);
passing.forEach((result) => {
  const level = result.meetsAAA ? 'AAA' : 'AA';
  console.log(`  ${result.status} ${result.name}`);
  console.log(`     Ratio: ${result.ratio}:1 (${level})`);
  console.log(`     FG: ${result.fg} | BG: ${result.bg}`);
  console.log('');
});

// Display failing combinations
if (failing.length > 0) {
  console.log(`\n❌ Failing Combinations (${failing.length}/${results.length}):\n`);
  failing.forEach((result) => {
    console.log(`  ${result.status} ${result.name}`);
    console.log(`     Ratio: ${result.ratio}:1 (Required: ${result.isLarge ? '3.0' : '4.5'}:1)`);
    console.log(`     FG: ${result.fg} | BG: ${result.bg}`);
    console.log(`     ⚠️  ${result.isLarge ? 'Use for large text only' : 'Needs adjustment'}`);
    console.log('');
  });
}

// Summary
console.log('=' .repeat(80));
console.log('\n📊 Summary:\n');
console.log(`  Total combinations tested: ${results.length}`);
console.log(`  Passing WCAG AA: ${passing.length} (${Math.round((passing.length / results.length) * 100)}%)`);
console.log(`  Failing WCAG AA: ${failing.length} (${Math.round((failing.length / results.length) * 100)}%)`);
console.log(`  Passing WCAG AAA: ${results.filter(r => r.meetsAAA).length}`);

if (failing.length === 0) {
  console.log('\n✨ All color combinations meet WCAG 2.1 Level AA standards!\n');
} else {
  console.log('\n⚠️  Some color combinations need adjustment.\n');
  console.log('Recommendations:');
  console.log('  1. Use failing combinations only for large text (18pt+ or 14pt+ bold)');
  console.log('  2. Adjust foreground or background colors to increase contrast');
  console.log('  3. Consider using alternative color combinations\n');
}

console.log('=' .repeat(80));
console.log('\n');
