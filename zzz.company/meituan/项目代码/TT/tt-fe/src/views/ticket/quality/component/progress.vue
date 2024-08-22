<template>
    <div class="progress-wrapper">
        <div
            class="mtd-progress-bar"
            :style="{height: `${strokeWidth}px`}">
            <div
                class="mtd-progress-bar-outer"
                :class="color">
                <div
                    class="mtd-progress-bar-inner"
                    :class="color"
                    :style="{
                        width: `${percent}%`,
                    }" />
            </div>
        </div>
        <span class="text">{{ `${part}/${total}` }}</span>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
    components: {}
})
export default class Progress extends Vue {
    @Prop() color: string;
    @Prop() part: number;
    @Prop() total: number;
    @Prop() strokeWidth: number;
    wrapperColor: string = '';

    get percent () {
        return this.part / this.total * 100;
    }
}
</script>

<style lang="scss">
.progress-wrapper {
    display: flex;
    align-items: center;
    .mtd-progress-bar {
        padding-right: 56px;
        .mtd-progress-bar-outer {
            &.blue {
                background-color: rgba(22, 111, 247, 0.1);
            }
            .mtd-progress-bar-inner {
                &.green {
                    background-color: #00ba73;
                }
                &.blue {
                    background-color: #1b77ec;
                }
            }
        }
    }
    .text {
        font-weight: 500;
        font-family: Avenir-Medium;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.84);
        line-height: 20px;
    }
}
</style>
