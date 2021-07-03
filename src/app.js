import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import Player from './player.js';
import * as dotenv from 'dotenv';
dotenv.config();

const tryCatchForAsync = async function (promise) {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    console.error(err);
    return [null, err];
  }
};

const getPlayers = async function () {
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

const getPlayersStatsSingleSeason = async function (player, season) {
  const [response, error] = await tryCatchForAsync(
    fetch(`https://statsapi.web.nhl.com/${player.link}/stats?stats=yearByYear`)
  );
  if (error) return;

  const [data, error2] = await tryCatchForAsync(response.json());
  if (error2) return;

  if (data.stats) player.stats = data.stats[0].splits;
  else
    console.log(
      `[ERROR]: There was an error getting stats for '${player.fullName}'... [RESPONSE MESSAGE]: ${data.message}`
    );
  return player;
};

const players = await Promise.all(
  (
    await getPlayers()
  ).map((player) => getPlayersStatsSingleSeason(player, '20202021'))
);

console.log(players.length);
console.log(players[0]);

const mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
  useUnifiedTopology: true,
});
await mongoClient.connect();
const playersCollection = mongoClient.db('playerdb').collection('player-stats');

for (const player of players) {
  const query = { _id: player.id };
  const update = { $set: player };
  const options = { upsert: true };
  await playersCollection.updateOne(query, update, options);
}

await mongoClient.close();
