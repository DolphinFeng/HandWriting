<template>
    <button @click="prev">上一张</button>
    <button @click="next">下一张</button>
    <div>
        <div class="swiper-item" v-for="(item, index) in props.list" :key="index"
            :style="{ transform: `translateX(${currentIndex * -140}px)`, transition: 'transform 0.5s ease', }">
            <img :src="item" alt="" />
        </div>
        <div class="swiper"></div>
    </div>
</template>

<script setup>
import { ref, watchEffect } from "vue";
const props = defineProps({
    list: {
        type: Array,
    },
    auto: {
        type: Boolean,
        default: true,
    },
    time: {
        type: Number,
        default: 3000,
    },
});

const currentIndex = ref(0);
const isPaused = ref(false);

const prev = () => {
    currentIndex.value =
        (currentIndex.value - 1 + props.list.length) % props.list.length;
    console.log(currentIndex.value);
};

const next = () => {
    currentIndex.value =
        (currentIndex.value + 1 + props.list.length) % props.list.length;
    console.log(currentIndex.value);
};

watchEffect(() => {
    let timer;
    if (props.auto) {
        timer = setInterval(() => {
            next();
        }, props.time);
    } else if (timer) {
        clearInterval(timer);
    }
});
</script>

<style lang="css" scoped>
* {
    margin: 0;
    padding: 0;
}

.swiper-item {
    float: left;
}

img {
    height: 100px;
    width: 100px;
    margin: 20px;
}

.swiper {
    position: absolute;
    width: 140px;
    height: 140px;
    border: 1px solid #000;
    overflow: hidden;
}
</style>