<template>
  <div class="page-container">
    <div class="content-wrap">
      <Header></Header>
      <router-view v-if="storeIntialized" />
      <Loading v-else></Loading>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
import Header from './components/header.vue';
import Footer from './components/footer.vue';
import Loading from './components/loading.vue';
import { mapState } from 'vuex';

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    Loading
  },
  data() {
    return {
      storeIntialized: false
    };
  },
  computed: mapState(['mobile']),
  async mounted() {
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 769 && !this.mobile) {
        this.$store.commit('updateMobile', true);
      } else if (window.innerWidth > 769 && this.mobile) {
        this.$store.commit('updateMobile', false);
      }
    });
    window.dispatchEvent(new Event('resize'));
    await this.$store.dispatch('initialize');

    this.storeIntialized = true;
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
