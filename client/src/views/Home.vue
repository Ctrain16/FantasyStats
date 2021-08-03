<template>
  <div class="home">
    <div class="filters">
      <Filter
        :label="'Position'"
        :options="positions"
        v-model="filters.position"
      ></Filter>
      <Filter :label="'Team'" :options="teams" v-model="filters.team"></Filter>
    </div>

    <p v-show="skaters.length === 0">Fetching skaters...</p>
    <p v-if="skaters[0] === 'error'">Error fetching skaters</p>
    <div v-else-if="skaters.length > 0" id="player-chart">
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
          <tr
            v-for="(player, i) in playersOnPage"
            :key="i"
            @click="this.$router.push(`/player/${player._id}`)"
          >
            <td>{{ i + 1 + (currentPage - 1) * playersPerPage }}</td>
            <td>{{ player.fullName }}</td>
            <td>{{ getSeason(player) }}</td>
            <td>{{ player.position }}</td>
            <td>{{ player.team.abbreviation }}</td>
            <td
              v-for="(stat, name, index) in playerStats(i)"
              :key="name"
              :class="{
                'active-column':
                  index === 3 && (pageJustLoaded || sortColumn === 'P')
              }"
            >
              {{ stat }}
            </td>
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
import Filter from '../components/filter.vue';

export default {
  name: 'Home',
  components: { Filter },
  data() {
    return {
      goalies: [],
      skaters: [],
      teams: [],
      positions: ['Skaters', 'C', 'L', 'R', 'D', 'G'],

      currentPage: 1,
      playersPerPage: 50,

      sortColumn: 'P', // default to sort by points
      sortDescending: true,
      lastSortColumnIndex: 0,
      pageJustLoaded: true,

      filters: {
        season: '20202021',
        team: 'All',
        position: 'Skaters'
      }
    };
  },
  methods: {
    playerStats(index) {
      return this.filterPlayers()[
        index + (this.currentPage - 1) * this.playersPerPage
      ]._stats.slice(-1)[0].stat;
    },

    filterPlayers() {
      if (this.filters.position === 'G') {
        return this.goalies.filter(goalie => {
          if (this.filters.team !== 'All')
            return goalie.team.name === this.filters.team;
          return goalie;
        });
      }

      return this.skaters.filter(player => {
        if (
          this.filters.team !== 'All' &&
          this.filters.position !== 'Skaters'
        ) {
          return (
            player.team.name === this.filters.team &&
            player.position === this.filters.position
          );
        } else if (this.filters.team !== 'All') {
          return (
            player.team.name === this.filters.team && player.position !== 'G'
          );
        } else if (this.filters.position !== 'Skaters') {
          return player.position === this.filters.position;
        }
        return player.position !== 'G';
      });
    },

    getSeason(player) {
      const season = player._stats.slice(-1)[0].season;
      return `${season.slice(0, 4)}-${season.slice(6)}`;
    },

    selectSortColumn(e) {
      this.pageJustLoaded = false;

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
      if (this.filters.position === 'G') {
        this.goalies = this.goalies.sort((p1, p2) => {
          const p1stats = String(
            p1._stats.slice(-1)[0].stat[this.sortColumn]
          ).replace(':', '');
          const p2stats = String(
            p2._stats.slice(-1)[0].stat[this.sortColumn]
          ).replace(':', '');

          return this.sortDescending ? p2stats - p1stats : p1stats - p2stats;
        });
      } else {
        this.skaters = this.skaters.sort((p1, p2) => {
          const p1stats = String(
            p1._stats.slice(-1)[0].stat[this.sortColumn]
          ).replace(':', '');
          const p2stats = String(
            p2._stats.slice(-1)[0].stat[this.sortColumn]
          ).replace(':', '');

          return this.sortDescending ? p2stats - p1stats : p1stats - p2stats;
        });
      }
    }
  },
  computed: {
    playersOnPage() {
      return this.filterPlayers().slice(
        (this.currentPage - 1) * this.playersPerPage,
        this.currentPage * this.playersPerPage
      );
    },

    playerStatCategories() {
      if (this.filters.position !== 'G')
        return Object.keys(this.skaters[0]._stats.slice(-1)[0].stat);
      else return Object.keys(this.goalies[0]._stats.slice(-1)[0].stat);
    },

    numberOfPages() {
      return Array.from(
        Array(
          Math.ceil(this.filterPlayers().length / this.playersPerPage)
        ).keys()
      );
    }
  },
  async mounted() {
    try {
      this.teams = ['All', ...this.$store.state.teams];
      this.goalies = this.$store.getters.goalies;
      this.skaters = this.$store.getters.skaters.sort((p1, p2) => {
        const p1stats = String(p1._stats.slice(-1)[0].stat['P']).replace(
          ':',
          ''
        );
        const p2stats = String(p2._stats.slice(-1)[0].stat['P']).replace(
          ':',
          ''
        );
        return this.sortDescending ? p2stats - p1stats : p1stats - p2stats;
      });
    } catch (error) {
      this.skaters.push('error');
      console.error(error);
    }
  }
};
</script>

<style>
.home {
  margin: 10px;
  margin-left: 10vw;
  margin-right: 10vw;
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

.active-column {
  background-color: var(--color-lightbluefaded);
}

.pagination {
  display: flex;
  justify-content: center;

  min-width: fit-content;

  padding-top: 2vh;
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

.filters {
  display: flex;
  margin-top: 20px;
}
</style>
