<template>
  <div class="player" v-if="player.fullName">
    <div class="player-info">
      <h3>{{ player.fullName }}</h3>
      <p><b>Team:</b> {{ player.team.name }}</p>
      <p><b>Position:</b> {{ player.position }}</p>
      <p><b>Number:</b> {{ player.number }}</p>
    </div>

    <div id="player-chart">
      <table id="player-stats-table">
        <thead>
          <th>Season</th>
          <th>Team</th>
          <th v-for="(stat, i) in playerStatCategories" :key="i">
            {{ stat }}
          </th>
        </thead>
        <tbody>
          <tr v-for="(season, i) in player._stats" :key="i">
            <td>{{ formatSeason(season.season) }}</td>
            <td>{{ season.team.name }}</td>
            <td v-for="(stat, i) in season.stat" :key="i">
              {{ stat }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>

<script>
export default {
  name: 'Player',
  props: {
    id: String
  },
  data() {
    return {
      player: {}
    };
  },
  methods: {
    formatSeason(season) {
      return `${season.slice(0, 4)}-${season.slice(6)}`;
    },

    async updatePlayer() {
      this.player = await (
        await fetch('api/player', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: this.id
          })
        })
      ).json();
    }
  },
  computed: {
    playerStatCategories() {
      return Object.keys(this.player._stats.slice(-1)[0].stat);
    }
  },
  async mounted() {
    this.updatePlayer();
  },
  watch: {
    id: function(newVal, oldVal) {
      this.updatePlayer();
    }
  }
};
</script>

<style>
.player {
  margin: 10px;
}

.player-info {
  margin-bottom: 20px;
}

#player-chart {
  overflow-x: auto;
  max-width: fit-content;
  box-shadow: 0px 4px 8px 0px rgb(182, 182, 182);
  border: 1px solid var(--color-lightblue);
}

#player-stats-table {
  border-collapse: collapse;
  width: 100%;
  max-width: 80vw;
}

#player-stats-table td,
#player-stats-table th {
  padding: 8px;
  white-space: nowrap;
}

#player-stats-table td {
  border: 1px solid #ddd;
}

#player-stats-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

#player-stats-table tr:hover {
  background-color: #ddd;
  cursor: pointer;
}

#player-stats-table th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: var(--color-lightblue);
  color: white;
}
</style>
