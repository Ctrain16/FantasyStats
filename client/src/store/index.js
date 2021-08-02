import { createStore } from 'vuex';

export default createStore({
  state: {
    players: []
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
    }
  },
  actions: {
    async initialize({ commit }) {
      const players = await (
        await fetch('api/players', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      ).json();
      commit('setPlayers', players);
    }
  },
  modules: {}
});
