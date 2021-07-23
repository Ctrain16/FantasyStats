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
  }
};
</script>

<style></style>
