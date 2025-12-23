/*
  # Add vendor branding fields to shifts table

  ## Changes Made
  1. New Columns
    - `vendor_logo_url` (text, nullable) - URL to the vendor/seller's logo for watermarking
    - `vendor_name` (text, nullable) - Name of the vendor/seller organization

  ## Purpose
  These fields enable shifts to display vendor/seller branding alongside the prospect's branding,
  supporting white-label and partner scenarios where the visualization needs to show who created
  or is presenting the transformation analysis.

  ## Security
  No RLS changes needed - vendor fields inherit existing row-level security from shifts table.
*/

-- Add vendor branding fields to shifts table
ALTER TABLE shifts 
ADD COLUMN IF NOT EXISTS vendor_logo_url TEXT,
ADD COLUMN IF NOT EXISTS vendor_name TEXT;
