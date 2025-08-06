# Dark Mode Theme Implementation

## Overview
This medical platform now includes a comprehensive dark mode theme system. Users can toggle between light and dark modes using the moon/sun icon in the header.

## How It Works

### Theme Context
- `ThemeContext` manages the global theme state
- Persists user preference in localStorage
- Defaults to system preference on first visit
- Provides `toggleTheme()` function for switching modes

### CSS Variables
The theme system uses CSS custom properties (variables) for consistent theming:

#### Light Theme Colors
```css
--bg-primary: #ffffff        /* Main backgrounds */
--bg-secondary: #f8f9fa      /* Page backgrounds */
--bg-tertiary: #f1f5f9       /* Secondary elements */
--text-primary: #1f2937      /* Main text */
--text-secondary: #6b7280    /* Secondary text */
--accent-primary: #3b82f6    /* Primary buttons/links */
```

#### Dark Theme Colors
```css
--bg-primary: #1f2937        /* Main backgrounds */
--bg-secondary: #111827      /* Page backgrounds */
--bg-tertiary: #374151       /* Secondary elements */
--text-primary: #f9fafb      /* Main text */
--text-secondary: #d1d5db    /* Secondary text */
--accent-primary: #60a5fa    /* Primary buttons/links */
```

## Usage Guidelines

### 1. Use CSS Variables Instead of Hard-coded Colors
❌ **Don't do this:**
```css
.my-component {
    background: #ffffff;
    color: #1f2937;
    border: 1px solid #e5e7eb;
}
```

✅ **Do this:**
```css
.my-component {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
    transition: all 0.3s ease; /* Smooth theme transitions */
}
```

### 2. Available CSS Variables

#### Backgrounds
- `--bg-primary` - Cards, modals, main containers
- `--bg-secondary` - Page backgrounds, app background
- `--bg-tertiary` - Hover states, secondary containers
- `--bg-accent` - Subtle highlights

#### Text Colors
- `--text-primary` - Main headings and important text
- `--text-secondary` - Body text, descriptions
- `--text-tertiary` - Placeholders, disabled text
- `--text-inverse` - Text on colored backgrounds

#### Borders
- `--border-primary` - Main borders, dividers
- `--border-secondary` - Input borders, subtle dividers
- `--border-accent` - Highlighted borders

#### Shadows
- `--shadow-sm` - Small shadows for cards
- `--shadow-md` - Medium shadows for hover states
- `--shadow-lg` - Large shadows for modals

#### Status Colors
- `--success-bg`, `--success-border`, `--success-text`
- `--error-bg`, `--error-border`, `--error-text`
- `--warning-bg`, `--warning-border`, `--warning-text`
- `--info-bg`, `--info-border`, `--info-text`

### 3. Theme Utilities
Use the utility classes from `theme.css`:

```jsx
<div className="bg-primary text-primary border-primary">
    <button className="btn-theme-primary">Primary Button</button>
    <input className="input-theme" placeholder="Themed input" />
</div>
```

### 4. React Components
Access theme state in components:

```jsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
    const { isDarkMode, toggleTheme, theme } = useTheme();
    
    return (
        <div className={`my-component ${theme}`}>
            <button onClick={toggleTheme}>
                {isDarkMode ? '☀️' : '🌙'} Toggle Theme
            </button>
        </div>
    );
}
```

## Implementation Status

### ✅ Completed
- [x] Theme context and provider
- [x] CSS variable system
- [x] Header with theme toggle
- [x] Main app layouts (App.css)
- [x] Dashboard theming
- [x] Login page theming
- [x] Theme utility classes

### 🔄 In Progress
- [ ] All component CSS files updated
- [ ] Modal components theming
- [ ] Table components theming
- [ ] Form components theming

### 📋 To Do
- [ ] Patient management pages
- [ ] Report details pages
- [ ] X-ray analysis pages
- [ ] File upload components
- [ ] Chart/graph components

## Best Practices

1. **Always include transitions** for smooth theme switching:
   ```css
   transition: background-color 0.3s ease, color 0.3s ease;
   ```

2. **Test both themes** when styling new components

3. **Use semantic variable names** instead of color-specific names

4. **Maintain contrast ratios** for accessibility in both themes

5. **Update components incrementally** - the theme system works with mixed implementation

## Browser Support
- Modern browsers with CSS custom properties support
- Graceful fallback to light theme on older browsers
- Automatic system preference detection where supported

## Performance
- Theme switching is instant (CSS variables change immediately)
- Preferences are persisted in localStorage
- Minimal JavaScript overhead
- CSS transitions provide smooth visual feedback
