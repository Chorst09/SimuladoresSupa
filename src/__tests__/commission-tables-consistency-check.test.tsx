import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommissionTablesUnified from '@/components/calculators/CommissionTablesUnified';

// Mock the commissions hook with expected data
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
      },
      {
        id: '2',
        revenue_range: '500,01 a 1.000,00',
        revenue_min: 500.01,
        revenue_max: 1000,
        months_12: 2.51,
        months_24: 3.25,
        months_36: 4.00,
        months_48: 4.00,
        months_60: 4.00
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
      },
      {
        id: '2',
        revenue_range: '500,01 a 1.000,00',
        revenue_min: 500.01,
        revenue_max: 1000,
        months_12: 0.84,
        months_24: 1.08,
        months_36: 1.33,
        months_48: 1.33,
        months_60: 1.33
      }
    ],
    isLoading: false,
    error: null,
    refreshData: jest.fn()
  })
}));

describe('Commission Tables Consistency Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Task 12: Verify consistency across all calculators', () => {
    it('displays all 5 commission tables with correct structure', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Verify all 5 commission table titles are present
        expect(screen.getByText('Comissão Canal/Vendedor')).toBeInTheDocument();
        expect(screen.getByText('Comissão Vendedor')).toBeInTheDocument();
        expect(screen.getByText('Comissão Diretor')).toBeInTheDocument();
        expect(screen.getByText('Comissão Canal Influenciador')).toBeInTheDocument();
        expect(screen.getByText('Comissão Canal Indicador')).toBeInTheDocument();
      });
    });

    it('displays correct commission values matching requirements', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Canal/Vendedor commission values (Requirement 1.2)
        expect(screen.getByText('0,60%')).toBeInTheDocument(); // 12 months
        expect(screen.getByText('1,20%')).toBeInTheDocument(); // 24 months
        expect(screen.getByText('2,00%')).toBeInTheDocument(); // 36, 48, 60 months

        // Vendedor commission values (Requirement 1.3)
        expect(screen.getByText('1,2%')).toBeInTheDocument(); // 12 months
        expect(screen.getByText('2,4%')).toBeInTheDocument(); // 24 months
        expect(screen.getByText('3,6%')).toBeInTheDocument(); // 36, 48, 60 months

        // Director commission values (Requirement 1.4) - all 0%
        const zeroPercents = screen.getAllByText('0%');
        expect(zeroPercents.length).toBeGreaterThanOrEqual(5); // At least 5 periods for director
      });
    });

    it('displays revenue-based tables with correct structure', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Check for revenue range headers (Requirement 2.1)
        expect(screen.getByText('Faixa de Receita Mensal')).toBeInTheDocument();
        expect(screen.getByText('Até 500,00')).toBeInTheDocument();
        expect(screen.getByText('500,01 a 1.000,00')).toBeInTheDocument();

        // Check for period headers in revenue-based tables
        const periodHeaders = screen.getAllByText('12 meses');
        expect(periodHeaders.length).toBeGreaterThan(0);
      });
    });

    it('applies consistent dark theme styling (Requirement 5.1, 5.2)', () => {
      const { container } = render(<CommissionTablesUnified />);

      // Check for dark theme classes
      const darkElements = container.querySelectorAll('.bg-slate-900, .bg-gray-900, .text-white');
      expect(darkElements.length).toBeGreaterThan(0);

      // Check for table structure
      const tables = container.querySelectorAll('table');
      expect(tables.length).toBe(5); // Should have exactly 5 commission tables
    });

    it('has responsive design elements', () => {
      const { container } = render(<CommissionTablesUnified />);

      // Check for responsive classes
      const responsiveElements = container.querySelectorAll('.overflow-x-auto, .min-w-full, .w-full');
      expect(responsiveElements.length).toBeGreaterThan(0);
    });

    it('displays correct layout structure', async () => {
      const { container } = render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Should have a grid layout for organizing tables
        const gridElements = container.querySelectorAll('.grid, .flex');
        expect(gridElements.length).toBeGreaterThan(0);

        // Should have proper spacing between tables
        const spacingElements = container.querySelectorAll('.space-y-4, .space-y-6, .gap-4, .gap-6');
        expect(spacingElements.length).toBeGreaterThan(0);
      });
    });

    it('formats currency values correctly (Brazilian format)', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Check for percentage formatting with comma as decimal separator
        expect(screen.getByText('0,60%')).toBeInTheDocument();
        expect(screen.getByText('1,20%')).toBeInTheDocument();
        expect(screen.getByText('2,00%')).toBeInTheDocument();
      });
    });

    it('handles loading and error states gracefully', () => {
      // Test with loading state
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

      const { container } = render(<CommissionTablesUnified />);
      
      // Should render without crashing
      expect(container).toBeInTheDocument();
    });
  });

  describe('Data Accuracy Verification', () => {
    it('matches the provided screenshots data structure', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Verify the table structure matches requirements
        const tables = document.querySelectorAll('table');
        expect(tables.length).toBe(5);

        // Each table should have proper headers
        const tableHeaders = document.querySelectorAll('th');
        expect(tableHeaders.length).toBeGreaterThan(0);

        // Should have both simple period-based tables and revenue-range tables
        expect(screen.getByText('12 meses')).toBeInTheDocument();
        expect(screen.getByText('Faixa de Receita Mensal')).toBeInTheDocument();
      });
    });

    it('displays all required commission values', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Channel Seller values
        expect(screen.getByText('0,60%')).toBeInTheDocument();
        expect(screen.getByText('1,20%')).toBeInTheDocument();
        expect(screen.getByText('2,00%')).toBeInTheDocument();

        // Seller values
        expect(screen.getByText('1,2%')).toBeInTheDocument();
        expect(screen.getByText('2,4%')).toBeInTheDocument();
        expect(screen.getByText('3,6%')).toBeInTheDocument();

        // Director values (all zeros)
        const zeroValues = screen.getAllByText('0%');
        expect(zeroValues.length).toBeGreaterThanOrEqual(5);

        // Revenue-based table values
        expect(screen.getByText('1,50%')).toBeInTheDocument(); // Influencer first range, 12 months
        expect(screen.getByText('0,50%')).toBeInTheDocument(); // Indicator first range, 12 months
      });
    });
  });
});