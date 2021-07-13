import express from 'express';
import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

import { updateDb } from './updatedb.js';

const app = express();
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
  useUnifiedTopology: true,
});
await mongoClient.connect();
const playersCollection = mongoClient.db('playerdb').collection('player-stats');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/players', async (req, res) => {
  const { season } = req.body;
  const cursor = playersCollection.find({});
  const players = await cursor.toArray();

  res.send(
    players
      .filter((player) => player.position !== 'G')
      .filter((player) => {
        return player._stats.slice(-1)[0].season === season;
      })
  );
});

app.post('/api/goalies', async (req, res) => {
  const { season } = req.body;
  const cursor = playersCollection.find({});
  const players = await cursor.toArray();

  res.send(
    players
      .filter((player) => player.position === 'G')
      .filter((player) => {
        return player._stats.slice(-1)[0].season === season;
      })
  );
});

app.get('/api/updatedb', async (req, res) => {
  await updateDb();
  res.send('Succesfully updated database.');
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
