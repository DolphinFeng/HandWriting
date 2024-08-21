<template>
    <div class="template-table">
        <div class="rg-table__header">
            <h3 class="rg-table__h3">{{ title }}</h3>
            <mtd-button
                v-if="!(this.api === 'Bulletin' && this.list.length > 0)"
                @click="() => this.handleOperation()"
                type="primary">
                <i class="mtdicon mtdicon-add" /><span>添加</span>
            </mtd-button>
        </div>
        <mtd-table
            class="rg-template__table"
            v-loading="tableLoading"
            :data="list">
            <div slot="empty">
                <i class="iconfont icon-hulk-zanwushuju" />
                <p class="no-data">暂无数据</p>
            </div>
            <mtd-table-column
                v-if="this.api!=='Bulletin'"
                label="序号"
                type="index"
                width="100" />
            <mtd-table-column
                v-if="this.api!=='Bulletin'"
                prop="title"
                label="标题"
                min-width="20%"
                show-overflow-tooltip />
            <mtd-table-column
                v-if="this.api==='Bulletin'"
                prop="content"
                label="内容"
                min-width="30%"
                show-overflow-tooltip />
            <mtd-table-column
                v-else
                prop="content"
                label="内容"
                min-width="30%"
                show-overflow-tooltip>
                <template slot-scope="scope">
                    <a :href="scope.row.content" target="_blank">{{ scope.row.content }}</a>
                </template>
            </mtd-table-column>
            <mtd-table-column
                min-width="10%"
                width="150"
                label="设置">
                <template slot-scope="scope">
                    <div class="template-table__switch">
                        <mtd-switch
                            size="small"
                            v-model="scope.row.enable"
                            @change="()=>handleSwitchChange(scope.row)" />
                        {{ scope.row.enable?'启用':'禁用' }}
                    </div>
                </template>
            </mtd-table-column>
            <mtd-table-column
                width="150"
                label="操作">
                <template slot-scope="scope">
                    <mtd-button
                        type="text-primary"
                        @click="() => handleOperation(scope.row)">
                        编辑
                    </mtd-button>
                </template>
            </mtd-table-column>
        </mtd-table>
        <div class="rg-template__pagination" v-if="this.api!=='Bulletin'">
            <mtd-pagination
                :total="tn"
                show-quick-jumper
                show-size-changer
                show-total
                @change="change"
                :current-page.sync="currentPageMore"
                :page-size.sync="currentPageSize" />
        </div>
        <RgTemplateModal
            :type="this.api"
            :visible="openModal"
            :data="formData"
            @addItem="addItemHandler"
            @closeModal="closeModalHandler" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as api from '@/api';
import RgTemplateModal from './rgTemplateModal.vue';
import { pick } from 'lodash';

@Component({
    components: {
        RgTemplateModal
    }
})
export default class RgTemplateTable extends Vue {
    @Prop({ required: true })
    api: string;
    @Prop({ required: true })
    title: string;
    tableLoading: boolean = false;
    list: any = [];
    openModal: boolean = false;
    formData: any = {};
    currentPageMore: number = 1;
    currentPageSize: number = 10;
    tn: number = 0;
    created () {
        this.getItemList();
    }
    async getItemList () {
        const action = `get${this.api}`;
        const { code, data } = await api.rgApi[action]({
            rgId: this.$route.query.rgId,
            cn: this.currentPageMore,
            sn: this.currentPageSize
        });
        if (code === 200) {
            this.tn = data.tn;
            this.list = data.items;
        }
    }
    change (current, size) {
        this.currentPageMore = current;
        this.currentPageSize = size;
        this.getItemList();
    }
    handleSwitchChange (val) {
        this.addItemHandler(val);
    }
    async addItemHandler (val) {
        let action = '';
        const keys = ['rgId', 'title', 'content', 'enable', 'id'];
        this.closeModalHandler(false);
        if (val.id) {
            action = `update${this.api}`;
        } else {
            action = `add${this.api}`;
        }
        const { code } = await api.rgApi[action](pick(val, keys));
        if (code === 200) {
            this.$mtd.message.success('操作成功');
            this.getItemList();
        }
    }
    handleOperation (obj?: any) {
        if (obj && obj instanceof Object) {
            this.formData = obj;
        } else {
            this.formData = {};
        }
        this.openModal = true;
    }
    closeModalHandler (val) {
        this.openModal = val;
    }
}
</script>

<style lang="postcss" scoped>
.rg-table__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    padding-bottom: 12px;
    .rg-table__h3 {
        font-weight: 600;
    }
}
.template-table__switch {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
}
.rg-template__table {
    &.mtd-table >>> td {
        padding: 6px 0;
    }
}
.rg-template__pagination {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding: 20px 0;
}
</style>
