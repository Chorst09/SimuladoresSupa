import {
  getCommissionRate,
  getDirectorCommissionRate,
  getChannelSellerCommissionRate,
  getSellerCommissionRate,
  getChannelInfluencerCommissionRate,
  getChannelIndicatorCommissionRate,
  type CommissionChannelInfluencer,
  type CommissionChannelIndicator,
  type CommissionChannelDirector,
  type CommissionChannelSeller,
  type CommissionSeller
} from '@/hooks/use-commissions';

describe('Commission Rate Utility Functions', () => {
  const mockChannelInfluencerData: CommissionChannelInfluencer[] = [
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
    }
  ];

  const mockChannelIndicatorData: CommissionChannelIndicator[] = [
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
  ];

  const mockChannelDirector: CommissionChannelDirector = {
    id: 1,
    months_12: 0,
    months_24: 0,
    months_36: 0,
    months_48: 0,
    months_60: 0
  };

  const mockChannelSeller: CommissionChannelSeller = {
    id: 1,
    months_12: 0.60,
    months_24: 1.20,
    months_36: 2.00,
    months_48: 2.00,
    months_60: 2.00
  };

  const mockSeller: CommissionSeller = {
    id: 1,
    months_12: 1.2,
    months_24: 2.4,
    months_36: 3.6,
    months_48: 3.6,
    months_60: 3.6
  };

  describe('getCommissionRate', () => {
    it('should return correct commission rate for revenue within first range', () => {
      const rate = getCommissionRate(mockChannelInfluencerData, 300, 12);
      expect(rate).toBe(1.50);
    });

    it('should return correct commission rate for revenue within second range', () => {
      const rate = getCommissionRate(mockChannelInfluencerData, 750, 24);
      expect(rate).toBe(3.25);
    });

    it('should return correct commission rate for revenue within third range', () => {
      const rate = getCommissionRate(mockChannelInfluencerData, 1200, 36);
      expect(rate).toBe(5.00);
    });

    it('should return correct commission rate based on contract period', () => {
      expect(getCommissionRate(mockChannelInfluencerData, 300, 10)).toBe(1.50); // 12 months
      expect(getCommissionRate(mockChannelInfluencerData, 300, 20)).toBe(2.00); // 24 months
      expect(getCommissionRate(mockChannelInfluencerData, 300, 30)).toBe(2.50); // 36 months
      expect(getCommissionRate(mockChannelInfluencerData, 300, 40)).toBe(2.50); // 48 months
      expect(getCommissionRate(mockChannelInfluencerData, 300, 60)).toBe(2.50); // 60 months
    });

    it('should return 0 for revenue outside all ranges', () => {
      const rate = getCommissionRate(mockChannelInfluencerData, 2000, 12);
      expect(rate).toBe(0);
    });

    it('should return 0 for empty commission array', () => {
      const rate = getCommissionRate([], 300, 12);
      expect(rate).toBe(0);
    });
  });

  describe('getDirectorCommissionRate', () => {
    it('should return correct commission rate for different periods', () => {
      expect(getDirectorCommissionRate(mockChannelDirector, 10)).toBe(0); // 12 months
      expect(getDirectorCommissionRate(mockChannelDirector, 20)).toBe(0); // 24 months
      expect(getDirectorCommissionRate(mockChannelDirector, 30)).toBe(0); // 36 months
      expect(getDirectorCommissionRate(mockChannelDirector, 40)).toBe(0); // 48 months
      expect(getDirectorCommissionRate(mockChannelDirector, 60)).toBe(0); // 60 months
    });

    it('should return 0 when commission data is null', () => {
      const rate = getDirectorCommissionRate(null, 12);
      expect(rate).toBe(0);
    });
  });

  describe('getChannelSellerCommissionRate', () => {
    it('should return correct commission rate for different periods', () => {
      expect(getChannelSellerCommissionRate(mockChannelSeller, 10)).toBe(0.60); // 12 months
      expect(getChannelSellerCommissionRate(mockChannelSeller, 20)).toBe(1.20); // 24 months
      expect(getChannelSellerCommissionRate(mockChannelSeller, 30)).toBe(2.00); // 36 months
      expect(getChannelSellerCommissionRate(mockChannelSeller, 40)).toBe(2.00); // 48 months
      expect(getChannelSellerCommissionRate(mockChannelSeller, 60)).toBe(2.00); // 60 months
    });

    it('should return 0 when commission data is null', () => {
      const rate = getChannelSellerCommissionRate(null, 12);
      expect(rate).toBe(0);
    });
  });

  describe('getSellerCommissionRate', () => {
    it('should return correct commission rate for different periods', () => {
      expect(getSellerCommissionRate(mockSeller, 10)).toBe(1.2); // 12 months
      expect(getSellerCommissionRate(mockSeller, 20)).toBe(2.4); // 24 months
      expect(getSellerCommissionRate(mockSeller, 30)).toBe(3.6); // 36 months
      expect(getSellerCommissionRate(mockSeller, 40)).toBe(3.6); // 48 months
      expect(getSellerCommissionRate(mockSeller, 60)).toBe(3.6); // 60 months
    });

    it('should return 0 when commission data is null', () => {
      const rate = getSellerCommissionRate(null, 12);
      expect(rate).toBe(0);
    });
  });

  describe('getChannelInfluencerCommissionRate', () => {
    it('should return correct commission rate for revenue within range', () => {
      const rate = getChannelInfluencerCommissionRate(mockChannelInfluencerData, 300, 12);
      expect(rate).toBe(1.50);
    });

    it('should return correct commission rate for different periods', () => {
      expect(getChannelInfluencerCommissionRate(mockChannelInfluencerData, 300, 10)).toBe(1.50); // 12 months
      expect(getChannelInfluencerCommissionRate(mockChannelInfluencerData, 300, 20)).toBe(2.00); // 24 months
      expect(getChannelInfluencerCommissionRate(mockChannelInfluencerData, 300, 30)).toBe(2.50); // 36 months
      expect(getChannelInfluencerCommissionRate(mockChannelInfluencerData, 300, 40)).toBe(2.50); // 48 months
      expect(getChannelInfluencerCommissionRate(mockChannelInfluencerData, 300, 60)).toBe(2.50); // 60 months
    });

    it('should return 0 for revenue outside all ranges', () => {
      const rate = getChannelInfluencerCommissionRate(mockChannelInfluencerData, 2000, 12);
      expect(rate).toBe(0);
    });

    it('should return 0 when commission data is null', () => {
      const rate = getChannelInfluencerCommissionRate(null, 300, 12);
      expect(rate).toBe(0);
    });

    it('should return 0 when commission data is empty array', () => {
      const rate = getChannelInfluencerCommissionRate([], 300, 12);
      expect(rate).toBe(0);
    });
  });

  describe('getChannelIndicatorCommissionRate', () => {
    it('should return correct commission rate for revenue within range', () => {
      const rate = getChannelIndicatorCommissionRate(mockChannelIndicatorData, 300, 12);
      expect(rate).toBe(0.50);
    });

    it('should return correct commission rate for different periods', () => {
      expect(getChannelIndicatorCommissionRate(mockChannelIndicatorData, 300, 10)).toBe(0.50); // 12 months
      expect(getChannelIndicatorCommissionRate(mockChannelIndicatorData, 300, 20)).toBe(0.67); // 24 months
      expect(getChannelIndicatorCommissionRate(mockChannelIndicatorData, 300, 30)).toBe(0.83); // 36 months
      expect(getChannelIndicatorCommissionRate(mockChannelIndicatorData, 300, 40)).toBe(0.83); // 48 months
      expect(getChannelIndicatorCommissionRate(mockChannelIndicatorData, 300, 60)).toBe(0.83); // 60 months
    });

    it('should return 0 for revenue outside all ranges', () => {
      const rate = getChannelIndicatorCommissionRate(mockChannelIndicatorData, 2000, 12);
      expect(rate).toBe(0);
    });

    it('should return 0 when commission data is null', () => {
      const rate = getChannelIndicatorCommissionRate(null, 300, 12);
      expect(rate).toBe(0);
    });

    it('should return 0 when commission data is empty array', () => {
      const rate = getChannelIndicatorCommissionRate([], 300, 12);
      expect(rate).toBe(0);
    });
  });

  describe('Edge cases and boundary testing', () => {
    it('should handle exact boundary values correctly', () => {
      // Test exact boundary at 500
      expect(getCommissionRate(mockChannelInfluencerData, 500, 12)).toBe(1.50);
      expect(getCommissionRate(mockChannelInfluencerData, 500.01, 12)).toBe(2.51);
      
      // Test exact boundary at 1000
      expect(getCommissionRate(mockChannelInfluencerData, 1000, 12)).toBe(2.51);
      expect(getCommissionRate(mockChannelInfluencerData, 1000.01, 12)).toBe(4.01);
    });

    it('should handle zero and negative values', () => {
      expect(getCommissionRate(mockChannelInfluencerData, 0, 12)).toBe(1.50);
      expect(getCommissionRate(mockChannelInfluencerData, -100, 12)).toBe(0);
    });

    it('should handle extreme contract periods', () => {
      expect(getCommissionRate(mockChannelInfluencerData, 300, 1)).toBe(1.50); // Very short
      expect(getCommissionRate(mockChannelInfluencerData, 300, 120)).toBe(2.50); // Very long
    });
  });
});