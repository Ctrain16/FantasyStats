<template>
  <div class="header">
    <router-link to="/">
      <img v-show="!mobile" class="logo" src="@/assets/logo.svg" />
      <img v-show="mobile" class="mobile-logo" src="@/assets/mobileLogo.svg" />
    </router-link>
    <SearchBox></SearchBox>
  </div>
</template>

<script>
import SearchBox from '../components/searchbox.vue';
import { mapState } from 'vuex';

export default {
  name: 'Header',
  components: { SearchBox },
  computed: mapState(['mobile'])
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

@media (max-width: 769px) {
  .header {
    justify-content: space-between;
  }
}

.logo {
  width: 200px;
  height: 58px;
}

.mobile-logo {
  margin-left: 10px;
  width: 58px;
  height: 58px;
}
</style>
