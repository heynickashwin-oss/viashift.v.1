/*
  # Add Sightline Fields to Shifts Table

  1. Changes
    - Add `sightline_line1` column (text) - First line of the sightline message
    - Add `sightline_metric` column (text) - Central metric/value to highlight
    - Add `sightline_line2` column (text) - Second line of the sightline message
    - Add `sightline_enabled` column (boolean) - Toggle to enable/skip sightline phase
  
  2. Default Values
    - sightline_line1: 'What if [company] could recover'
    - sightline_metric: '$1.6M'
    - sightline_line2: 'from deals dying in silence?'
    - sightline_enabled: true
  
  3. Notes
    - [company] placeholder in line1/line2 will be replaced with actual company name
    - If sightline_enabled is false, viewer skips directly to transformation
*/

ALTER TABLE shifts ADD COLUMN IF NOT EXISTS sightline_line1 TEXT DEFAULT 'What if [company] could recover';
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS sightline_metric TEXT DEFAULT '$1.6M';
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS sightline_line2 TEXT DEFAULT 'from deals dying in silence?';
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS sightline_enabled BOOLEAN DEFAULT true;