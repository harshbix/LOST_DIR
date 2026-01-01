const { MongoClient } = require('mongodb');

(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB || 'lostandfound';
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    const admin = client.db(dbName).admin();
    const info = await admin.ping();
    console.log(`Connected to MongoDB at ${uri}/${dbName} — ping:`, info);
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection failed:', err && err.message ? err.message : err);
    process.exit(2);
  } finally {
    try { await client.close(); } catch (e) {}
  }
})();
