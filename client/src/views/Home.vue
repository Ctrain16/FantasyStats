<template>
  <div class="home">
    <p v-show="players.length === 0">Fetching players...</p>
    <p v-if="players[0] === 'error'">Error fetching players</p>
    <div v-else-if="players.length > 0" id="player-chart">
      <ul id="player-list">
        <li v-for="(player, i) in playersOnPage" :key="i">
          {{ player.fullName }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
// @ is an alias to /srck
// import HelloWorld from '@/components/HelloWorld.vue';

export default {
  name: 'Home',
  data() {
    return {
      players: [],
      page: 1,
      playersPerPage: 50
    };
  },
  computed: {
    playersOnPage() {
      return this.players.slice(
        (this.page - 1) * this.playersPerPage,
        this.page * this.playersPerPage
      );
    }
  },
  async mounted() {
    try {
      this.players = await (await fetch('api/players')).json();
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
