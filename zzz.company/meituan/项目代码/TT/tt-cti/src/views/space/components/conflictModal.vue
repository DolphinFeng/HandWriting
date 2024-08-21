<template>
    <mtd-modal
        title="选中目录绑定的服务组与未选目录冲突"
        v-model="visible"
        width="1000px"
        @close="closeModal">
        <div class="conflict-content">
            <p class="title">
                {{ `您选中的目录中，${conflictList.length} 条存在服务组冲突问题，不可直接绑定到当前空间。` }}
                <mtd-button
                    class="btn-demo-item"
                    @click="()=> showTable('showConflictTable')"
                    type="text-primary">查看详情</mtd-button>
            </p>

            <div v-if="showConflictTable" class="item">
                <mtd-table :data="tableData">
                    <mtd-table-column
                        prop="conflictName"
                        label="冲突目录" />
                    <mtd-table-column
                        prop="rgName"
                        label="服务冲突组"
                        width="180" />
                    <mtd-table-column
                        prop="owner"
                        width="180"
                        label="服务冲突管理员" />
                </mtd-table>
            </div>
            <p class="title">
                {{ `您选中的目录中，${unConflictList.length} 条不存在服务组冲突问题，可直接绑定到当前空间。` }}
                <mtd-button
                    v-if="unConflictList.length"
                    class="btn-demo-item"
                    @click="()=> showTable('showUnConflictTable')"
                    type="text-primary">查看详情</mtd-button>
            </p>

            <div v-if="showUnConflictTable" class="item">
                <div v-for="(item, index) in unConflictList" :key="index">
                    <div>{{ `${item.categoryName}/${item.typeName}/${item.itemName}` }}</div>
                </div>
            </div>
        </div>
        <div slot="footer" class="demo-modal-footer">
            <mtd-button @click="closeModal">取消</mtd-button><mtd-button
                type="primary"
                @click="confirm">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component({

})
export default class ConflictModal extends Vue {
    @Prop()
    show: boolean;
    @Prop()
    conflictList: any[];
    @Prop()
    unConflictList: any[];
    @Prop({ required: true, default: { categoryIds: [] } })
    transferParams: any;

    visible: boolean = false;
    tableData: any = [];
    showConflictTable: boolean = false;
    showUnConflictTable: boolean = false;

    @Watch('show')
    showHandler (val) {
        this.visible = val;
    }

    @Watch('conflictList')
    handleConflictList (val) {
        this.getConflictData(val);
    }

    getConflictData (val) {
        this.tableData = val.map(item => {
            item.conflictName = `${item.categoryName}/${item.typeName}/${item.itemName}`;
            return item;
        });
    }

    showTable (name) {
        this[name] = !this[name];
    }

    closeModal () {
        this.$emit('closeModal');
    }

    confirm () {
        this.$emit('closeModal');
        this.$emit('confirm', this.transferParams);
    }
}
</script>

<style lang="postcss" scoped>
.conflict-content {
    .title {
        margin-bottom: 20px;
    }
    .item {
        margin-bottom: 20px;
    }
}
</style>
