<template>
  <div class="header">
    <img class="logo" src="@/assets/logo.svg" />
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
  width: 200px;
  height: 58px;

  font-family: 'Aquire';
}

.test {
  font-family: 'Aquire';
}

.searchbox {
  margin: 10px;
  padding-left: 20px;

  height: 40px;
  width: 400px;

  border: 1px solid var(--color-blue);
  border-radius: 5px;
  box-shadow: 0px 4px 4px 0px rgba(46, 46, 46, 0.26);
}
</style>
