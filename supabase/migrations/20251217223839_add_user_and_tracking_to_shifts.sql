/*
  # Add user tracking and view metrics to shifts table

  1. Changes
    - Add `user_id` column to `shifts` table (references auth.users)
    - Add `view_count` column to track how many times shift was viewed
    - Add `shared_at` column to track when shift was first shared
    - Update RLS policies for authenticated users
    - Keep public read access for /view routes (prospects)

  2. Security
    - Users can only create shifts for themselves
    - Users can read their own shifts
    - Anyone can read any shift (for public sharing)
    - Users can only update their own shifts
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shifts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE shifts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shifts' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE shifts ADD COLUMN view_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shifts' AND column_name = 'shared_at'
  ) THEN
    ALTER TABLE shifts ADD COLUMN shared_at timestamptz;
  END IF;
END $$;

DROP POLICY IF EXISTS "Anyone can create shifts" ON shifts;
DROP POLICY IF EXISTS "Anyone can view shifts" ON shifts;

CREATE POLICY "Authenticated users can create their own shifts"
  ON shifts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view shifts"
  ON shifts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update their own shifts"
  ON shifts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
