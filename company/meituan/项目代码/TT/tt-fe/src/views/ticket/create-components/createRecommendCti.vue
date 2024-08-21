<template>
    <div class="create-content-wrapper">
        <CreateCtiRecommend
            :recommend-list="recommendList"
            :clear-selected-cti="clearSelectedCti"
            @change="recommendChange" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CreateCtiRecommend from './createCtiRecommend.vue';

@Component({
    components: {
        CreateCtiRecommend
    }
})
export default class CreateRecommendCti extends Vue {
    @Prop()
    recommendList: CommonTypes.ctiTreeItem[];
    @Prop()
    clearSelectedCti: boolean;

    recommendChange (cti) {
        this.$emit('recommendChange', cti);
    }
}

</script>

<style lang="scss">
.create-recommend-wrapper {
    // padding: 16px 20px;
    background-color: #fff;
    // box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
    // border-radius: 4px;
}
</style>