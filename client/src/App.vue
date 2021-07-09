<template>
  <div>
    <Header></Header>
    <router-view />
  </div>
</template>

<script>
import Header from './components/header.vue';

export default {
  name: 'App',
  components: {
    Header
  }
};
</script>

<style>
:root {
  --color-white: #ffffff;
  --color-ivory: #fbfff1;
  --color-blue: #090c9b;
  --color-lightblue: #3590f3;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: inherit;
}
</style>
