// Script to update all seeded users with proper bcrypt passwords
const db = require('../db');
const bcrypt = require('bcrypt');

async function updatePasswords() {
  try {
    console.log('🔐 Updating seed data passwords...\n');

    // Hash the default password
    const defaultPassword = 'aegis@2025';
    const hash = await bcrypt.hash(defaultPassword, 10);

    // Update all users with the new hash
    await db.pool.query('UPDATE users SET password_hash = $1', [hash]);

    console.log('✅ All users updated with password: ' + defaultPassword);
    console.log('\nLogin Credentials for Testing:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📧 Admin User:');
    console.log('  Email: admin@aegis.edu');
    console.log('  Password: ' + defaultPassword);

    console.log('\n📧 Faculty:');
    console.log('  Email: rajesh.kumar@aegis.edu');
    console.log('  Password: ' + defaultPassword);

    console.log('\n📧 Student:');
    console.log('  Email: priya.singh@aegis.edu');
    console.log('  Password: ' + defaultPassword);

    console.log('\n📧 Authority:');
    console.log('  Email: dean@aegis.edu');
    console.log('  Password: ' + defaultPassword);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating passwords:', error.message);
    process.exit(1);
  }
}

updatePasswords();
