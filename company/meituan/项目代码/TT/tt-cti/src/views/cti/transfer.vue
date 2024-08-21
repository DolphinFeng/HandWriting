<template>
    <div class="cti-transfer-container">
        <div class="transfer-title">
            <span @click="cancelBack"><i class="mtdicon mtdicon-arrow-left" />目录迁移</span>
        </div>
        <div class="cti-transfer-form-container">
            <div class="steps-wrapper">
                <mtd-steps :active="activeStep">
                    <mtd-step title="目录迁移" />
                    <mtd-step title="完成" />
                </mtd-steps>
            </div>
            <div class="operate-container catalog-form-wrapper" v-show="activeStep === 0">
                <mtd-form>
                    <mtd-form-item
                        label="迁移的旧目录："
                        :label-width="120"
                        :key="0">
                        <category-tree
                            :clearable="true"
                            :is-mw="true"
                            :category-tree="totalCategoryTreeList"
                            :multiple="true"
                            :allow-any-level="true"
                            @categoryChange="handleSourceCategoryChange" />
                    </mtd-form-item>
                    <mtd-form-item
                        label="目标目录："
                        :label-width="120"
                        :key="1">
                        <category-tree
                            :clearable="true"
                            :is-mw="true"
                            :allow-any-level="true"
                            :category-tree="categoryTreeList"
                            @categoryChange="handleTargetCategoryChange" />
                    </mtd-form-item>
                    <mtd-form-item
                        :label-width="120">
                        <mtd-checkbox v-model="transferWithCti">迁移TT的同时，迁移目录</mtd-checkbox>
                    </mtd-form-item>
                </mtd-form>
            </div>
            <div class="operate-container transfer-doing-wrapper" v-if="activeStep === 1">
                <!-- <img src="@/assets/img/mw-transfer.png"> -->
                <div v-if="percentage < 100">
                    <h3>迁移中 ...</h3>
                    <mtd-progress :percentage="percentage" />
                </div>
                <div v-else>
                    <i class="mtdicon mtdicon-success-circle" />
                    <h3>迁移成功</h3>
                    <mtd-button type="primary" @click="goBack">完成</mtd-button>
                </div>
            </div>
            <div class="button-container" v-if="activeStep === 0">
                <mtd-button @click="cancelBack" class="close-btn">取 消</mtd-button>
                <mtd-button
                    :disabled="btnDisabled"
                    :loading="btnLoading"
                    type="primary"
                    @click="ctiTransfer">开始迁移</mtd-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import * as api from '@/api';

import CategoryTree from '@/views/cti/components/category-tree.vue';
/**
 * 美维工单 迁移页面
 *
 * @author liyuyao
 * @date 07/09/2019
 */

const defaultCti = {
    categoryName: '',
    categoryId: 0,
    typeName: '',
    typeId: 0,
    itemName: '',
    itemId: 0
};

@Component({
    components: {
        CategoryTree
    }
})
export default class CtiTransferIndex extends Vue {
    categoryTreeList: any = [];
    totalCategoryTreeList: any = [];

    activeStep: number = 0;

    sourceCti: CommonTypes.CtiItem[] = [];

    targetCti: CommonTypes.CtiItem = defaultCti;

    transferWithCti: boolean = false;

    btnLoading: boolean = false;
    percentage: number = 0;
    migrateId: number = 0;
    interval: any;

    get btnDisabled () {
        return !(this.sourceCti.length > 0 && this.targetCti.categoryId);
    }
    mounted () {
        this.getCategoryTree();
        this.getCategoryTreeTotal();
    }
    async getCategoryTree () {
        try {
            const res = await api.ctiApi.getCategoryTree();
            this.categoryTreeList = res.data.items;
        } catch (e) {
            console.log(e);
        }
    }
    async getCategoryTreeTotal () {
        try {
            const res = await api.ctiApi.getCategoryTreeTotal(true);
            this.totalCategoryTreeList = res.data.items;
        } catch (e) {
            console.log(e);
        }
    }
    handleSourceCategoryChange (catalog) {
        // delete catalog.rgId;
        // catalog.itemName = catalog.itemName && catalog.itemName.split('（')[0];
        this.sourceCti = catalog;
    }
    handleTargetCategoryChange (catalog) {
        delete catalog.rgId;
        this.targetCti = catalog;
    }
    cancelBack () {
        this.$router.push({
            name: 'cti'
        }).catch(e => e);
    }
    async ctiTransfer () {
        this.btnLoading = true;
        try {
            const res = await api.ctiApi.ctiTransfer({
                sources: this.sourceCti,
                target: this.targetCti,
                type: this.transferWithCti ? 1 : 2
            });
            const { code, data } = res;
            if (code === 200) {
                this.activeStep++;
                this.migrateId = data.migrateId;
                this.getTransferProgress();
                if (this.percentage === 100) {
                    return;
                } else {
                    this.interval = setInterval(this.getTransferProgress, 2000);
                }
            }
            this.btnLoading = false;
        } catch (e) {
            this.btnLoading = false;
        }
    }
    async getTransferProgress () {
        try {
            const res = await api.ctiApi.getTransferProgress(this.migrateId);
            const { code, data } = res;
            if (code === 200) {
                this.percentage = data.progress;
                if (this.percentage === 100) {
                    clearInterval(this.interval);
                }
            } else {
                clearInterval(this.interval);
            }
        } catch (e) {
            clearInterval(this.interval);
            console.log(e);
        }
    }
    goBack () {
        this.$router.push({
            name: 'cti'
        }).catch(e => e);
    }
}
</script>

<style lang="postcss">
.cti-transfer-container {
    background: #FFFFFF;
    padding-bottom: 60px;
    .transfer-title {
        padding: 16px 24px;
        span {
            cursor: pointer;
            font-family: PingFangSC-Semibold;
            font-size: 18px;
            color: #333333;
            line-height: 22px;
        }
        .mtdicon-arrow-left {
            margin-right: 8px;
        }
    }
    .cti-transfer-form-container {
        padding: 20px 0;
        width: 720px;
        margin: 0 auto;
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
            padding: 60px 0;
            text-align: center;
            img {
                width: 120px;
                height: 120px;
            }
            .mtd-progress {
                width: 500px;
                margin: 0 auto;
            }
            .mtdicon-success-circle {
                color: #00B365;
                font-size: 50px;
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
    .button-container {
        text-align: right;
    }
}
</style>
