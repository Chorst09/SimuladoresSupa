# Commission Tables Migration

This directory contains SQL migration scripts for updating the commission tables in the Supabase database.

## Files

### `deploy-commission-tables.sql`
The main migration script that:
- Creates 3 new commission tables (`commission_seller`, `commission_channel_influencer`, `commission_channel_indicator`)
- Updates existing tables with correct values
- Sets up proper indexes, RLS policies, and triggers
- Inserts default commission data based on the design document

### `commission-tables-update.sql`
Individual migration for creating new tables only.

### `update-existing-commission-tables.sql`
Individual migration for updating existing commission tables.

## Deployment Instructions

### Option 1: Using the Deployment Script
```bash
node scripts/deploy-commission-tables.js
```

### Option 2: Manual Deployment
1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `deploy-commission-tables.sql`
4. Paste and execute the script
5. Verify the results using the verification queries

## Tables Created/Updated

### New Tables
1. **commission_seller** - Simple period-based commission structure for sellers
2. **commission_channel_influencer** - Revenue-range based commissions for channel influencers
3. **commission_channel_indicator** - Revenue-range based commissions for channel indicators

### Updated Tables
1. **commission_channel_seller** - Updated with correct Canal/Vendedor values
2. **commission_channel_director** - Updated with correct Director values (all zeros)

## Data Structure

### Simple Period-Based Tables
- `commission_seller`
- `commission_channel_seller` (existing, updated)
- `commission_channel_director` (existing, updated)

Columns: `months_12`, `months_24`, `months_36`, `months_48`, `months_60`

### Revenue-Range Based Tables
- `commission_channel_influencer`
- `commission_channel_indicator`

Columns: `revenue_range`, `revenue_min`, `revenue_max`, `months_12`, `months_24`, `months_36`, `months_48`, `months_60`

## Default Values

### Commission Seller (1.2%, 2.4%, 3.6%, 3.6%, 3.6%)
### Commission Channel/Seller (0.60%, 1.20%, 2.00%, 2.00%, 2.00%)
### Commission Director (0%, 0%, 0%, 0%, 0%)

### Commission Channel Influencer
| Revenue Range | 12 months | 24 months | 36+ months |
|---------------|-----------|-----------|------------|
| Até 500,00 | 1.50% | 2.00% | 2.50% |
| 500,01 a 1.000,00 | 2.51% | 3.25% | 4.00% |
| 1.000,01 a 1.500,00 | 4.01% | 4.50% | 5.00% |
| 1.500,01 a 3.000,00 | 5.01% | 5.50% | 6.00% |
| 3.000,01 a 5.000,00 | 6.01% | 6.50% | 7.00% |
| Acima de 5.000,01 | 7.01% | 7.50% | 8.00% |

### Commission Channel Indicator
| Revenue Range | 12 months | 24 months | 36+ months |
|---------------|-----------|-----------|------------|
| Até 500,00 | 0.50% | 0.67% | 0.83% |
| 500,01 a 1.000,00 | 0.84% | 1.08% | 1.33% |
| 1.000,01 a 1.500,00 | 1.34% | 1.50% | 1.67% |
| 1.500,01 a 3.000,00 | 1.67% | 1.83% | 2.00% |
| 3.000,01 a 5.000,00 | 2.00% | 2.17% | 2.50% |
| Acima de 5.000,01 | 2.34% | 2.50% | 3.00% |

## Verification

After deployment, run these queries to verify:

```sql
-- Check all commission tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'commission_%';

-- Verify data in each table
SELECT 'seller' as type, * FROM commission_seller;
SELECT 'channel_seller' as type, * FROM commission_channel_seller;
SELECT 'director' as type, * FROM commission_channel_director;
SELECT 'influencer' as type, revenue_range, months_12, months_24, months_36 
FROM commission_channel_influencer ORDER BY revenue_min;
SELECT 'indicator' as type, revenue_range, months_12, months_24, months_36 
FROM commission_channel_indicator ORDER BY revenue_min;
```

## Security

All tables have:
- Row Level Security (RLS) enabled
- Read access for authenticated users
- Write access restricted to admin users
- Automatic timestamp updates via triggers

## Next Steps

After successful deployment:
1. Update the `useCommissions` hook to fetch from all tables
2. Create the `CommissionTablesUnified` component
3. Update all calculator components to use the new unified tables
4. Test the implementation across all calculators