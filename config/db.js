// config/db.js
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: 1433,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    pool: {
        max: 500,          // increase to 30-50 depending on server capacity
        min: 50,
        idleTimeoutMillis: 300000
    }
};

let pool;

const connectDB = async () => {
    try {
        pool = await sql.connect(config);
        console.log('Connected to MSSQL');
    } catch (error) {
        console.error('MSSQL Connection Failed:', error);
    }
};

const getDBPool = () => {
    if (!pool) {
        throw new Error('Database connection not established. Call connectDB() first.');
    }
    return pool;
};

export { connectDB, getDBPool, sql, pool };
