# Requirements Document

## Introduction

This specification addresses critical issues in the Internet MAN calculator related to proposal editing functionality and discount application logic. The calculator currently fails to load customer data when editing proposals and incorrectly applies seller and director discounts to all values instead of only the monthly total.

## Requirements

### Requirement 1

**User Story:** As a user, I want to edit existing Internet MAN proposals and see all previously entered customer data loaded correctly, so that I can make modifications without re-entering all information.

#### Acceptance Criteria

1. WHEN a user opens an existing Internet MAN proposal for editing THEN the system SHALL load and display all previously saved customer data
2. WHEN customer data is loaded THEN the system SHALL populate all form fields with the correct values
3. WHEN customer data is loaded THEN the system SHALL maintain all calculation results and configurations
4. IF customer data fails to load THEN the system SHALL display an appropriate error message and allow manual data entry

### Requirement 2

**User Story:** As a user, I want seller and director discounts to be applied only to the monthly total amount, so that other calculations and displays remain accurate.

#### Acceptance Criteria

1. WHEN seller discount is applied THEN the system SHALL apply the discount only to the monthly total value
2. WHEN director discount is applied THEN the system SHALL apply the discount only to the monthly total value
3. WHEN discounts are applied THEN the system SHALL NOT modify installation costs, equipment costs, or other non-monthly values
4. WHEN discounts are applied THEN the system SHALL update the DRE calculations to reflect the discounted monthly total
5. WHEN discounts are removed THEN the system SHALL restore the original monthly total without affecting other values