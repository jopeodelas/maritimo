const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'maritimo_voting',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Creating discussions and comments tables...');
    
    // Create discussions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS discussions (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
          author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_discussions_author_id ON discussions(author_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_discussions_updated_at ON discussions(updated_at);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_comments_discussion_id ON comments(discussion_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);`);
    
    // Create trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_discussion_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
          UPDATE discussions 
          SET updated_at = CURRENT_TIMESTAMP 
          WHERE id = NEW.discussion_id;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Create trigger
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_discussion_timestamp ON comments;
      CREATE TRIGGER trigger_update_discussion_timestamp
          AFTER INSERT ON comments
          FOR EACH ROW
          EXECUTE FUNCTION update_discussion_timestamp();
    `);
    
    console.log('Tables created successfully!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

createTables(); 