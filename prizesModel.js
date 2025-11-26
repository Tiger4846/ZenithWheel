const db = require('./db');

// Initialize the table
const initTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS prizes (
      id VARCHAR(255) PRIMARY KEY,
      name TEXT NOT NULL,
      color VARCHAR(50),
      quantity INTEGER DEFAULT 0,
      original_quantity INTEGER DEFAULT 0
    );
  `;
    await db.query(queryText);
};

const getAllPrizes = async () => {
    const res = await db.query('SELECT * FROM prizes');
    // Convert snake_case to camelCase for frontend compatibility
    return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        color: row.color,
        quantity: row.quantity,
        originalQuantity: row.original_quantity
    }));
};

const createPrize = async (prize) => {
    const queryText = `
    INSERT INTO prizes (id, name, color, quantity, original_quantity)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
    const values = [
        String(prize.id),
        prize.name,
        prize.color,
        prize.quantity,
        prize.originalQuantity
    ];
    const res = await db.query(queryText, values);
    return res.rows[0];
};

// Bulk replace (Transaction)
const resetPrizes = async (newPrizes) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM prizes');

        const queryText = `
      INSERT INTO prizes (id, name, color, quantity, original_quantity)
      VALUES ($1, $2, $3, $4, $5)
    `;

        for (const prize of newPrizes) {
            const values = [
                String(prize.id),
                prize.name,
                prize.color,
                prize.quantity,
                prize.originalQuantity
            ];
            await client.query(queryText, values);
        }

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

const decrementPrizeQuantity = async (id) => {
    const queryText = `
    UPDATE prizes
    SET quantity = quantity - 1
    WHERE id = $1 AND quantity > 0
    RETURNING *;
  `;
    const res = await db.query(queryText, [String(id)]);
    if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
            id: row.id,
            name: row.name,
            color: row.color,
            quantity: row.quantity,
            originalQuantity: row.original_quantity
        };
    }
    return null;
};

module.exports = {
    initTable,
    getAllPrizes,
    createPrize,
    resetPrizes,
    decrementPrizeQuantity
};
