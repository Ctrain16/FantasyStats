<template>
  <div class="loading-section">
    <p style="padding: 1rem">{{ loadingMessage }}</p>
    <div class="loader"></div>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  data() {
    return {
      loadingMessage: 'Loading.',
      loadingInterval: null
    };
  },
  mounted() {
    let dotCount = 1;
    this.loadingInterval = setInterval(() => {
      dotCount = dotCount === 3 ? 1 : dotCount + 1;
      this.loadingMessage = 'Loading' + '.'.repeat(dotCount);
    }, 250);
  },
  unmounted() {
    clearInterval(this.loadingInterval);
  }
};
</script>

<style>
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
</style>
