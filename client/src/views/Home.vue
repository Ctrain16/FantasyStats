<template>
  <div class="home">
    <h1>Home Page</h1>
    <p v-show="players.length === 0">Fetching players...</p>
    <p v-if="players[0] === 'error'">Error fetching players</p>
    <div id="player-chart" v-else>
      <ul id="player-list">
        <li v-for="(player, i) in players" :key="i">
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
      players: []
    };
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
