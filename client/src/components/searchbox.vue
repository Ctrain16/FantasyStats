<template>
  <form class="search-suggestion" @submit="submit($event)">
    <input
      class="searchbox"
      placeholder="Search for player..."
      v-model="search"
      @input="searchForPlayer()"
      @keyup="handleKeyInput($event.keyCode)"
    />
    <div v-if="searchResults.length > 0" class="search-suggestion-items">
      <div
        v-for="(player, i) in searchResults"
        :key="i"
        @click="clickPlayer(player._id)"
        :class="{
          'search-suggestion-active': searchFocus === i
        }"
      >
        <p>{{ player.fullName }}</p>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: 'SearchBox',
  data() {
    return {
      search: '',
      searchFocus: -1,
      searchResults: [],
      maxResults: 5
    };
  },
  methods: {
    async searchForPlayer() {
      if (this.search === '' || this.search.replaceAll(' ', '').length === 0)
        return;

      try {
        const res = await fetch(
          `/api/search/${encodeURIComponent(this.search)}`
        );
        const data = await res.json();

        this.searchResults = data ?? [];

        if (this.searchResults.length === 0) this.searchFocus = -1;
        else if (this.searchFocus > this.searchResults.length)
          this.searchFocus = this.searchResults.length - 1;
      } catch (error) {
        console.error(error);
      }
    },

    clickPlayer(playerID) {
      this.searchResults = [];
      this.searchFocus = -1;
      this.search = '';
      this.$router.push(`/player/${playerID}`);
    },

    submit(e) {
      e.preventDefault();
      if (this.searchResults.length > 0 && this.searchFocus !== -1) {
        this.clickPlayer(this.searchResults[this.searchFocus]._id);
        document.querySelector('.searchbox').blur();
        this.search = '';
      } else if (this.searchResults.length > 0) {
        this.clickPlayer(this.searchResults[0]._id);
        document.querySelector('.searchbox').blur();
        this.search = '';
      }
    },

    handleKeyInput(keyCode) {
      if (
        keyCode === 40 &&
        this.searchFocus ===
          Math.min(this.maxResults, this.searchResults.length) - 1
      ) {
        this.searchFocus = 0;
      } else if (keyCode === 40) {
        this.searchFocus++;
      } else if (keyCode === 38 && this.searchFocus <= 0) {
        this.searchFocus =
          Math.min(this.maxResults, this.searchResults.length) - 1;
      } else if (keyCode === 38) {
        this.searchFocus--;
      }
    }
  }
};
</script>

<style>
.search-suggestion {
  /*the container must be positioned relative:*/
  position: relative;
  display: flex;

  height: 60px;
  width: 50vw;
  max-width: 400px;

  padding: 10px 25px;
}

.searchbox {
  margin: 5px;
  padding-left: 20px;

  height: 40px;
  width: 50vw;
  max-width: 400px;

  border: 1px solid var(--color-blue);
  border-radius: 5px;
  box-shadow: 0px 4px 4px 0px rgba(46, 46, 46, 0.26);
}

.search-suggestion-items {
  position: absolute;
  margin: 0 25px;

  color: black;

  z-index: 99;
  top: 50px;
  left: 0;
  right: 0;
}

.search-suggestion-items div {
  padding: 10px;
  margin: 0px 5px 0px 5px;
  cursor: pointer;

  box-shadow: 0px 4px 4px 0px rgb(51, 51, 51);
  background-color: #fff;

  border: 1px solid black;
  border-top: none;
}

.search-suggestion-items div:hover {
  background-color: #e9e9e9;
}

.search-suggestion-active {
  background-color: DodgerBlue !important;
  color: #ffffff;
}
</style>
