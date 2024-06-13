<template>
  <div id="map" class="map"></div>
</template>

<script>
class tile {
  load(func) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let list = [];
        for (let i = 0; i < 100; i++) {
          for (let j = 0; j < Math.random() * 10; j++) {}
          list.push(func());
        }
        resolve(list);
      }, Math.random() * 10);
    });
  }
}

export default {
  data() {
    return {
      num: 0,
    };
  },
  mounted() {
    let pl = [];
    for (let i = 0; i < 10; i++) {
      pl.push(new tile().load(() => ++this.num));
    }
    Promise.all(pl).then((res) => {
      console.log(res);
    });
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.map {
  width: 100vw;
  height: 100vh;
}
</style>
