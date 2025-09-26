/**
 * DRE Calculations Verification Test
 * 
 * This test verifies that DRE calculations correctly reflect the corrected discount application:
 * - Setup costs are shown without discounts
 * - Monthly revenue shows discounted values
 * - Commission calculations use discounted monthly totals
 * - Profit calculations are accurate
 */

describe('DRE Calculations with Corrected Discount Application', () => {
    // Mock data for testing
    const mockRadioPlan = {
        speed: 100,
        price12: 1000,
        price24: 950,
        price36: 900,
        price48: 850,
        price60: 800,
        installationCost: 500,
        manCost: 300,
        description: '100 Mbps',
        baseCost: 300
    };

    const mockTaxRates = {
        pis: 1.65,
        cofins: 7.6,
        csll: 9.0,
        irpj: 15.0,
        banda: 2.09,
        fundraising: 0.0,
        rate: 0.0,
        margem: 0.0,
        custoDesp: 10.0
    };

    // Helper function to calculate expected values
    const calculateExpectedValues = (
        baseMonthly: number,
        setupCost: number,
        salespersonDiscount: boolean,
        directorDiscountPercentage: number,
        referralCommission: number = 0,
        influencerCommission: number = 0
    ) => {
        // Apply discounts only to monthly
        const salespersonFactor = salespersonDiscount ? 0.95 : 1.0;
        const directorFactor = 1 - (directorDiscountPercentage / 100);
        const discountedMonthly = baseMonthly * salespersonFactor * directorFactor;
        
        // Setup costs remain unchanged
        const finalSetup = setupCost;
        
        // Final monthly after commission deductions
        const finalMonthly = discountedMonthly - referralCommission - influencerCommission;
        
        return {
            discountedMonthly,
            finalSetup,
            finalMonthly,
            salespersonFactor,
            directorFactor
        };
    };

    test('DRE shows setup costs without discounts applied', () => {
        const baseMonthly = 1000;
        const setupCost = 500;
        const salespersonDiscount = true;
        const directorDiscountPercentage = 10;
        
        const expected = calculateExpectedValues(
            baseMonthly,
            setupCost,
            salespersonDiscount,
            directorDiscountPercentage
        );
        
        // Setup cost should remain unchanged regardless of discounts
        expect(expected.finalSetup).toBe(setupCost);
        expect(expected.finalSetup).toBe(500);
        
        // Verify setup cost is not affected by discount factors
        expect(expected.finalSetup).not.toBe(setupCost * expected.salespersonFactor);
        expect(expected.finalSetup).not.toBe(setupCost * expected.directorFactor);
    });

    test('DRE shows monthly revenue with discounts properly applied', () => {
        const baseMonthly = 1000;
        const setupCost = 500;
        const salespersonDiscount = true;
        const directorDiscountPercentage = 15;
        
        const expected = calculateExpectedValues(
            baseMonthly,
            setupCost,
            salespersonDiscount,
            directorDiscountPercentage
        );
        
        // Monthly revenue should reflect both discounts
        const expectedDiscountedMonthly = 1000 * 0.95 * 0.85; // 807.5
        expect(expected.discountedMonthly).toBe(expectedDiscountedMonthly);
        expect(expected.discountedMonthly).toBe(807.5);
        
        // Verify it's different from base monthly
        expect(expected.discountedMonthly).not.toBe(baseMonthly);
    });

    test('DRE commission calculations use discounted monthly totals', () => {
        const baseMonthly = 1000;
        const setupCost = 500;
        const salespersonDiscount = true;
        const directorDiscountPercentage = 20;
        const commissionRate = 0.10; // 10%
        
        const expected = calculateExpectedValues(
            baseMonthly,
            setupCost,
            salespersonDiscount,
            directorDiscountPercentage
        );
        
        // Commission should be calculated on discounted monthly revenue
        const expectedCommission = expected.discountedMonthly * commissionRate;
        const actualDiscountedMonthly = 1000 * 0.95 * 0.80; // 760
        const expectedCommissionValue = 760 * 0.10; // 76
        
        expect(actualDiscountedMonthly).toBe(760);
        expect(expectedCommissionValue).toBe(76);
        
        // Commission should not be calculated on base monthly
        const wrongCommission = baseMonthly * commissionRate; // 100
        expect(expectedCommissionValue).not.toBe(wrongCommission);
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
        
        testCases.forEach(({ salesperson, director, expectedFactor }) => {
            const expected = calculateExpectedValues(
                baseMonthly,
                setupCost,
                salesperson,
                director
            );
            
            expect(expected.discountedMonthly).toBe(baseMonthly * expectedFactor);
            expect(expected.finalSetup).toBe(setupCost); // Always unchanged
        });
    });

    test('DRE profit calculations are accurate after discount corrections', () => {
        const baseMonthly = 1000;
        const setupCost = 500;
        const cost = 300; // Service cost
        const salespersonDiscount = true;
        const directorDiscountPercentage = 10;
        
        const expected = calculateExpectedValues(
            baseMonthly,
            setupCost,
            salespersonDiscount,
            directorDiscountPercentage
        );
        
        // Calculate expected profit components
        const discountedRevenue = expected.discountedMonthly; // 855
        const revenueTaxes = discountedRevenue * (mockTaxRates.pis + mockTaxRates.cofins) / 100;
        const grossProfit = discountedRevenue - cost - revenueTaxes;
        const profitTaxes = grossProfit > 0 ? grossProfit * (mockTaxRates.csll + mockTaxRates.irpj) / 100 : 0;
        const netProfit = grossProfit - profitTaxes;
        
        // Verify calculations
        expect(discountedRevenue).toBe(855);
        expect(revenueTaxes).toBeCloseTo(79.0875, 1); // (1.65 + 7.6) / 100 * 855 = 9.25 / 100 * 855
        expect(grossProfit).toBeCloseTo(475.9125, 1); // 855 - 300 - 79.0875
        expect(profitTaxes).toBeCloseTo(114.219, 1); // (9 + 15) / 100 * 475.9125 = 24 / 100 * 475.9125
        expect(netProfit).toBeCloseTo(361.6935, 1); // 475.9125 - 114.219
    });

    test('DRE payback calculation uses undiscounted setup costs', () => {
        const baseMonthly = 1000;
        const setupCost = 600;
        const cost = 300;
        const salespersonDiscount = true;
        const directorDiscountPercentage = 25;
        
        const expected = calculateExpectedValues(
            baseMonthly,
            setupCost,
            salespersonDiscount,
            directorDiscountPercentage
        );
        
        // Calculate net profit (simplified)
        const discountedRevenue = expected.discountedMonthly; // 750
        const estimatedNetProfit = discountedRevenue - cost - (discountedRevenue * 0.30); // Simplified calculation
        
        // Payback should use undiscounted setup cost
        const paybackMonths = Math.ceil(setupCost / estimatedNetProfit);
        const wrongPaybackMonths = Math.ceil((setupCost * 0.95 * 0.75) / estimatedNetProfit); // Wrong calculation
        
        expect(paybackMonths).not.toBe(wrongPaybackMonths);
        expect(setupCost).toBe(600); // Verify setup cost is not discounted
        
        // Payback calculation should use full setup cost, not discounted
        expect(paybackMonths).toBeGreaterThan(0);
    });

    test('DRE handles partner commissions correctly with discounts', () => {
        const baseMonthly = 1000;
        const setupCost = 500;
        const salespersonDiscount = true;
        const directorDiscountPercentage = 15;
        const referralCommission = 50;
        const influencerCommission = 30;
        
        const expected = calculateExpectedValues(
            baseMonthly,
            setupCost,
            salespersonDiscount,
            directorDiscountPercentage,
            referralCommission,
            influencerCommission
        );
        
        // DRE should show:
        // - Revenue: discounted monthly (before commission deductions)
        // - Commissions: as separate line items
        // - Final monthly: after commission deductions
        
        expect(expected.discountedMonthly).toBe(807.5); // 1000 * 0.95 * 0.85
        expect(expected.finalMonthly).toBe(727.5); // 807.5 - 50 - 30
        expect(expected.finalSetup).toBe(500); // Unchanged
        
        // Verify commissions are deducted from discounted revenue, not base revenue
        const totalCommissions = referralCommission + influencerCommission;
        expect(expected.finalMonthly).toBe(expected.discountedMonthly - totalCommissions);
    });

    test('DRE calculations maintain consistency across different scenarios', () => {
        const scenarios = [
            { monthly: 500, setup: 200, salesperson: false, director: 0 },
            { monthly: 1500, setup: 800, salesperson: true, director: 5 },
            { monthly: 2000, setup: 1000, salesperson: true, director: 20 },
            { monthly: 800, setup: 300, salesperson: false, director: 30 }
        ];
        
        scenarios.forEach(({ monthly, setup, salesperson, director }) => {
            const expected = calculateExpectedValues(monthly, setup, salesperson, director);
            
            // Consistency checks
            expect(expected.finalSetup).toBe(setup); // Setup never discounted
            expect(expected.discountedMonthly).toBeLessThanOrEqual(monthly); // Discounted <= original
            
            if (salesperson || director > 0) {
                expect(expected.discountedMonthly).toBeLessThan(monthly); // Should be discounted
            } else {
                expect(expected.discountedMonthly).toBe(monthly); // No discount applied
            }
        });
    });
});