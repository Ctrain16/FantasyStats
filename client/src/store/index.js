import { createStore } from 'vuex';

export default createStore({
  state: {
    mobile: false,

    positions: ['Skaters', 'C', 'L', 'R', 'D', 'G'],
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
  mutations: {
    setTeams(state, teams) {
      state.teams = teams;
    },
    updateMobile(state, value) {
      state.mobile = value;
    }
  },
  actions: {
    async initialize({ commit }) {
      const teams = await (await fetch('api/teams')).json();
      commit('setTeams', teams);
    }
  },
  modules: {}
});
