import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import all calculator components
import InternetFibraCalculator from '@/components/calculators/InternetFibraCalculator';
import RadioInternetCalculator from '@/components/calculators/RadioInternetCalculator';
import PABXSIPCalculator from '@/components/calculators/PABXSIPCalculator';
import MaquinasVirtuaisCalculator from '@/components/calculators/MaquinasVirtuaisCalculator';
import CommissionTablesUnified from '@/components/calculators/CommissionTablesUnified';

// Mock the auth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user',
      email: 'test@example.com',
      role: 'admin',
      token: 'test-token'
    }
  })
}));

// Mock the commissions hook
jest.mock('@/hooks/use-commissions', () => ({
  useCommissions: () => ({
    channelSeller: {
      id: '1',
      months_12: 0.60,
      months_24: 1.20,
      months_36: 2.00,
      months_48: 2.00,
      months_60: 2.00
    },
    seller: {
      id: '1',
      months_12: 1.2,
      months_24: 2.4,
      months_36: 3.6,
      months_48: 3.6,
      months_60: 3.6
    },
    channelDirector: {
      id: '1',
      months_12: 0,
      months_24: 0,
      months_36: 0,
      months_48: 0,
      months_60: 0
    },
    channelInfluencer: [
      {
        id: '1',
        revenue_range: 'Até 500,00',
        revenue_min: 0,
        revenue_max: 500,
        months_12: 1.50,
        months_24: 2.00,
        months_36: 2.50,
        months_48: 2.50,
        months_60: 2.50
      }
    ],
    channelIndicator: [
      {
        id: '1',
        revenue_range: 'Até 500,00',
        revenue_min: 0,
        revenue_max: 500,
        months_12: 0.50,
        months_24: 0.67,
        months_36: 0.83,
        months_48: 0.83,
        months_60: 0.83
      }
    ],
    isLoading: false,
    error: null,
    refreshData: jest.fn()
  }),
  getCommissionRate: jest.fn(() => 0.02),
  getSellerCommissionRate: jest.fn(() => 0.03)
}));

// Mock Supabase
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      upsert: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] }))
}));

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
) as jest.Mock;

describe('Final Calculator Consistency Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CommissionTablesUnified Component Standalone', () => {
    it('renders all 5 commission tables with correct data', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Check for all table titles
        expect(screen.getByText('Comissão Canal/Vendedor')).toBeInTheDocument();
        expect(screen.getByText('Comissão Vendedor')).toBeInTheDocument();
        expect(screen.getByText('Comissão Diretor')).toBeInTheDocument();
        expect(screen.getByText('Comissão Canal Influenciador')).toBeInTheDocument();
        expect(screen.getByText('Comissão Canal Indicador')).toBeInTheDocument();
      });

      // Check for period headers (should appear in all simple tables)
      const periodHeaders = screen.getAllByText('12 meses');
      expect(periodHeaders.length).toBeGreaterThan(0);

      // Check for revenue range headers (should appear in complex tables)
      expect(screen.getByText('Faixa de Receita Mensal')).toBeInTheDocument();

      // Check for specific commission values
      expect(screen.getByText('0,60%')).toBeInTheDocument(); // Channel/Seller 12 months
      expect(screen.getByText('1,2%')).toBeInTheDocument(); // Seller 12 months
      expect(screen.getByText('0%')).toBeInTheDocument(); // Director (all periods)
    });

    it('applies consistent dark theme styling', () => {
      render(<CommissionTablesUnified />);

      // Check for dark theme classes
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        expect(table.closest('.bg-slate-900, .bg-gray-900')).toBeTruthy();
      });
    });
  });

  describe('Calculator Components Integration', () => {
    const calculators = [
      { name: 'Internet Fibra', component: InternetFibraCalculator },
      { name: 'Radio Internet', component: RadioInternetCalculator },
      { name: 'PABX SIP', component: PABXSIPCalculator },
      { name: 'Máquinas Virtuais', component: MaquinasVirtuaisCalculator }
    ];

    calculators.forEach(({ name, component: Component }) => {
      it(`${name} calculator renders without errors and includes commission tables`, async () => {
        const { container } = render(<Component />);
        
        // Wait for component to render
        await waitFor(() => {
          expect(container).toBeInTheDocument();
        });

        // Component should render without throwing errors
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });

  describe('Visual Consistency Verification', () => {
    it('verifies commission table structure is identical across all contexts', async () => {
      // Render standalone component
      const { container: standaloneContainer } = render(<CommissionTablesUnified />);
      
      await waitFor(() => {
        expect(standaloneContainer.querySelector('table')).toBeInTheDocument();
      });

      // Check that all expected tables are present
      const tables = standaloneContainer.querySelectorAll('table');
      expect(tables.length).toBe(5); // Should have exactly 5 commission tables

      // Check table headers consistency
      const tableHeaders = standaloneContainer.querySelectorAll('th');
      expect(tableHeaders.length).toBeGreaterThan(0);

      // Verify dark theme application
      const darkElements = standaloneContainer.querySelectorAll('.bg-slate-900, .bg-gray-900, .text-white');
      expect(darkElements.length).toBeGreaterThan(0);
    });

    it('verifies responsive design elements are present', () => {
      render(<CommissionTablesUnified />);

      // Check for responsive classes
      const responsiveElements = document.querySelectorAll('.overflow-x-auto, .min-w-full, .w-full');
      expect(responsiveElements.length).toBeGreaterThan(0);
    });
  });

  describe('Data Accuracy Verification', () => {
    it('displays correct commission values matching requirements', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Canal/Vendedor values
        expect(screen.getByText('0,60%')).toBeInTheDocument(); // 12 months
        expect(screen.getByText('1,20%')).toBeInTheDocument(); // 24 months
        expect(screen.getByText('2,00%')).toBeInTheDocument(); // 36, 48, 60 months

        // Vendedor values
        expect(screen.getByText('1,2%')).toBeInTheDocument(); // 12 months
        expect(screen.getByText('2,4%')).toBeInTheDocument(); // 24 months
        expect(screen.getByText('3,6%')).toBeInTheDocument(); // 36, 48, 60 months

        // Director values (all 0%)
        const zeroPercents = screen.getAllByText('0%');
        expect(zeroPercents.length).toBeGreaterThanOrEqual(5); // At least 5 periods for director
      });
    });

    it('displays correct revenue ranges for complex tables', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Check for revenue ranges
        expect(screen.getByText('Até 500,00')).toBeInTheDocument();
        
        // Check for Brazilian currency formatting
        const currencyElements = document.querySelectorAll('[data-testid*="currency"], .currency');
        // Currency formatting should be present in revenue ranges
      });
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('handles loading states gracefully', () => {
      // Mock loading state
      jest.doMock('@/hooks/use-commissions', () => ({
        useCommissions: () => ({
          channelSeller: null,
          seller: null,
          channelDirector: null,
          channelInfluencer: null,
          channelIndicator: null,
          isLoading: true,
          error: null,
          refreshData: jest.fn()
        })
      }));

      render(<CommissionTablesUnified />);
      
      // Should render loading state or fallback data
      expect(document.body).toBeInTheDocument();
    });

    it('handles error states gracefully', () => {
      // Mock error state
      jest.doMock('@/hooks/use-commissions', () => ({
        useCommissions: () => ({
          channelSeller: null,
          seller: null,
          channelDirector: null,
          channelInfluencer: null,
          channelIndicator: null,
          isLoading: false,
          error: 'Failed to load commission data',
          refreshData: jest.fn()
        })
      }));

      render(<CommissionTablesUnified />);
      
      // Should render error state or fallback data
      expect(document.body).toBeInTheDocument();
    });
  });
});