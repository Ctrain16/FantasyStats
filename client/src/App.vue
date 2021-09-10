<template>
  <div class="page-container">
    <div class="content-wrap">
      <Header></Header>
      <router-view v-if="storeIntialized" />
      <div v-else class="loading-section">
        <p style="padding: 1rem">{{ loadingMessage }}</p>
        <div class="loader"></div>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
import Header from './components/header.vue';
import Footer from './components/footer.vue';
import { mapState } from 'vuex';

export default {
  name: 'App',
  components: {
    Header,
    Footer
  },
  data() {
    return {
      storeIntialized: false,
      loadingMessage: 'Loading.'
    };
  },
  computed: mapState(['mobile']),
  async mounted() {
    let dotCount = 1;
    const loadingInterval = setInterval(() => {
      dotCount = dotCount === 3 ? 1 : dotCount + 1;
      this.loadingMessage = 'Loading' + '.'.repeat(dotCount);
    }, 250);

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
    clearInterval(loadingInterval);
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

.loading-section {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -60%);

  display: flex;
  flex-direction: column;
  align-items: center;
}

.loader {
  border: 8px solid var(--color-ivory); /* Light grey */
  border-top: 8px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
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
