<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  border: 0;

  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text-primary);
  overflow-x: hidden;
  overflow-y: auto;
}

#app {
  width: 100vw;
  min-height: 100vh;
}

@font-face {
  font-family: wending;
  src: url("~@/assets/css/DigitalNumbers-Regular.ttf");
}
</style>
