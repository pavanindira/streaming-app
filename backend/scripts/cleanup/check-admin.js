const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./models');
const { User } = db;

const checkAdmin = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Connected to DB.');

        const admin = await User.findOne({ where: { email: 'admin@music.com' } });

        if (admin) {
            console.log('Admin user found:');
            console.log('ID:', admin.id);
            console.log('Email:', admin.email);
            console.log('Role:', admin.role); // This is the critical part
            console.log('Role Type:', typeof admin.role);
        } else {
            console.log('Admin user NOT found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkAdmin();
