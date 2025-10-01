# Implementation Plan

- [x] 1. Fix proposal data loading in editProposal function
  - Update editProposal function to properly load all saved calculator state from proposal metadata
  - Ensure clientData is loaded from both proposal.clientData and proposal.client fields for backward compatibility
  - Restore all discount settings, contract terms, and other calculator parameters from saved proposal
  - Add error handling for missing or corrupted proposal data
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Correct discount application logic to apply only to monthly totals
  - Remove discount factors from finalTotalSetup calculation - setup costs should not be discounted
  - Ensure salespersonDiscountFactor and directorDiscountFactor only apply to monthly revenue calculations
  - Update referralPartnerCommission and influencerPartnerCommission calculations to use discounted monthly totals
  - Verify finalTotalMonthly calculation applies discounts correctly while keeping setup costs unchanged
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Update saveProposal function to store complete calculator state
  - Enhance proposal metadata to include all calculator state variables (discounts, contract terms, etc.)
  - Ensure all form data and calculation parameters are saved for proper restoration during editing
  - Add version tracking for proposal data structure changes
  - Test save/load cycle to verify data persistence
  - _Requirements: 1.1, 1.2_

- [x] 4. Fix DRE calculations to reflect corrected discount application
  - Update DRE display to show setup costs without discounts applied
  - Ensure monthly revenue calculations in DRE use properly discounted values
  - Verify commission calculations in DRE reflect the corrected monthly totals
  - Test DRE accuracy with various discount combinations
  - _Requirements: 2.4, 2.5_

- [x] 5. Add comprehensive error handling for proposal editing
  - Add validation for proposal data structure before loading
  - Implement fallback behavior when proposal data is missing or corrupted
  - Add user-friendly error messages for data loading failures
  - Log errors for debugging purposes while maintaining user experience
  - _Requirements: 1.4_

- [x] 6. Test discount application across all calculator displays
  - Verify proposal summary shows correct setup costs (undiscounted) and monthly totals (discounted)
  - Test print functionality to ensure discounts are properly reflected in printed proposals
  - Validate all currency formatting and calculations with discount scenarios
  - Test edge cases like zero discounts, maximum discounts, and combined discounts
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_