import { createStore } from 'vuex';

export default createStore({
  state: {
    players: [],
    teams: []
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
      commit('setTeams', teams);
      commit('setPlayers', players);
    }
  },
  modules: {}
});
