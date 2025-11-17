# Animation Components

This directory contains reusable animation wrapper components for the student dashboard.

## Components

### FadeIn.tsx
Smooth fade-in animation with subtle y-offset (10px)
- Duration: 400ms
- Easing: easeOut

### StaggerChildren.tsx
Staggered entrance animation for lists and grids
- Default delay: 80-100ms between children
- Customizable stagger delay

### CountUp.tsx
Number count-up animation
- Duration: 1.2s
- Supports decimal places and formatting

## Usage

```tsx
import { FadeIn, StaggerChildren, CountUp } from '@/components/animations';

<FadeIn>
  <Card>Content</Card>
</FadeIn>

<StaggerChildren>
  {items.map(item => <Item key={item.id} />)}
</StaggerChildren>

<CountUp end={85} duration={1200} />
```

## Performance

All animations use GPU-accelerated properties (transform, opacity) for smooth 60fps performance.
