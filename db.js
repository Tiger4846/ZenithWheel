const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: {
    //   rejectUnauthorized: false // Required for some hosted databases like Railway/Heroku
    // }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
