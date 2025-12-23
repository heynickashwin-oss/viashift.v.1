/*
  # Create Shift Shares Tracking Table

  1. New Tables
    - `shift_shares`
      - `id` (uuid, primary key) - Unique share record ID
      - `shift_id` (uuid, foreign key) - References shifts table
      - `shared_by_email` (text, nullable) - Email of person sharing (champion)
      - `shared_to_email` (text, nullable) - Email of recipient
      - `stakeholder_type` (text) - Type of stakeholder perspective (finance/ops/sales/all)
      - `created_at` (timestamptz) - When the share occurred
      - `viewed_at` (timestamptz, nullable) - When recipient viewed the shift

  2. Security
    - Enable RLS on `shift_shares` table
    - Add policy for authenticated users to insert their own shares
    - Add policy for authenticated users to view shares of their shifts

  3. Indexes
    - Index on shift_id for fast lookups
    - Index on shared_to_email for tracking recipient engagement
*/

-- Create shift_shares table
CREATE TABLE IF NOT EXISTS shift_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id uuid NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  shared_by_email text,
  shared_to_email text,
  stakeholder_type text NOT NULL DEFAULT 'all',
  created_at timestamptz DEFAULT now(),
  viewed_at timestamptz
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_shift_shares_shift_id ON shift_shares(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_shares_shared_to_email ON shift_shares(shared_to_email);
CREATE INDEX IF NOT EXISTS idx_shift_shares_created_at ON shift_shares(created_at);

-- Enable RLS
ALTER TABLE shift_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert shares (for tracking purposes)
CREATE POLICY "Anyone can create share records"
  ON shift_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can view shares for shifts they own
CREATE POLICY "Users can view shares of their shifts"
  ON shift_shares
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shifts
      WHERE shifts.id = shift_shares.shift_id
      AND shifts.user_id = auth.uid()
    )
  );

-- Policy: Allow anonymous share tracking (for public views)
CREATE POLICY "Allow anonymous share inserts"
  ON shift_shares
  FOR INSERT
  TO anon
  WITH CHECK (true);
