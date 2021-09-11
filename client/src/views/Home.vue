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
        :selected="tempSeason"
        v-model="tempSeason"
      ></Filter>
    </div>

    <p v-if="sortedPlayers.length === 0">Error fetching skaters</p>
    <div id="player-chart">
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
            <td>{{ season }}</td>
            <td>{{ player.position }}</td>
            <td>{{ playerTeam(player) }}</td>
            <td
              v-for="(stat, name) in playerStats(i)"
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
import { mapState, mapGetters } from 'vuex';
import Filter from '../components/filter.vue';

export default {
  name: 'Home',
  components: { Filter },
  data() {
    return {
      sortedPlayers: [],
      filteredPlayers: [],

      currentPage: 1,
      playersPerPage: 50,

      sortColumn: 'P',
      sortDescending: true,
      lastSortColumnIndex: 0,

      // filters
      position: 'Skaters',
      team: 'All',
      tempSeason: '2020-21'
    };
  },
  watch: {
    position: function(newPosition, oldPosition) {
      this.filterPlayers();
      if (newPosition !== 'G' && oldPosition !== 'G') return;

      if (newPosition === 'G') {
        this.sortedPlayers = this.goalies;
        this.sortColumn = 'SV%';
      } else {
        this.sortedPlayers = this.skaters;
        this.sortColumn = 'P';
      }
      this.sortPlayers();
    },

    team: function() {
      this.filterPlayers();
    },

    tempSeason: async function(newSeason) {
      await this.$store.dispatch('updatePlayers', {
        season: `${newSeason.slice(0, 4)}20${newSeason.slice(-2)}`
      });

      if (this.position === 'G') {
        this.sortedPlayers = this.goalies;
        this.sortColumn = 'SV%';
      } else {
        this.sortedPlayers = this.skaters;
        this.sortColumn = 'P';
      }

      this.currentPage = 1;
      this.sortDescending = true;
      this.$store.commit('updateSeason', newSeason);

      this.sortPlayers();
      this.filterPlayers();
    }
  },
  methods: {
    playerStats(index) {
      return this.playerStatsSeason(
        this.filteredPlayers[
          index + (this.currentPage - 1) * this.playersPerPage
        ]
      ).stat;
    },

    playerStatsSeason(player) {
      return player.statistics.find(
        year =>
          year.season === `${this.season.slice(0, 4)}20${this.season.slice(-2)}`
      );
    },

    playerTeam(player) {
      return this.playerStatsSeason(player).team.abbreviation;
    },

    filterPlayers() {
      if (this.position === 'G') {
        if (this.team !== 'All')
          this.filteredPlayers = this.sortedPlayers.filter(
            goalie => goalie.team.name === this.team
          );
        this.filteredPlayers = this.sortedPlayers.filter(player => {
          return this.playerStatsSeason(player);
        });
      }

      this.filteredPlayers = this.sortedPlayers
        .filter(skater => {
          if (this.team !== 'All' && this.position !== 'Skaters') {
            return (
              skater.team.name === this.team &&
              skater.position === this.position
            );
          } else if (this.team !== 'All') return skater.team.name === this.team;
          else if (this.position !== 'Skaters')
            return skater.position === this.position;

          return skater;
        })
        .filter(player => {
          return this.playerStatsSeason(player);
        });
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
      this.sortPlayers();
      this.$forceUpdate();
    },

    sortPlayers() {
      this.sortedPlayers = this.sortedPlayers.sort((p1, p2) => {
        const p1stats = String(
          this.playerStatsSeason(p1).stat[this.sortColumn]
        ).replace(':', '');
        const p2stats = String(
          this.playerStatsSeason(p2).stat[this.sortColumn]
        ).replace(':', '');

        return this.sortDescending ? p2stats - p1stats : p1stats - p2stats;
      });
      this.filterPlayers();
    }
  },
  computed: {
    ...mapGetters(['goalies', 'skaters']),
    ...mapState(['players', 'teams', 'positions', 'seasons', 'season']),

    playerStatCategories() {
      if (this.position !== 'G')
        return Object.keys(this.skaters[0].statistics.slice(-1)[0].stat);
      else return Object.keys(this.goalies[0].statistics.slice(-1)[0].stat);
    },

    numberOfPages() {
      return Array.from(
        Array(
          Math.ceil(this.filteredPlayers.length / this.playersPerPage)
        ).keys()
      );
    },

    playersOnPage() {
      return this.filteredPlayers.slice(
        (this.currentPage - 1) * this.playersPerPage,
        this.currentPage * this.playersPerPage
      );
    }
  },
  async mounted() {
    this.sortedPlayers = this.skaters;
    this.tempSeason = this.season;
    this.sortPlayers();
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
