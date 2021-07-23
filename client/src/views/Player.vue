<template>
  <div class="player" v-if="player.fullName">
    <h3>{{ player.fullName }}</h3>
    <p><b>Team:</b> {{ player.team.name }}</p>
    <p><b>Position:</b> {{ player.position }}</p>
    <p><b>Number:</b> {{ player.number }}</p>

    <table>
      <thead></thead>
      <tbody></tbody>
    </table>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>

<script>
export default {
  name: 'Player',
  props: {
    id: String
  },
  data() {
    return {
      player: {}
    };
  },
  async mounted() {
    this.player = await (
      await fetch('api/player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: this.id
        })
      })
    ).json();
  }
};
</script>

<style></style>
