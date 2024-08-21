<template>
    <mtd-modal
        v-model="showModal"
        :destroy-on-close="true"
        title="调整轮班顺序"
        @close="close"
        class="oncall-sort-modal common-modal"
        width="400px">
        <div class="drop-tip">拖拽名称进行排序 共<span> {{ sortedList.length }} </span>组</div>
        <div class="drop-filter">
            <Container @drop="onDropEvent">
                <Draggable v-for="(item, index) in sortedList" :key="`${index}-${item.id}`">
                    <div class="draggable-item">
                        <i class="mtdicon mtdicon-sortupanddown-o" style="vertical-align: bottom;" />
                        <span>{{ item.split('/')[0] }}</span>
                    </div>
                </Draggable>
            </Container>
        </div>
        <div slot="footer">
            <mtd-button class="tt-pure-btn" @click="close">取消</mtd-button>
            <mtd-button
                type="primary"
                class="tt-pure-btn"
                @click="confirm">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Container, Draggable } from 'vue-smooth-dnd';
import { applyDrag } from '@/utils/helpers';
@Component({
    components: {
        Container,
        Draggable
    }
})
export default class SortOncallMemberModal extends Vue {
    @Prop({ default: false })
    visible: boolean;
    @Prop({ default: 'user' })
    type: 'user' | 'group';
    @Prop({ default: () => [] })
    list: CommonTypes.mapObject;

    showModal: boolean = false;
    sortedList: CommonTypes.mapObject[] = [];

    @Watch('visible', { immediate: true })
    onVisibleChanged () {
        this.showModal = this.visible;
    }
    @Watch('list', { immediate: true })
    onDataChanged () {
        this.sortedList = [].concat(this.list);
    }
    onDropEvent (dropResult) {
        this.sortedList = applyDrag(this.sortedList, dropResult);
    }
    close () {
        this.$emit('update:visible', false);
    }
    confirm () {
        this.close();
        this.$emit('success', this.sortedList);
    }
}
</script>

<style lang="scss">
.oncall-sort-modal {
    .mtd-modal-content-wrapper {
        padding-top: 12px !important;
        padding-bottom: 24px;
    }
    .drop-tip {
        color: rgba(0, 0, 0, 0.35);
        margin-bottom: 4px;
        font-size: 12px;
        span {
            color: rgba(0, 0, 0, 0.84);
        }
    }
    .drop-filter {
        .draggable-item {
            padding: 6px 6px;
            &:hover {
                background: #F5F5F5;
                cursor: grab;
            }
            .mtdicon {
                margin-right: 8px;
            }
        }
    }
}
</style>
