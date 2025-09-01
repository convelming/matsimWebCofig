<!-- home -->
<template>
  <div class="box box1"></div>
  <div class="box2"></div>
  <div class="box3"></div>
  <div class="box4"></div>
  <div class="box5"></div>
</template>

<script setup></script>

<style lang="scss" scoped>
.box {
  border-radius: 16px;
  padding: 16px;
}
.box1 {
  transform-origin: left top;
  transform: scale(var(--scale));
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  width: 352px;
  height: 581px;
  background:
    linear-gradient(
      135deg,
      rgba($color: #cbf0ec, $alpha: 50%) 0%,
      rgba($color: #c8ece8, $alpha: 41%) 10%,
      rgba($color: #bdd8d5, $alpha: 0%) 50%
    ),
    rgba($color: #dae4ee, $alpha: 0.5);
}
</style>
