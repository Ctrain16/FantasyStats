import fetch from 'node-fetch';

const teamAbbreviations = new Map();

const fetchTeamAbbreviations = async function () {
  const { teams } = await (
    await fetch(`https://statsapi.web.nhl.com/api/v1/teams`)
  ).json();

  teams.forEach((team) => {
    teamAbbreviations.set(team.name, team.abbreviation);
  });
};

export { teamAbbreviations, fetchTeamAbbreviations };
