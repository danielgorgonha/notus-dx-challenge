# Cursor AI Prompt: Notus DX Challenge - Web3 Wallet Dashboard

## Project Overview
Create a modern Web3 wallet dashboard for testing Notus Labs API. This is a 10-day developer experience challenge project that needs to look professional and production-ready.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Privy SDK (@privy-io/react-auth) for Web3 authentication
- Notus API integration

## Visual Identity Requirements

### Color Palette
```css
:root {
  --notus-blue: #0066FF;
  --notus-dark: #0A0A0F;
  --notus-gray: #1A1A1F;
  --accent-green: #00D9A0;
  --accent-purple: #8B5CF6;
  --accent-red: #FF4757;
  --accent-yellow: #FFC107;
}
```

### Typography
- Primary font: Inter (Google Fonts)
- Font weights: 300, 400, 500, 600, 700
- Hierarchy: 48px (h1), 32px (h2), 24px (h3), 16px (body), 14px (small)

### Layout Structure
**Sidebar Navigation (280px fixed width):**
- Logo with icon at top
- Navigation items: Dashboard, Smart Wallet, Swap & Transfer, Liquidity Pools, History
- Active state with blue background and border
- User connection status at bottom

**Main Content Area:**
- Header with title, description, and Connect Wallet button
- Grid layouts: 3-column for stats, 2-column for main sections
- Responsive: collapses to single column on mobile

### Component Design Patterns

#### Glass Effect Cards
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 102, 255, 0.2);
}
```

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, #0066FF, #00D9A0);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 102, 255, 0.3);
}
```

### Key Components to Implement

1. **Sidebar Navigation**
   - Fixed position, glass background
   - Icons with labels for each section
   - Active/hover states
   - User wallet status indicator

2. **Dashboard Stats Cards**
   - Total Balance, 24h Volume, Active Pools
   - Large numbers with percentage changes
   - Colored icons for each metric
   - Hover animations

3. **Portfolio Section**
   - Token list with icons, names, amounts
   - USD values and percentage changes
   - Green/red colors for gains/losses

4. **Quick Actions Grid**
   - 2x2 grid of action buttons
   - Icons: Swap, Send, Pool, KYC
   - Hover effects with scale transform
   - Colored backgrounds matching action type

5. **Transaction History**
   - List of recent transactions
   - Icons, descriptions, timestamps
   - Values and status indicators

### Animations & Interactions
- Smooth transitions (0.3s ease)
- Hover effects on all interactive elements
- Loading states with subtle animations
- Scale transforms on button hover
- Card elevation on hover

### Responsive Design
- Sidebar collapses to hamburger menu on mobile
- Grid layouts adapt: 3→2→1 columns
- Touch-friendly button sizes (44px minimum)
- Proper spacing and typography scaling

## Implementation Instructions

1. **Setup**
   - Create Next.js 14 project with TypeScript
   - Install Tailwind CSS and configure custom colors
   - Add Inter font from Google Fonts
   - Setup component structure in /components directory

2. **Core Components**
   ```
   /components
     /ui
       - Button.tsx
       - Card.tsx
       - Sidebar.tsx
     /dashboard
       - StatsCard.tsx
       - Portfolio.tsx
       - QuickActions.tsx
       - TransactionHistory.tsx
   ```

3. **Styling Approach**
   - Use Tailwind for base styles
   - Custom CSS for glass effects and complex animations
   - CSS modules or styled-components for component-specific styles

4. **Key Features to Focus On**
   - Professional, modern appearance
   - Smooth animations and interactions
   - Clear visual hierarchy
   - Accessibility (proper contrast, keyboard navigation)
   - Production-ready code quality

## Success Metrics
- Visually impressive dashboard that looks like a production DeFi app
- Smooth performance with 60fps animations
- Clean, maintainable component architecture
- Mobile-responsive design
- Professional presentation suitable for developer portfolio

## Notes
- This project is for a developer experience research program
- Focus on clean, modern design that impresses technical evaluators
- Prioritize user experience and visual polish
- Code should be well-structured and commented for easy review