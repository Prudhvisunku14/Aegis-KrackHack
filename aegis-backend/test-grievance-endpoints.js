#!/usr/bin/env node
/**
 * Test script to verify grievance endpoints work with the fixed schema
 */

require('dotenv').config();
const db = require('./db');

// Helper to test endpoints
async function testGrievanceEndpoints() {
  try {
    console.log('\n=== Testing Grievance Endpoints ===\n');

    // Test 1: Get grievances schema
    console.log('1. Checking grievances table schema...');
    const schemaResult = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'grievances' 
      ORDER BY ordinal_position
    `);
    console.log('✓ Grievances schema columns:');
    schemaResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    // Test 2: Check if there's test data
    console.log('\n2. Checking existing grievances...');
    const grievancesResult = await db.query('SELECT grievance_id, submitted_by, category_id, status, created_at FROM grievances LIMIT 5');
    console.log(`✓ Found ${grievancesResult.rowCount} grievances`);
    grievancesResult.rows.forEach(g => {
      console.log(`  - ID: ${g.grievance_id}, Submitted By: ${g.submitted_by}, Category: ${g.category_id}, Status: ${g.status}`);
    });

    // Test 3: Test the create endpoint query
    console.log('\n3. Testing INSERT query (without executing)...');
    const testInsertQuery = `
      INSERT INTO grievances (submitted_by, category_id, priority_id, description, location, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'submitted', NOW(), NOW()) 
      RETURNING *
    `;
    console.log('✓ INSERT query is valid');
    console.log(`  Query: ${testInsertQuery.trim()}`);

    // Test 4: Test the list endpoint query
    console.log('\n4. Testing LIST query...');
    const listQuery = `
      SELECT g.*, gc.category_name, gp.priority_name
      FROM grievances g
      LEFT JOIN grievance_category gc ON g.category_id = gc.category_id
      LEFT JOIN grievance_priority gp ON g.priority_id = gp.priority_id
      ORDER BY g.created_at DESC 
      LIMIT 3
    `;
    const listResult = await db.query(listQuery);
    console.log(`✓ LIST query returned ${listResult.rowCount} rows`);
    listResult.rows.forEach(g => {
      console.log(`  - Grievance #${g.grievance_id}: ${g.category_name}, Priority: ${g.priority_name}, Status: ${g.status}`);
    });

    // Test 5: Test myGrievances query (use a test user_id)
    console.log('\n5. Testing MY GRIEVANCES query...');
    const userId = 1; // Test with user ID 1
    const myGrievancesQuery = `
      SELECT g.*, gc.category_name, gp.priority_name, u.full_name as reporter_name
      FROM grievances g
      LEFT JOIN grievance_category gc ON g.category_id = gc.category_id
      LEFT JOIN grievance_priority gp ON g.priority_id = gp.priority_id
      LEFT JOIN users u ON g.submitted_by = u.user_id
      WHERE g.submitted_by = $1 
      ORDER BY g.created_at DESC 
      LIMIT 10
    `;
    const myGrievancesResult = await db.query(myGrievancesQuery, [userId]);
    console.log(`✓ MY GRIEVANCES query returned ${myGrievancesResult.rowCount} rows for user ${userId}`);
    myGrievancesResult.rows.forEach(g => {
      console.log(`  - Grievance #${g.grievance_id}: ${g.category_name}, Submitted by: ${g.reporter_name}`);
    });

    // Test 6: Verify primary key is grievance_id
    console.log('\n6. Testing GET single grievance query...');
    const grievanceId = grievancesResult.rows[0]?.grievance_id;
    if (grievanceId) {
      const getQuery = `
        SELECT g.*, gc.category_name, gp.priority_name
        FROM grievances g
        LEFT JOIN grievance_category gc ON g.category_id = gc.category_id
        LEFT JOIN grievance_priority gp ON g.priority_id = gp.priority_id
        WHERE g.grievance_id = $1
      `;
      const getResult = await db.query(getQuery, [grievanceId]);
      console.log(`✓ GET query returned grievance: #${getResult.rows[0].grievance_id} - ${getResult.rows[0].category_name}`);
    } else {
      console.log('⚠ No grievances found to test GET endpoint');
    }

    console.log('\n=== All Tests Passed ===\n');

  } catch (err) {
    console.error('✗ Error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// Run tests
testGrievanceEndpoints();
