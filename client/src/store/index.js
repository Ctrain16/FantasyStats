import { createStore } from 'vuex';

export default createStore({
  state: {
    positions: ['Skaters', 'C', 'L', 'R', 'D', 'G'],
    players: [],
    teams: [],
    seasons: [
      '2020-21',
      '2019-20',
      '2018-19',
      '2017-18',
      '2016-17',
      '2015-16',
      '2014-15',
      '2013-14',
      '2012-13',
      '2011-12',
      '2010-11',
      '2009-10',
      '2008-09',
      '2007-08',
      '2006-07',
      '2005-06'
    ],
    season: '2020-21'
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

    updateSeason(state, season) {
      state.season = season;
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
