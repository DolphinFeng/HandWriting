<template>
    <div class="helpdesk-transfer-container">
        <div class="helpdesk-transfer-form-container">
            <h2>美维迁移-CTI配置</h2>
            <div class="steps-wrapper">
                <mtd-steps :active="activeStep">
                    <mtd-step title="目录配置" />
                    <mtd-step title="配置确认" />
                    <mtd-step title="开始迁移" />
                </mtd-steps>
            </div>
            <div class="operate-container catalog-form-wrapper" v-show="activeStep === 0">
                <mtd-form>
                    <mtd-form-item label="填写项目id：" :label-width="120">
                        <mtd-input
                            type="text"
                            v-model="projectId"
                            @change="clearProjectList"
                            @blur="getProjectList"
                            placeholder="请输入项目id"
                            style="width: 280px;" />
                        <div class="project-id-tip">{{ projectTip }}</div>
                    </mtd-form-item>
                    <mtd-form-item
                        v-if="projectId"
                        label="选择服务目录："
                        :label-width="120">
                        <div
                            class="cti-transfer-item"
                            v-for="(mwCti, index) in mwCtiList"
                            :key="index">
                            <span class="mwcti-name">{{ mwCtiDisplay(mwCti) }}</span>
                            <i class="mtdicon mtdicon-arrow-right" />
                            <category-tree
                                class="mw-catagory-tree"
                                :clearable="false"
                                :is-mw="true"
                                :is-mwgd="true"
                                :index="index"
                                :category-tree="categoryTreeList"
                                :category-name="mwCti && mwCti.categoryName"
                                :category-id="mwCti && mwCti.categoryId"
                                :type-name="mwCti && mwCti.typeName"
                                :type-id="mwCti && mwCti.typeId"
                                :item-name="mwCti && mwCti.itemName"
                                :item-id="mwCti && mwCti.itemId"
                                @categoryChange="handleCategoryChange" />
                        </div>
                        <div
                            class="load-more-button"
                            @click="handleLoadMore"
                            v-if="showLoadMore">点击加载更多</div>
                    </mtd-form-item>
                </mtd-form>
            </div>
            <div class="operate-container config-check-wrapper" v-if="activeStep === 1">
                <h3>请确认迁移信息</h3>
                <mtd-form>
                    <mtd-form-item label="项目id：" :label-width="120">
                        {{ projectId }}
                    </mtd-form-item>
                    <mtd-form-item label="服务目录" :label-width="120">
                        <ul class="check-list-ul">
                            <li
                                class="check-item"
                                :key="index"
                                v-for="(checkMw, index) in checkMwList">
                                <span class="mw-item">{{ mwCtiDisplay(checkMw) }}</span>
                                <i class="mtdicon mtdicon-arrow-right" />
                                <span class="cti-item">{{ `${checkMw.categoryName}/${checkMw.typeName}/${checkMw.itemName}` }}</span>
                            </li>
                        </ul>
                    </mtd-form-item>
                </mtd-form>
            </div>
            <div class="operate-container transfer-doing-wrapper" v-if="activeStep === 2">
                <img src="@/assets/img/mw-transfer.png">
                <p>迁移工单创建成功，为不影响系统的线上使用，TT团队会根据您迁移的工单数量评估迁移时间。</p>
                <p>我们会在5个工作日内协助您完成迁移，迁移成功后会有TT状态同步通知，感谢！</p>
            </div>
        </div>
        <div class="steps-footer">
            <div class="footer-center-container" v-if="activeStep < 2">
                <mtd-button @click="cancelBack" class="close-btn">{{ cancelText }}</mtd-button>
                <mtd-button
                    :loading="btnLoading"
                    :disabled="!projectId || !mwCtiList.length"
                    type="primary"
                    @click="nextOperate">{{ submitText }}</mtd-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
// import { State } from 'vuex-class';
// import store from '@/store';
import * as api from '@/api';

import CategoryTree from '@/views/cti/components/category-tree.vue';
/**
 * 美维工单 迁移页面
 *
 * @author liyuyao
 * @date 07/09/2019
 */
@Component({
    components: {
        CategoryTree
    }
})
export default class HelpdeskTransferIndex extends Vue {
    projectId: number = null;
    categoryTreeList: any = [];
    mwCtiList: any = [];
    activeStep: number = 0;
    projectTip: string = '可以在美维工单链接中查看项目id，示例：https://helpdesk.sankuai.com/setting/project/400，400即为项目id';

    btnLoading: boolean = false;

    limit: number = 40;
    currentPage: number = 1;

    showLoadMore: boolean = false;

    mounted () {
        this.getCategoryTree();
    }
    clearProjectList () {
        this.mwCtiList = [];
    }
    async getProjectList () {
        this.mwCtiList = await this.getHelpdeskCTI();
    }
    async getHelpdeskCTI () {
        if (!this.projectId) {
            return;
        }
        const res = await api.ctiApi.getHelpdeskCTI(this.projectId, this.currentPage, this.limit);
        const { code, data } = res;
        let mwCtiList = [];
        // 前端过滤空CTI后 total和展示内容对不上 无法通过比较total判断分页
        this.showLoadMore = data.items && data.items.length === this.limit;
        // 过滤可能存在的空CTI
        if (code === 200) {
            const mwlist = data.items.filter(x => x.mwCate1Name);
            mwCtiList = await Promise.all(mwlist.map(async (mwCti) => {
                if (mwCti.itemId) {
                    const ctiInfo = await this.getItemDetail(mwCti.itemId);
                    return Object.assign(mwCti, ctiInfo);
                } else {
                    return mwCti;
                }
            }));
        }
        return mwCtiList;
    }
    async handleLoadMore () {
        this.currentPage++;
        const data = await this.getHelpdeskCTI();
        this.mwCtiList.push(...data);
    }
    async getCategoryTree () {
        try {
            const res = await api.ctiApi.getCategoryTreeTotal();
            this.categoryTreeList = res.data.items;
        } catch (e) {
            console.log(e);
        }
    }
    mwCtiDisplay (mwCti) {
        if (mwCti) {
            let catalog = mwCti.mwCate1Name;
            if (mwCti.mwCate2Name) {
                catalog += '/' + mwCti.mwCate2Name;
            }
            if (mwCti.mwCate3Name) {
                catalog += '/' + mwCti.mwCate3Name;
            }
            return catalog;
        }
    }
    async handleCategoryChange (catalog, index, ifManual) {
        if (ifManual) {
            return;
        }
        const mwCti = this.mwCtiList[index];
        if (mwCti.itemId) {
            await this.removeBindToCti(mwCti.id);
        }
        const params = {
            mwProjectId: this.projectId,
            mwCate1Name: mwCti.mwCate1Name,
            mwCate1Id: mwCti.mwCate1Id,
            mwCate2Name: mwCti.mwCate2Name,
            mwCate2Id: mwCti.mwCate2Id,
            mwCate3Name: mwCti.mwCate3Name,
            mwCate3Id: mwCti.mwCate3Id,
            itemName: catalog.itemName,
            itemId: catalog.itemId
        };
        await this.bindMwToCti(params, index);
        for (const key in catalog) {
            this.mwCtiList[index][key] = catalog[key];
        }
    }
    async removeBindToCti (configId) {
        try {
            await api.ctiApi.removeBindToCti(configId);
        } catch (e) {
            console.log(e);
        }
    }
    async bindMwToCti (params, index) {
        try {
            const res = await api.ctiApi.bindMwToCti(params);
            const { code, data } = res;
            if (code === 200) {
                this.$mtd.message.success('绑定成功');
                this.mwCtiList[index].id = data.id;
            }
        } catch (e) {
            console.log(e);
        }
    }
    async getItemDetail (itemId) {
        if (!itemId) {
            return;
        }
        const res = await api.ctiApi.getItemInfo(itemId);
        const { code, data } = res;
        if (code === 200) {
            return {
                categoryName: data.categoryName,
                categoryId: data.categoryId,
                typeName: data.typeName,
                typeId: data.typeId,
                itemName: data.itemName,
                itemId: data.itemId
            };
        } else {

        }
    }
    cancelBack () {
        if (this.activeStep === 0) {
            this.$router.push({
                name: 'cti'
            }).catch(e => e);
        } else {
            this.activeStep--;
        }
    }
    nextOperate () {
        if (this.activeStep > 0) {
            this.checkTransfer();
        } else {
            this.activeStep++;
        }
    }
    checkTransfer () {
        this.$mtd.confirm({
            message: '迁移后的TT权限均为「公开」，确定要开始迁移吗？',
            width: '433px',
            showCancelButton: true,
            type: 'warning',
            okButtonText: '确定',
            onOk: async () => {
                this.mwTransfer();
            }
        }).catch(e => e);
    }
    async mwTransfer () {
        this.btnLoading = true;
        try {
            // 发起迁移tt
            const res = await api.ctiApi.mwTransfer(this.projectId);
            const { code } = res;
            if (code === 200) {
                this.activeStep++;
            } else {
                this.$mtd.message.error('请求失败');
            }
        } catch (e) {
            console.log(e);
        }
        this.btnLoading = false;
    }
    get submitText () {
        return this.activeStep > 0 ? '发起迁移' : '下一步';
    }
    get cancelText () {
        return this.activeStep > 0 ? '上一步' : '取消';
    }
    get checkMwList () {
        return this.mwCtiList.filter(mwCti => mwCti.itemId);
    }
}
</script>

<style lang="postcss">
.helpdesk-transfer-container {
    background: #FFFFFF;
    padding-bottom: 60px;
    .helpdesk-transfer-form-container {
        padding: 20px 0;
        width: 720px;
        margin: 0 auto;
        h2 {
            text-align: center;
            font-family: PingFangSC-Semibold;
            font-size: 18px;
            color: #333333;
            line-height: 22px;
        }
        h3 {
            margin-bottom: 20px;
            font-family: PingFangSC-Medium;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.87);
            line-height: 22px;
        }
        .steps-wrapper {
            margin: 24px 0;
        }
        .catalog-form-wrapper {
            .project-id-tip {
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.38);
            }
        }
        .config-check-wrapper {
            .check-list-ul .check-item {
                margin-bottom: 16px;
                span {
                    display: inline-block;
                    width: 300px;
                    line-height: 20px;
                    vertical-align: middle;
                }
                .mw-item {
                    width: 240px;
                }
            }
        }
        .transfer-doing-wrapper {
            padding: 140px 0;
            text-align: center;
            img {
                width: 120px;
                height: 120px;
            }
        }
        .cti-transfer-item {
            margin-bottom: 16px;
            .mwcti-name {
                vertical-align: middle;
                line-height: 20px;
                display: inline-block;
                width: 240px;
            }
            i {
                vertical-align: middle;
            }
            .mw-catagory-tree {
                vertical-align: middle;
                width: 300px;
                display: inline-block;
            }
        }
    }
    .mtdicon-arrow-right {
        margin: 0 15px;
    }
    .mtd-form-item {
        margin-bottom: 12px;
    }
    .steps-footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        padding: 14px;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.07);
        background: #FFFFFF;
        z-index: 5;
        .footer-center-container {
            margin: 0 auto;
            width: 750px;
            text-align: right;
            .close-btn {
                margin-right: 8px;
            }
        }
    }
    .load-more-button {
        text-align: center;
        color: #FF8800;
        cursor: pointer;
    }
}
</style>
