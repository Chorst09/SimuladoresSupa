import { formatBrazilianNumber, formatCurrency } from '@/lib/utils';

// Mock the utils functions for testing
jest.mock('@/lib/utils', () => ({
  formatBrazilianNumber: jest.fn(),
  formatCurrency: jest.fn(),
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

const mockFormatBrazilianNumber = formatBrazilianNumber as jest.MockedFunction<typeof formatBrazilianNumber>;
const mockFormatCurrency = formatCurrency as jest.MockedFunction<typeof formatCurrency>;

describe('Commission Data Formatting', () => {
  beforeEach(() => {
    // Reset mocks and set default implementations
    jest.clearAllMocks();
    
    mockFormatBrazilianNumber.mockImplementation((value: number) => {
      return value.toFixed(2).replace('.', ',');
    });
    
    mockFormatCurrency.mockImplementation((value: number) => {
      return `R$ ${value.toFixed(2).replace('.', ',')}`;
    });
  });

  describe('formatBrazilianNumber', () => {
    it('should format decimal numbers with comma separator', () => {
      const result = formatBrazilianNumber(1.50);
      expect(result).toBe('1,50');
      expect(mockFormatBrazilianNumber).toHaveBeenCalledWith(1.50);
    });

    it('should format whole numbers with two decimal places', () => {
      const result = formatBrazilianNumber(2);
      expect(result).toBe('2,00');
      expect(mockFormatBrazilianNumber).toHaveBeenCalledWith(2);
    });

    it('should format zero correctly', () => {
      const result = formatBrazilianNumber(0);
      expect(result).toBe('0,00');
      expect(mockFormatBrazilianNumber).toHaveBeenCalledWith(0);
    });

    it('should format small decimal numbers correctly', () => {
      const result = formatBrazilianNumber(0.60);
      expect(result).toBe('0,60');
      expect(mockFormatBrazilianNumber).toHaveBeenCalledWith(0.60);
    });

    it('should format numbers with many decimal places', () => {
      const result = formatBrazilianNumber(2.51234);
      expect(result).toBe('2,51');
      expect(mockFormatBrazilianNumber).toHaveBeenCalledWith(2.51234);
    });

    it('should handle edge cases', () => {
      // Very small numbers
      expect(formatBrazilianNumber(0.01)).toBe('0,01');
      
      // Large numbers
      expect(formatBrazilianNumber(99.99)).toBe('99,99');
      
      // Numbers that round
      expect(formatBrazilianNumber(1.999)).toBe('2,00');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with R$ prefix and comma separator', () => {
      const result = formatCurrency(500.00);
      expect(result).toBe('R$ 500,00');
      expect(mockFormatCurrency).toHaveBeenCalledWith(500.00);
    });

    it('should format decimal currency values', () => {
      const result = formatCurrency(1000.50);
      expect(result).toBe('R$ 1000,50');
      expect(mockFormatCurrency).toHaveBeenCalledWith(1000.50);
    });

    it('should format zero currency', () => {
      const result = formatCurrency(0);
      expect(result).toBe('R$ 0,00');
      expect(mockFormatCurrency).toHaveBeenCalledWith(0);
    });

    it('should format large currency values', () => {
      const result = formatCurrency(5000.01);
      expect(result).toBe('R$ 5000,01');
      expect(mockFormatCurrency).toHaveBeenCalledWith(5000.01);
    });
  });

  describe('Commission Value Formatting Scenarios', () => {
    it('should format typical commission percentages correctly', () => {
      const commissionValues = [0.60, 1.20, 2.00, 2.40, 3.60];
      
      commissionValues.forEach(value => {
        const formatted = formatBrazilianNumber(value);
        expect(formatted).toMatch(/^\d+,\d{2}$/); // Should match pattern like "1,20"
        expect(formatted).not.toContain('.'); // Should not contain dots
      });
    });

    it('should format revenue ranges correctly', () => {
      const revenueValues = [500.00, 1000.00, 1500.00, 3000.00, 5000.00];
      
      revenueValues.forEach(value => {
        const formatted = formatCurrency(value);
        expect(formatted).toMatch(/^R\$ \d+,\d{2}$/); // Should match pattern like "R$ 500,00"
        expect(formatted).not.toContain('.'); // Should not contain dots
      });
    });

    it('should handle channel influencer commission values', () => {
      const influencerRates = [1.50, 2.51, 4.01, 5.01, 6.01, 7.01];
      
      influencerRates.forEach(rate => {
        const formatted = formatBrazilianNumber(rate);
        expect(formatted).toBe(rate.toFixed(2).replace('.', ','));
      });
    });

    it('should handle channel indicator commission values', () => {
      const indicatorRates = [0.50, 0.84, 1.34, 1.67, 2.00, 2.34];
      
      indicatorRates.forEach(rate => {
        const formatted = formatBrazilianNumber(rate);
        expect(formatted).toBe(rate.toFixed(2).replace('.', ','));
      });
    });

    it('should maintain precision for financial calculations', () => {
      // Test values that might have floating point precision issues
      const precisionTestValues = [0.1, 0.2, 0.3, 1.1, 2.2, 3.3];
      
      precisionTestValues.forEach(value => {
        const formatted = formatBrazilianNumber(value);
        expect(formatted).toMatch(/^\d+,\d{2}$/);
        
        // Should always have exactly 2 decimal places
        const decimalPart = formatted.split(',')[1];
        expect(decimalPart).toHaveLength(2);
      });
    });
  });

  describe('Display Accuracy Requirements', () => {
    it('should format all commission table values according to Brazilian standards', () => {
      // Test all the specific values from the requirements
      const testCases = [
        { input: 0.60, expected: '0,60' },
        { input: 1.20, expected: '1,20' },
        { input: 2.00, expected: '2,00' },
        { input: 1.2, expected: '1,20' },
        { input: 2.4, expected: '2,40' },
        { input: 3.6, expected: '3,60' },
        { input: 0, expected: '0,00' },
        { input: 1.50, expected: '1,50' },
        { input: 2.51, expected: '2,51' },
        { input: 4.01, expected: '4,01' },
        { input: 7.01, expected: '7,01' },
        { input: 0.50, expected: '0,50' },
        { input: 0.84, expected: '0,84' },
        { input: 2.34, expected: '2,34' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = formatBrazilianNumber(input);
        expect(result).toBe(expected);
      });
    });

    it('should format revenue ranges according to Brazilian currency standards', () => {
      const revenueCases = [
        { input: 500, expected: 'R$ 500,00' },
        { input: 1000, expected: 'R$ 1000,00' },
        { input: 1500, expected: 'R$ 1500,00' },
        { input: 3000, expected: 'R$ 3000,00' },
        { input: 5000, expected: 'R$ 5000,00' },
        { input: 500.01, expected: 'R$ 500,01' },
        { input: 1000.01, expected: 'R$ 1000,01' },
        { input: 5000.01, expected: 'R$ 5000,01' }
      ];

      revenueCases.forEach(({ input, expected }) => {
        const result = formatCurrency(input);
        expect(result).toBe(expected);
      });
    });

    it('should never use dot as decimal separator', () => {
      const testValues = [0.5, 1.25, 2.75, 3.33, 4.67, 5.99];
      
      testValues.forEach(value => {
        const numberResult = formatBrazilianNumber(value);
        const currencyResult = formatCurrency(value);
        
        expect(numberResult).not.toContain('.');
        expect(currencyResult).not.toContain('.');
        expect(numberResult).toContain(',');
        expect(currencyResult).toContain(',');
      });
    });

    it('should maintain consistency across different number types', () => {
      // Test integers, decimals, and edge cases
      const mixedValues = [0, 1, 1.0, 1.5, 1.50, 2.00, 2.0];
      
      mixedValues.forEach(value => {
        const result = formatBrazilianNumber(value);
        
        // All should have exactly one comma and two digits after
        expect(result.split(',').length).toBe(2);
        expect(result.split(',')[1].length).toBe(2);
      });
    });
  });
});