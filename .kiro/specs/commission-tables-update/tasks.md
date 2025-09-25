# Implementation Plan

- [x] 1. Create new Supabase database tables for commission data
  - Create SQL migration script for new commission tables (channel_influencer, channel_indicator, seller)
  - Add proper indexes, RLS policies, and triggers for the new tables
  - Insert default commission data based on the provided screenshots
  - _Requirements: 3.1, 3.2_

- [x] 2. Update useCommissions hook to fetch all commission types
  - Extend the existing useCommissions hook to fetch data from all 5 commission tables
  - Add new TypeScript interfaces for the new commission types
  - Implement proper error handling and fallback data for each commission type
  - Add loading states and data validation for all commission types
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 3. Create unified commission tables component
  - Create new CommissionTablesUnified component that displays all 5 commission tables
  - Implement proper layout with Canal/Vendedor table at top, Influencer/Indicator tables in middle row, Seller/Director tables in bottom row
  - Apply consistent dark theme styling matching the provided screenshots
  - Add proper responsive design for mobile devices
  - _Requirements: 1.1, 4.3, 5.1, 5.2_

- [x] 4. Implement individual commission table components
- [x] 4.1 Create ChannelSellerTable component
  - Implement simple period-based table (12, 24, 36, 48, 60 months)
  - Display commission values: 0.60%, 1.20%, 2.00%, 2.00%, 2.00%
  - Apply dark theme styling consistent with design
  - _Requirements: 1.2, 5.3_

- [x] 4.2 Create SellerTable component
  - Implement simple period-based table (12, 24, 36, 48, 60 months)
  - Display commission values: 1.2%, 2.4%, 3.6%, 3.6%, 3.6%
  - Apply dark theme styling consistent with design
  - _Requirements: 1.3, 5.3_

- [x] 4.3 Create DirectorTable component
  - Implement simple period-based table (12, 24, 36, 48, 60 months)
  - Display commission values: 0% for all periods
  - Apply dark theme styling consistent with design
  - _Requirements: 1.4, 5.3_

- [x] 4.4 Create ChannelInfluencerTable component
  - Implement revenue-range based table with 6 revenue tiers
  - Display commission values for each tier across 5 time periods
  - Format revenue ranges in Brazilian currency format
  - Apply dark theme styling consistent with design
  - _Requirements: 2.1, 2.2, 5.4_

- [x] 4.5 Create ChannelIndicatorTable component
  - Implement revenue-range based table with 6 revenue tiers
  - Display commission values for each tier across 5 time periods
  - Format revenue ranges in Brazilian currency format
  - Apply dark theme styling consistent with design
  - _Requirements: 2.1, 2.3, 5.4_

- [x] 5. Update Internet Fibra calculator to use new commission tables
  - Replace existing FiberCommissionsSection with CommissionTablesUnified
  - Remove old FiberCommissionTables component import
  - Test that commission tables display correctly in the calculator
  - _Requirements: 4.1, 4.2_

- [x] 6. Update Internet MAN calculator to use new commission tables
  - Replace existing CommissionTables with CommissionTablesUnified
  - Remove old ManCommissionTables component import
  - Test that commission tables display correctly in the calculator
  - _Requirements: 4.1, 4.2_

- [x] 7. Update Internet Radio calculator to use new commission tables
  - Replace existing RadioCommissionsSection with CommissionTablesUnified
  - Remove old RadioCommissionTables component import
  - Test that commission tables display correctly in the calculator
  - _Requirements: 4.1, 4.2_

- [x] 8. Update PABX SIP calculator to use new commission tables
  - Replace existing CommissionTables with CommissionTablesUnified
  - Remove old commission table imports
  - Test that commission tables display correctly in the calculator
  - _Requirements: 4.1, 4.2_

- [x] 9. Update Virtual Machines calculator to use new commission tables
  - Replace existing VMCommissionsSection with CommissionTablesUnified
  - Remove old VMCommissionTables component import
  - Test that commission tables display correctly in the calculator
  - _Requirements: 4.1, 4.2_

- [x] 10. Create comprehensive test suite for commission tables
  - Write unit tests for useCommissions hook with all commission types
  - Write unit tests for each individual commission table component
  - Write integration tests for CommissionTablesUnified component
  - Test error handling and fallback data scenarios
  - Test data formatting and display accuracy
  - _Requirements: 3.3, 5.3, 5.4_

- [x] 11. Clean up old commission table components
  - Remove unused commission table components (FiberCommissionTables, RadioCommissionTables, etc.)
  - Remove unused commission section components
  - Clean up unused imports and dependencies
  - Update any remaining references to old components
  - _Requirements: 4.4_

- [x] 12. Verify consistency across all calculators
  - Test all 5 calculators to ensure they display identical commission tables
  - Verify visual consistency and proper dark theme application
  - Test responsive behavior on different screen sizes
  - Verify data accuracy matches the provided screenshots
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2_