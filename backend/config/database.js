const mysql = require('mysql');
require('dotenv').config();

//const urlDB = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

const db = mysql.createConnection(
    'mysql://root:DoPnPFdgRRNFRWUoKxXebISgAqgWMjLH@mysql.railway.internal:3306/railway'
);

/*host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME*/

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

module.exports = db;
