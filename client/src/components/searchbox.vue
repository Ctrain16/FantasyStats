<template>
  <input class="searchbox" placeholder="Search for player..." />
</template>

<script>
export default {
  name: 'SearchBox'
};
</script>

<style>
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
