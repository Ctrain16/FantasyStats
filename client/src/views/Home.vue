<template>
  <div class="home">
    <p v-show="players.length === 0">Fetching players...</p>
    <p v-if="players[0] === 'error'">Error fetching players</p>
    <div v-else-if="players.length > 0" id="player-chart">
      <table id="player-stats-table">
        <thead>
          <tr>
            <th>Player</th>
            <th v-for="(stat, i) in playerStatCategories" :key="i">
              {{ stat }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(player, i) in playersOnPage" :key="i">
            <td>{{ player.fullName }}</td>
            <td v-for="(stat, j) in playerStats(i)" :key="j">{{ stat }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div id="pagination">
      <button
        v-for="page in numberOfPages"
        :key="page"
        @click="this.currentPage = page + 1"
      >
        {{ page + 1 }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      players: [],
      currentPage: 1,
      playersPerPage: 50
    };
  },
  methods: {
    playerStats(index) {
      return this.players[index]._stats.slice(-1)[0].stat;
    }
  },
  computed: {
    playersOnPage() {
      return this.players.slice(
        (this.currentPage - 1) * this.playersPerPage,
        this.currentPage * this.playersPerPage
      );
    },

    playerStatCategories() {
      const index = 0;
      while (this.players[index].position === 'G') index++;
      return Object.keys(this.players[index]._stats.slice(-1)[0].stat);
    },

    numberOfPages() {
      return Array.from(
        Array(Math.ceil(this.players.length / this.playersPerPage)).keys()
      );
    }
  },
  async mounted() {
    try {
      this.players = await (await fetch('api/players')).json();
      const x = this.players[0]._stats;
      console.log(x.slice(-1)[0]);
    } catch (error) {
      this.players.push('error');
      console.error(error);
    }
  }
};
</script>

<style>
.home {
  margin: 10px;
}
</style>
