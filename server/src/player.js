class Player {
  constructor(player) {
    this._id = player['person']['id'];
    this._link = player['person']['link'];
    this.fullName = player['person']['fullName'];
    this.number = player['jerseyNumber'];
    this.position = player['position']['code'];
  }

  set stats(stats) {
    this._stats = stats.filter(
      (seasonStats) => seasonStats.league.name === 'National Hockey League'
    );
  }

  get stats() {
    return this._stats;
  }

  get id() {
    return this._id;
  }

  get link() {
    return this._link;
  }
}

export default Player;
