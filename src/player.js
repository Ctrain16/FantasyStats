class Player {
  constructor(player) {
    this._id = player['person']['id'];
    this._fullName = player['person']['fullName'];
    this._link = player['person']['link'];
    this._number = player['jerseyNumber'];
    this._position = player['position']['code'];
  }

  set stats(stats) {
    this._stats = stats;
  }

  get stats() {
    return this._stats;
  }

  get id() {
    return this._id;
  }

  get fullName() {
    return this._fullName;
  }

  get link() {
    return this._link;
  }

  get number() {
    return this._number;
  }

  get position() {
    return this._position;
  }
}

export default Player;
