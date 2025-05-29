<!-- index -->
<template>
  <div class="index">testpage1</div>
</template>

<script>
import data from "./103.json";
import * as Bean from "@/utils/Bean";
export default {
  name: "index",
  props: {},
  components: {},
  computed: {},
  watch: {},
  data() {
    return {};
  },
  created() {
    console.log(data.data);

    const transitLine = new Bean.TransitLine(data.data);
    console.log(transitLine);

    const transitRoutes = transitLine.transitRoutes;
    const json = transitRoutes[1].toJSON();

    console.log(json);
  },
  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.index {
}
</style>
