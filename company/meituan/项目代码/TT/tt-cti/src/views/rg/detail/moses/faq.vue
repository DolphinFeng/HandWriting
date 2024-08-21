<template>
    <div class="rg-moses-faq">
        <div class="faqs-table-title">
            <h3>常见问题</h3>
            <mtd-button
                icon="mtdicon mtdicon-add"
                type="text"
                @click="startEditingFaq()">添加
            </mtd-button>
        </div>
        <mtd-form
            class="faq-editing-form"
            ref="faqEditingForm"
            :model="faqEditingStage"
            :label-width="0"
            :rules="faqEditingFormRules">
            <mtd-table
                class="faqs-table"
                :data="faqs"
                row-key="id">
                <mtd-table-column
                    prop="id"
                    label="序号"
                    :width="56">
                    <template v-slot="scope">{{ scope.$index + 1 }}</template>
                </mtd-table-column>
                <mtd-table-column prop="title" label="标题">
                    <template v-slot="scope">
                        <mtd-form-item prop="title" v-if="faqEditingStage.id === scope.row.id">
                            <mtd-input
                                class="faq-title-input"
                                v-model="faqEditingStage.title"
                                @keyup.enter="saveEditingFaq"
                                placeholder="输入标题" />
                        </mtd-form-item>
                        <span v-else>{{ scope.row.title }}</span>
                    </template>
                </mtd-table-column>
                <mtd-table-column prop="content" label="内容">
                    <template v-slot="scope">
                        <mtd-form-item prop="content" v-if="faqEditingStage.id === scope.row.id">
                            <mtd-input
                                class="faq-link-input"
                                v-if="faqEditingStage.id === scope.row.id"
                                v-model="faqEditingStage.content"
                                @keyup.enter="saveEditingFaq"
                                placeholder="输入内容" />
                        </mtd-form-item>
                        <span v-else>{{ scope.row.content }}</span>
                    </template>
                </mtd-table-column>
                <mtd-table-column
                    prop="show"
                    label="启用"
                    :width="64">
                    <template slot-scope="scope">
                        <mtd-switch
                            v-if="scope.row.id"
                            :actived="scope.row.enable"
                            @change="toggleFaqEnable(scope.row, $event)" />
                    </template>
                </mtd-table-column>
                <mtd-table-column label="操作" :width="128">
                    <template slot-scope="scope">
                        <template v-if="faqEditingStage.id !== scope.row.id">
                            <mtd-button
                                key="1"
                                class="table-link"
                                type="text"
                                v-if="scope.row.id != null"
                                @click="deleteFaq(scope.row)">
                                删除
                            </mtd-button>
                            <mtd-button
                                key="2"
                                class="table-link"
                                type="text-primary"
                                @click="startEditingFaq(scope.row)">
                                编辑
                            </mtd-button>
                        </template>
                        <template v-else>
                            <!-- 如果正在编辑状态，点击按钮即保存 -->
                            <mtd-button
                                key="3"
                                type="text-primary"
                                class="table-link"
                                @click="saveEditingFaq()">保存</mtd-button>
                            <mtd-button
                                key="4"
                                type="text-primary"
                                class="table-link"
                                @click="cancelEditingFaq(scope.row)">取消</mtd-button>
                        </template>
                    </template>
                </mtd-table-column>
            </mtd-table>
        </mtd-form>
        <div v-if="total > Math.min(...pageSizes)" class="pagination-container">
            <mtd-pagination
                :total="total"
                show-size-changer
                show-total
                :current-page.sync="currentPage"
                :page-size.sync="limit"
                @change="handlePageChange" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { isEmpty } from 'lodash';
import { FormRules, Form } from '@ss/mtd-vue';
import { PaginationMixin } from '@/utils/mixin';
import * as api from '@/api';

interface Faq {
    id: number | null;
    title: string;
    content: string;
}

@Component({ name: 'rg-moses-faq' })
export default class RgMosesFaq extends PaginationMixin {
    @Prop({ required: true })
    rgId: number;

    faqs: Array<Faq> = [];

    faqEditingStage: Faq = {
        id: null,
        title: null,
        content: null
    };

    faqEditingFormRules: FormRules = {
        title: [
            { required: true, message: '标题不可为空' },
            { max: 100, message: '常见问题标题字数不可超过100字' }
        ],
        content: [
            { required: true, message: '内容不可为空' },
            {
                pattern: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
                message: '请输入请输入有效的URL链接'
            },
            {
                // 安全的URL字符串长度
                // see: https://stackoverflow.com/a/33733386/4747368
                max: 2048,
                message: 'URL链接长度不可超过2048'
            }
        ]
    };

    mounted () {
        this.getMosesFaqs();
    }

    async getMosesFaqs () {
        try {
            const res = await api.rgApi.getMosesFaqs({
                rgId: this.rgId,
                cn: this.currentPage,
                sn: this.limit
            });
            const { code, data } = res;
            this.faqs = data.items || [];
            this.total = data.tn;

            if (code === 200) {
                if (data.tn > 0 && !data.items.length) {
                    this.currentPage -= 1;
                    if (this.currentPage <= 0) {
                        this.currentPage = 1;
                    }
                    this.getMosesFaqs();
                }
            } else {
                this.$mtd.message({ message: res.message, type: 'error' });
            }
        } catch (e) {
            console.log(e);
        }
    }

    handlePageChange (current: number, size: number) {
        this.limit = size;
        this.currentPage = current;
        this.getMosesFaqs();
    }

    startEditingFaq (faqData: any) {
        if (isEmpty(faqData)) {
            // 如果正在添加，直接中止
            const lastItem = this.faqs[this.faqs.length - 1];
            if (lastItem && lastItem.id === null) {
                return;
            }
            const newItem = {
                id: null,
                title: '',
                content: ''
            };
            this.faqs.push(newItem);
            this.faqEditingStage.title = newItem.title;
            this.faqEditingStage.content = newItem.content;
            return;
        }
        // 开始编辑
        this.faqEditingStage.id = faqData.id;
        this.faqEditingStage.title = faqData.title;
        this.faqEditingStage.content = faqData.content;
    }
    cancelEditingFaq (faqData: any) {
        // reset 编辑区
        this.faqEditingStage = { id: null, title: null, content: null };
        if (faqData.id == null) {
            this.faqs.pop();
        }
    }
    deleteFaq (faqData: any) {
        this.$mtd.confirm({
            message: '确认删除？',
            onOk: async () => {
                const res = await api.rgApi.deleteFaq(faqData.id);
                if (res.code === 200) {
                    this.$mtd.message({ message: '删除成功', type: 'success' });
                    this.getMosesFaqs();
                } else {
                    this.$mtd.message({ message: '删除失败', type: 'error' });
                }
            }
        }).catch(e => {
            console.log(e);
        });
    }

    validateFaq (): Promise<boolean> {
        return new Promise((resolve) => {
            (this.$refs.faqEditingForm as Form).validate((valid) => {
                resolve(valid);
            }).catch(e => {
                console.log(e);
                resolve(false);
            });
        });
    }

    async saveEditingFaq () {
        const valid = await this.validateFaq();
        if (!valid) return;
        if (this.faqEditingStage.id == null) {
            try {
                const res = await api.rgApi.addMosesFaq({
                    rgId: this.rgId,
                    content: this.faqEditingStage.content,
                    title: this.faqEditingStage.title
                });
                if (res.code === 200) {
                    const idx = this.faqs.map(item => (item.id || null)).indexOf(this.faqEditingStage.id);
                    const addedFaq = res.data;
                    this.faqs[idx] = { ...addedFaq };
                    this.faqEditingStage = { id: null, title: null, content: null };
                } else {
                    this.$mtd.message({ message: res.message, type: 'error' });
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            try {
                const res = await api.rgApi.updateFaq({
                    rgId: this.rgId,
                    id: this.faqEditingStage.id,
                    title: this.faqEditingStage.title,
                    content: this.faqEditingStage.content,
                    enable: true
                });
                if (res.code === 200) {
                    const idx = this.faqs.map(item => (item.id || null)).indexOf(this.faqEditingStage.id);
                    const updatedFaq = res.data;
                    this.faqs[idx] = { ...updatedFaq };

                    this.$mtd.message({ message: '修改成功', type: 'success' });
                    this.faqEditingStage = { id: null, title: null, content: null };
                } else {
                    this.$mtd.message({ message: res.message, type: 'error' });
                }
            } catch (e) {
                console.log(e);
            }
        }
    }
    // 设置 faq 是否启用
    async toggleFaqEnable (faqData: any, enable: boolean) {
        const { id } = faqData;
        if (id == null) {
            return;
        }
        const res = await api.rgApi.updateFaq({ ...faqData, enable });
        if (res.code === 200) {
            this.$mtd.message({ message: '设置成功', type: 'success' });
            this.getMosesFaqs();
        }
    }
}
</script>
<style lang="postcss">
.rg-moses-faq {
    .faqs-table-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0;
        h3 {
            font-family: PingFangSC-Medium;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.84);
            letter-spacing: 0;
            text-align: justify;
            line-height: 22px;
            font-weight: 500;
            border-left: 3px solid #FFC300;
            padding-left: 8px;
        }
    }
    .faqs-table {
        margin-top: 8px;
        .mtd-input-wrapper {
            &.faq-title-input {
                width: 340px;
            }
            &.faq-link-input {
                width: 400px;
            }
        }
    }
}
</style>
