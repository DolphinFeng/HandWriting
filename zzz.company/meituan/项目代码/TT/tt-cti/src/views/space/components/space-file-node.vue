<template>
    <mtd-modal
        :title="isEdit ? `编辑分类` : `添加分类`"
        class="template-permission-dialog"
        @close="handleClose"
        v-model="visible"
        width="400px">
        分类名称：<mtd-input v-model="name" style="width: 280px;" />
        <div slot="footer" class="demo-modal-footer">
            <mtd-button @click="cancel">取消</mtd-button>
            <mtd-button type="primary" @click="submit">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as api from '@/api';

// import * as api from '@/api';

/**
 * 选择指定目录
 *
 * @author liyuyao
 * @date 06/09/2020
 */
@Component
export default class SpaceFileNode extends Vue {
    @Prop()
    node: CommonTypes.fileNode;

    @Prop({ default: false })
    isEdit: Boolean;

    name: string = '';

    visible: Boolean = true;

    mounted () {
        this.name = this.isEdit ? this.node.name : '';
    }
    async submit () {
        try {
            const res = this.isEdit ? await api.ctiApi.updateNodes({
                id: this.id,
                name: this.name
            }) : await api.ctiApi.addNodes({
                parentId: this.id,
                name: this.name
            });
            const { code } = res;
            if (code === 200) {
                this.$mtd.message.success('操作成功');
                this.$emit('success', res.data);
                this.$emit('close');
            }
        } catch (e) {
            console.log(e);
        }
    }
    handleClose () {
        this.$emit('close');
    }
    cancel () {
        this.visible = false;
        this.handleClose();
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10) || 0;
    }
    get id () {
        return this.node.id || 0;
    }
}
</script>

<style lang="postcss">
.special-cti-dialog .mtd-modal-content-wrapper {
    min-width: 700px;
}
</style>
