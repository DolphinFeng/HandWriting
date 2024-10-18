<template>
  <swip :list="list" :auto="true" :time="1000" />
</template>

<script setup>
import swip from "./components/Swiper.vue";

const list = [
  "https://yanxuan-item.nosdn.127.net/cac68a7880bec1c72dcfce112d10e955.png",
  "https://yanxuan-item.nosdn.127.net/06a158d2888b20383a466227e39bbbc7.jpg",
  "https://yanxuan.nosdn.127.net/8f8092d5bf6a133a8cb59ab7b9f790e9.png",
  "https://yanxuan-item.nosdn.127.net/eac6c40fdb0f977fdf80048d7b181ffa.png",
  "https://yanxuan-item.nosdn.127.net/f881cfe7de9a576aaeea6ee0d1d24823.jpg",
];
</script>

<style lang="scss" scoped></style>