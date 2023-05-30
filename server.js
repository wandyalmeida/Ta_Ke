// server.js
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const MONGO_CNSTRING = "mongodb+srv://Wandy:Wandy5566@cluster0.nuptbwo.mongodb.net/?retryWrites=true&w=majority"
// MONGO_CNSTRING = mongodb+srv://Wandy:Wandy5566@cluster0.nuptbwo.mongodb.net/?retryWrites=true&w=majority
const client = new MongoClient(MONGO_CNSTRING);
const dbName = 'List';

async function main() {
  const app = express();
  app.use(express.json());
  app.use(express.static(__dirname));
  try {
    await client.connect();
    console.log('Connected successfully to server');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('waitingList');

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
  });

  app.get('/waitingList', async (req, res) => {
    try {
      const waitingList = await collection.find().toArray();
      res.json(waitingList);
    } catch (err) {
      console.error('Error retrieving waiting list data from MongoDB:', err);
      res.status(500).json({ error: 'An error occurred while retrieving the waiting list data' });
    }
  });

  app.post('/addToWaitingList', async (req, res) => {
    const { userName, musicId, artist, musicName } = req.body;
    const insertResult = await collection.insertOne({
      userName,
      musicId,
      artist,
      musicName,
    });
    res.json(insertResult);
  });
  app.post('/removeFromWaitingList', async (req, res) => {
    // Get the item ID and user name from the request body
    const { itemId, userName } = req.body;

    // Remove the specified item from the waiting list
    await collection.deleteOne({ musicId: itemId, userName: userName });

    // Send a response to the client
    res.send('Item removed from waiting list');
});

app.post('/deleteAll', async (req, res) => {
    // Remove all items from the waiting list
    await collection.deleteMany({});

    // Send a response to the client
    res.send('All items removed from waiting list');
});


  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
}

main().catch(console.error);
