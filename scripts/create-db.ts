import { Client } from 'pg';
import 'dotenv/config';

(async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });

  try {
    await client.connect();
    await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log(`✅ Database "${process.env.DB_NAME}" created successfully`);
  } catch (err) {
    if (err.code === '42P04') {
      console.log(`ℹ️ Database "${process.env.DB_NAME}" already exists`);
    } else {
      console.error('❌ Error creating database:', err);
    }
  } finally {
    await client.end();
  }
})();
