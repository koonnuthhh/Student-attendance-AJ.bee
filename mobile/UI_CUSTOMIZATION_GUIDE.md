# 🎨 UI Customization Guide

This guide explains how to easily customize the app's appearance, including colors, dark mode, and component styling.

## 🌈 Quick Color Customization

### 1. Change Brand Colors

Edit `src/config/theme.ts` - look for the `EASY_CUSTOMIZATION` section:

```typescript
export const EASY_CUSTOMIZATION = {
  // Main brand color - change this to update your primary color everywhere
  PRIMARY_COLOR: 'rgb(130, 23, 25)', // Your current red color
  
  // Secondary color - change this to update your secondary color everywhere  
  SECONDARY_COLOR: '#FFFFFF', // Your current white color
  
  // Quick color overrides - uncomment and modify to customize specific colors
  // ATTENDANCE_PRESENT_COLOR: '#4CAF50',
  // ATTENDANCE_ABSENT_COLOR: '#F44336',
  // SUCCESS_COLOR: '#4CAF50',
  // ERROR_COLOR: '#F44336',
} as const;
```

### 2. Customize Attendance Status Colors

In the same file, uncomment and modify:

```typescript
// ATTENDANCE_PRESENT_COLOR: '#4CAF50',  // Green for present
// ATTENDANCE_ABSENT_COLOR: '#F44336',   // Red for absent  
// ATTENDANCE_LATE_COLOR: '#FF9800',     // Orange for late
```

## 🌓 Dark Mode

Dark mode is automatically supported! Users can toggle it in Settings screen.

### Customize Dark Mode Colors

Edit the `darkColors` object in `theme.ts`:

```typescript
const darkColors = {
  background: '#121212',     // Dark background
  surface: '#1E1E1E',        // Card backgrounds
  text: '#FFFFFF',           // Primary text
  // ... modify other colors as needed
}
```

## 🧩 Component Customization

### Button Variants

The Button component supports multiple variants:

```tsx
<Button title="Primary" variant="primary" />
<Button title="Secondary" variant="secondary" />
<Button title="Outline" variant="outline" />
<Button title="Ghost" variant="ghost" />
<Button title="Danger" variant="danger" />
```

### Card Variants

```tsx
<Card variant="elevated" />  // With shadow
<Card variant="outlined" />  // With border
<Card variant="flat" />      // No shadow/border
```

## 🎯 Advanced Customization

### Typography

Modify font sizes and weights:

```typescript
const typography = {
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,     // Base font size
    md: 16,
    lg: 18,
    // ... add more sizes
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
}
```

### Spacing

Adjust spacing throughout the app:

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,     // Base spacing
  lg: 20,
  xl: 24,
  // ... add more spacing
}
```

### Border Radius

Control rounded corners:

```typescript
const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,        // Default border radius
  lg: 12,
  xl: 16,
  full: 9999,   // Fully rounded
}
```

## 🔧 Using Theme in Components

### With Theme Hook

```tsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      <Text style={{ color: theme.colors.text }}>
        Current mode: {isDark ? 'Dark' : 'Light'}
      </Text>
      <Button title="Toggle Theme" onPress={toggleTheme} />
    </View>
  );
};
```

### With Themed Styles Hook

```tsx
import { useThemedStyles } from '../contexts/ThemeContext';

const MyComponent = () => {
  const styles = useThemedStyles(createStyles);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World</Text>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.base,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg,
  },
});
```

## 🎨 Theme Structure

```typescript
theme = {
  colors: {
    // Primary colors
    primary: 'rgb(130, 23, 25)',
    secondary: '#FFFFFF',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    
    // UI colors
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    border: '#E5E5E5',
    // ... more colors
  },
  typography: { /* font sizes, weights */ },
  spacing: { /* spacing values */ },
  borderRadius: { /* border radius values */ },
  shadows: { /* shadow configurations */ },
  components: { /* component-specific sizing */ },
  animation: { /* animation durations */ },
  layout: { /* layout constants */ },
  isDark: false, // true for dark theme
}
```

## 🚀 Quick Start Tips

1. **Change brand color**: Modify `PRIMARY_COLOR` in `EASY_CUSTOMIZATION`
2. **Test dark mode**: Use Settings screen or call `toggleTheme()`
3. **Customize attendance colors**: Uncomment color overrides in `EASY_CUSTOMIZATION`
4. **Add new variants**: Extend component variant types and styling
5. **Use theme everywhere**: Import `useTheme()` hook in all components

## 📱 Platform Considerations

- Colors automatically work on both iOS and Android
- Dark mode respects system preferences (can be enhanced)
- StatusBar automatically updates based on theme
- Navigation header colors are themed

## 🔍 Debugging Tips

- Use the Settings screen preview to see color changes
- Check console for theme-related errors
- Restart app after major theme changes
- Use React DevTools to inspect theme values

Need help? Check the Settings screen for a live theme preview!