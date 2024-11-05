const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const cors = require('cors');
const kafka = require('kafka-node');
const axios = require('axios');


const app = express();
const port = 3000;

app.use(cors());

const redisClient = redis.createClient({
  host: '172.18.0.3',
  port: 6379
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

mongoose.connect('mongodb://172.18.0.2:27017/transaction_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(express.json());

const cacheMiddleware = (req, res, next) => {
  const cacheKey = req.originalUrl;

  redisClient.get(cacheKey, (err, data) => {
    if (err) {
      console.error('Redis get error:', err);
      next();
      return;
    }
    if (data) {
      console.log('Cache hit:', cacheKey);
      res.json(JSON.parse(data));
    } else {
      console.log('Cache miss:', cacheKey);
      next();
    }
  });
};

// Cache invalidation function
const invalidateCache = () => {
  const cacheKeys = [
    '/transactions',
    '/sales-by-category',
    '/total-sales-by-payment-method',
    '/sales-over-time',
    '/top-selling-products',
    '/sales-distribution-by-location',
    '/total-transactions'
  ];
  
  cacheKeys.forEach(key => {
    redisClient.keys(`${key}*`, (err, keys) => {
      if (err) return console.log(err);
      keys.forEach(key => {
        redisClient.del(key, (err, response) => {
          if (response == 1) {
            console.log(`Deleted cache key: ${key}`);
          } else {
            console.log(`Failed to delete cache key: ${key}`);
          }
        });
      });
    });
  });
};


// CRUD Operations
// CRUD Operations
app.get('/transactions', cacheMiddleware, async (req, res) => {
  try {
    const transactions = await db.collection('transactions').find().toArray();
    const cacheKey = req.originalUrl;
    redisClient.setex(cacheKey, 3600, JSON.stringify(transactions));
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/transactions', async (req, res) => {
  try {
    const transaction = req.body;
    await db.collection('transactions').insertOne(transaction);
    invalidateCache();  // Clear all related cache
    res.status(201).json(transaction);
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTransaction = req.body;
    await db.collection('transactions').updateOne({ _id: mongoose.Types.ObjectId(id) }, { $set: updatedTransaction });
    invalidateCache();  // Clear all related cache
    res.json(updatedTransaction);
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('transactions').deleteOne({ _id: mongoose.Types.ObjectId(id) });
    invalidateCache();  // Clear all related cache
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/sales-by-category', cacheMiddleware, async (req, res) => {
  try {
    const sales = await db.collection('transactions').aggregate([
      { $group: { _id: '$category', totalQuantity: { $sum: '$quantity' } } }
    ]).toArray();

    const cacheKey = req.originalUrl;
    redisClient.setex(cacheKey, 3600, JSON.stringify(sales));

    res.json(sales);
  } catch (err) {
    console.error('Error fetching sales by category:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/total-sales-by-payment-method', cacheMiddleware, async (req, res) => {
  try {
    const sales = await db.collection('transactions').aggregate([
      { $group: { _id: '$payment_method', totalPrice: { $sum: '$total_price' } } }
    ]).toArray();

    const cacheKey = req.originalUrl;
    redisClient.setex(cacheKey, 3600, JSON.stringify(sales));

    res.json(sales);
  } catch (err) {
    console.error('Error fetching total sales by payment method:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/sales-over-time', cacheMiddleware, async (req, res) => {
  try {
    const sales = await db.collection('transactions').aggregate([
      {
        $addFields: {
          timestamp: {
            $cond: {
              if: { $eq: [{ $type: "$timestamp" }, "string"] },
              then: { $dateFromString: { dateString: "$timestamp" } },
              else: "$timestamp"
            }
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          totalPrice: { $sum: "$total_price" }
        }
      },
      { $sort: { "_id": 1 } }  
    ]).toArray();

    const cacheKey = req.originalUrl;
    redisClient.setex(cacheKey, 3600, JSON.stringify(sales));

    res.json(sales);
  } catch (err) {
    console.error('Error fetching sales over time:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/top-selling-products', cacheMiddleware, async (req, res) => {
  try {
    const sales = await db.collection('transactions').aggregate([
      { $group: { _id: '$product_name', quantity: { $sum: '$quantity' } } },
      { $sort: { quantity: -1 } },
      { $limit: 10 }
    ]).toArray();

    const cacheKey = req.originalUrl;
    redisClient.setex(cacheKey, 3600, JSON.stringify(sales));

    res.json(sales);
  } catch (err) {
    console.error('Error fetching top selling products:', err);
    res.status(500).send('Internal Server Error');
  }
});

const getLocationCoordinates = async (location) => {
  const apiKey = 'c528bf035d064d7eaf6ba0864b68c298'; 
  const encodedLocation = encodeURIComponent(location);
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodedLocation}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    if (data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      console.log(`Coordinates for ${location}: ${lat}, ${lng}`);
      return { lat, lng };
    } else {
      console.log(`No coordinates found for ${location}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching coordinates for ${location}:`, error);
    return null;
  }
};

app.get('/sales-distribution-by-location', cacheMiddleware, async (req, res) => {
  try {
    const sales = await db.collection('transactions').aggregate([
      { $group: { _id: '$location', totalPrice: { $sum: '$total_price' } } }
    ]).toArray();

    console.log('Aggregated sales data:', sales);

    const salesWithCoordinates = await Promise.all(sales.map(async (item) => {
      const coordinates = await getLocationCoordinates(item._id);
      if (coordinates) {
        return { ...item, lat: coordinates.lat, lng: coordinates.lng };
      }
      return null;
    }));

    const validSalesWithCoordinates = salesWithCoordinates.filter(item => item !== null);

    console.log('Sales with coordinates:', validSalesWithCoordinates);

    const cacheKey = req.originalUrl;
    redisClient.setex(cacheKey, 3600, JSON.stringify(validSalesWithCoordinates));

    res.json(validSalesWithCoordinates);
  } catch (err) {
    console.error('Error fetching sales distribution by location:', err);
    res.status(500).send('Internal Server Error');
  }
});




app.get('/total-transactions', cacheMiddleware, async (req, res) => {
  try {
    console.log('Fetching total transactions from MongoDB');
    const total = await db.collection('transactions').countDocuments();
    console.log('Total transactions:', total);

    const cacheKey = req.originalUrl;
    redisClient.setex(cacheKey, 3600, JSON.stringify({ total }));

    res.json({ total });
  } catch (err) {
    console.error('Error fetching total transactions:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Kafka Consumer setup
const Consumer = kafka.Consumer;
const kafkaClient = new kafka.KafkaClient({ kafkaHost: '172.18.0.5:9092' });
const consumer = new Consumer(kafkaClient, [{ topic: 'transactions', partition: 0 }], { autoCommit: true });

consumer.on('message', async (message) => {
  const transaction = JSON.parse(message.value);

  try {
    // Save to MongoDB
    await db.collection('transactions').insertOne(transaction);
    console.log(`Inserted transaction ${transaction.transaction_id} into MongoDB`);

    // Invalidate cache for all relevant endpoints
    invalidateCache('/sales-by-category');
    invalidateCache('/total-sales-by-payment-method');
    invalidateCache('/sales-over-time');
    invalidateCache('/top-selling-products');
    invalidateCache('/sales-distribution-by-location');
    invalidateCache('/total-transactions');

  } catch (err) {
    console.error('Error processing transaction:', err);
  }
});

consumer.on('error', (err) => {
  console.error('Kafka consumer error:', err);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
