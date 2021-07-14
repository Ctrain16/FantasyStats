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
  --color-lightbluefaded: #a8d2ff;
}

* {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: inherit;
}
</style>
