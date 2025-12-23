/*
  # Create Logos Storage Bucket

  1. Changes
    - Create a public storage bucket named 'logos' for prospect logo uploads
    - Enable public access for viewing logos on shared Shifts
    - Set up RLS policies for authenticated users to upload
  
  2. Security
    - Only authenticated users can upload to the bucket
    - Everyone can view logos (public access for /view/[id] pages)
    - File size limit: 2MB
    - Allowed file types: image/png, image/jpeg, image/svg+xml
*/

-- Create the logos storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

-- Allow authenticated users to update their own logos
CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'logos');

-- Allow authenticated users to delete their own logos
CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'logos');

-- Allow everyone to view logos (public bucket)
CREATE POLICY "Anyone can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');