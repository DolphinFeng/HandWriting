<template>
    <div class="about-num-wrapper">
        <div class="about-number-wrapper">
            <span class="number">{{ formatNum }}</span> {{ $getText('about_num_prefix', '个') }}
        </div>
        <div class="about-num-title">{{ title }}</div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

/**
 * 系统首页-与我相关 数字
 *
 * @author liyuyao
 * @date 11/03/2020
 */
@Component
export default class AboutNum extends Vue {
    @Prop({ default: 0 })
    number: number;

    @Prop({ default: '' })
    title: number;

    get formatNum () {
        return this.number > 99 ? '99+' : this.number;
    }
}
</script>

<style lang="scss" scoped>
.about-num-wrapper {
    width: 33%;
    display: inline-block;
    font-size: 14px;
    text-align: center;
    cursor: pointer;
    &:hover {
        .number {
            color: #f80;
        }
    }
}
.about-num-title {
    margin-top: 4px;
    color: rgba(0, 0, 0, 0.6);
    line-height: 14px;
}
.about-number-wrapper {
    color: rgba(0, 0, 0, 0.84);
    font-size: 12px;
    .number {
        font-size: 30px;
        font-family: PingFangSC-Medium;
        // margin-right: 2px;
    }
}
</style>
