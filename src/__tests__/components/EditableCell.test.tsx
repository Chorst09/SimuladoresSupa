import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditableCell } from '@/components/ui/editable-cell';

describe('EditableCell', () => {
  const mockOnSave = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it('should render value in display mode', () => {
    render(<EditableCell value={5.5} onSave={mockOnSave} />);
    
    expect(screen.getByText('5,50%')).toBeInTheDocument();
  });

  it('should enter edit mode when clicked', () => {
    render(<EditableCell value={5.5} onSave={mockOnSave} />);
    
    const cell = screen.getByText('5,50%').closest('div');
    fireEvent.click(cell!);
    
    expect(screen.getByDisplayValue('5.5')).toBeInTheDocument();
  });

  it('should save value when Enter is pressed', async () => {
    render(<EditableCell value={5.5} onSave={mockOnSave} />);
    
    const cell = screen.getByText('5,50%').closest('div');
    fireEvent.click(cell!);
    
    const input = screen.getByDisplayValue('5.5');
    fireEvent.change(input, { target: { value: '7.2' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(7.2);
    });
  });

  it('should cancel edit when Escape is pressed', () => {
    render(<EditableCell value={5.5} onSave={mockOnSave} />);
    
    const cell = screen.getByText('5,50%').closest('div');
    fireEvent.click(cell!);
    
    const input = screen.getByDisplayValue('5.5');
    fireEvent.change(input, { target: { value: '7.2' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    
    expect(screen.getByText('5,50%')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should save value when check button is clicked', async () => {
    render(<EditableCell value={5.5} onSave={mockOnSave} />);
    
    const cell = screen.getByText('5,50%').closest('div');
    fireEvent.click(cell!);
    
    const input = screen.getByDisplayValue('5.5');
    fireEvent.change(input, { target: { value: '8.3' } });
    
    const checkButton = screen.getByRole('button');
    fireEvent.click(checkButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(8.3);
    });
  });

  it('should be disabled when disabled prop is true', () => {
    render(<EditableCell value={5.5} onSave={mockOnSave} disabled />);
    
    const cell = screen.getByText('5,50%');
    fireEvent.click(cell);
    
    // Should not enter edit mode
    expect(screen.queryByDisplayValue('5.5')).not.toBeInTheDocument();
  });

  it('should handle invalid input gracefully', async () => {
    render(<EditableCell value={5.5} onSave={mockOnSave} />);
    
    const cell = screen.getByText('5,50%').closest('div');
    fireEvent.click(cell!);
    
    const input = screen.getByDisplayValue('5.5');
    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText('5,50%')).toBeInTheDocument();
    });
    
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});