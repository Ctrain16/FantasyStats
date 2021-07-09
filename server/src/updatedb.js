import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import Player from './player.js';

const tryCatchForAsync = async function (promise) {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    console.error(err);
    return [null, err];
  }
};

const fetchPlayers = async function () {
  const [response, error] = await tryCatchForAsync(
    fetch('https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster')
  );
  if (error) return;

  const [data, error2] = await tryCatchForAsync(response.json());
  if (error2) return;

  const teams = data.teams;

  const players = [];
  teams.forEach(function (team) {
    const rosterJSON = team['roster'];
    if (rosterJSON) {
      rosterJSON['roster'].forEach(function (player) {
        players.push(new Player(player));
      });
    }
  });

  return players;
};

const fetchPlayerStats = async function (player, season) {
  const [response, error] = await tryCatchForAsync(
    fetch(`https://statsapi.web.nhl.com/${player.link}/stats?stats=yearByYear`)
  );
  if (error) return;

  const [data, error2] = await tryCatchForAsync(response.json());
  if (error2) return;

  if (data.stats) player.stats = data.stats[0].splits;
  else
    console.log(
      `[ERROR]: could not get stats for '${player.fullName}'... [RESPONSE MESSAGE]: ${data.message}`
    );
  return player;
};

const updateDb = async function () {
  const players = await Promise.all(
    (await fetchPlayers()).map((player) => fetchPlayerStats(player, '20202021'))
  );

  const mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
    useUnifiedTopology: true,
  });
  await mongoClient.connect();

  const playersCollection = mongoClient
    .db('playerdb')
    .collection('player-stats');

  for (const player of players) {
    await playersCollection.updateOne(
      { _id: player.id }, // query
      { $set: player }, // update operation
      { upsert: true } // options... upsert inserts a document if query doesn't find one
    );
  }

  await mongoClient.close();
  console.log(`[SUCCESS]: Player database was successfully updated`);
};

export { updateDb };
