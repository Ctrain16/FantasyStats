const fantasyPointValues = {
  assist: 3,
  goal: 4,
  hit: 0.25,
  pim: 0.5,
  plusMinus: 0.25,
  shg: 2,
  shot: 0.5,
  ppp: 1,
  ga: -1,
  sv: 0.25,
  so: 5,
  w: 5,
};

const calcPlayerFPPG = function (stats) {
  const fppg =
    ((stats.goals ?? 0) * fantasyPointValues.goal +
      (stats.assists ?? 0) * fantasyPointValues.assist +
      (stats.hits ?? 0) * fantasyPointValues.hit +
      (stats.pim ?? 0) * fantasyPointValues.pim +
      (stats.plusMinus ?? 0) * fantasyPointValues.plusMinus +
      (stats.shortHandedGoals ?? 0) * fantasyPointValues.shg +
      (stats.shots ?? 0) * fantasyPointValues.shot +
      (stats.powerPlayPoints ?? 0) * fantasyPointValues.ppp) /
    stats.games;

  return fppg;
};

export { calcPlayerFPPG };
