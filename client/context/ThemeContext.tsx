import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeMode;
    colorScheme: 'light' | 'dark';
    setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const deviceColorScheme = useDeviceColorScheme() ?? 'light';
    const [theme, setThemeState] = useState<ThemeMode>('system');

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem('user-theme');
            if (savedTheme) {
                setThemeState(savedTheme as ThemeMode);
            }
        };
        loadTheme();
    }, []);

    const setTheme = async (newTheme: ThemeMode) => {
        setThemeState(newTheme);
        await AsyncStorage.setItem('user-theme', newTheme);
    };

    const colorScheme = theme === 'system' ? deviceColorScheme : theme;

    return (
        <ThemeContext.Provider value={{ theme, colorScheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
