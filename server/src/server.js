import path from 'path';
import express from 'express';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';

dotenv.config();

import { updateDb } from './util/updatedb.js';
import { fetchPlayerIds } from './util/fetchplayerids.js';

const LATEST_SEASON = '20202021';

const app = express();
app.use(express.json());
if (process.env.NODE_ENV === 'production')
  app.use(express.static(path.join(path.resolve(), '../client/dist')));

const mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
  useUnifiedTopology: true,
});
await mongoClient.connect();
const playersCollection = mongoClient.db('playerdb').collection('player-stats');

app.get('/', (req, res) => {
  res.sendFile(path.join(path.resolve(), '../client/dist/index.html'));
});

app.post('/api/players', async (req, res) => {
  try {
    let { season } = req.body;
    if (season === 'latest') season = LATEST_SEASON;

    const cursor = playersCollection.find({
      statistics: { $elemMatch: { season: season } },
    });
    const players = await cursor.toArray();

    res.send(players);
  } catch (error) {
    console.error(error);
  }
});

app.post('/api/skaters', async (req, res) => {
  try {
    let { season } = req.body;
    if (season === 'latest') season = LATEST_SEASON;

    const cursor = playersCollection.find({
      position: { $ne: 'G' },
      statistics: { $elemMatch: { season: season } },
    });
    const skaters = await cursor.toArray();

    res.send(skaters);
  } catch (error) {
    console.error(error);
  }
});

app.post('/api/goalies', async (req, res) => {
  try {
    let { season } = req.body;
    if (season === 'latest') season = LATEST_SEASON;

    const cursor = playersCollection.find({
      position: { $eq: 'G' },
      statistics: { $elemMatch: { season: season } },
    });
    const goalies = await cursor.toArray();

    res.send(goalies);
  } catch (error) {
    console.error(error);
  }
});

app.post('/api/player', async (req, res) => {
  const { id } = req.body;
  res.send(await playersCollection.findOne({ _id: Number(id) }));
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

app.get('/api/seasons', async (req, res) => {
  res.send([
    '2020-21',
    '2019-20',
    '2018-19',
    '2017-18',
    '2016-17',
    '2015-16',
    '2014-15',
    '2013-14',
    '2012-13',
    '2011-12',
    '2010-11',
    '2009-10',
    '2008-09',
    '2007-08',
    '2006-07',
    '2005-06',
  ]);
});

app.get('/api/updateIds', async (req, res) => {
  await fetchPlayerIds();
  res.send('Succesfully updated player ids.');
});

app.get('/api/updatedb', async (req, res) => {
  try {
    await updateDb();
    res.send('Succesfully updated database.');
  } catch (error) {
    console.error(`[ERROR]: ${error}`);
    res.status(500).send(`Failed to update database.`);
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
