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
        players.push(new Player(player, team));
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

  if (data.stats) {
    const stats = data.stats[0].splits;

    for (const [index, { stat }] of stats.entries()) {
      stats[index].stat = new Map([
        ['GP', stat.games],
        ['G', stat.goals],
        ['A', stat.assists],
        ['P', stat.points],
        ['+/-', stat.plusMinus],
        ['PIM', stat.pim],
        ['H', stat.hits],
        ['S', stat.shots],
        ['S%', stat.shotPct],
        ['BS', stat.blocked],
        ['GWG', stat.gameWinningGoals],
        ['OTG', stat.overTimeGoals],
        ['PPG', stat.powerPlayGoals],
        ['PPP', stat.powerPlayPoints],
        ['SHG', stat.shortHandedGoals],
        ['SHP', stat.shortHandedPoints],
        ['TOI', stat.timeOnIce],
        ['PPTOI', stat.powerPlayTimeOnIce],
        ['SHTOI', stat.shortHandedTimeOnIce],
        ['FO%', stat.faceOffPct],
      ]);
    }
    player.stats = stats;
  } else
    console.log(
      `[ERROR]: could not get stats for '${player.fullName}'... [RESPONSE MESSAGE]: ${data.message}`
    );
  return player.stats && player.stats.length > 0 ? player : null; // remove players where we couldn't get their stats or they haven't played in the NHL, why the NHL API would still include them seems dumb
};

const updateDb = async function () {
  const players = (
    await Promise.all(
      (
        await fetchPlayers()
      ).map((player) => fetchPlayerStats(player, '20202021'))
    )
  ).filter((player) => player !== null);

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
