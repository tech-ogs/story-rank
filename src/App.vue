<template>
  <div id="app">
    <component v-bind:is="module.view"></component>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
	module () { return this.$store.getters.module }
  }
}
</script>

<style>
html, body {
  height: 100%;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 5px;
  height: 100%;
}

.width100 {
  width: 100%;
}

.height100 {
  height: 100%;
}

.square15 {
  height: 15px;
  width: 15px;
}

.square30 {
  height: 30px;
  width: 30px;
}

.square50 {
  height: 50px;
  width: 50px;
}

.display-flex {
  display: flex;
}
.flex-perfect-center{
  display: flex;
  align-items: center;
  justify-content: center;
}

.inline-flex-perfect-center{
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.flex-left-right{
  display: flex;
  justify-content: space-between;
}

.flex-space-around{
  display: flex;
  justify-content: space-around;
}

.flex-right {
	display: flex;
	justify-content: flex-end;
}
.flex-left {
	display: flex;
	justify-content: flex-start;
}

.no-border {
  border-width: 0px;
}
</style>
