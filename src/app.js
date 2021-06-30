import fetch from 'node-fetch';
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
    fetch(
      `https://statsapi.web.nhl.com/api/v1/people/${player.id}/stats?stats=yearByYear`
    )
  );
  if (error) return;

  const [data, error2] = await tryCatchForAsync(response.json());
  if (error2) return;

  if (data.stats) player.stats = data.stats[0].splits;
  else
    console.log(
      `ERROR: There was an error getting stats for ${player.fullName}... RESPONSE MESSAGE: ${data.message}`
    );
  return player;
};

let players = await getPlayers();
const playerPromises = players.map((player) =>
  getPlayersStatsSingleSeason(player, '20202021')
);
players = await Promise.all(playerPromises);
// players.forEach((player) => {
//   if (player.position === 'G') console.log(player);
// });
console.log(players[0]);
console.log(players.length);
