/*
  # Add Branding Customization to Shifts

  1. Changes
    - Add `logo_url` column to store uploaded prospect logo
    - Add `primary_color` column for custom flow color (defaults to #00D4E5 cyan)
    - Add `secondary_color` column for accent/blocked color (defaults to #FF6B6B coral)
  
  2. Notes
    - These allow sellers to customize each Shift with prospect branding
    - Logo stored in Supabase storage, URL saved in column
    - Colors apply to flow visualization
*/

-- Add branding columns to shifts table
DO $$
BEGIN
  -- Add logo_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shifts' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE shifts ADD COLUMN logo_url text;
  END IF;

  -- Add primary_color column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shifts' AND column_name = 'primary_color'
  ) THEN
    ALTER TABLE shifts ADD COLUMN primary_color text DEFAULT '#00D4E5';
  END IF;

  -- Add secondary_color column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shifts' AND column_name = 'secondary_color'
  ) THEN
    ALTER TABLE shifts ADD COLUMN secondary_color text DEFAULT '#FF6B6B';
  END IF;
END $$;