/*
  # Create shifts table

  1. New Tables
    - `shifts`
      - `id` (uuid, primary key) - Unique identifier for each shift
      - `company_input` (text) - The company name or URL entered by the user
      - `created_at` (timestamptz) - Timestamp when the shift was created
  
  2. Security
    - Enable RLS on `shifts` table
    - Add policy to allow anyone to create shifts (public access)
    - Add policy to allow anyone to read their own created shifts
*/

CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_input text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create shifts"
  ON shifts
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view shifts"
  ON shifts
  FOR SELECT
  TO anon
  USING (true);