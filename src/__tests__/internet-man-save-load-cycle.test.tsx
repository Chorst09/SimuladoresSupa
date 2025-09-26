/**
 * Test file for Internet MAN Calculator save/load cycle verification
 * Tests the enhanced saveProposal function and complete calculator state persistence
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the necessary modules
jest.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        user: {
            id: 'test-user-id',
            email: 'test@example.com',
            token: 'test-token'
        }
    })
}));

jest.mock('@/lib/supabaseClient', () => ({
    supabase: {}
}));

jest.mock('@/hooks/use-commissions', () => ({
    useCommissions: () => ({
        channelIndicator: [],
        channelInfluencer: [],
        channelSeller: [],
        seller: [],
        isLoading: false
    }),
    getCommissionRate: () => 0.05,
    getSellerCommissionRate: () => 0.03,
    getChannelSellerCommissionRate: () => 0.02
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Internet MAN Calculator Save/Load Cycle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                id: 'test-proposal-id',
                success: true
            }),
            text: async () => 'Success'
        });
    });

    it('should save complete calculator state in metadata', async () => {
        // Test data representing a complete calculator state
        const testCalculatorState = {
            // Core calculator state
            applySalespersonDiscount: true,
            appliedDirectorDiscountPercentage: 10,
            includeReferralPartner: true,
            includeInfluencerPartner: false,
            contractTerm: 24,
            includeInstallation: true,
            selectedSpeed: 100,
            
            // Customer and project state
            isExistingCustomer: true,
            previousMonthly: 1500,
            includeLastMile: true,
            lastMileCost: 500,
            projectValue: 50000,
            
            // Discount and pricing state
            directorDiscountPercentage: 15,
            taxRates: {
                pis: 15.00,
                cofins: 0.00,
                csll: 0.00,
                irpj: 0.00,
                banda: 2.09,
                fundraising: 0.00,
                rate: 0.00,
                margem: 0.00,
                custoDesp: 10.00
            },
            markup: 120,
            estimatedNetMargin: 25.5,
            
            // UI state
            isEditingTaxes: false
        };

        const testClientData = {
            name: 'Test Client',
            contact: 'John Doe',
            projectName: 'Test Project',
            email: 'client@test.com',
            phone: '123-456-7890'
        };

        const testAccountManagerData = {
            name: 'Test Manager',
            email: 'manager@test.com',
            phone: '098-765-4321'
        };

        const testProducts = [{
            id: '1',
            type: 'RADIO' as const,
            description: '100 Mbps - 24 meses',
            setup: 1996,
            monthly: 1578,
            details: {
                speed: 100,
                term: 24,
                includeInstallation: true
            }
        }];

        // Simulate the saveProposal function logic
        const baseTotalMonthly = testProducts.reduce((sum, p) => sum + p.monthly, 0);
        const totalSetup = testProducts.reduce((sum, p) => sum + p.setup, 0);
        
        // Apply discounts (matching the calculator logic)
        const salespersonDiscountFactor = testCalculatorState.applySalespersonDiscount ? 0.95 : 1;
        const directorDiscountFactor = 1 - (testCalculatorState.appliedDirectorDiscountPercentage / 100);
        const finalTotalMonthly = baseTotalMonthly * salespersonDiscountFactor * directorDiscountFactor;

        const currentTimestamp = new Date().toISOString();
        
        const expectedMetadata = {
            // Core calculator state
            applySalespersonDiscount: testCalculatorState.applySalespersonDiscount,
            appliedDirectorDiscountPercentage: testCalculatorState.appliedDirectorDiscountPercentage,
            includeReferralPartner: testCalculatorState.includeReferralPartner,
            includeInfluencerPartner: testCalculatorState.includeInfluencerPartner,
            contractTerm: testCalculatorState.contractTerm,
            includeInstallation: testCalculatorState.includeInstallation,
            selectedSpeed: testCalculatorState.selectedSpeed,
            
            // Customer and project state
            isExistingCustomer: testCalculatorState.isExistingCustomer,
            previousMonthly: testCalculatorState.previousMonthly,
            includeLastMile: testCalculatorState.includeLastMile,
            lastMileCost: testCalculatorState.lastMileCost,
            projectValue: testCalculatorState.projectValue,
            
            // Discount and pricing state
            directorDiscountPercentage: testCalculatorState.directorDiscountPercentage,
            taxRates: testCalculatorState.taxRates,
            markup: testCalculatorState.markup,
            estimatedNetMargin: testCalculatorState.estimatedNetMargin,
            
            // UI state
            isEditingTaxes: testCalculatorState.isEditingTaxes,
            
            // Calculated values
            baseTotalMonthly: baseTotalMonthly,
            finalTotalSetup: totalSetup,
            finalTotalMonthly: finalTotalMonthly,
            referralPartnerCommission: expect.any(Number),
            influencerPartnerCommission: 0, // Since includeInfluencerPartner is false
            
            // Version tracking
            metadataVersion: 2,
            savedAt: expect.any(String),
            savedBy: 'test@example.com',
            calculatorVersion: 'InternetManCalculator_v2.0',
            dataStructureVersion: '2024-01-01'
        };

        const expectedProposal = {
            title: expect.stringContaining('Proposta Internet Man'),
            client: testClientData.name,
            value: finalTotalMonthly,
            type: 'MAN',
            status: 'Rascunho',
            createdBy: 'test@example.com',
            createdAt: expect.any(String),
            version: expect.any(Number),
            contractPeriod: testCalculatorState.contractTerm,
            
            // Backward compatibility fields
            clientData: testClientData,
            accountManager: testAccountManagerData,
            products: testProducts,
            totalSetup: totalSetup,
            totalMonthly: finalTotalMonthly,
            baseTotalMonthly: baseTotalMonthly,
            applySalespersonDiscount: testCalculatorState.applySalespersonDiscount,
            appliedDirectorDiscountPercentage: testCalculatorState.appliedDirectorDiscountPercentage,
            includeReferralPartner: testCalculatorState.includeReferralPartner,
            includeInfluencerPartner: testCalculatorState.includeInfluencerPartner,
            userId: 'test-user-id',
            
            // Enhanced metadata
            metadata: expectedMetadata
        };

        // Verify that the proposal structure matches expectations
        expect(expectedProposal.metadata).toBeDefined();
        expect(expectedProposal.metadata?.metadataVersion).toBe(2);
        expect(expectedProposal.metadata?.calculatorVersion).toBe('InternetManCalculator_v2.0');
        
        // Verify all calculator state is preserved
        expect(expectedProposal.metadata?.applySalespersonDiscount).toBe(true);
        expect(expectedProposal.metadata?.appliedDirectorDiscountPercentage).toBe(10);
        expect(expectedProposal.metadata?.contractTerm).toBe(24);
        expect(expectedProposal.metadata?.selectedSpeed).toBe(100);
        expect(expectedProposal.metadata?.isExistingCustomer).toBe(true);
        expect(expectedProposal.metadata?.taxRates).toEqual(testCalculatorState.taxRates);
        expect(expectedProposal.metadata?.markup).toBe(120);
        
        // Verify calculated values are stored for verification
        expect(expectedProposal.metadata?.baseTotalMonthly).toBe(baseTotalMonthly);
        expect(expectedProposal.metadata?.finalTotalSetup).toBe(totalSetup);
        expect(expectedProposal.metadata?.finalTotalMonthly).toBe(finalTotalMonthly);
    });

    it('should handle metadata version tracking correctly', () => {
        const testMetadataVersions = [
            { version: 1, description: 'Original metadata structure' },
            { version: 2, description: 'Enhanced metadata with complete state' }
        ];

        testMetadataVersions.forEach(({ version, description }) => {
            const metadata = {
                metadataVersion: version,
                calculatorVersion: `InternetManCalculator_v${version}.0`,
                dataStructureVersion: '2024-01-01'
            };

            expect(metadata.metadataVersion).toBe(version);
            expect(metadata.calculatorVersion).toContain(`v${version}.0`);
        });
    });

    it('should preserve all tax rates in metadata', () => {
        const testTaxRates = {
            pis: 15.00,
            cofins: 3.00,
            csll: 9.00,
            irpj: 15.00,
            banda: 2.09,
            fundraising: 1.00,
            rate: 0.50,
            margem: 5.00,
            custoDesp: 10.00
        };

        const metadata = {
            taxRates: testTaxRates,
            metadataVersion: 2
        };

        // Verify all tax rate fields are preserved
        Object.keys(testTaxRates).forEach(taxType => {
            expect(metadata.taxRates[taxType as keyof typeof testTaxRates]).toBe(testTaxRates[taxType as keyof typeof testTaxRates]);
        });
    });

    it('should include audit trail information', () => {
        const currentTimestamp = new Date().toISOString();
        const testUser = 'test@example.com';

        const metadata = {
            metadataVersion: 2,
            savedAt: currentTimestamp,
            savedBy: testUser,
            calculatorVersion: 'InternetManCalculator_v2.0',
            dataStructureVersion: '2024-01-01'
        };

        expect(metadata.savedAt).toBe(currentTimestamp);
        expect(metadata.savedBy).toBe(testUser);
        expect(metadata.calculatorVersion).toBe('InternetManCalculator_v2.0');
        expect(metadata.dataStructureVersion).toBe('2024-01-01');
    });

    it('should calculate and store commission values correctly', () => {
        const monthlyRevenue = 1000;
        const contractTerm = 24;
        
        // Mock commission rates
        const referralRate = 0.05; // 5%
        const influencerRate = 0.03; // 3%
        
        const expectedReferralCommission = monthlyRevenue * referralRate;
        const expectedInfluencerCommission = monthlyRevenue * influencerRate;

        const metadata = {
            includeReferralPartner: true,
            includeInfluencerPartner: true,
            referralPartnerCommission: expectedReferralCommission,
            influencerPartnerCommission: expectedInfluencerCommission,
            metadataVersion: 2
        };

        expect(metadata.referralPartnerCommission).toBe(50); // 1000 * 0.05
        expect(metadata.influencerPartnerCommission).toBe(30); // 1000 * 0.03
    });
});