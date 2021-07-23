<template>
  <div class="header">
    <router-link to="/">
      <img class="logo" src="@/assets/logo.svg" />
    </router-link>
    <SearchBox></SearchBox>
  </div>
</template>

<script>
import SearchBox from '../components/searchbox.vue';

export default {
  name: 'Header',
  components: { SearchBox }
};
</script>

<style>
.header {
  display: flex;
  align-items: center;
  height: 80px;

  color: var(--color-white);
  background-color: var(--color-lightblue);
  box-shadow: 0px 4px 8px 0px rgb(182, 182, 182);
}

.logo {
  margin: 10px;
  width: 200px;
  height: 58px;
}
</style>
