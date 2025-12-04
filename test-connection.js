const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB Connection...');
console.log('Connection URI:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password

// Test DNS resolution first
const dns = require('dns');
const url = require('url');

try {
  const parsedUri = new URL(process.env.MONGODB_URI);
  const hostname = parsedUri.hostname;

  console.log('\n1. Testing DNS resolution for:', hostname);

  dns.resolve(hostname, (err, addresses) => {
    if (err) {
      console.error('DNS Resolution Failed:', err.message);
      console.log('\n❌ The cluster hostname cannot be found.');
      console.log('\nPossible solutions:');
      console.log('1. Verify the cluster exists in MongoDB Atlas');
      console.log('2. Get the correct connection string from Atlas:');
      console.log('   - Go to https://cloud.mongodb.com');
      console.log('   - Click "Connect" on your cluster');
      console.log('   - Select "Connect your application"');
      console.log('   - Copy the connection string');
      process.exit(1);
    } else {
      console.log('✓ DNS resolved successfully:', addresses);
      testMongooseConnection();
    }
  });
} catch (error) {
  console.error('Invalid URI format:', error.message);
  process.exit(1);
}

async function testMongooseConnection() {
  console.log('\n2. Testing Mongoose connection...');

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✓ MongoDB Connected Successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    console.log('Ready State:', conn.connection.readyState);

    await mongoose.connection.close();
    console.log('\n✓ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed:', error.message);

    if (error.message.includes('authentication failed')) {
      console.log('\n⚠️  Authentication issue - check username/password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n⚠️  Cluster hostname not found - update your connection string');
    } else if (error.message.includes('timeout')) {
      console.log('\n⚠️  Connection timeout - check IP whitelist in Atlas Network Access');
    }

    process.exit(1);
  }
}
