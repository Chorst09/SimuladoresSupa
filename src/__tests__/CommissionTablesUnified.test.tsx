import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommissionTablesUnified from '@/components/calculators/CommissionTablesUnified';
import { useCommissions } from '@/hooks/use-commissions';

// Mock the useCommissions hook
jest.mock('@/hooks/use-commissions');
const mockUseCommissions = useCommissions as jest.MockedFunction<typeof useCommissions>;

// Mock the utils functions
jest.mock('@/lib/utils', () => ({
  formatBrazilianNumber: (value: number) => value.toFixed(2),
  formatCurrency: (value: number) => `R$ ${value.toFixed(2)}`,
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('CommissionTablesUnified', () => {
  const mockCommissionData = {
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
      }
    ],
    isLoading: false,
    error: null,
    refreshData: jest.fn()
  };

  beforeEach(() => {
    mockUseCommissions.mockReturnValue(mockCommissionData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render all 5 commission tables when data is loaded', async () => {
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

  it('should display loading state correctly', async () => {
    mockUseCommissions.mockReturnValue({
      ...mockCommissionData,
      isLoading: true
    });

    render(<CommissionTablesUnified />);

    expect(screen.getByText('Carregando tabelas de comissões...')).toBeInTheDocument();
  });

  it('should display error state correctly', async () => {
    mockUseCommissions.mockReturnValue({
      ...mockCommissionData,
      isLoading: false,
      error: 'Test error message'
    });

    render(<CommissionTablesUnified />);

    expect(screen.getByText('Erro ao carregar tabelas de comissões: Test error message')).toBeInTheDocument();
  });

  it('should display Canal/Vendedor commission values correctly', async () => {
    render(<CommissionTablesUnified />);

    await waitFor(() => {
      expect(screen.getByText('0.60%')).toBeInTheDocument(); // 12 months
      expect(screen.getByText('1.20%')).toBeInTheDocument(); // 24 months
      expect(screen.getByText('2.00%')).toBeInTheDocument(); // 36, 48, 60 months
    });
  });

  it('should display Vendedor commission values correctly', async () => {
    render(<CommissionTablesUnified />);

    await waitFor(() => {
      expect(screen.getByText('1.20%')).toBeInTheDocument(); // 12 months (seller)
      expect(screen.getByText('2.40%')).toBeInTheDocument(); // 24 months
      expect(screen.getByText('3.60%')).toBeInTheDocument(); // 36, 48, 60 months
    });
  });

  it('should display Director commission values correctly (all zeros)', async () => {
    render(<CommissionTablesUnified />);

    await waitFor(() => {
      // Director table should show 0.00% for all periods
      const directorSection = screen.getByText('Comissão Diretor').closest('.bg-slate-900\\/80');
      expect(directorSection).toBeInTheDocument();
      
      // Should have multiple 0.00% values in the director table
      const zeroValues = screen.getAllByText('0.00%');
      expect(zeroValues.length).toBeGreaterThan(0);
    });
  });

  it('should display revenue-based tables with correct structure', async () => {
    render(<CommissionTablesUnified />);

    await waitFor(() => {
      // Check for revenue range headers
      expect(screen.getByText('Receita Mensal')).toBeInTheDocument();
      
      // Check for time period headers
      expect(screen.getByText('12m')).toBeInTheDocument();
      expect(screen.getByText('24m')).toBeInTheDocument();
      expect(screen.getByText('36m')).toBeInTheDocument();
      expect(screen.getByText('48m')).toBeInTheDocument();
      expect(screen.getByText('60m')).toBeInTheDocument();
      
      // Check for revenue ranges
      expect(screen.getByText('Até 500,00')).toBeInTheDocument();
      expect(screen.getByText('500,01 a 1.000,00')).toBeInTheDocument();
    });
  });

  it('should apply dark theme styling correctly', async () => {
    render(<CommissionTablesUnified />);

    await waitFor(() => {
      const cards = document.querySelectorAll('.bg-slate-900\\/80');
      expect(cards.length).toBe(5); // Should have 5 commission table cards
      
      cards.forEach(card => {
        expect(card).toHaveClass('border-slate-800', 'text-white');
      });
    });
  });

  it('should have responsive layout classes', async () => {
    render(<CommissionTablesUnified />);

    await waitFor(() => {
      // Check for responsive grid classes
      const gridContainers = document.querySelectorAll('.grid-cols-1.lg\\:grid-cols-2');
      expect(gridContainers.length).toBe(2); // Two rows with side-by-side layout
    });
  });

  it('should accept and apply custom className', async () => {
    render(<CommissionTablesUnified className="custom-test-class" />);

    await waitFor(() => {
      const container = document.querySelector('.custom-test-class');
      expect(container).toBeInTheDocument();
    });
  });
});