import { useState, useEffect, useCallback } from 'react';

const API_KEY = 'AIzaSyDnXLyp1b_lEDQJz7A4DUW3S-ZtYT1MGOk';
const FONTS_API_URL = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`;

export interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  category: string;
}

interface GoogleFontsResponse {
  items: GoogleFont[];
}

interface UseGoogleFontsReturn {
  fonts: GoogleFont[];
  isLoading: boolean;
  error: string | null;
  loadFont: (fontFamily: string, variant?: string) => void;
  loadedFonts: Set<string>;
}

// Cache fonts globally to avoid refetching
let cachedFonts: GoogleFont[] | null = null;
const loadedFontsSet = new Set<string>();

export function useGoogleFonts(): UseGoogleFontsReturn {
  const [fonts, setFonts] = useState<GoogleFont[]>(cachedFonts || []);
  const [isLoading, setIsLoading] = useState(!cachedFonts);
  const [error, setError] = useState<string | null>(null);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(loadedFontsSet);

  useEffect(() => {
    if (cachedFonts) {
      setFonts(cachedFonts);
      setIsLoading(false);
      return;
    }

    const fetchFonts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(FONTS_API_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch fonts: ${response.statusText}`);
        }

        const data: GoogleFontsResponse = await response.json();
        cachedFonts = data.items;
        setFonts(data.items);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load fonts');
        console.error('Error fetching Google Fonts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFonts();
  }, []);

  const loadFont = useCallback((fontFamily: string, _variant: string = 'regular') => {
    if (loadedFontsSet.has(fontFamily)) return;

    // Create a link element to load the font
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    loadedFontsSet.add(fontFamily);
    setLoadedFonts(new Set(loadedFontsSet));
  }, []);

  return {
    fonts,
    isLoading,
    error,
    loadFont,
    loadedFonts,
  };
}

// Group fonts by category for better organization
export function groupFontsByCategory(fonts: GoogleFont[]): Record<string, GoogleFont[]> {
  return fonts.reduce((acc, font) => {
    const category = font.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(font);
    return acc;
  }, {} as Record<string, GoogleFont[]>);
}

// Get display name for category
export function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    'serif': 'Serif',
    'sans-serif': 'Sans Serif',
    'display': 'Display',
    'handwriting': 'Handwriting',
    'monospace': 'Monospace',
  };
  return names[category] || category;
}
