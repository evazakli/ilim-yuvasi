import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

export interface ThemeColors {
  primary: string;
  button: string;
  buttonHover: string;
  secondaryButton: string;
  secondaryButtonHover: string;
  resetButton: string;
  resetHover: string;
  textAccent: string;
}

export const THEMES: Record<string, ThemeColors> = {
  "Varsayılan": {
    primary: "#1E1E2E",
    button: "#0A84FF",
    buttonHover: "#0062D1",
    secondaryButton: "#313244",
    secondaryButtonHover: "#45475A",
    resetButton: "#F38BA8",
    resetHover: "#D65D7A",
    textAccent: "#89B4FA",
  },
  "Mavi": {
    primary: "#0F172A",
    button: "#2980B9",
    buttonHover: "#1F618D",
    secondaryButton: "#1B2631",
    secondaryButtonHover: "#212F3D",
    resetButton: "#E74C3C",
    resetHover: "#C0392B",
    textAccent: "#5DADE2",
  },
  "Yeşil": {
    primary: "#14271A",
    button: "#27AE60",
    buttonHover: "#1E8449",
    secondaryButton: "#1E3524",
    secondaryButtonHover: "#264731",
    resetButton: "#D35400",
    resetHover: "#A04000",
    textAccent: "#82E0AA",
  },
  "Kırmızı": {
    primary: "#2C1111",
    button: "#C0392B",
    buttonHover: "#922B21",
    secondaryButton: "#3D1A1A",
    secondaryButtonHover: "#502323",
    resetButton: "#7F8C8D",
    resetHover: "#616A6B",
    textAccent: "#E6B0AA",
  },
  "Mor": {
    primary: "#1E112A",
    button: "#8E44AD",
    buttonHover: "#6C3483",
    secondaryButton: "#2C1A3D",
    secondaryButtonHover: "#3A2350",
    resetButton: "#E74C3C",
    resetHover: "#C0392B",
    textAccent: "#D7BDE2",
  },
};

interface ThemeContextType {
  activeThemeName: string;
  theme: ThemeColors;
  setThemeName: (name: string) => void;
  availableThemeNames: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeThemeName, setActiveThemeName] = useState<string>(() => {
    return storageService.loadSettings().theme || "Varsayılan";
  });

  const theme = THEMES[activeThemeName] || THEMES["Varsayılan"];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-bg-primary', theme.primary);
    root.style.setProperty('--color-btn-primary', theme.button);
    root.style.setProperty('--color-btn-hover', theme.buttonHover);
    root.style.setProperty('--color-btn-secondary', theme.secondaryButton);
    root.style.setProperty('--color-btn-secondary-hover', theme.secondaryButtonHover);
    root.style.setProperty('--color-btn-reset', theme.resetButton);
    root.style.setProperty('--color-btn-reset-hover', theme.resetHover);
    root.style.setProperty('--color-text-accent', theme.textAccent);

    const currentSettings = storageService.loadSettings();
    storageService.saveSettings({ ...currentSettings, theme: activeThemeName });
  }, [activeThemeName, theme]);

  const setThemeName = (name: string) => {
    if (THEMES[name]) {
      setActiveThemeName(name);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        activeThemeName,
        theme,
        setThemeName,
        availableThemeNames: Object.keys(THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
