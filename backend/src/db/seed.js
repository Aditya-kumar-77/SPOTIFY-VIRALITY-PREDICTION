require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  console.log('Seed: No sample predictions to insert. Run migrations first.');
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
