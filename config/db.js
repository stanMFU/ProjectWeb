const mysql = require('mysql2');

// Create a MySQL pool with promises
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'webdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();  // Notice the .promise() to enable promise-based API

module.exports = pool;
