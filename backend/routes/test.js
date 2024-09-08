const bcrypt = require('bcrypt');

const generateHash = async (plainPassword) => {
    try {
        const hash = await bcrypt.hash(plainPassword, 10);
        console.log(`Hashed password: ${hash}`);
    } catch (error) {
        console.error('Error hashing password:', error);
    }
};

// Example usage:
const password = 'CICT12345'; // Password to hash
generateHash(password);

const hashedPasswordFromDB = 'yourStoredHash'; // Replace with hash from database

// Password entered by user during login
const enteredPassword = 'yourTestPassword';

bcrypt.compare(enteredPassword, hashedPasswordFromDB, (err, isMatch) => {
    if (err) {
        console.error('Error comparing passwords:', err);
    } else if (isMatch) {
        console.log('Password matches');
    } else {
        console.log('Password does not match');
    }
});