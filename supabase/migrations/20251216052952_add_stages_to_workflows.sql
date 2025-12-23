/*
  # Add stages column to workflows table

  1. Changes
    - Add `stages` column to `workflows` table to store stage markers
    - Stages are stored as JSONB array containing stage definitions

  2. Notes
    - Existing workflows will have an empty array by default
    - Each stage has: id, name, time (position in timeline), and color
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflows' AND column_name = 'stages'
  ) THEN
    ALTER TABLE workflows ADD COLUMN stages JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;
