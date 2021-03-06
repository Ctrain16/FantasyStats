const fantasyPointValues = {
  assist: 3,
  goal: 4,
  hit: 0.25,
  pim: 0.25,
  plusMinus: 0.25,
  shg: 1,
  shot: 0.5,
  ppp: 1,
  ga: -1,
  save: 0.25,
  so: 3,
  win: 4,
};

const calcSkaterAdvancedStats = function (stats) {
  const totalFantasyPoints =
    (stats.goals ?? 0) * fantasyPointValues.goal +
    (stats.assists ?? 0) * fantasyPointValues.assist +
    (stats.hits ?? 0) * fantasyPointValues.hit +
    (stats.pim ?? 0) * fantasyPointValues.pim +
    (stats.plusMinus ?? 0) * fantasyPointValues.plusMinus +
    (stats.shortHandedGoals ?? 0) * fantasyPointValues.shg +
    (stats.shots ?? 0) * fantasyPointValues.shot +
    (stats.powerPlayPoints ?? 0) * fantasyPointValues.ppp;

  return {
    Fpts: totalFantasyPoints,
    FPPG: totalFantasyPoints / stats.games,
  };
};

const calcGoalieAdvancedStats = function (stats) {
  const totalFantasyPoints =
    (stats.assists ?? 0) * fantasyPointValues.assist +
    (stats.pim ?? 0) * fantasyPointValues.pim +
    (stats.goalsAgainst ?? 0) * fantasyPointValues.ga +
    (stats.saves ?? 0) * fantasyPointValues.save +
    (stats.shutouts ?? 0) * fantasyPointValues.so +
    (stats.wins ?? 0) * fantasyPointValues.win;

  return {
    Fpts: totalFantasyPoints,
    FPPG: totalFantasyPoints / stats.games,
  };
};

export { calcSkaterAdvancedStats, calcGoalieAdvancedStats };
