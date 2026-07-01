-- Task 2: Add owner_id + affiliate_base_url to brands table
-- Run this once in Supabase SQL Editor: https://supabase.com/dashboard/project/lcgyimqfjhafdvmjsrir/sql

ALTER TABLE brands ADD COLUMN IF NOT EXISTS owner_id text;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS affiliate_base_url text;

-- Seed ES brand with current hardcoded values (backward compat)
UPDATE brands
SET
  owner_id = '15957920',
  affiliate_base_url = 'https://shop.doterra.com/ES/es_ES/shop/essential-oils/?OwnerID=15957920'
WHERE id = 'a20e4f07-e572-4605-acfc-5c53355f2ada';
