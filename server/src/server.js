import path from 'path';
import express from 'express';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';

dotenv.config();

import { updateDb } from './updatedb.js';
import { fetchPlayerIds } from './fetchplayerids.js';

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
  let { season } = req.body;
  if (season === 'latest') season = LATEST_SEASON;

  const cursor = playersCollection.find({});
  const players = await cursor.toArray();

  res.send(
    season
      ? players.filter((player) => {
          return player._stats.find((year) => year.season === season);
        })
      : players
  );
});

app.post('/api/skaters', async (req, res) => {
  let { season } = req.body;
  if (season === 'latest') season = LATEST_SEASON;

  const cursor = playersCollection.find({ position: { $ne: 'G' } });
  const players = await cursor.toArray();

  res.send(
    players.filter((player) => {
      return player._stats.slice(-1)[0].season === season;
    })
  );
});

app.post('/api/goalies', async (req, res) => {
  let { season } = req.body;
  if (season === 'latest') season = LATEST_SEASON;

  const cursor = playersCollection.find({ position: { $eq: 'G' } });
  const players = await cursor.toArray();

  res.send(
    players.filter((player) => {
      return player._stats.slice(-1)[0].season === season;
    })
  );
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
  await updateDb();
  res.send('Succesfully updated database.');
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
