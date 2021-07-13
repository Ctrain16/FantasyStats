<template>
  <div class="home">
    <p v-show="players.length === 0">Fetching players...</p>
    <p v-if="players[0] === 'error'">Error fetching players</p>
    <div v-else-if="players.length > 0" id="player-chart">
      <table id="player-stats-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Season</th>
            <th>Pos</th>
            <th>Team</th>
            <th
              v-for="(stat, i) in playerStatCategories"
              :key="i"
              @click="selectSortColumn"
            >
              {{ stat }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(player, i) in playersOnPage" :key="i">
            <td>{{ i + 1 }}</td>
            <td>{{ player.fullName }}</td>
            <td>{{ getSeason(player) }}</td>
            <td>{{ player.position }}</td>
            <td>{{ player.team }}</td>
            <td v-for="(stat, j) in playerStats(i)" :key="j">{{ stat }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <a
        v-for="page in numberOfPages"
        :key="page"
        @click="currentPage = page + 1"
        :class="currentPage === page + 1 ? 'page-button active' : 'page-button'"
        href="#"
      >
        {{ page + 1 }}
      </a>
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
      playersPerPage: 50,

      sortColumn: '',
      sortDescending: true,
      lastSortColumnIndex: 0,

      filters: {
        season: '20202021'
      }
    };
  },
  methods: {
    playerStats(index) {
      return this.players[
        index + (this.currentPage - 1) * this.playersPerPage
      ]._stats.slice(-1)[0].stat;
    },

    getSeason(player) {
      const season = player._stats.slice(-1)[0].season;
      return `${season.slice(0, 4)}-${season.slice(6)}`;
    },

    selectSortColumn(e) {
      const tableHeaders = document.getElementById('player-stats-table')
        .children[0].children[0].children;
      const sortColumnIndex = [...tableHeaders].findIndex(
        header => header.textContent === e.target.textContent
      );

      [...document.getElementById('player-stats-table').rows].forEach(row => {
        row.cells[this.lastSortColumnIndex].classList.remove('active-column');
        const sortedColumn = row.cells[sortColumnIndex];
        if (sortedColumn.nodeName === 'TD')
          sortedColumn.classList.add('active-column');
      });
      this.lastSortColumnIndex = sortColumnIndex;

      this.sortDescending =
        this.sortColumn === e.target.textContent ? !this.sortDescending : true;
      this.sortColumn = e.target.textContent;
      this.currentPage = 1;
      this.players = this.players.sort((p1, p2) => {
        const p1stats = String(
          p1._stats.slice(-1)[0].stat[this.sortColumn]
        ).replace(':', '');
        const p2stats = String(
          p2._stats.slice(-1)[0].stat[this.sortColumn]
        ).replace(':', '');

        return this.sortDescending ? p2stats - p1stats : p1stats - p2stats;
      });
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
      this.players = await (
        await fetch('api/players', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            season: this.filters.season
          })
        })
      ).json();
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

#player-chart {
  overflow-x: auto;
  margin-left: 10vw;
  margin-right: 10vw;
  box-shadow: 0px 4px 8px 0px rgb(182, 182, 182);
}

#player-stats-table {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
  max-width: 80vw;
}

#player-stats-table td,
#player-stats-table th {
  border: 1px solid #ddd;
  padding: 8px;
  white-space: nowrap;
}

#player-stats-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

#player-stats-table tr:hover {
  background-color: #ddd;
}

#player-stats-table th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: var(--color-lightblue);
  color: white;
}

.active-column {
  background-color: var(--color-lightbluefaded);
}

.pagination {
  display: flex;
  justify-content: center;

  min-width: fit-content;

  padding-top: 2vh;
  padding-bottom: 5vh;
}

.page-button {
  color: var(--color-lightblue);
  float: left;
  padding: 4px 8px;
  text-decoration: none;
}

.pagination a.active {
  background-color: var(--color-lightblue);
  color: white;
  border-radius: 3px;
}

.pagination a:hover:not(.active) {
  background-color: #ddd;
  border-radius: 5px;
}
</style>
