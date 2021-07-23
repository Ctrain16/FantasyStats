<template>
  <div class="player">
    <h1>Player</h1>
    <h2>{{ id }}</h2>
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
