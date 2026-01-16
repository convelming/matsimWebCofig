<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
html,
body {
  overflow-x: hidden;
  overflow-y: auto;
}

#app {
  width: 100vw;
  min-height: 100vh;
  background-color: var(--background-color-base);
  overflow: visible;
}
</style>
