/*
  Migration: drop_players_image_data_idx.sql
  -------------------------------------------------------
  Drops the problematic index on BYTEA column image_data
  that caused "index row requires N bytes, maximum size is 8191".
  We don't need an index on raw image bytes. If needed later,
  create a hash-based index on md5(image_data).
*/

DROP INDEX IF EXISTS idx_players_image_data; 