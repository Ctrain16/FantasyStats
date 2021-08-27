import { createStore } from 'vuex';

export default createStore({
  state: {
    positions: ['Skaters', 'C', 'L', 'R', 'D', 'G'],
    players: [],
    teams: [],
    seasons: []
  },
  getters: {
    goalies: state => {
      return state.players.filter(player => player.position === 'G');
    },
    skaters: state => {
      return state.players.filter(player => player.position !== 'G');
    }
  },
  mutations: {
    setPlayers(state, players) {
      state.players = players;
    },
    setTeams(state, teams) {
      state.teams = teams;
    },
    setSeasons(state, seasons) {
      state.seasons = seasons;
    }
  },
  actions: {
    async initialize({ commit }) {
      const players = await (
        await fetch('api/players', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            season: 'latest'
          })
        })
      ).json();
      const teams = await (await fetch('api/teams')).json();
      const seasons = await (await fetch('api/seasons')).json();
      commit('setSeasons', seasons);
      commit('setTeams', teams);
      commit('setPlayers', players);
    },

    async updatePlayers({ commit }, { season }) {
      try {
        const players = await (
          await fetch('api/players', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              season: season
            })
          })
        ).json();

        commit('setPlayers', players);
      } catch (error) {
        console.error('Failed to update players.');
      }
    }
  },
  modules: {}
});
