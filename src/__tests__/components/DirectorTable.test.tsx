import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DirectorTable from '@/components/calculators/DirectorTable';

describe('DirectorTable', () => {
  it('should render the table title correctly', () => {
    render(<DirectorTable />);
    
    expect(screen.getByText('Comissão Diretor')).toBeInTheDocument();
  });

  it('should render all table headers', () => {
    render(<DirectorTable />);
    
    expect(screen.getByText('Período')).toBeInTheDocument();
    expect(screen.getByText('Comissão')).toBeInTheDocument();
  });

  it('should render all commission periods and values', () => {
    render(<DirectorTable />);
    
    // Check periods
    expect(screen.getByText('12 meses')).toBeInTheDocument();
    expect(screen.getByText('24 meses')).toBeInTheDocument();
    expect(screen.getByText('36 meses')).toBeInTheDocument();
    expect(screen.getByText('48 meses')).toBeInTheDocument();
    expect(screen.getByText('60 meses')).toBeInTheDocument();
    
    // Check commission values - all should be 0%
    expect(screen.getAllByText('0%')).toHaveLength(5); // All 5 periods should be 0%
  });

  it('should have zero commission rates for all periods', () => {
    render(<DirectorTable />);
    
    // All director commission rates should be 0%
    const zeroRates = screen.getAllByText('0%');
    expect(zeroRates).toHaveLength(5);
    
    // Should not have any non-zero rates
    expect(screen.queryByText('1%')).not.toBeInTheDocument();
    expect(screen.queryByText('2%')).not.toBeInTheDocument();
    expect(screen.queryByText('0,5%')).not.toBeInTheDocument();
  });

  it('should apply dark theme styling', () => {
    render(<DirectorTable />);
    
    const container = document.querySelector('.bg-slate-900');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('rounded-lg', 'p-4');
  });

  it('should apply custom className when provided', () => {
    render(<DirectorTable className="custom-test-class" />);
    
    const container = document.querySelector('.custom-test-class');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('bg-slate-900');
  });

  it('should have proper table structure', () => {
    render(<DirectorTable />);
    
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(6); // 1 header + 5 data rows
  });

  it('should have accessible table headers', () => {
    render(<DirectorTable />);
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveTextContent('Período');
    expect(headers[1]).toHaveTextContent('Comissão');
  });

  it('should display commission values with monospace font', () => {
    render(<DirectorTable />);
    
    const commissionCells = document.querySelectorAll('.font-mono');
    expect(commissionCells.length).toBeGreaterThan(0);
    
    // Check that commission values have monospace font
    const zeroRates = screen.getAllByText('0%');
    zeroRates.forEach(rate => {
      expect(rate.closest('td')).toHaveClass('font-mono');
    });
  });

  it('should have hover effects on table rows', () => {
    render(<DirectorTable />);
    
    const dataRows = document.querySelectorAll('tbody tr');
    dataRows.forEach(row => {
      expect(row).toHaveClass('hover:bg-slate-800/50');
    });
  });

  it('should have proper border styling', () => {
    render(<DirectorTable />);
    
    const headerRow = document.querySelector('thead tr');
    expect(headerRow).toHaveClass('border-b', 'border-slate-700');
    
    const dataRows = document.querySelectorAll('tbody tr');
    dataRows.forEach(row => {
      expect(row).toHaveClass('border-b', 'border-slate-800');
    });
  });

  it('should be responsive with overflow scroll', () => {
    render(<DirectorTable />);
    
    const scrollContainer = document.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
  });

  it('should have consistent zero commission across all periods', () => {
    render(<DirectorTable />);
    
    // All periods should have the same 0% commission
    const commissionCells = document.querySelectorAll('tbody td:nth-child(2)');
    expect(commissionCells).toHaveLength(5);
    
    commissionCells.forEach(cell => {
      expect(cell).toHaveTextContent('0%');
    });
  });

  it('should have white text for visibility on dark background', () => {
    render(<DirectorTable />);
    
    const title = screen.getByText('Comissão Diretor');
    expect(title).toHaveClass('text-white');
    
    const table = screen.getByRole('table');
    expect(table).toHaveClass('text-white');
  });

  it('should differentiate from other commission tables by having zero rates', () => {
    render(<DirectorTable />);
    
    // Director table should be unique in having all zero rates
    const zeroRates = screen.getAllByText('0%');
    expect(zeroRates).toHaveLength(5);
    
    // Should not have any percentage rates that other tables might have
    expect(screen.queryByText('0,60%')).not.toBeInTheDocument(); // Channel/Seller
    expect(screen.queryByText('1,2%')).not.toBeInTheDocument(); // Seller
    expect(screen.queryByText('1,50%')).not.toBeInTheDocument(); // Influencer
    expect(screen.queryByText('0,50%')).not.toBeInTheDocument(); // Indicator
  });

  it('should maintain table structure consistency with other commission tables', () => {
    render(<DirectorTable />);
    
    // Should have same structure as other simple commission tables
    const periodCells = document.querySelectorAll('tbody td:first-child');
    const commissionCells = document.querySelectorAll('tbody td:nth-child(2)');
    
    expect(periodCells).toHaveLength(5);
    expect(commissionCells).toHaveLength(5);
    
    // Check period labels match other tables
    expect(screen.getByText('12 meses')).toBeInTheDocument();
    expect(screen.getByText('24 meses')).toBeInTheDocument();
    expect(screen.getByText('36 meses')).toBeInTheDocument();
    expect(screen.getByText('48 meses')).toBeInTheDocument();
    expect(screen.getByText('60 meses')).toBeInTheDocument();
  });
});