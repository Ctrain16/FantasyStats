<template>
  <div class="page-container">
    <p>Hello</p>
    <div class="content-wrap">
      <Header></Header>
      <router-view />
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
import Header from './components/header.vue';
import Footer from './components/footer.vue';

export default {
  name: 'App',
  components: {
    Header,
    Footer
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

@font-face {
  font-family: 'Aquire';
  src: local('Aquire'), url(/fonts/Aquire/Aquire-BW0ox.otf) format('opentype');
}

@font-face {
  font-family: 'AquireLight';
  src: local('AquireLight'),
    url(/fonts/Aquire/AquireLight-YzE0o.otf) format('opentype');
}

.page-container {
  position: relative;
  min-height: 100vh;
}

.content-wrap {
  padding-bottom: 7vh;
}
</style>
