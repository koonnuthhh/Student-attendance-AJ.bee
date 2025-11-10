/**
 * Theme Context for Dark Mode Support
 * 
 * This context manages the theme state (light/dark mode) throughout the app.
 * Provides easy theme switching and persistence.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';
import { lightTheme, darkTheme, Theme } from '../config/theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  // Load saved theme preference on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    saveThemePreference(isDark);
  }, [isDark]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@attendance_theme');
      if (savedTheme !== null) {
        setIsDark(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (darkMode: boolean) => {
    try {
      await AsyncStorage.setItem('@attendance_theme', JSON.stringify(darkMode));
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const setDarkMode = (darkMode: boolean) => {
    setIsDark(darkMode);
  };

  const theme = isDark ? darkTheme : lightTheme;

  const value = {
    theme,
    isDark,
    toggleTheme,
    setDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.surface} 
      />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper hook for easy styling with current theme
export const useThemedStyles = <T extends Record<string, any>>(
  createStyles: (theme: Theme) => T
): T => {
  const { theme } = useTheme();
  return createStyles(theme);
};

export default ThemeContext;