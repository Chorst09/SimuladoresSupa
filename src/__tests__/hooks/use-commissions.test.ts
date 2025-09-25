import { renderHook, act, waitFor } from '@testing-library/react';
import { useCommissions } from '@/hooks/use-commissions';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/use-auth';

// Mock dependencies
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn()
    },
    from: jest.fn()
  }
}));

jest.mock('@/hooks/use-auth');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useCommissions Hook', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'user'
  };

  const mockSession = {
    user: { email: 'test@example.com' },
    expires_at: Date.now() + 3600000
  };

  const mockChannelSellerData = {
    id: 1,
    months_12: 0.60,
    months_24: 1.20,
    months_36: 2.00,
    months_48: 2.00,
    months_60: 2.00
  };

  const mockChannelDirectorData = {
    id: 1,
    months_12: 0,
    months_24: 0,
    months_36: 0,
    months_48: 0,
    months_60: 0
  };

  const mockSellerData = {
    id: 1,
    months_12: 1.2,
    months_24: 2.4,
    months_36: 3.6,
    months_48: 3.6,
    months_60: 3.6
  };

  const mockChannelInfluencerData = [
    {
      id: 1,
      revenue_range: "Até 500,00",
      revenue_min: 0,
      revenue_max: 500,
      months_12: 1.50,
      months_24: 2.00,
      months_36: 2.50,
      months_48: 2.50,
      months_60: 2.50
    },
    {
      id: 2,
      revenue_range: "500,01 a 1.000,00",
      revenue_min: 500.01,
      revenue_max: 1000,
      months_12: 2.51,
      months_24: 3.25,
      months_36: 4.00,
      months_48: 4.00,
      months_60: 4.00
    }
  ];

  const mockChannelIndicatorData = [
    {
      id: 1,
      revenue_range: "Até 500,00",
      revenue_min: 0,
      revenue_max: 500,
      months_12: 0.50,
      months_24: 0.67,
      months_36: 0.83,
      months_48: 0.83,
      months_60: 0.83
    },
    {
      id: 2,
      revenue_range: "500,01 a 1.000,00",
      revenue_min: 500.01,
      revenue_max: 1000,
      months_12: 0.84,
      months_24: 1.08,
      months_36: 1.33,
      months_48: 1.33,
      months_60: 1.33
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock setup
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    });

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    // Mock Supabase queries
    const mockFrom = jest.fn();
    mockSupabase.from.mockReturnValue(mockFrom as any);
    
    mockFrom.mockImplementation((table: string) => {
      const mockSelect = jest.fn();
      const mockSingle = jest.fn();
      const mockOrder = jest.fn();

      switch (table) {
        case 'commission_channel_seller':
          mockSelect.mockReturnValue({ single: mockSingle });
          mockSingle.mockResolvedValue({ data: mockChannelSellerData, error: null });
          break;
        case 'commission_channel_director':
          mockSelect.mockReturnValue({ single: mockSingle });
          mockSingle.mockResolvedValue({ data: mockChannelDirectorData, error: null });
          break;
        case 'commission_seller':
          mockSelect.mockReturnValue({ single: mockSingle });
          mockSingle.mockResolvedValue({ data: mockSellerData, error: null });
          break;
        case 'commission_channel_influencer':
          mockSelect.mockReturnValue({ order: mockOrder });
          mockOrder.mockResolvedValue({ data: mockChannelInfluencerData, error: null });
          break;
        case 'commission_channel_indicator':
          mockSelect.mockReturnValue({ order: mockOrder });
          mockOrder.mockResolvedValue({ data: mockChannelIndicatorData, error: null });
          break;
      }

      return { select: mockSelect };
    });
  });

  it('should initialize with loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    });

    const { result } = renderHook(() => useCommissions());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.channelSeller).toBe(null);
    expect(result.current.channelDirector).toBe(null);
    expect(result.current.seller).toBe(null);
    expect(result.current.channelInfluencer).toBe(null);
    expect(result.current.channelIndicator).toBe(null);
  });

  it('should fetch all commission types successfully when user is authenticated', async () => {
    const { result } = renderHook(() => useCommissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(null);
    expect(result.current.channelSeller).toEqual(mockChannelSellerData);
    expect(result.current.channelDirector).toEqual(mockChannelDirectorData);
    expect(result.current.seller).toEqual(mockSellerData);
    expect(result.current.channelInfluencer).toEqual(mockChannelInfluencerData);
    expect(result.current.channelIndicator).toEqual(mockChannelIndicatorData);
  });

  it('should use fallback data when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn()
    });

    const { result } = renderHook(() => useCommissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(null);
    expect(result.current.channelSeller).toEqual({
      id: 1,
      months_12: 0.60,
      months_24: 1.20,
      months_36: 2.00,
      months_48: 2.00,
      months_60: 2.00
    });
    expect(result.current.channelDirector).toEqual({
      id: 1,
      months_12: 0,
      months_24: 0,
      months_36: 0,
      months_48: 0,
      months_60: 0
    });
    expect(result.current.seller).toEqual({
      id: 1,
      months_12: 1.2,
      months_24: 2.4,
      months_36: 3.6,
      months_48: 3.6,
      months_60: 3.6
    });
    expect(result.current.channelInfluencer).toHaveLength(6);
    expect(result.current.channelIndicator).toHaveLength(6);
  });

  it('should use fallback data when session is not found', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });

    const { result } = renderHook(() => useCommissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(null);
    expect(result.current.channelSeller).toBeDefined();
    expect(result.current.channelDirector).toBeDefined();
    expect(result.current.seller).toBeDefined();
    expect(result.current.channelInfluencer).toBeDefined();
    expect(result.current.channelIndicator).toBeDefined();
  });

  it('should handle session error and use fallback data', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Session error' }
    });

    const { result } = renderHook(() => useCommissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Erro ao verificar sessão: Session error');
    expect(result.current.channelSeller).toBeDefined();
    expect(result.current.channelDirector).toBeDefined();
    expect(result.current.seller).toBeDefined();
    expect(result.current.channelInfluencer).toBeDefined();
    expect(result.current.channelIndicator).toBeDefined();
  });

  it('should handle database errors and use fallback data', async () => {
    const mockFrom = jest.fn();
    mockSupabase.from.mockReturnValue(mockFrom as any);
    
    mockFrom.mockImplementation((table: string) => {
      const mockSelect = jest.fn();
      const mockSingle = jest.fn();
      const mockOrder = jest.fn();

      if (table === 'commission_channel_seller') {
        mockSelect.mockReturnValue({ single: mockSingle });
        mockSingle.mockResolvedValue({ data: null, error: { message: 'Database error' } });
      } else {
        mockSelect.mockReturnValue({ single: mockSingle, order: mockOrder });
        mockSingle.mockResolvedValue({ data: mockChannelDirectorData, error: null });
        mockOrder.mockResolvedValue({ data: mockChannelInfluencerData, error: null });
      }

      return { select: mockSelect };
    });

    const { result } = renderHook(() => useCommissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(null);
    expect(result.current.channelSeller).toEqual({
      id: 1,
      months_12: 0.60,
      months_24: 1.20,
      months_36: 2.00,
      months_48: 2.00,
      months_60: 2.00
    });
  });

  it('should validate commission data correctly', async () => {
    const invalidData = {
      id: 1,
      months_12: 'invalid',
      months_24: 1.20,
      months_36: 2.00,
      months_48: 2.00,
      months_60: 2.00
    };

    const mockFrom = jest.fn();
    mockSupabase.from.mockReturnValue(mockFrom as any);
    
    mockFrom.mockImplementation((table: string) => {
      const mockSelect = jest.fn();
      const mockSingle = jest.fn();
      const mockOrder = jest.fn();

      if (table === 'commission_channel_seller') {
        mockSelect.mockReturnValue({ single: mockSingle });
        mockSingle.mockResolvedValue({ data: invalidData, error: null });
      } else {
        mockSelect.mockReturnValue({ single: mockSingle, order: mockOrder });
        mockSingle.mockResolvedValue({ data: mockChannelDirectorData, error: null });
        mockOrder.mockResolvedValue({ data: mockChannelInfluencerData, error: null });
      }

      return { select: mockSelect };
    });

    const { result } = renderHook(() => useCommissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should use fallback data when validation fails
    expect(result.current.channelSeller).toEqual({
      id: 1,
      months_12: 0.60,
      months_24: 1.20,
      months_36: 2.00,
      months_48: 2.00,
      months_60: 2.00
    });
  });

  it('should provide refreshData function that refetches data', async () => {
    const { result } = renderHook(() => useCommissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refreshData).toBe('function');

    // Call refreshData
    await act(async () => {
      await result.current.refreshData();
    });

    expect(mockSupabase.from).toHaveBeenCalled();
  });

  it('should handle general errors gracefully', async () => {
    mockSupabase.auth.getSession.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCommissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.channelSeller).toBeDefined();
    expect(result.current.channelDirector).toBeDefined();
    expect(result.current.seller).toBeDefined();
    expect(result.current.channelInfluencer).toBeDefined();
    expect(result.current.channelIndicator).toBeDefined();
  });
});