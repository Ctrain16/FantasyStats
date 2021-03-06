<template>
  <div class="home">
    <div class="filters">
      <Filter
        :label="'Position'"
        :options="positions"
        v-model="position"
      ></Filter>
      <Filter
        :label="'Team'"
        :options="['All', ...teams]"
        v-model="team"
      ></Filter>
      <Filter
        :label="'Season'"
        :options="seasons"
        :selected="season"
        v-model="season"
      ></Filter>
    </div>

    <div v-if="!loading">
      <p v-if="players.length === 0">Error fetching skaters</p>
      <div v-else id="player-chart">
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
              v-for="(player, i) in players"
              :key="i"
              @click="this.$router.push(`/player/${player._id}`)"
            >
              <td>{{ i + 1 + (currentPage - 1) * playersPerPage }}</td>
              <td>{{ player.fullName }}</td>
              <td>{{ formatSeason(player.statistics.season) }}</td>
              <td>{{ player.position }}</td>
              <td>{{ player.statistics.team.abbreviation }}</td>
              <td
                v-for="(stat, name) in player.statistics.stat"
                :key="name"
                :class="{
                  'active-column': name === sortColumn
                }"
              >
                {{ stat }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      -
      <div class="pagination">
        <a
          v-for="page in numberOfPages"
          :key="page"
          @click="currentPage = page"
          :class="currentPage === page ? 'page-button active' : 'page-button'"
          href="#"
        >
          {{ page }}
        </a>
      </div>
    </div>
    <Loading v-else></Loading>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Filter from '../components/filter.vue';
import Loading from '../components/loading.vue';

export default {
  name: 'Home',
  components: { Filter, Loading },
  data() {
    return {
      players: [],

      currentPage: 1,
      numberOfPages: null,
      playersPerPage: 50,

      sortColumn: 'P',
      sortDescending: true,
      lastSortColumnIndex: 0,

      loading: false,

      // filters
      position: 'Skaters',
      team: 'All',
      season: '2020-21'
    };
  },
  watch: {
    position: function(newPosition, oldPosition) {
      if (newPosition === 'G') this.sortColumn = 'SV%';
      else if (newPosition !== 'G' && oldPosition === 'G')
        this.sortColumn = 'P';
      this.loadPlayers();
    },

    team: function() {
      this.loadPlayers();
    },

    season: function() {
      this.loadPlayers();
    },

    sortColumn: function() {
      this.loadPlayers();
    },

    sortDescending: function() {
      this.loadPlayers();
    },

    currentPage: function() {
      this.loadPlayers();
    }
  },
  methods: {
    formatSeason(season) {
      return `${season.slice(0, 4)}-${season.slice(-2)}`;
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
    },

    async loadPlayers() {
      this.loading = true;

      const data = await (
        await fetch('api/players', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            season: `${this.season.slice(0, 4)}20${this.season.slice(-2)}`,
            team: this.team,
            position: this.position,
            sortedBy: this.sortColumn,
            order: this.sortDescending ? 'desc' : 'asc',
            page: this.currentPage
          })
        })
      ).json();

      this.players = data.players;
      this.numberOfPages = data.pagination.numberOfPages;
      this.playersPerPage = data.pagination.pageLength;

      this.loading = false;
    }
  },
  computed: {
    ...mapState(['teams', 'positions', 'seasons']),

    playerStatCategories() {
      return Object.keys(this.players[0].statistics.stat);
    }
  },
  async mounted() {
    await this.loadPlayers();
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
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
}
</style>
