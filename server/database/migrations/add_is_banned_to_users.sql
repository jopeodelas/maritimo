/*
  Migration: add_is_banned_to_users.sql
  -------------------------------------------------------
  Adds a boolean column "is_banned" to the "users" table
  with a default of FALSE so that the admin panel can ban
  and unban users.
*/

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT FALSE; 