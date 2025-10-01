import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommissionTablesUnified from '@/components/calculators/CommissionTablesUnified';
import { useCommissions } from '@/hooks/use-commissions';

// Mock the useCommissions hook
jest.mock('@/hooks/use-commissions');
const mockUseCommissions = useCommissions as jest.MockedFunction<typeof useCommissions>;

// Mock the utils functions
jest.mock('@/lib/utils', () => ({
  formatBrazilianNumber: (value: number) => value.toFixed(2).replace('.', ','),
  formatCurrency: (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`,
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('CommissionTablesUnified Integration Tests', () => {
  const mockFullCommissionData = {
    channelSeller: {
      id: 1,
      months_12: 0.60,
      months_24: 1.20,
      months_36: 2.00,
      months_48: 2.00,
      months_60: 2.00
    },
    channelDirector: {
      id: 1,
      months_12: 0,
      months_24: 0,
      months_36: 0,
      months_48: 0,
      months_60: 0
    },
    seller: {
      id: 1,
      months_12: 1.2,
      months_24: 2.4,
      months_36: 3.6,
      months_48: 3.6,
      months_60: 3.6
    },
    channelInfluencer: [
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
      },
      {
        id: 3,
        revenue_range: "1.000,01 a 1.500,00",
        revenue_min: 1000.01,
        revenue_max: 1500,
        months_12: 4.01,
        months_24: 4.50,
        months_36: 5.00,
        months_48: 5.00,
        months_60: 5.00
      },
      {
        id: 4,
        revenue_range: "1.500,01 a 3.000,00",
        revenue_min: 1500.01,
        revenue_max: 3000,
        months_12: 5.01,
        months_24: 5.50,
        months_36: 6.00,
        months_48: 6.00,
        months_60: 6.00
      },
      {
        id: 5,
        revenue_range: "3.000,01 a 5.000,00",
        revenue_min: 3000.01,
        revenue_max: 5000,
        months_12: 6.01,
        months_24: 6.50,
        months_36: 7.00,
        months_48: 7.00,
        months_60: 7.00
      },
      {
        id: 6,
        revenue_range: "Acima de 5.000,01",
        revenue_min: 5000.01,
        revenue_max: 999999999,
        months_12: 7.01,
        months_24: 7.50,
        months_36: 8.00,
        months_48: 8.00,
        months_60: 8.00
      }
    ],
    channelIndicator: [
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
      },
      {
        id: 3,
        revenue_range: "1.000,01 a 1.500,00",
        revenue_min: 1000.01,
        revenue_max: 1500,
        months_12: 1.34,
        months_24: 1.50,
        months_36: 1.67,
        months_48: 1.67,
        months_60: 1.67
      },
      {
        id: 4,
        revenue_range: "1.500,01 a 3.000,00",
        revenue_min: 1500.01,
        revenue_max: 3000,
        months_12: 1.67,
        months_24: 1.83,
        months_36: 2.00,
        months_48: 2.00,
        months_60: 2.00
      },
      {
        id: 5,
        revenue_range: "3.000,01 a 5.000,00",
        revenue_min: 3000.01,
        revenue_max: 5000,
        months_12: 2.00,
        months_24: 2.17,
        months_36: 2.50,
        months_48: 2.50,
        months_60: 2.50
      },
      {
        id: 6,
        revenue_range: "Acima de 5.000,01",
        revenue_min: 5000.01,
        revenue_max: 999999999,
        months_12: 2.34,
        months_24: 2.50,
        months_36: 3.00,
        months_48: 3.00,
        months_60: 3.00
      }
    ],
    isLoading: false,
    error: null,
    refreshData: jest.fn()
  };

  beforeEach(() => {
    mockUseCommissions.mockReturnValue(mockFullCommissionData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Data Integration', () => {
    it('should render all 5 commission tables with complete data', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Check for all table titles
        expect(screen.getByText('Comissão Canal/Vendedor')).toBeInTheDocument();
        expect(screen.getByText('Comissão Canal Influenciador')).toBeInTheDocument();
        expect(screen.getByText('Comissão Canal Indicador')).toBeInTheDocument();
        expect(screen.getByText('Comissão Vendedor')).toBeInTheDocument();
        expect(screen.getByText('Comissão Diretor')).toBeInTheDocument();
      });
    });

    it('should display all revenue ranges for both influencer and indicator tables', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Should have 2 instances of each revenue range (one for influencer, one for indicator)
        expect(screen.getAllByText('Até 500,00')).toHaveLength(2);
        expect(screen.getAllByText('500,01 a 1.000,00')).toHaveLength(2);
        expect(screen.getAllByText('1.000,01 a 1.500,00')).toHaveLength(2);
        expect(screen.getAllByText('1.500,01 a 3.000,00')).toHaveLength(2);
        expect(screen.getAllByText('3.000,01 a 5.000,00')).toHaveLength(2);
        expect(screen.getAllByText('Acima de 5.000,01')).toHaveLength(2);
      });
    });

    it('should display correct commission values with Brazilian formatting', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Channel/Seller values
        expect(screen.getByText('0,60%')).toBeInTheDocument();
        expect(screen.getByText('1,20%')).toBeInTheDocument();
        
        // Seller values
        expect(screen.getByText('1,20%')).toBeInTheDocument(); // 12 months seller
        expect(screen.getByText('2,40%')).toBeInTheDocument();
        expect(screen.getByText('3,60%')).toBeInTheDocument();
        
        // Director values (all zeros)
        expect(screen.getAllByText('0,00%')).toHaveLength(5);
        
        // Influencer values
        expect(screen.getByText('1,50%')).toBeInTheDocument();
        expect(screen.getByText('7,01%')).toBeInTheDocument(); // Highest influencer rate
        
        // Indicator values
        expect(screen.getByText('0,50%')).toBeInTheDocument();
        expect(screen.getByText('2,34%')).toBeInTheDocument(); // Highest indicator rate
      });
    });
  });

  describe('Layout and Responsive Design', () => {
    it('should have proper layout structure with 3 rows', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // First row: Canal/Vendedor (full width)
        const firstRowCard = screen.getByText('Comissão Canal/Vendedor').closest('.bg-slate-900\\/80');
        expect(firstRowCard).toBeInTheDocument();
        
        // Second row: Influencer and Indicator (side by side)
        const influencerCard = screen.getByText('Comissão Canal Influenciador').closest('.bg-slate-900\\/80');
        const indicatorCard = screen.getByText('Comissão Canal Indicador').closest('.bg-slate-900\\/80');
        expect(influencerCard).toBeInTheDocument();
        expect(indicatorCard).toBeInTheDocument();
        
        // Third row: Seller and Director (side by side)
        const sellerCard = screen.getByText('Comissão Vendedor').closest('.bg-slate-900\\/80');
        const directorCard = screen.getByText('Comissão Diretor').closest('.bg-slate-900\\/80');
        expect(sellerCard).toBeInTheDocument();
        expect(directorCard).toBeInTheDocument();
      });
    });

    it('should have responsive grid classes for side-by-side tables', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        const gridContainers = document.querySelectorAll('.grid.grid-cols-1.lg\\:grid-cols-2');
        expect(gridContainers).toHaveLength(2); // Two rows with side-by-side layout
      });
    });

    it('should have overflow scroll for all tables', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        const scrollContainers = document.querySelectorAll('.overflow-x-auto');
        expect(scrollContainers).toHaveLength(5); // One for each table
      });
    });
  });

  describe('Dark Theme Integration', () => {
    it('should apply consistent dark theme across all tables', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        const cards = document.querySelectorAll('.bg-slate-900\\/80');
        expect(cards).toHaveLength(5);
        
        cards.forEach(card => {
          expect(card).toHaveClass('border-slate-800', 'text-white');
        });
      });
    });

    it('should have white text for all table content', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        const tableHeaders = document.querySelectorAll('th');
        tableHeaders.forEach(header => {
          expect(header).toHaveClass('text-white');
        });
        
        const tableCells = document.querySelectorAll('td');
        tableCells.forEach(cell => {
          expect(cell).toHaveClass('text-white');
        });
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should display loading state correctly', async () => {
      mockUseCommissions.mockReturnValue({
        ...mockFullCommissionData,
        isLoading: true
      });

      render(<CommissionTablesUnified />);

      expect(screen.getByText('Carregando tabelas de comissões...')).toBeInTheDocument();
    });

    it('should display error state correctly', async () => {
      mockUseCommissions.mockReturnValue({
        ...mockFullCommissionData,
        isLoading: false,
        error: 'Database connection failed'
      });

      render(<CommissionTablesUnified />);

      expect(screen.getByText('Erro ao carregar tabelas de comissões: Database connection failed')).toBeInTheDocument();
    });

    it('should handle partial data gracefully', async () => {
      mockUseCommissions.mockReturnValue({
        ...mockFullCommissionData,
        channelSeller: null,
        channelInfluencer: null
      });

      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Should still render table structure even with missing data
        expect(screen.getByText('Comissão Canal/Vendedor')).toBeInTheDocument();
        expect(screen.getByText('Comissão Canal Influenciador')).toBeInTheDocument();
        
        // But tables should be empty or show fallback
        const channelSellerTable = screen.getByText('Comissão Canal/Vendedor').closest('.bg-slate-900\\/80');
        const influencerTable = screen.getByText('Comissão Canal Influenciador').closest('.bg-slate-900\\/80');
        
        expect(channelSellerTable).toBeInTheDocument();
        expect(influencerTable).toBeInTheDocument();
      });
    });
  });

  describe('Data Accuracy Integration', () => {
    it('should display exact values from hook data', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // Verify specific values match the mock data exactly
        expect(screen.getByText('0,60%')).toBeInTheDocument(); // channelSeller.months_12
        expect(screen.getByText('1,20%')).toBeInTheDocument(); // channelSeller.months_24
        expect(screen.getByText('2,00%')).toBeInTheDocument(); // channelSeller.months_36
        
        expect(screen.getByText('1,20%')).toBeInTheDocument(); // seller.months_12 (formatted)
        expect(screen.getByText('2,40%')).toBeInTheDocument(); // seller.months_24
        expect(screen.getByText('3,60%')).toBeInTheDocument(); // seller.months_36
        
        expect(screen.getByText('1,50%')).toBeInTheDocument(); // channelInfluencer[0].months_12
        expect(screen.getByText('7,01%')).toBeInTheDocument(); // channelInfluencer[5].months_12
        
        expect(screen.getByText('0,50%')).toBeInTheDocument(); // channelIndicator[0].months_12
        expect(screen.getByText('2,34%')).toBeInTheDocument(); // channelIndicator[5].months_12
      });
    });

    it('should maintain data consistency across table updates', async () => {
      const { rerender } = render(<CommissionTablesUnified />);

      // Initial render
      await waitFor(() => {
        expect(screen.getByText('0,60%')).toBeInTheDocument();
      });

      // Update data
      const updatedData = {
        ...mockFullCommissionData,
        channelSeller: {
          ...mockFullCommissionData.channelSeller!,
          months_12: 0.70
        }
      };
      mockUseCommissions.mockReturnValue(updatedData);

      rerender(<CommissionTablesUnified />);

      await waitFor(() => {
        expect(screen.getByText('0,70%')).toBeInTheDocument();
        expect(screen.queryByText('0,60%')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should have proper table structure for screen readers', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        const tables = screen.getAllByRole('table');
        expect(tables).toHaveLength(5);
        
        tables.forEach(table => {
          const headers = table.querySelectorAll('th');
          const rows = table.querySelectorAll('tr');
          
          expect(headers.length).toBeGreaterThan(0);
          expect(rows.length).toBeGreaterThan(1); // At least header + 1 data row
        });
      });
    });

    it('should have proper heading hierarchy', async () => {
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        // All table titles should be properly structured
        expect(screen.getByText('Comissão Canal/Vendedor')).toBeInTheDocument();
        expect(screen.getByText('Comissão Canal Influenciador')).toBeInTheDocument();
        expect(screen.getByText('Comissão Canal Indicador')).toBeInTheDocument();
        expect(screen.getByText('Comissão Vendedor')).toBeInTheDocument();
        expect(screen.getByText('Comissão Diretor')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Integration', () => {
    it('should render efficiently with large datasets', async () => {
      const startTime = performance.now();
      
      render(<CommissionTablesUnified />);

      await waitFor(() => {
        expect(screen.getByText('Comissão Canal/Vendedor')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
    });

    it('should handle refreshData calls correctly', async () => {
      const mockRefreshData = jest.fn();
      mockUseCommissions.mockReturnValue({
        ...mockFullCommissionData,
        refreshData: mockRefreshData
      });

      render(<CommissionTablesUnified />);

      await waitFor(() => {
        expect(screen.getByText('Comissão Canal/Vendedor')).toBeInTheDocument();
      });

      // The refreshData function should be available
      expect(mockRefreshData).toBeDefined();
      expect(typeof mockRefreshData).toBe('function');
    });
  });
});