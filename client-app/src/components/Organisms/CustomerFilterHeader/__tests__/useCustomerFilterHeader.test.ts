import {renderHook} from '@testing-library/react-native';
import {Animated} from 'react-native';
import {useCustomerFilterHeader} from '../useCustomerFilterHeader';

// Mock React Native Animated
jest.mock('react-native', () => ({
  Animated: {
    Value: jest.fn().mockImplementation((value) => ({
      _value: value,
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      extractOffset: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      stopAnimation: jest.fn(),
      resetAnimation: jest.fn(),
    })),
    timing: jest.fn().mockImplementation(() => ({
      start: jest.fn(),
    })),
    parallel: jest.fn().mockImplementation((animations) => ({
      start: jest.fn(),
    })),
  },
}));

describe('useCustomerFilterHeader', () => {
  const mockAnimatedValue = (initialValue: number) => ({
    _value: initialValue,
    setValue: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    extractOffset: jest.fn(),
    setOffset: jest.fn(),
    flattenOffset: jest.fn(),
    stopAnimation: jest.fn(),
    resetAnimation: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset Animated.Value mock to return fresh instances
    (Animated.Value as jest.Mock).mockImplementation((value) => mockAnimatedValue(value));
  });

  describe('Initial State', () => {
    it('initializes with correct default animation values when not searching', () => {
      const {result} = renderHook(() =>
        useCustomerFilterHeader({isSearching: false})
      );

      expect((result.current.filterOpacity as any)._value).toBe(1);
      expect((result.current.searchOpacity as any)._value).toBe(0);
      expect((result.current.filterTranslateX as any)._value).toBe(0);
      expect((result.current.searchTranslateX as any)._value).toBe(100);
      expect((result.current.filterScale as any)._value).toBe(1);
      expect((result.current.searchScale as any)._value).toBe(0.8);
    });

    it('initializes with correct default animation values when searching', () => {
      const {result} = renderHook(() =>
        useCustomerFilterHeader({isSearching: true})
      );

      expect((result.current.filterOpacity as any)._value).toBe(1);
      expect((result.current.searchOpacity as any)._value).toBe(0);
      expect((result.current.filterTranslateX as any)._value).toBe(0);
      expect((result.current.searchTranslateX as any)._value).toBe(100);
      expect((result.current.filterScale as any)._value).toBe(1);
      expect((result.current.searchScale as any)._value).toBe(0.8);
    });
  });

  describe('Animation Triggers', () => {
    it('triggers search animation when isSearching changes to true', () => {
      const {rerender} = renderHook(
        (props) => useCustomerFilterHeader(props),
        {
          initialProps: {isSearching: false},
        }
      );

      // Clear initial animation calls
      jest.clearAllMocks();

      // Change to searching state
      rerender({isSearching: true});

      expect(Animated.timing).toHaveBeenCalled();
      expect(Animated.parallel).toHaveBeenCalled();
    });

    it('triggers filter animation when isSearching changes to false', () => {
      const {rerender} = renderHook(
        (props) => useCustomerFilterHeader(props),
        {
          initialProps: {isSearching: true},
        }
      );

      // Clear initial animation calls
      jest.clearAllMocks();

      // Change to non-searching state
      rerender({isSearching: false});

      expect(Animated.timing).toHaveBeenCalled();
      expect(Animated.parallel).toHaveBeenCalled();
    });
  });

  describe('Search Animation (isSearching: true)', () => {
    it('configures correct filter animation values when switching to search mode', () => {
      const {rerender} = renderHook(
        (props) => useCustomerFilterHeader(props),
        {
          initialProps: {isSearching: false},
        }
      );

      // Clear initial calls
      jest.clearAllMocks();

      // Switch to search mode
      rerender({isSearching: true});

      // Verify Animated.timing was called with correct parameters for filter elements
      expect(Animated.timing).toHaveBeenCalledWith(
        expect.objectContaining({_value: 1}), // filterOpacity
        expect.objectContaining({
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      );

      expect(Animated.timing).toHaveBeenCalledWith(
        expect.objectContaining({_value: 0}), // filterTranslateX
        expect.objectContaining({
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        })
      );

      expect(Animated.timing).toHaveBeenCalledWith(
        expect.objectContaining({_value: 1}), // filterScale
        expect.objectContaining({
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        })
      );
    });

    it('configures correct search animation values when switching to search mode', () => {
      const {rerender} = renderHook(
        (props) => useCustomerFilterHeader(props),
        {
          initialProps: {isSearching: false},
        }
      );

      // Clear initial calls
      jest.clearAllMocks();

      // Switch to search mode
      rerender({isSearching: true});

      // Verify Animated.timing was called with correct parameters for search elements
      expect(Animated.timing).toHaveBeenCalledWith(
        expect.objectContaining({_value: 0}), // searchOpacity
        expect.objectContaining({
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      );

      expect(Animated.timing).toHaveBeenCalledWith(
        expect.objectContaining({_value: 100}), // searchTranslateX
        expect.objectContaining({
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      );

      expect(Animated.timing).toHaveBeenCalledWith(
        expect.objectContaining({_value: 0.8}), // searchScale
        expect.objectContaining({
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      );
    });
  });

  describe('Filter Animation (isSearching: false)', () => {
    it('configures correct search hide animation values when switching to filter mode', () => {
      const {rerender} = renderHook(
        (props) => useCustomerFilterHeader(props),
        {
          initialProps: {isSearching: true},
        }
      );

      // Clear initial calls
      jest.clearAllMocks();

      // Switch to filter mode
      rerender({isSearching: false});

      // Verify Animated.timing was called with correct parameters for hiding search elements
      expect(Animated.timing).toHaveBeenCalledWith(
        expect.objectContaining({_value: 0}), // searchOpacity
        expect.objectContaining({
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      );

      expect(Animated.timing).toHaveBeenCalledWith(
        expect.objectContaining({_value: 100}), // searchTranslateX
        expect.objectContaining({
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        })
      );

      expect(Animated.timing).toHaveBeenCalledWith(
        expect.objectContaining({_value: 0.8}), // searchScale
        expect.objectContaining({
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        })
      );
    });

    it('configures correct filter show animation values when switching to filter mode', () => {
      const {rerender} = renderHook(
        (props) => useCustomerFilterHeader(props),
        {
          initialProps: {isSearching: true},
        }
      );

      // Clear initial calls
      jest.clearAllMocks();

      // Switch to filter mode
      rerender({isSearching: false});

      // Verify Animated.timing was called with correct parameters for showing filter elements
      expect(Animated.timing).toHaveBeenCalledWith(
        expect.objectContaining({_value: 1}), // filterOpacity
        expect.objectContaining({
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      );

      expect(Animated.timing).toHaveBeenCalledWith(
        expect.objectContaining({_value: 0}), // filterTranslateX
        expect.objectContaining({
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      );

      expect(Animated.timing).toHaveBeenCalledWith(
        expect.objectContaining({_value: 1}), // filterScale
        expect.objectContaining({
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      );
    });
  });

  describe('Animation Execution', () => {
    it('starts parallel animations when switching states', () => {
      const mockStart = jest.fn();
      const mockParallel = jest.fn().mockReturnValue({start: mockStart});
      
      (Animated.parallel as jest.Mock).mockImplementation(mockParallel);

      const {rerender} = renderHook(
        (props) => useCustomerFilterHeader(props),
        {
          initialProps: {isSearching: false},
        }
      );

      // Clear initial calls
      jest.clearAllMocks();

      // Switch states
      rerender({isSearching: true});

      expect(Animated.parallel).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({start: expect.any(Function)}), // timing animations
        ])
      );
      expect(mockStart).toHaveBeenCalled();
    });
  });

  describe('Return Values', () => {
    it('returns all required animation values', () => {
      const {result} = renderHook(() =>
        useCustomerFilterHeader({isSearching: false})
      );

      expect(result.current).toHaveProperty('filterOpacity');
      expect(result.current).toHaveProperty('searchOpacity');
      expect(result.current).toHaveProperty('filterTranslateX');
      expect(result.current).toHaveProperty('searchTranslateX');
      expect(result.current).toHaveProperty('filterScale');
      expect(result.current).toHaveProperty('searchScale');
    });

    it('maintains stable references for animation values', () => {
      const {result, rerender} = renderHook(
        (props) => useCustomerFilterHeader(props),
        {
          initialProps: {isSearching: false},
        }
      );

      const firstRender = {
        filterOpacity: result.current.filterOpacity,
        searchOpacity: result.current.searchOpacity,
        filterTranslateX: result.current.filterTranslateX,
        searchTranslateX: result.current.searchTranslateX,
        filterScale: result.current.filterScale,
        searchScale: result.current.searchScale,
      };

      // Re-render with same props
      rerender({isSearching: false});

      // Animation values should be stable references
      expect(result.current.filterOpacity).toBe(firstRender.filterOpacity);
      expect(result.current.searchOpacity).toBe(firstRender.searchOpacity);
      expect(result.current.filterTranslateX).toBe(firstRender.filterTranslateX);
      expect(result.current.searchTranslateX).toBe(firstRender.searchTranslateX);
      expect(result.current.filterScale).toBe(firstRender.filterScale);
      expect(result.current.searchScale).toBe(firstRender.searchScale);
    });
  });

  describe('Multiple State Changes', () => {
    it('handles rapid state changes correctly', () => {
      const {rerender} = renderHook(
        (props) => useCustomerFilterHeader(props),
        {
          initialProps: {isSearching: false},
        }
      );

      // Multiple rapid state changes
      rerender({isSearching: true});
      rerender({isSearching: false});
      rerender({isSearching: true});

      // Should have triggered animations for each change
      expect(Animated.parallel).toHaveBeenCalled();
      expect(Animated.timing).toHaveBeenCalled();
    });
  });
});
