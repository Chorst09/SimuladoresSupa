import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChannelInfluencerTable from '@/components/calculators/ChannelInfluencerTable';

describe('ChannelInfluencerTable', () => {
  it('should render the table title correctly', () => {
    render(<ChannelInfluencerTable />);
    
    expect(screen.getByText('Comissão Canal Influenciador')).toBeInTheDocument();
  });

  it('should render all table headers', () => {
    render(<ChannelInfluencerTable />);
    
    expect(screen.getByText('Faixa de Receita Mensal')).toBeInTheDocument();
    expect(screen.getByText('12 meses')).toBeInTheDocument();
    expect(screen.getByText('24 meses')).toBeInTheDocument();
    expect(screen.getByText('36 meses')).toBeInTheDocument();
    expect(screen.getByText('48 meses')).toBeInTheDocument();
    expect(screen.getByText('60 meses')).toBeInTheDocument();
  });

  it('should render all revenue ranges', () => {
    render(<ChannelInfluencerTable />);
    
    expect(screen.getByText('Até R$ 500,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 500,01 a R$ 1.000,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.000,01 a R$ 1.500,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.500,01 a R$ 3.000,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 3.000,01 a R$ 5.000,00')).toBeInTheDocument();
    expect(screen.getByText('Acima de R$ 5.000,01')).toBeInTheDocument();
  });

  it('should render correct commission values for first revenue range', () => {
    render(<ChannelInfluencerTable />);
    
    expect(screen.getByText('1,50%')).toBeInTheDocument(); // 12 months
    expect(screen.getByText('2,00%')).toBeInTheDocument(); // 24 months
    expect(screen.getAllByText('2,50%')).toHaveLength(3); // 36, 48, 60 months
  });

  it('should render correct commission values for second revenue range', () => {
    render(<ChannelInfluencerTable />);
    
    expect(screen.getByText('2,51%')).toBeInTheDocument(); // 12 months
    expect(screen.getByText('3,25%')).toBeInTheDocument(); // 24 months
    expect(screen.getAllByText('4,00%')).toHaveLength(3); // 36, 48, 60 months
  });

  it('should render correct commission values for highest revenue range', () => {
    render(<ChannelInfluencerTable />);
    
    expect(screen.getByText('7,01%')).toBeInTheDocument(); // 12 months
    expect(screen.getByText('7,50%')).toBeInTheDocument(); // 24 months
    expect(screen.getAllByText('8,00%')).toHaveLength(3); // 36, 48, 60 months
  });

  it('should apply dark theme styling', () => {
    render(<ChannelInfluencerTable />);
    
    const container = document.querySelector('.bg-slate-900');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('rounded-lg', 'p-4');
  });

  it('should apply custom className when provided', () => {
    render(<ChannelInfluencerTable className="custom-test-class" />);
    
    const container = document.querySelector('.custom-test-class');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('bg-slate-900');
  });

  it('should have proper table structure', () => {
    render(<ChannelInfluencerTable />);
    
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(7); // 1 header + 6 data rows
  });

  it('should have accessible table headers', () => {
    render(<ChannelInfluencerTable />);
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(6);
    expect(headers[0]).toHaveTextContent('Faixa de Receita Mensal');
    expect(headers[1]).toHaveTextContent('12 meses');
    expect(headers[2]).toHaveTextContent('24 meses');
    expect(headers[3]).toHaveTextContent('36 meses');
    expect(headers[4]).toHaveTextContent('48 meses');
    expect(headers[5]).toHaveTextContent('60 meses');
  });

  it('should display commission values with monospace font', () => {
    render(<ChannelInfluencerTable />);
    
    const commissionCells = document.querySelectorAll('.font-mono');
    expect(commissionCells.length).toBeGreaterThan(0);
    
    // Check that commission values have monospace font
    expect(screen.getByText('1,50%').closest('td')).toHaveClass('font-mono');
    expect(screen.getByText('2,51%').closest('td')).toHaveClass('font-mono');
  });

  it('should have hover effects on table rows', () => {
    render(<ChannelInfluencerTable />);
    
    const dataRows = document.querySelectorAll('tbody tr');
    dataRows.forEach(row => {
      expect(row).toHaveClass('hover:bg-slate-800/50');
    });
  });

  it('should have proper border styling', () => {
    render(<ChannelInfluencerTable />);
    
    const headerRow = document.querySelector('thead tr');
    expect(headerRow).toHaveClass('border-b', 'border-slate-700');
    
    const dataRows = document.querySelectorAll('tbody tr');
    dataRows.forEach(row => {
      expect(row).toHaveClass('border-b', 'border-slate-800');
    });
  });

  it('should be responsive with overflow scroll', () => {
    render(<ChannelInfluencerTable />);
    
    const scrollContainer = document.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
  });

  it('should use small text size for better fit', () => {
    render(<ChannelInfluencerTable />);
    
    const table = screen.getByRole('table');
    expect(table).toHaveClass('text-sm');
    
    // Check that revenue range cells have extra small text
    const revenueCells = document.querySelectorAll('tbody td:first-child');
    revenueCells.forEach(cell => {
      expect(cell).toHaveClass('text-xs');
    });
  });

  it('should center-align commission value headers and cells', () => {
    render(<ChannelInfluencerTable />);
    
    // Check header alignment
    const commissionHeaders = document.querySelectorAll('th:not(:first-child)');
    commissionHeaders.forEach(header => {
      expect(header).toHaveClass('text-center');
    });
    
    // Check cell alignment
    const commissionCells = document.querySelectorAll('tbody td:not(:first-child)');
    commissionCells.forEach(cell => {
      expect(cell).toHaveClass('text-center');
    });
  });
});