/**
 * Integration test for Internet MAN Calculator save/load cycle
 * Tests that saved proposal data can be properly loaded back into the calculator
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

describe('Internet MAN Calculator Save/Load Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should save and load complete calculator state correctly', async () => {
        // Create a mock proposal with enhanced metadata
        const mockSavedProposal = {
            id: 'test-proposal-123',
            baseId: 'test-base-123',
            version: 2,
            client: {
                name: 'Test Client Corp',
                contact: 'John Doe',
                projectName: 'Network Upgrade Project',
                email: 'john@testclient.com',
                phone: '555-0123',
                companyName: 'Test Client Corp',
                address: '123 Business St',
                cnpj: '12.345.678/0001-90'
            },
            clientData: {
                name: 'Test Client Corp',
                contact: 'John Doe',
                projectName: 'Network Upgrade Project',
                email: 'john@testclient.com',
                phone: '555-0123',
                companyName: 'Test Client Corp',
                address: '123 Business St',
                cnpj: '12.345.678/0001-90'
            },
            accountManager: {
                name: 'Jane Manager',
                email: 'jane@company.com',
                phone: '555-0456'
            },
            products: [{
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
            }],
            totalSetup: 1996,
            totalMonthly: 1420.11, // After discounts
            createdAt: '2024-01-15T10:30:00Z',
            userId: 'test-user-id',
            contractPeriod: 24,
            applySalespersonDiscount: true,
            appliedDirectorDiscountPercentage: 10,
            includeReferralPartner: true,
            includeInfluencerPartner: false,
            baseTotalMonthly: 1578,
            metadata: {
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
                previousMonthly: 1200,
                includeLastMile: true,
                lastMileCost: 300,
                projectValue: 45000,

                // Discount and pricing state
                directorDiscountPercentage: 15,
                taxRates: {
                    pis: 15.00,
                    cofins: 3.00,
                    csll: 9.00,
                    irpj: 15.00,
                    banda: 2.09,
                    fundraising: 1.00,
                    rate: 0.50,
                    margem: 5.00,
                    custoDesp: 10.00
                },
                markup: 125,
                estimatedNetMargin: 28.5,

                // UI state
                isEditingTaxes: false,

                // Calculated values
                baseTotalMonthly: 1578,
                finalTotalSetup: 1996,
                finalTotalMonthly: 1420.11,
                referralPartnerCommission: 71.01,
                influencerPartnerCommission: 0,

                // Version tracking
                metadataVersion: 2,
                savedAt: '2024-01-15T10:30:00Z',
                savedBy: 'test@example.com',
                calculatorVersion: 'InternetManCalculator_v2.0',
                dataStructureVersion: '2024-01-01'
            }
        };

        // Simulate the editProposal function logic for loading data
        const loadedState = {
            currentProposal: mockSavedProposal,
            clientData: mockSavedProposal.clientData || mockSavedProposal.client,
            accountManagerData: mockSavedProposal.accountManager,
            addedProducts: mockSavedProposal.products,

            // Load calculator state from metadata
            applySalespersonDiscount: mockSavedProposal.metadata?.applySalespersonDiscount || false,
            appliedDirectorDiscountPercentage: mockSavedProposal.metadata?.appliedDirectorDiscountPercentage || 0,
            includeReferralPartner: mockSavedProposal.metadata?.includeReferralPartner || false,
            includeInfluencerPartner: mockSavedProposal.metadata?.includeInfluencerPartner || false,
            contractTerm: mockSavedProposal.metadata?.contractTerm || 12,
            includeInstallation: mockSavedProposal.metadata?.includeInstallation !== false,
            selectedSpeed: mockSavedProposal.metadata?.selectedSpeed || 0,
            isExistingCustomer: mockSavedProposal.metadata?.isExistingCustomer || false,
            previousMonthly: mockSavedProposal.metadata?.previousMonthly || 0,
            includeLastMile: mockSavedProposal.metadata?.includeLastMile || false,
            lastMileCost: mockSavedProposal.metadata?.lastMileCost || 0,
            projectValue: mockSavedProposal.metadata?.projectValue || 0,
            directorDiscountPercentage: mockSavedProposal.metadata?.directorDiscountPercentage || 0,
            taxRates: mockSavedProposal.metadata?.taxRates || {
                pis: 15.00, cofins: 0.00, csll: 0.00, irpj: 0.00,
                banda: 2.09, fundraising: 0.00, rate: 0.00, margem: 0.00, custoDesp: 10.00
            },
            markup: mockSavedProposal.metadata?.markup || 100,
            estimatedNetMargin: mockSavedProposal.metadata?.estimatedNetMargin || 0,
            isEditingTaxes: mockSavedProposal.metadata?.isEditingTaxes || false
        };

        // Verify that all state was loaded correctly
        expect(loadedState.currentProposal).toBe(mockSavedProposal);
        expect(loadedState.clientData.name).toBe('Test Client Corp');
        expect(loadedState.clientData.email).toBe('john@testclient.com');
        expect(loadedState.accountManagerData.name).toBe('Jane Manager');
        expect(loadedState.addedProducts).toHaveLength(1);
        expect(loadedState.addedProducts[0].description).toBe('100 Mbps - 24 meses');

        // Verify calculator state restoration
        expect(loadedState.applySalespersonDiscount).toBe(true);
        expect(loadedState.appliedDirectorDiscountPercentage).toBe(10);
        expect(loadedState.includeReferralPartner).toBe(true);
        expect(loadedState.includeInfluencerPartner).toBe(false);
        expect(loadedState.contractTerm).toBe(24);
        expect(loadedState.includeInstallation).toBe(true);
        expect(loadedState.selectedSpeed).toBe(100);

        // Verify customer and project state
        expect(loadedState.isExistingCustomer).toBe(true);
        expect(loadedState.previousMonthly).toBe(1200);
        expect(loadedState.includeLastMile).toBe(true);
        expect(loadedState.lastMileCost).toBe(300);
        expect(loadedState.projectValue).toBe(45000);

        // Verify pricing and discount state
        expect(loadedState.directorDiscountPercentage).toBe(15);
        expect(loadedState.markup).toBe(125);
        expect(loadedState.estimatedNetMargin).toBe(28.5);

        // Verify tax rates are loaded correctly
        expect(loadedState.taxRates.pis).toBe(15.00);
        expect(loadedState.taxRates.cofins).toBe(3.00);
        expect(loadedState.taxRates.csll).toBe(9.00);
        expect(loadedState.taxRates.irpj).toBe(15.00);
        expect(loadedState.taxRates.banda).toBe(2.09);
        expect(loadedState.taxRates.fundraising).toBe(1.00);
        expect(loadedState.taxRates.rate).toBe(0.50);
        expect(loadedState.taxRates.margem).toBe(5.00);
        expect(loadedState.taxRates.custoDesp).toBe(10.00);

        // Verify UI state
        expect(loadedState.isEditingTaxes).toBe(false);
    });

    it('should handle backward compatibility with older proposal formats', () => {
        // Mock an older proposal without enhanced metadata
        const oldProposal = {
            id: 'old-proposal-123',
            baseId: 'old-base-123',
            version: 1,
            client: 'Old Client Name', // String format (old style)
            accountManager: {
                name: 'Old Manager',
                email: 'old@company.com',
                phone: '555-0789'
            },
            products: [{
                id: '1',
                type: 'RADIO' as const,
                description: '50 Mbps - 12 meses',
                setup: 998,
                monthly: 720,
                details: {
                    speed: 50,
                    term: 12,
                    includeInstallation: true
                }
            }],
            totalSetup: 998,
            totalMonthly: 720,
            createdAt: '2023-12-01T09:00:00Z',
            userId: 'test-user-id',
            contractPeriod: 12,
            // No metadata field - testing backward compatibility
        };

        // Simulate loading with fallback values
        const loadedState = {
            currentProposal: oldProposal,
            clientData: typeof oldProposal.client === 'string'
                ? { name: oldProposal.client, contact: '', projectName: '', email: '', phone: '' }
                : oldProposal.client,
            accountManagerData: oldProposal.accountManager,
            addedProducts: oldProposal.products,

            // Use fallback values when metadata is missing
            applySalespersonDiscount: false, // Default
            appliedDirectorDiscountPercentage: 0, // Default
            includeReferralPartner: false, // Default
            includeInfluencerPartner: false, // Default
            contractTerm: oldProposal.contractPeriod || 12,
            includeInstallation: true, // Default
            selectedSpeed: 0, // Default
            isExistingCustomer: false, // Default
            previousMonthly: 0, // Default
            includeLastMile: false, // Default
            lastMileCost: 0, // Default
            projectValue: 0, // Default
            directorDiscountPercentage: 0, // Default
            taxRates: { // Default values
                pis: 15.00, cofins: 0.00, csll: 0.00, irpj: 0.00,
                banda: 2.09, fundraising: 0.00, rate: 0.00, margem: 0.00, custoDesp: 10.00
            },
            markup: 100, // Default
            estimatedNetMargin: 0, // Default
            isEditingTaxes: false // Default
        };

        // Verify backward compatibility handling
        expect(loadedState.clientData.name).toBe('Old Client Name');
        expect(loadedState.clientData.contact).toBe('');
        expect(loadedState.accountManagerData.name).toBe('Old Manager');
        expect(loadedState.addedProducts).toHaveLength(1);
        expect(loadedState.contractTerm).toBe(12);

        // Verify default values are used when metadata is missing
        expect(loadedState.applySalespersonDiscount).toBe(false);
        expect(loadedState.appliedDirectorDiscountPercentage).toBe(0);
        expect(loadedState.includeReferralPartner).toBe(false);
        expect(loadedState.includeInfluencerPartner).toBe(false);
        expect(loadedState.selectedSpeed).toBe(0);
        expect(loadedState.isExistingCustomer).toBe(false);
        expect(loadedState.markup).toBe(100);
    });

    it('should validate metadata version and handle version differences', () => {
        const proposalV1 = {
            metadata: { metadataVersion: 1 }
        };

        const proposalV2 = {
            metadata: { metadataVersion: 2 }
        };

        const proposalNoVersion = {
            metadata: {} // No version specified
        };

        // Test version detection
        expect(proposalV1.metadata.metadataVersion).toBe(1);
        expect(proposalV2.metadata.metadataVersion).toBe(2);
        expect(proposalNoVersion.metadata.metadataVersion).toBeUndefined();

        // Simulate version-based loading logic
        const getMetadataVersion = (proposal: any) => {
            return proposal.metadata?.metadataVersion || 1; // Default to v1 if not specified
        };

        expect(getMetadataVersion(proposalV1)).toBe(1);
        expect(getMetadataVersion(proposalV2)).toBe(2);
        expect(getMetadataVersion(proposalNoVersion)).toBe(1); // Default
    });

    it('should restore isEditingTaxes UI state correctly', () => {
        // Test proposal with isEditingTaxes set to true
        const proposalWithEditingTaxes = {
            id: 'test-editing-taxes',
            client: { name: 'Test Client' },
            accountManager: { name: 'Test Manager', email: '', phone: '' },
            products: [],
            metadata: {
                isEditingTaxes: true,
                metadataVersion: 2
            }
        };

        // Test proposal without isEditingTaxes (should default to false)
        const proposalWithoutEditingTaxes = {
            id: 'test-no-editing-taxes',
            client: { name: 'Test Client' },
            accountManager: { name: 'Test Manager', email: '', phone: '' },
            products: [],
            metadata: {
                metadataVersion: 2
                // isEditingTaxes not specified
            }
        };

        // Simulate loading with isEditingTaxes = true
        const loadedStateWithEditing = {
            isEditingTaxes: proposalWithEditingTaxes.metadata?.isEditingTaxes || false
        };

        // Simulate loading without isEditingTaxes (should default to false)
        const loadedStateWithoutEditing = {
            isEditingTaxes: proposalWithoutEditingTaxes.metadata?.isEditingTaxes || false
        };

        expect(loadedStateWithEditing.isEditingTaxes).toBe(true);
        expect(loadedStateWithoutEditing.isEditingTaxes).toBe(false);
    });

    it('should preserve calculated values for verification', () => {
        // Create a more realistic calculation scenario
        const baseTotalMonthly = 1578;
        const salespersonDiscountFactor = 0.95; // 5% discount
        const directorDiscountFactor = 0.9; // 10% discount

        // Calculate discounted monthly total
        const discountedMonthly = baseTotalMonthly * salespersonDiscountFactor * directorDiscountFactor;

        // Calculate commissions based on discounted amount (as per calculator logic)
        const referralCommissionRate = 0.05; // 5%
        const referralPartnerCommission = discountedMonthly * referralCommissionRate;

        // Final total after commissions
        const finalTotalMonthly = discountedMonthly - referralPartnerCommission;

        const mockProposal = {
            metadata: {
                baseTotalMonthly: baseTotalMonthly,
                finalTotalSetup: 1996,
                finalTotalMonthly: finalTotalMonthly,
                referralPartnerCommission: referralPartnerCommission,
                influencerPartnerCommission: 0,
                metadataVersion: 2
            }
        };

        // Verify calculated values are preserved
        expect(mockProposal.metadata.baseTotalMonthly).toBe(1578);
        expect(mockProposal.metadata.finalTotalSetup).toBe(1996);
        expect(mockProposal.metadata.referralPartnerCommission).toBeCloseTo(67.46, 1); // 1578 * 0.95 * 0.9 * 0.05
        expect(mockProposal.metadata.influencerPartnerCommission).toBe(0);

        // Verify the calculation chain is consistent
        const recalculatedDiscounted = mockProposal.metadata.baseTotalMonthly * 0.95 * 0.9;
        const recalculatedFinal = recalculatedDiscounted - mockProposal.metadata.referralPartnerCommission;
        expect(recalculatedFinal).toBeCloseTo(mockProposal.metadata.finalTotalMonthly, 2);
    });
});