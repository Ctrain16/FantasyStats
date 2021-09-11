import path from 'path';
import express from 'express';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import morgan from 'morgan';
import { MongoClient } from 'mongodb';

dotenv.config();

import { updateDb } from './database/updatedb.js';
import { fetchPlayerIds } from './database/fetchplayerids.js';

const LATEST_SEASON = '20202021';
const PAGE_SIZE = 50;

const app = express();
app.use(express.json());
app.use(morgan('common'));

if (process.env.NODE_ENV === 'production')
  app.use(express.static(path.join(path.resolve(), '../client/dist')));

const mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
  useUnifiedTopology: true,
});
await mongoClient.connect();
const playersCollection = mongoClient.db('playerdb').collection('player-stats');

app.get('/', (req, res, next) => {
  try {
    res.sendFile(path.join(path.resolve(), '../client/dist/index.html'));
  } catch (error) {
    next(error);
  }
});

app.post('/api/players', async (req, res, next) => {
  try {
    let { season, team, position, sortedBy, order, page } = req.body;
    if (season === 'latest') season = LATEST_SEASON;

    const cursor = playersCollection.find({
      statistics: { $elemMatch: { season: season } },
    });

    const players = (await cursor.toArray())
      .map((player) => {
        player.statistics = player.statistics.find((year) => {
          return year.season === season;
        });
        return player;
      })
      .filter((player) => {
        if (team.toLowerCase() !== 'all')
          return player.statistics.team.name === team;
        return player;
      })
      .filter((player) => {
        if (position.toLowerCase() !== 'skaters')
          return player.position === position;
        return player.position !== 'G';
      })
      .sort((p1, p2) => {
        const p1stat = p1.statistics.stat[sortedBy];
        const p2stat = p2.statistics.stat[sortedBy];

        return order === 'desc' ? p2stat - p1stat : p1stat - p2stat;
      });

    const playersOnPage = players.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

    const numPages = Math.ceil(players.length / PAGE_SIZE);

    res.send({
      players: playersOnPage,
      pagination: {
        currentPage: page,
        numberOfPages: numPages,
        pageLength: PAGE_SIZE,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/player', async (req, res, next) => {
  try {
    const { id } = req.body;
    res.send(await playersCollection.findOne({ _id: Number(id) }));
  } catch (error) {
    next(error);
  }
});

app.get('/api/teams', async (req, res, next) => {
  try {
    res.send(
      (
        await (await fetch('https://statsapi.web.nhl.com/api/v1/teams')).json()
      ).teams
        .map((team) => team.name)
        .sort()
    );
  } catch (error) {
    next(error);
  }
});

app.get('/api/search/:query', async (req, res, next) => {
  try {
    const query = req.params.query;
    const cursor = playersCollection
      .find(
        {
          $text: { $search: query + '*' },
        },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(5);

    const results = await cursor.toArray();
    res.send(results);
  } catch (error) {
    next(error);
  }
});

// Database Routes
// TODO need to protect these routes
app.get('/api/updateIds', async (req, res, next) => {
  try {
    await fetchPlayerIds();
    res.send('Succesfully updated player ids.');
  } catch (error) {
    next(error);
  }
});

app.get('/api/updatedb', async (req, res, next) => {
  try {
    await updateDb();
    res.send('Succesfully updated database.');
  } catch (error) {
    next(error);
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('SIGINT', async function () {
  await mongoClient.close();
  console.log('Closed Mongo connection.');
  process.exit(0);
});
