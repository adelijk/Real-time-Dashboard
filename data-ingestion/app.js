const fs = require('fs');
const { MongoClient } = require('mongodb');

// MongoDB connection URI and Database/Collection names
const uri = 'mongodb://172.18.0.2:27017'; // Using the service name 'mongodb' from docker-compose.yml
const dbName = 'transactions_db';
const collectionName = 'transactions';

// Path to the JSON file containing the transactions
const filePath = 'transactions.json';

async function main() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const data = fs.readFileSync(filePath, 'utf8');
        const transactions = JSON.parse(data);

        const result = await collection.insertMany(transactions);
        console.log(`${result.insertedCount} transactions were inserted`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
        console.log('Connection to MongoDB closed');
    }
}

main().catch(console.error);
