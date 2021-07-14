import express from 'express';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
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
    players.filter((player) => {
      return player._stats.slice(-1)[0].season === season;
    })
  );
});

app.post('/api/skaters', async (req, res) => {
  const { season } = req.body;
  const cursor = playersCollection.find({ position: { $ne: 'G' } });
  const players = await cursor.toArray();

  res.send(
    players.filter((player) => {
      return player._stats.slice(-1)[0].season === season;
    })
  );
});

app.post('/api/goalies', async (req, res) => {
  const { season } = req.body;
  const cursor = playersCollection.find({ position: { $eq: 'G' } });
  const players = await cursor.toArray();

  res.send(
    players.filter((player) => {
      return player._stats.slice(-1)[0].season === season;
    })
  );
});

app.get('/api/teams', async (req, res) => {
  res.send(
    (
      await (await fetch('https://statsapi.web.nhl.com/api/v1/teams')).json()
    ).teams
      .map((team) => team.name)
      .sort()
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
