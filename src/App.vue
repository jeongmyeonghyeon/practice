<template>
  <div id="app">
    <Main></Main>
  </div>
</template>

<script>
  import Main from './components/main/Main.vue'
  import Detail from './components/detail/Detail.vue'

export default {
  components: {
    'Main': Main,
    'Detail': Detail
  }
}
</script>

<style>
</style>
