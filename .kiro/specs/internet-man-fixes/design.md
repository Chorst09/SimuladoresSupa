# Design Document

## Overview

This design addresses two critical issues in the Internet MAN calculator:
1. **Proposal Editing Data Loading**: When editing existing proposals, customer data is not being properly loaded into the form fields
2. **Discount Application Logic**: Seller and director discounts are incorrectly being applied to all values (setup costs, etc.) instead of only the monthly total

## Architecture

The solution involves modifying the existing `InternetManCalculator` component to:
- Fix the `editProposal` function to properly restore all saved state
- Refactor discount calculation logic to apply discounts only to monthly totals
- Ensure DRE calculations reflect the corrected discount application

## Components and Interfaces

### Current Issues Identified

1. **editProposal Function**: Currently only loads basic data but doesn't restore all calculator state including discount settings and other parameters
2. **Discount Logic**: The `salespersonDiscountFactor` and `directorDiscountFactor` are being applied to both `finalTotalSetup` and `finalTotalMonthly`, which is incorrect

### Proposed Changes

#### 1. Enhanced editProposal Function
```typescript
const editProposal = (proposal: Proposal) => {
    // Load all saved data from proposal metadata
    setCurrentProposal(proposal);
    setClientData(proposal.clientData || proposal.client);
    setAccountManagerData(proposal.accountManager);
    setAddedProducts(proposal.products);
    
    // Restore all calculator state from saved metadata
    if (proposal.metadata) {
        setApplySalespersonDiscount(proposal.metadata.applySalespersonDiscount || false);
        setAppliedDirectorDiscountPercentage(proposal.metadata.appliedDirectorDiscountPercentage || 0);
        setIncludeReferralPartner(proposal.metadata.includeReferralPartner || false);
        setIncludeInfluencerPartner(proposal.metadata.includeInfluencerPartner || false);
        setContractTerm(proposal.metadata.contractTerm || 12);
        setIncludeInstallation(proposal.metadata.includeInstallation !== false);
        // ... restore other state variables
    }
    
    setViewMode('calculator');
};
```

#### 2. Corrected Discount Application
```typescript
// Apply discounts ONLY to monthly totals
const baseTotalMonthly = (addedProducts || []).reduce((sum, p) => sum + p.monthly, 0);
const baseTotalSetup = (addedProducts || []).reduce((sum, p) => sum + p.setup, 0);

// Discounts applied only to monthly
const salespersonDiscountFactor = applySalespersonDiscount ? 0.95 : 1;
const directorDiscountFactor = 1 - (appliedDirectorDiscountPercentage / 100);

const discountedMonthly = baseTotalMonthly * salespersonDiscountFactor * directorDiscountFactor;

// Setup costs remain unchanged
const finalTotalSetup = baseTotalSetup;
const finalTotalMonthly = discountedMonthly - referralPartnerCommission - influencerPartnerCommission;
```

## Data Models

### Enhanced Proposal Interface
```typescript
interface Proposal {
    id: string;
    baseId: string;
    version: number;
    client: ClientData;
    clientData: ClientData; // Ensure both fields are available
    accountManager: AccountManagerData;
    products: Product[];
    totalSetup: number;
    totalMonthly: number;
    createdAt: string;
    userId: string;
    metadata?: {
        applySalespersonDiscount: boolean;
        appliedDirectorDiscountPercentage: number;
        includeReferralPartner: boolean;
        includeInfluencerPartner: boolean;
        contractTerm: number;
        includeInstallation: boolean;
        selectedSpeed: number;
        // ... other calculator state
    };
}
```

## Error Handling

### Proposal Loading Errors
- If proposal data is missing or corrupted, display clear error message
- Provide fallback to empty form state
- Log errors for debugging purposes

### Discount Calculation Errors
- Validate discount percentages are within acceptable ranges (0-100%)
- Handle edge cases where monthly total is zero
- Ensure calculations don't result in negative values

## Testing Strategy

### Unit Tests
- Test `editProposal` function with various proposal data structures
- Test discount calculations with different combinations of discounts
- Test edge cases (zero values, missing data, etc.)

### Integration Tests
- Test complete edit workflow from proposal selection to data loading
- Test discount application in DRE calculations
- Test save/load cycle to ensure data persistence

### Manual Testing
- Verify all form fields are populated when editing proposals
- Verify discounts only affect monthly totals in summary displays
- Verify DRE calculations show correct values after discount application