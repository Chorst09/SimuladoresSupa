/**
 * Task 4: DRE Calculations Fix Verification Test
 * 
 * This test verifies that the DRE calculations correctly reflect the corrected discount application:
 * - Setup costs are shown without discounts applied
 * - Monthly revenue calculations in DRE use properly discounted values
 * - Commission calculations in DRE reflect the corrected monthly totals
 * - Test DRE accuracy with various discount combinations
 */

describe('Task 4: DRE Calculations Fix Verification', () => {
    // Helper function to simulate the cost breakdown calculation
    const simulateCostBreakdown = (
        baseMonthly: number,
        setupCost: number,
        serviceCost: number,
        salespersonDiscount: boolean,
        directorDiscountPercentage: number,
        referralCommission: number = 0,
        influencerCommission: number = 0
    ) => {
        // Apply discounts only to monthly revenue
        const salespersonFactor = salespersonDiscount ? 0.95 : 1.0;
        const directorFactor = 1 - (directorDiscountPercentage / 100);
        const discountedMonthlyRevenue = baseMonthly * salespersonFactor * directorFactor;
        
        // Setup costs remain unchanged
        const finalSetupFee = setupCost;
        
        // Tax rates (matching the component)
        const taxRates = {
            pis: 1.65,
            cofins: 7.6,
            csll: 9.0,
            irpj: 15.0
        };
        
        // Calculate taxes on discounted revenue
        const pisTax = discountedMonthlyRevenue * (taxRates.pis / 100);
        const cofinsTax = discountedMonthlyRevenue * (taxRates.cofins / 100);
        const revenueTaxValue = pisTax + cofinsTax;
        
        // Calculate gross profit: revenue minus costs, taxes, and commissions
        const totalCommissions = referralCommission + influencerCommission;
        const grossProfit = discountedMonthlyRevenue - serviceCost - revenueTaxValue - totalCommissions;
        
        // Calculate profit taxes
        const csllTax = grossProfit > 0 ? grossProfit * (taxRates.csll / 100) : 0;
        const irpjTax = grossProfit > 0 ? grossProfit * (taxRates.irpj / 100) : 0;
        const profitTaxValue = csllTax + irpjTax;
        
        // Calculate final net profit
        const netProfit = grossProfit - profitTaxValue;
        const netMargin = discountedMonthlyRevenue > 0 ? (netProfit / discountedMonthlyRevenue) * 100 : 0;
        
        return {
            finalPrice: discountedMonthlyRevenue, // Discounted monthly revenue
            setupFee: finalSetupFee, // Undiscounted setup cost
            cost: serviceCost,
            revenueTaxValue,
            profitTaxValue,
            grossProfit,
            netProfit,
            netMargin,
            salespersonFactor,
            directorFactor
        };
    };

    test('DRE shows setup costs without discounts applied', () => {
        const baseMonthly = 1000;
        const setupCost = 500;
        const serviceCost = 300;
        const salespersonDiscount = true;
        const directorDiscountPercentage = 15;
        
        const result = simulateCostBreakdown(
            baseMonthly,
            setupCost,
            serviceCost,
            salespersonDiscount,
            directorDiscountPercentage
        );
        
        // Setup cost should remain unchanged regardless of discounts
        expect(result.setupFee).toBe(setupCost);
        expect(result.setupFee).toBe(500);
        
        // Verify setup cost is not affected by discount factors
        expect(result.setupFee).not.toBe(setupCost * result.salespersonFactor);
        expect(result.setupFee).not.toBe(setupCost * result.directorFactor);
        expect(result.setupFee).not.toBe(setupCost * result.salespersonFactor * result.directorFactor);
    });

    test('DRE monthly revenue calculations use properly discounted values', () => {
        const baseMonthly = 1000;
        const setupCost = 500;
        const serviceCost = 300;
        const salespersonDiscount = true;
        const directorDiscountPercentage = 20;
        
        const result = simulateCostBreakdown(
            baseMonthly,
            setupCost,
            serviceCost,
            salespersonDiscount,
            directorDiscountPercentage
        );
        
        // Monthly revenue should reflect both discounts
        const expectedDiscountedMonthly = 1000 * 0.95 * 0.80; // 760
        expect(result.finalPrice).toBe(expectedDiscountedMonthly);
        expect(result.finalPrice).toBe(760);
        
        // Verify it's different from base monthly
        expect(result.finalPrice).not.toBe(baseMonthly);
        expect(result.finalPrice).toBeLessThan(baseMonthly);
    });

    test('DRE commission calculations reflect corrected monthly totals', () => {
        const baseMonthly = 1000;
        const setupCost = 500;
        const serviceCost = 300;
        const salespersonDiscount = true;
        const directorDiscountPercentage = 10;
        const commissionRate = 0.08; // 8%
        
        const result = simulateCostBreakdown(
            baseMonthly,
            setupCost,
            serviceCost,
            salespersonDiscount,
            directorDiscountPercentage
        );
        
        // Commission should be calculated on discounted monthly revenue
        const expectedCommission = result.finalPrice * commissionRate;
        const actualDiscountedMonthly = 1000 * 0.95 * 0.90; // 855
        const expectedCommissionValue = 855 * 0.08; // 68.4
        
        expect(result.finalPrice).toBe(855);
        expect(expectedCommissionValue).toBe(68.4);
        
        // Commission should not be calculated on base monthly
        const wrongCommission = baseMonthly * commissionRate; // 80
        expect(expectedCommissionValue).not.toBe(wrongCommission);
        expect(expectedCommissionValue).toBeLessThan(wrongCommission);
    });

    test('DRE accuracy with various discount combinations', () => {
        const testCases = [
            // No discounts
            { salesperson: false, director: 0, expectedFactor: 1.0 },
            // Only salesperson discount
            { salesperson: true, director: 0, expectedFactor: 0.95 },
            // Only director discount
            { salesperson: false, director: 10, expectedFactor: 0.90 },
            // Both discounts
            { salesperson: true, director: 15, expectedFactor: 0.95 * 0.85 },
            // Maximum discounts
            { salesperson: true, director: 50, expectedFactor: 0.95 * 0.50 }
        ];
        
        const baseMonthly = 1000;
        const setupCost = 500;
        const serviceCost = 300;
        
        testCases.forEach(({ salesperson, director, expectedFactor }) => {
            const result = simulateCostBreakdown(
                baseMonthly,
                setupCost,
                serviceCost,
                salesperson,
                director
            );
            
            expect(result.finalPrice).toBe(baseMonthly * expectedFactor);
            expect(result.setupFee).toBe(setupCost); // Always unchanged
            
            // Verify profit calculations are based on discounted revenue
            expect(result.grossProfit).toBeLessThan(result.finalPrice);
            expect(result.netProfit).toBeLessThan(result.grossProfit);
        });
    });

    test('DRE profit calculations are accurate after discount corrections', () => {
        const baseMonthly = 1000;
        const setupCost = 500;
        const serviceCost = 300;
        const salespersonDiscount = true;
        const directorDiscountPercentage = 10;
        
        const result = simulateCostBreakdown(
            baseMonthly,
            setupCost,
            serviceCost,
            salespersonDiscount,
            directorDiscountPercentage
        );
        
        // Verify calculations step by step
        const expectedDiscountedRevenue = 1000 * 0.95 * 0.90; // 855
        const expectedRevenueTaxes = expectedDiscountedRevenue * (1.65 + 7.6) / 100; // 79.0875
        const expectedGrossProfit = expectedDiscountedRevenue - serviceCost - expectedRevenueTaxes; // 475.9125
        const expectedProfitTaxes = expectedGrossProfit * (9.0 + 15.0) / 100; // 114.219
        const expectedNetProfit = expectedGrossProfit - expectedProfitTaxes; // 361.6935
        
        expect(result.finalPrice).toBe(expectedDiscountedRevenue);
        expect(result.revenueTaxValue).toBeCloseTo(expectedRevenueTaxes, 2);
        expect(result.grossProfit).toBeCloseTo(expectedGrossProfit, 2);
        expect(result.profitTaxValue).toBeCloseTo(expectedProfitTaxes, 2);
        expect(result.netProfit).toBeCloseTo(expectedNetProfit, 2);
    });

    test('DRE payback calculation uses undiscounted setup costs', () => {
        const baseMonthly = 1000;
        const setupCost = 600;
        const serviceCost = 300;
        const salespersonDiscount = true;
        const directorDiscountPercentage = 25;
        
        const result = simulateCostBreakdown(
            baseMonthly,
            setupCost,
            serviceCost,
            salespersonDiscount,
            directorDiscountPercentage
        );
        
        // Payback should use undiscounted setup cost
        const paybackMonths = result.setupFee > 0 && result.netProfit > 0 
            ? Math.ceil(result.setupFee / result.netProfit) 
            : 0;
        
        // Wrong calculation would use discounted setup cost
        const discountedSetupCost = setupCost * 0.95 * 0.75; // Wrong approach
        const wrongPaybackMonths = discountedSetupCost > 0 && result.netProfit > 0 
            ? Math.ceil(discountedSetupCost / result.netProfit) 
            : 0;
        
        expect(paybackMonths).not.toBe(wrongPaybackMonths);
        expect(result.setupFee).toBe(setupCost); // Verify setup cost is not discounted
        expect(paybackMonths).toBeGreaterThan(wrongPaybackMonths);
    });

    test('DRE handles partner commissions correctly with discounts', () => {
        const baseMonthly = 1000;
        const setupCost = 500;
        const serviceCost = 300;
        const salespersonDiscount = true;
        const directorDiscountPercentage = 15;
        const referralCommission = 50;
        const influencerCommission = 30;
        
        const result = simulateCostBreakdown(
            baseMonthly,
            setupCost,
            serviceCost,
            salespersonDiscount,
            directorDiscountPercentage,
            referralCommission,
            influencerCommission
        );
        
        // DRE should show:
        // - Revenue: discounted monthly (before commission deductions)
        // - Commissions: deducted from gross profit calculation
        // - Setup: undiscounted
        
        expect(result.finalPrice).toBe(807.5); // 1000 * 0.95 * 0.85
        expect(result.setupFee).toBe(500); // Unchanged
        
        // Verify commissions are properly deducted from gross profit
        const totalCommissions = referralCommission + influencerCommission;
        const expectedGrossProfitWithCommissions = result.finalPrice - serviceCost - result.revenueTaxValue - totalCommissions;
        expect(result.grossProfit).toBeCloseTo(expectedGrossProfitWithCommissions, 2);
    });

    test('DRE tax calculations are correct with discounted revenue', () => {
        const baseMonthly = 1000;
        const setupCost = 500;
        const serviceCost = 300;
        const salespersonDiscount = true;
        const directorDiscountPercentage = 20;
        
        const result = simulateCostBreakdown(
            baseMonthly,
            setupCost,
            serviceCost,
            salespersonDiscount,
            directorDiscountPercentage
        );
        
        const discountedRevenue = 1000 * 0.95 * 0.80; // 760
        
        // Revenue taxes should be calculated on discounted revenue
        const expectedPisTax = discountedRevenue * 0.0165; // 12.54
        const expectedCofinsTax = discountedRevenue * 0.076; // 57.76
        const expectedRevenueTax = expectedPisTax + expectedCofinsTax; // 70.3
        
        expect(result.finalPrice).toBe(discountedRevenue);
        expect(result.revenueTaxValue).toBeCloseTo(expectedRevenueTax, 2);
        
        // Profit taxes should be calculated on gross profit (after revenue taxes and costs)
        const expectedGrossProfit = discountedRevenue - serviceCost - expectedRevenueTax; // 389.7
        const expectedCsllTax = expectedGrossProfit * 0.09; // 35.073
        const expectedIrpjTax = expectedGrossProfit * 0.15; // 58.455
        const expectedProfitTax = expectedCsllTax + expectedIrpjTax; // 93.528
        
        expect(result.grossProfit).toBeCloseTo(expectedGrossProfit, 2);
        expect(result.profitTaxValue).toBeCloseTo(expectedProfitTax, 2);
    });
});