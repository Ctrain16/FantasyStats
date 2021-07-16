<template>
  <input
    class="searchbox"
    placeholder="Search for player..."
    @input="searchForPlayer($event.target.value)"
  />
</template>

<script>
export default {
  name: 'SearchBox',
  data() {
    return {
      players: []
    };
  },
  methods: {
    searchForPlayer(input) {
      const results = this.players
        .filter(player =>
          player.fullName.toLowerCase().startsWith(input.toLowerCase())
        )
        .slice(0, 5);
    }
  },
  async mounted() {
    this.players = await (
      await fetch('api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    ).json();
  }
};
</script>

<style>
.searchbox {
  margin: 10px;
  padding-left: 20px;

  height: 40px;
  width: 400px;

  border: 1px solid var(--color-blue);
  border-radius: 5px;
  box-shadow: 0px 4px 4px 0px rgba(46, 46, 46, 0.26);
}
</style>
