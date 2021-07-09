<template>
  <div class="header">
    <div class="logo">
      <h1>CMT</h1>
      <h3>stats</h3>
    </div>
    <input class="searchbox" placeholder="Search for player..." />
  </div>
</template>

<script>
export default {
  name: 'Header'
};
</script>

<style>
.header {
  display: flex;
  align-items: center;
  height: 80px;

  color: var(--color-white);
  background-color: var(--color-blue);
}

.logo {
  margin: 10px;
}

.searchbox {
  margin: 10px;

  height: 40px;
  width: 100%;
}
</style>
