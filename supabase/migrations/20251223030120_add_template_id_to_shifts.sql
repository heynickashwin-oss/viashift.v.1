/*
  # Add template_id to shifts table

  1. Changes
    - Add `template_id` column to shifts table
      - Type: TEXT
      - Default: 'b2b-sales-enablement'
      - Stores which template was used to create the shift
  
  2. Notes
    - This preserves the template selection when redirecting from /create to /shift/{id}
    - Defaults to 'b2b-sales-enablement' for backward compatibility with existing shifts
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shifts' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE shifts ADD COLUMN template_id TEXT DEFAULT 'b2b-sales-enablement';
  END IF;
END $$;