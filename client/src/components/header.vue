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
  background-color: var(--color-lightblue);
  box-shadow: 0px 4px 8px 0px rgb(182, 182, 182);
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
