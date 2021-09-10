import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import Player from '../util/player.js';
import {
  calcSkaterAdvancedStats,
  calcGoalieAdvancedStats,
} from '../util/advancedstats.js';
import { fetchTeamAbbreviations } from '../util/fetchteamabbreviation.js';

const tryCatchForAsync = async function (promise) {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    console.error(err);
    return [null, err];
  }
};

const fetchPlayers = async function (ids) {
  const players = await Promise.all(
    ids.map(async (id) => {
      const [response, error] = await tryCatchForAsync(
        fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}`)
      );
      if (error) return;

      const [data, error2] = await tryCatchForAsync(response.json());
      if (error2) return;

      return new Player(data.people);
    })
  );

  console.log(`[INFO]: Players fetched.`);
  return players;
};

const fetchPlayerStats = async function (player) {
  const [response, error] = await tryCatchForAsync(
    fetch(`https://statsapi.web.nhl.com/${player.link}/stats?stats=yearByYear`)
  );
  if (error) return;

  const [data, error2] = await tryCatchForAsync(response.json());
  if (error2) return;

  if (data.stats) {
    if (player.primaryPosition.code === 'G')
      player.stats = formatGoalieStats(data.stats[0].splits);
    else player.stats = formatSkaterStats(data.stats[0].splits);
  } else
    console.log(
      `[ERROR]: could not get stats for '${player.fullName}'... [RESPONSE MESSAGE]: ${data.message}`
    );
  return player.statistics && player.statistics.length > 0 ? player : null; // remove players where we couldn't get their stats or they haven't played in the NHL, why the NHL API would still include them seems dumb
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
    player.statistics.forEach((season) => {
      if (!totalFPPG[season.season])
        totalFPPG[season.season] = { f: {}, d: {}, g: {} };

      let position = 'f';
      if (player.primaryPosition.code === 'G') position = 'g';
      else if (player.primaryPosition.code === 'D') position = 'd';

      totalFPPG[season.season][position].playerCount
        ? totalFPPG[season.season][position].playerCount++
        : (totalFPPG[season.season][position].playerCount = 1);
      totalFPPG[season.season][position].Fpts
        ? (totalFPPG[season.season][position].Fpts += Number(
            season.stat.get('FPPG')
          ))
        : (totalFPPG[season.season][position].Fpts = 1);
    });
  });

  const averageFPPG = {};
  for (const season in totalFPPG) {
    if (!averageFPPG[season]) averageFPPG[season] = { f: {}, d: {}, g: {} };
    averageFPPG[season].f =
      totalFPPG[season].f.Fpts / totalFPPG[season].f.playerCount;
    averageFPPG[season].d =
      totalFPPG[season].d.Fpts / totalFPPG[season].d.playerCount;
    averageFPPG[season].g =
      totalFPPG[season].g.Fpts / totalFPPG[season].g.playerCount;
  }

  return players.map((player) => {
    player.statistics.map((season) => {
      let position = 'f';
      if (player.primaryPosition.code === 'G') position = 'g';
      else if (player.primaryPosition.code === 'D') position = 'd';
      season.stat.set(
        'FPARG',
        (
          season.stat.get('FPPG') - averageFPPG[season.season][position]
        ).toFixed(2)
      );
      return season;
    });
    return player;
  });
};

const updateDb = async function () {
  console.log(`[INFO]: Beginning to update playerdb.`);
  await fetchTeamAbbreviations();

  const mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
    useUnifiedTopology: true,
  });
  await mongoClient.connect();

  const playerIdCollection = mongoClient
    .db('playerdb')
    .collection('player-ids');
  const { playerids } = await playerIdCollection.findOne({ _id: 1 });

  const players = calculateFPARG(
    (
      await Promise.all(
        (
          await fetchPlayers(playerids)
        ).map((player) => fetchPlayerStats(player))
      )
    ).filter((player) => player !== null)
  );
  console.log(`[INFO]: Players stats fetched.`);

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
