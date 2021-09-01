<template>
  <div class="filter">
    <label :for="label">{{ label }}</label>
    <select
      :name="label"
      :id="label"
      @input="this.$emit('update:modelValue', $event.target.value)"
    >
      <option
        v-for="option in options"
        :key="option"
        :selected="this.selected === option"
        >{{ option }}</option
      >
    </select>
  </div>
</template>

<script>
export default {
  name: 'Filter',
  props: {
    label: String,
    options: Array,
    selected: String
  }
};
</script>

<style>
.filter {
  display: flex;
  flex-direction: column;
  width: 200px;
  min-width: 200px;
  margin: 0px 20px 20px 0px;
}
</style>
