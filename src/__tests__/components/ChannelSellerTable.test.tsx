import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChannelSellerTable from '@/components/calculators/ChannelSellerTable';

describe('ChannelSellerTable', () => {
  it('should render the table title correctly', () => {
    render(<ChannelSellerTable />);
    
    expect(screen.getByText('Comissão Canal/Vendedor')).toBeInTheDocument();
  });

  it('should render all table headers', () => {
    render(<ChannelSellerTable />);
    
    expect(screen.getByText('Período')).toBeInTheDocument();
    expect(screen.getByText('Comissão')).toBeInTheDocument();
  });

  it('should render all commission periods and values', () => {
    render(<ChannelSellerTable />);
    
    // Check periods
    expect(screen.getByText('12 meses')).toBeInTheDocument();
    expect(screen.getByText('24 meses')).toBeInTheDocument();
    expect(screen.getByText('36 meses')).toBeInTheDocument();
    expect(screen.getByText('48 meses')).toBeInTheDocument();
    expect(screen.getByText('60 meses')).toBeInTheDocument();
    
    // Check commission values
    expect(screen.getByText('0,60%')).toBeInTheDocument();
    expect(screen.getByText('1,20%')).toBeInTheDocument();
    expect(screen.getAllByText('2,00%')).toHaveLength(3); // 36, 48, 60 months
  });

  it('should apply dark theme styling', () => {
    render(<ChannelSellerTable />);
    
    const container = document.querySelector('.bg-slate-900');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('rounded-lg', 'p-4');
  });

  it('should apply custom className when provided', () => {
    render(<ChannelSellerTable className="custom-test-class" />);
    
    const container = document.querySelector('.custom-test-class');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('bg-slate-900');
  });

  it('should have proper table structure', () => {
    render(<ChannelSellerTable />);
    
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(6); // 1 header + 5 data rows
  });

  it('should have accessible table headers', () => {
    render(<ChannelSellerTable />);
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveTextContent('Período');
    expect(headers[1]).toHaveTextContent('Comissão');
  });

  it('should display commission values with monospace font', () => {
    render(<ChannelSellerTable />);
    
    const commissionCells = document.querySelectorAll('.font-mono');
    expect(commissionCells.length).toBeGreaterThan(0);
    
    // Check that commission values have monospace font
    expect(screen.getByText('0,60%').closest('td')).toHaveClass('font-mono');
    expect(screen.getByText('1,20%').closest('td')).toHaveClass('font-mono');
  });

  it('should have hover effects on table rows', () => {
    render(<ChannelSellerTable />);
    
    const dataRows = document.querySelectorAll('tbody tr');
    dataRows.forEach(row => {
      expect(row).toHaveClass('hover:bg-slate-800/50');
    });
  });

  it('should have proper border styling', () => {
    render(<ChannelSellerTable />);
    
    const headerRow = document.querySelector('thead tr');
    expect(headerRow).toHaveClass('border-b', 'border-slate-700');
    
    const dataRows = document.querySelectorAll('tbody tr');
    dataRows.forEach(row => {
      expect(row).toHaveClass('border-b', 'border-slate-800');
    });
  });

  it('should be responsive with overflow scroll', () => {
    render(<ChannelSellerTable />);
    
    const scrollContainer = document.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
  });
});