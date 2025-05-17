import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/preact';
import { useTheme, Theme } from './useTheme';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

const setAttributeSpy = vi.fn();

describe('useTheme', () => {
  let originalLocalStorage: Storage;

  beforeEach(() => {
    originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();

    vi.spyOn(document.documentElement, 'setAttribute').mockImplementation(
      setAttributeSpy
    );

    setAttributeSpy.mockClear();
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });

    vi.restoreAllMocks();
  });

  it('should initialize with defaultTheme if localStorage is empty', () => {
    const { result } = renderHook(() => useTheme('dark'));

    expect(result.current[0]).toBe('dark');
    expect(localStorageMock.getItem('theme')).toBe('dark');
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('should initialize with light theme by default if no defaultTheme prop and localStorage is empty', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current[0]).toBe('light');
    expect(localStorageMock.getItem('theme')).toBe('light');
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'light');
  });

  it('should initialize with theme from localStorage if present', () => {
    localStorageMock.setItem('theme', 'dark');

    const { result } = renderHook(() => useTheme('light'));
    expect(result.current[0]).toBe('dark');
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('should initialize with defaultTheme if localStorage has an invalid theme value', () => {
    localStorageMock.setItem('theme', 'funky');
    const { result } = renderHook(() => useTheme('light'));

    expect(result.current[0]).toBe('funky' as Theme);
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'funky');
  });

  describe('toggleTheme', () => {
    it('should update document attribute and localStorage on theme change', () => {
      const { result } = renderHook(() => useTheme());
      setAttributeSpy.mockClear();
      localStorageMock.clear();

      act(() => {
        result.current[1]();
      });

      expect(result.current[0]).toBe('dark');
      expect(localStorageMock.getItem('theme')).toBe('dark');
      expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');
      expect(setAttributeSpy).toHaveBeenCalledTimes(1);

      setAttributeSpy.mockClear();
      localStorageMock.clear();

      act(() => {
        result.current[1]();
      });

      expect(result.current[0]).toBe('light');
      expect(localStorageMock.getItem('theme')).toBe('light');
      expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'light');
      expect(setAttributeSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should apply default theme to document and localStorage on initial render', () => {
    renderHook(() => useTheme('dark'));
    expect(localStorageMock.getItem('theme')).toBe('dark');
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');
    expect(setAttributeSpy).toHaveBeenCalledTimes(1);
  });
});
