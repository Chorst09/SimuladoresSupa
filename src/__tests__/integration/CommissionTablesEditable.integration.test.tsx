import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommissionTablesUnified from '@/components/calculators/CommissionTablesUnified';

// Mock do hook useCommissions
jest.mock('@/hooks/use-commissions', () => ({
  useCommissions: () => ({
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
      }
    ],
    isLoading: false,
    error: null,
    refreshData: jest.fn()
  })
}));

// Mock do hook useCommissionsEditor
const mockUpdateCommission = jest.fn();
jest.mock('@/hooks/use-commissions-editor', () => ({
  useCommissionsEditor: () => ({
    updateCommission: mockUpdateCommission,
    isUpdating: false
  })
}));

// Mock da API fetch
global.fetch = jest.fn();

describe('CommissionTablesUnified - Editable Mode', () => {
  beforeEach(() => {
    mockUpdateCommission.mockClear();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render in read-only mode by default', () => {
    render(<CommissionTablesUnified />);
    
    // Should show values but not be editable
    expect(screen.getByText('0,60%')).toBeInTheDocument();
    expect(screen.getByText('1,20%')).toBeInTheDocument();
    
    // Should not have edit icons
    expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument();
  });

  it('should render in editable mode when editable prop is true', () => {
    render(<CommissionTablesUnified editable />);
    
    // Should show values
    expect(screen.getByText('0,60%')).toBeInTheDocument();
    
    // Values should be clickable for editing
    const editableCell = screen.getByText('0,60%').closest('div');
    expect(editableCell).toHaveClass('cursor-pointer');
  });

  it('should allow editing channel seller commission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(<CommissionTablesUnified editable />);
    
    // Click on a commission value to edit
    const cell = screen.getByText('0,60%').closest('div');
    fireEvent.click(cell!);
    
    // Should show input field
    const input = screen.getByDisplayValue('0.6');
    expect(input).toBeInTheDocument();
    
    // Change value
    fireEvent.change(input, { target: { value: '1.5' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Should call update function
    await waitFor(() => {
      expect(mockUpdateCommission).toHaveBeenCalledWith({
        table: 'channel_seller',
        id: 1,
        field: 'months_12',
        value: 1.5
      });
    });
  });

  it('should allow editing channel influencer commission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(<CommissionTablesUnified editable />);
    
    // Find and click on influencer commission value
    const influencerCell = screen.getByText('1,50%').closest('div');
    fireEvent.click(influencerCell!);
    
    // Should show input field
    const input = screen.getByDisplayValue('1.5');
    expect(input).toBeInTheDocument();
    
    // Change value
    fireEvent.change(input, { target: { value: '2.0' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Should call update function
    await waitFor(() => {
      expect(mockUpdateCommission).toHaveBeenCalledWith({
        table: 'channel_influencer',
        id: 1,
        field: 'months_12',
        value: 2.0
      });
    });
  });

  it('should handle edit cancellation', () => {
    render(<CommissionTablesUnified editable />);
    
    // Click on a commission value to edit
    const cell = screen.getByText('0,60%').closest('div');
    fireEvent.click(cell!);
    
    // Should show input field
    const input = screen.getByDisplayValue('0.6');
    
    // Change value but cancel
    fireEvent.change(input, { target: { value: '1.5' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    
    // Should return to display mode without saving
    expect(screen.getByText('0,60%')).toBeInTheDocument();
    expect(mockUpdateCommission).not.toHaveBeenCalled();
  });

  it('should show all commission tables', () => {
    render(<CommissionTablesUnified editable />);
    
    // Should show all table titles
    expect(screen.getByText('Comissão Canal/Vendedor')).toBeInTheDocument();
    expect(screen.getByText('Comissão Canal Influenciador')).toBeInTheDocument();
    expect(screen.getByText('Comissão Canal Indicador')).toBeInTheDocument();
    expect(screen.getByText('Comissão Vendedor')).toBeInTheDocument();
    expect(screen.getByText('Comissão Diretor')).toBeInTheDocument();
  });
});