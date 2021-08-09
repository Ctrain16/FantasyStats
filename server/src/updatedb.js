import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import Player from './player.js';
import {
  calcSkaterAdvancedStats,
  calcGoalieAdvancedStats,
} from './advancedstats.js';

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
    if (player.position === 'G')
      player.stats = formatGoalieStats(data.stats[0].splits);
    else player.stats = formatSkaterStats(data.stats[0].splits);
  } else
    console.log(
      `[ERROR]: could not get stats for '${player.fullName}'... [RESPONSE MESSAGE]: ${data.message}`
    );
  return player.stats && player.stats.length > 0 ? player : null; // remove players where we couldn't get their stats or they haven't played in the NHL, why the NHL API would still include them seems dumb
};

const formatSkaterStats = function (stats) {
  for (const [index, { stat }] of stats.entries()) {
    const advancedStats = calcSkaterAdvancedStats(stat);
    stats[index].stat = new Map([
      ['GP', stat.games],
      ['G', stat.goals],
      ['A', stat.assists],
      ['P', stat.points],
      ['+/-', stat.plusMinus],
      ['PIM', stat.pim],
      ['H', stat.hits],
      ['S', stat.shots],
      ['S%', Number(stat.shotPct).toFixed(1)],
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
      ['FO%', Number(stat.faceOffPct).toFixed(1)],
      ['Fpts', Number(advancedStats.Fpts).toFixed(2)],
      ['FPPG', Number(advancedStats.FPPG).toFixed(2)],
    ]);
  }

  return stats;
};

const formatGoalieStats = function (stats) {
  for (const [index, { stat }] of stats.entries()) {
    const advancedStats = calcGoalieAdvancedStats(stat);
    stats[index].stat = new Map([
      ['GP', stat.games],
      ['GS', stat.gamesStarted],
      ['W', stat.wins],
      ['L', stat.losses],
      ['T/OT', stat.ot + stat.ties],
      ['SO', stat.shutouts],
      ['SV%', String(Number(stat.savePercentage).toFixed(3)).slice(1)],
      ['GAA', Number(stat.goalAgainstAverage).toFixed(2)],
      ['GA', stat.goalsAgainst],
      ['SA', stat.shotsAgainst],
      ['SV', stat.saves],
      ['TOI', stat.timeOnIce],
      ['Fpts', Number(advancedStats.Fpts).toFixed(2)],
      ['FPPG', Number(advancedStats.FPPG).toFixed(2)],
    ]);
  }

  return stats;
};

/**
 * Calculates each players FPARG (Fantasy points above replacement / per game)
 * @param {*} players
 */
const calculateFPARG = function (players) {
  const totalFPPG = {};
  players.forEach((player) => {
    player._stats.forEach((season) => {
      if (!totalFPPG[season.season]) totalFPPG[season.season] = {};

      totalFPPG[season.season].playerCount
        ? totalFPPG[season.season].playerCount++
        : (totalFPPG[season.season].playerCount = 1);
      totalFPPG[season.season].Fpts
        ? (totalFPPG[season.season].Fpts += Number(season.stat.get('FPPG')))
        : (totalFPPG[season.season].Fpts = 1);
    });
  });

  const averageFPPG = {};
  for (const season in totalFPPG) {
    if (!averageFPPG[season]) averageFPPG[season] = {};
    averageFPPG[season] =
      totalFPPG[season].Fpts / totalFPPG[season].playerCount;
  }

  return players.map((player) => {
    player._stats.map((season) => {
      season.stat.set(
        'FPARG',
        (season.stat.get('FPPG') - averageFPPG[season.season]).toFixed(2)
      );
      return season;
    });
    return player;
  });
};

const updateDb = async function () {
  const players = calculateFPARG(
    (
      await Promise.all(
        (
          await fetchPlayers()
        ).map((player) => fetchPlayerStats(player, '20202021'))
      )
    ).filter((player) => player !== null)
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
