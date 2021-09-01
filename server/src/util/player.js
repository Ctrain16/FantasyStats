import { teamAbbreviations } from './fetchteamabbreviation.js';

class Player {
  constructor(player) {
    for (const property in player[0]) {
      this[property] = player[0][property];
    }
  }

  set stats(stats) {
    this.statistics = stats
      .filter(
        (seasonStats) => seasonStats.league.name === 'National Hockey League'
      )
      .map((seasonStats) => {
        seasonStats.team.abbreviation = teamAbbreviations.get(
          seasonStats.team.name
        );
        return seasonStats;
      });
  }
}

export default Player;
