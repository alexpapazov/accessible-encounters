-- Migration 001 — visual style preference
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- Adds the column that remembers which visual style a signed-in user picked in
-- Settings, so the choice follows them across devices. Signed-out users keep
-- the preference in localStorage and need nothing here.
--
-- Safe to run on a live database: adding a nullable column with a default
-- rewrites nothing and locks nothing meaningfully at this size. Existing rows
-- get 'basic', which is what they were already seeing.

alter table public.profiles
  add column if not exists visual_style text not null default 'basic';

-- Keep the column honest: only styles the app actually ships.
-- Extend this list when a new renderer is added.
alter table public.profiles
  drop constraint if exists profiles_visual_style_check;

alter table public.profiles
  add constraint profiles_visual_style_check
  check (visual_style in ('basic'));
