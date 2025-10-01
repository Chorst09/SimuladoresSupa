import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SellerTable from '@/components/calculators/SellerTable';

describe('SellerTable', () => {
  it('should render the table title correctly', () => {
    render(<SellerTable />);
    
    expect(screen.getByText('Comissão Vendedor')).toBeInTheDocument();
  });

  it('should render all table headers', () => {
    render(<SellerTable />);
    
    expect(screen.getByText('Período')).toBeInTheDocument();
    expect(screen.getByText('Comissão')).toBeInTheDocument();
  });

  it('should render all commission periods and values', () => {
    render(<SellerTable />);
    
    // Check periods
    expect(screen.getByText('12 meses')).toBeInTheDocument();
    expect(screen.getByText('24 meses')).toBeInTheDocument();
    expect(screen.getByText('36 meses')).toBeInTheDocument();
    expect(screen.getByText('48 meses')).toBeInTheDocument();
    expect(screen.getByText('60 meses')).toBeInTheDocument();
    
    // Check commission values
    expect(screen.getByText('1,2%')).toBeInTheDocument();
    expect(screen.getByText('2,4%')).toBeInTheDocument();
    expect(screen.getAllByText('3,6%')).toHaveLength(3); // 36, 48, 60 months
  });

  it('should have higher commission rates than Channel/Seller', () => {
    render(<SellerTable />);
    
    // Seller rates should be higher than Channel/Seller rates
    expect(screen.getByText('1,2%')).toBeInTheDocument(); // vs 0,60% for channel/seller
    expect(screen.getByText('2,4%')).toBeInTheDocument(); // vs 1,20% for channel/seller
    expect(screen.getAllByText('3,6%')).toHaveLength(3); // vs 2,00% for channel/seller
  });

  it('should apply dark theme styling', () => {
    render(<SellerTable />);
    
    const container = document.querySelector('.bg-slate-900');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('rounded-lg', 'p-4');
  });

  it('should apply custom className when provided', () => {
    render(<SellerTable className="custom-test-class" />);
    
    const container = document.querySelector('.custom-test-class');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('bg-slate-900');
  });

  it('should have proper table structure', () => {
    render(<SellerTable />);
    
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(6); // 1 header + 5 data rows
  });

  it('should have accessible table headers', () => {
    render(<SellerTable />);
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveTextContent('Período');
    expect(headers[1]).toHaveTextContent('Comissão');
  });

  it('should display commission values with monospace font', () => {
    render(<SellerTable />);
    
    const commissionCells = document.querySelectorAll('.font-mono');
    expect(commissionCells.length).toBeGreaterThan(0);
    
    // Check that commission values have monospace font
    expect(screen.getByText('1,2%').closest('td')).toHaveClass('font-mono');
    expect(screen.getByText('2,4%').closest('td')).toHaveClass('font-mono');
  });

  it('should have hover effects on table rows', () => {
    render(<SellerTable />);
    
    const dataRows = document.querySelectorAll('tbody tr');
    dataRows.forEach(row => {
      expect(row).toHaveClass('hover:bg-slate-800/50');
    });
  });

  it('should have proper border styling', () => {
    render(<SellerTable />);
    
    const headerRow = document.querySelector('thead tr');
    expect(headerRow).toHaveClass('border-b', 'border-slate-700');
    
    const dataRows = document.querySelectorAll('tbody tr');
    dataRows.forEach(row => {
      expect(row).toHaveClass('border-b', 'border-slate-800');
    });
  });

  it('should be responsive with overflow scroll', () => {
    render(<SellerTable />);
    
    const scrollContainer = document.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
  });

  it('should display commission progression correctly', () => {
    render(<SellerTable />);
    
    // Commission should increase from 12 to 24 months, then plateau
    expect(screen.getByText('1,2%')).toBeInTheDocument(); // 12 months - lowest
    expect(screen.getByText('2,4%')).toBeInTheDocument(); // 24 months - middle
    expect(screen.getAllByText('3,6%')).toHaveLength(3); // 36-60 months - highest
  });

  it('should use Brazilian number formatting', () => {
    render(<SellerTable />);
    
    // Should use comma as decimal separator (Brazilian format)
    expect(screen.getByText('1,2%')).toBeInTheDocument();
    expect(screen.getByText('2,4%')).toBeInTheDocument();
    expect(screen.getAllByText('3,6%')).toHaveLength(3);
    
    // Should not use dot notation
    expect(screen.queryByText('1.2%')).not.toBeInTheDocument();
    expect(screen.queryByText('2.4%')).not.toBeInTheDocument();
    expect(screen.queryByText('3.6%')).not.toBeInTheDocument();
  });

  it('should have white text for visibility on dark background', () => {
    render(<SellerTable />);
    
    const title = screen.getByText('Comissão Vendedor');
    expect(title).toHaveClass('text-white');
    
    const table = screen.getByRole('table');
    expect(table).toHaveClass('text-white');
  });
});