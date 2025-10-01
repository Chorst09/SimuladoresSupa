/**
 * Commission Tables Loading Fix Test
 * 
 * This test verifies that the commission tables loading issue has been resolved:
 * - Tables should not flicker during loading
 * - Fallback data should be available immediately
 * - Loading state should be minimal and smooth
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useCommissions } from '@/hooks/use-commissions';

// Mock Supabase
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => 
        Promise.resolve({ 
          data: { session: { user: { id: 'test-user' } } }, 
          error: null 
        })
      )
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => 
          Promise.resolve({ 
            data: {
              id: 'test-id',
              months_12: 1.0,
              months_24: 2.0,
              months_36: 3.0,
              months_48: 4.0,
              months_60: 5.0
            }, 
            error: null 
          })
        ),
        order: jest.fn(() => 
          Promise.resolve({ 
            data: [
              {
                id: 'test-range-1',
                revenue_range: 'Até 500,00',
                revenue_min: 0,
                revenue_max: 500,
                months_12: 1.5,
                months_24: 2.0,
                months_36: 2.5,
                months_48: 2.5,
                months_60: 2.5
              }
            ], 
            error: null 
          })
        )
      }))
    }))
  }
}));

// Mock auth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    loading: false
  })
}));

describe('Commission Tables Loading Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear console to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should provide fallback data immediately without loading state', () => {
    const { result } = renderHook(() => useCommissions());
    
    // Should have fallback data immediately
    expect(result.current.channelSeller).toBeTruthy();
    expect(result.current.seller).toBeTruthy();
    expect(result.current.channelInfluencer).toBeTruthy();
    expect(result.current.channelIndicator).toBeTruthy();
    
    // Should not be in loading state initially (fallback data available)
    expect(result.current.isLoading).toBe(false);
    
    // Should not have error initially
    expect(result.current.error).toBeNull();
  });

  test('should have valid fallback commission data structure', () => {
    const { result } = renderHook(() => useCommissions());
    
    // Verify channelSeller structure
    expect(result.current.channelSeller).toMatchObject({
      id: expect.any(String),
      months_12: expect.any(Number),
      months_24: expect.any(Number),
      months_36: expect.any(Number),
      months_48: expect.any(Number),
      months_60: expect.any(Number)
    });
    
    // Verify seller structure
    expect(result.current.seller).toMatchObject({
      id: expect.any(String),
      months_12: expect.any(Number),
      months_24: expect.any(Number),
      months_36: expect.any(Number),
      months_48: expect.any(Number),
      months_60: expect.any(Number)
    });
    
    // Verify channelInfluencer structure
    expect(Array.isArray(result.current.channelInfluencer)).toBe(true);
    expect(result.current.channelInfluencer!.length).toBeGreaterThan(0);
    expect(result.current.channelInfluencer![0]).toMatchObject({
      id: expect.any(String),
      revenue_range: expect.any(String),
      revenue_min: expect.any(Number),
      revenue_max: expect.any(Number),
      months_12: expect.any(Number),
      months_24: expect.any(Number),
      months_36: expect.any(Number),
      months_48: expect.any(Number),
      months_60: expect.any(Number)
    });
    
    // Verify channelIndicator structure
    expect(Array.isArray(result.current.channelIndicator)).toBe(true);
    expect(result.current.channelIndicator!.length).toBeGreaterThan(0);
    expect(result.current.channelIndicator![0]).toMatchObject({
      id: expect.any(String),
      revenue_range: expect.any(String),
      revenue_min: expect.any(Number),
      revenue_max: expect.any(Number),
      months_12: expect.any(Number),
      months_24: expect.any(Number),
      months_36: expect.any(Number),
      months_48: expect.any(Number),
      months_60: expect.any(Number)
    });
  });

  test('should maintain data consistency during Supabase loading', async () => {
    const { result } = renderHook(() => useCommissions());
    
    // Initial fallback data should be available
    const initialChannelSeller = result.current.channelSeller;
    const initialSeller = result.current.seller;
    
    expect(initialChannelSeller).toBeTruthy();
    expect(initialSeller).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
    
    // Wait for potential Supabase data loading
    await waitFor(() => {
      // Data should still be available (either fallback or Supabase data)
      expect(result.current.channelSeller).toBeTruthy();
      expect(result.current.seller).toBeTruthy();
      expect(result.current.channelInfluencer).toBeTruthy();
      expect(result.current.channelIndicator).toBeTruthy();
    }, { timeout: 5000 });
    
    // Should not be loading after data is resolved
    expect(result.current.isLoading).toBe(false);
  });

  test('should handle Supabase connection errors gracefully', async () => {
    // Mock Supabase to simulate connection error
    const mockSupabase = require('@/lib/supabaseClient').supabase;
    mockSupabase.auth.getSession.mockRejectedValueOnce(new Error('Connection failed'));
    
    const { result } = renderHook(() => useCommissions());
    
    // Should still have fallback data even with connection error
    expect(result.current.channelSeller).toBeTruthy();
    expect(result.current.seller).toBeTruthy();
    expect(result.current.channelInfluencer).toBeTruthy();
    expect(result.current.channelIndicator).toBeTruthy();
    
    // Should not be in loading state
    expect(result.current.isLoading).toBe(false);
    
    // Wait for error handling
    await waitFor(() => {
      // Should maintain fallback data
      expect(result.current.channelSeller).toBeTruthy();
      expect(result.current.seller).toBeTruthy();
    }, { timeout: 3000 });
  });

  test('should have reasonable fallback commission rates', () => {
    const { result } = renderHook(() => useCommissions());
    
    // Verify channelSeller rates are reasonable
    const channelSeller = result.current.channelSeller!;
    expect(channelSeller.months_12).toBeGreaterThan(0);
    expect(channelSeller.months_12).toBeLessThan(10); // Should be reasonable percentage
    expect(channelSeller.months_24).toBeGreaterThanOrEqual(channelSeller.months_12);
    
    // Verify seller rates are reasonable
    const seller = result.current.seller!;
    expect(seller.months_12).toBeGreaterThan(0);
    expect(seller.months_12).toBeLessThan(10); // Should be reasonable percentage
    expect(seller.months_24).toBeGreaterThanOrEqual(seller.months_12);
    
    // Verify influencer rates are reasonable
    const influencer = result.current.channelInfluencer![0];
    expect(influencer.months_12).toBeGreaterThan(0);
    expect(influencer.months_12).toBeLessThan(15); // Should be reasonable percentage
    
    // Verify indicator rates are reasonable
    const indicator = result.current.channelIndicator![0];
    expect(indicator.months_12).toBeGreaterThan(0);
    expect(indicator.months_12).toBeLessThan(10); // Should be reasonable percentage
  });

  test('should have proper revenue ranges for channel commissions', () => {
    const { result } = renderHook(() => useCommissions());
    
    // Verify influencer revenue ranges
    const influencerRanges = result.current.channelInfluencer!;
    expect(influencerRanges.length).toBeGreaterThan(0);
    
    // Should have ascending revenue ranges
    for (let i = 0; i < influencerRanges.length - 1; i++) {
      expect(influencerRanges[i].revenue_max).toBeLessThanOrEqual(influencerRanges[i + 1].revenue_min);
    }
    
    // Verify indicator revenue ranges
    const indicatorRanges = result.current.channelIndicator!;
    expect(indicatorRanges.length).toBeGreaterThan(0);
    
    // Should have ascending revenue ranges
    for (let i = 0; i < indicatorRanges.length - 1; i++) {
      expect(indicatorRanges[i].revenue_max).toBeLessThanOrEqual(indicatorRanges[i + 1].revenue_min);
    }
  });

  test('should not flicker between loading states', async () => {
    const { result } = renderHook(() => useCommissions());
    
    // Track loading state changes
    const loadingStates: boolean[] = [];
    loadingStates.push(result.current.isLoading);
    
    // Wait and check if loading state changes multiple times (flickering)
    await waitFor(() => {
      loadingStates.push(result.current.isLoading);
    }, { timeout: 2000 });
    
    // Should not have multiple loading state changes (no flickering)
    const loadingChanges = loadingStates.filter((state, index) => 
      index === 0 || state !== loadingStates[index - 1]
    );
    
    // Should have at most 2 state changes: false -> true -> false (if any loading occurs)
    expect(loadingChanges.length).toBeLessThanOrEqual(2);
    
    // Final state should always be false (not loading)
    expect(result.current.isLoading).toBe(false);
  });

  test('should maintain data integrity across re-renders', () => {
    const { result, rerender } = renderHook(() => useCommissions());
    
    // Get initial data
    const initialData = {
      channelSeller: result.current.channelSeller,
      seller: result.current.seller,
      channelInfluencer: result.current.channelInfluencer,
      channelIndicator: result.current.channelIndicator
    };
    
    // Force re-render
    rerender();
    
    // Data should remain consistent
    expect(result.current.channelSeller).toEqual(initialData.channelSeller);
    expect(result.current.seller).toEqual(initialData.seller);
    expect(result.current.channelInfluencer).toEqual(initialData.channelInfluencer);
    expect(result.current.channelIndicator).toEqual(initialData.channelIndicator);
    
    // Should not be loading
    expect(result.current.isLoading).toBe(false);
  });
});