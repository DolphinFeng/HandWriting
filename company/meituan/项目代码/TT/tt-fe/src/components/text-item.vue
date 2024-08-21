<template>
    <div class="static-text-item mtd-input">
        {{ value }}
        <!-- <span class="mtd-input-suffix-inner">
            <i class="mtdicon mtdicon-down-thick" />
        </span> -->
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class TextItem extends Vue {
    @Prop({ default: '' })
    value: string;
}
</script>

<style lang="scss" scoped>
.static-text-item {
    line-height: 30px;
    padding-left: 8px;
    color: rgba(0, 0, 0, 0.72);
}
</style>
