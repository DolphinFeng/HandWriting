<template>
    <div class="rg-moses-bulletin">
        <div class="bulletins-table-title">
            <h3>公告</h3>
            <mtd-button
                icon="mtdicon mtdicon-add"
                type="text"
                v-if="bulletins.length === 0"
                @click="startEditingBulletin()">添加
            </mtd-button>
        </div>

        <mtd-form
            class="bulletin-editing-form"
            ref="bulletinEditingForm"
            :model="bulletinEditingStage"
            :label-width="0"
            :rules="bulletinEditingFormRules">
            <mtd-table
                class="bulletins-table"
                :data="bulletins"
                row-key="id">
                <mtd-table-column
                    prop="id"
                    label="序号"
                    :width="56">
                    <template v-slot="scope">{{ scope.$index + 1 }}</template>
                </mtd-table-column>
                <mtd-table-column prop="content" label="内容">
                    <template v-slot="scope">
                        <mtd-form-item prop="content" v-if="bulletinEditingStage.id === scope.row.id">
                            <mtd-textarea
                                class="bulletin-link-input"
                                v-if="bulletinEditingStage.id === scope.row.id"
                                v-model="bulletinEditingStage.content"
                                placeholder="请输入公告内容，内容字数限制在500字内" />
                        </mtd-form-item>
                        <div
                            v-else
                            class="line-clamp"
                            style="-webkit-box-orient: vertical;">{{ scope.row.content }}</div>
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
                            @change="toggleBulletinEnable(scope.row, $event)" />
                        <mtd-switch v-else :actived="true" />
                    </template>
                </mtd-table-column>
                <mtd-table-column label="操作" :width="128">
                    <template slot-scope="scope">
                        <template v-if="bulletinEditingStage.id !== scope.row.id">
                            <mtd-button
                                key="1"
                                class="table-link"
                                type="text"
                                v-if="scope.row.id != null"
                                @click="deletBulletin(scope.row)">
                                删除
                            </mtd-button>
                            <mtd-button
                                key="2"
                                class="table-link"
                                type="text-primary"
                                @click="startEditingBulletin(scope.row)">
                                编辑
                            </mtd-button>
                        </template>
                        <template v-else>
                            <!-- 如果正在编辑状态，点击按钮即保存 -->
                            <mtd-button
                                key="3"
                                type="text-primary"
                                class="table-link"
                                @click="saveEditingBulletin()">保存</mtd-button>
                            <mtd-button
                                key="4"
                                type="text-primary"
                                class="table-link"
                                @click="cancelEditingBulletin(scope.row)">取消</mtd-button>
                        </template>
                    </template>
                </mtd-table-column>
            </mtd-table>
        </mtd-form>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { isEmpty } from 'lodash';
import * as api from '@/api';
import { Form, FormRules } from '@ss/mtd-vue';

interface Bulletin {
    id: number | null;
    content: string;
}

@Component({ name: 'rg-moses-bulletin' })
export default class RgMosesBulletin extends Vue {
    @Prop({ required: true })
    rgId: number;

    bulletins: Array<Bulletin> = [];

    bulletinEditingStage: Bulletin = {
        id: null,
        content: null
    };

    bulletinContent: string = '';
    bulletinId: number = null;

    submittingBulletin: boolean = false;

    bulletinEditingFormRules: FormRules = {
        content: [
            { required: true, message: '内容不可为空' },
            {
                max: 500,
                message: '公告内容不可超过500字'
            }
        ]
    };

    mounted () {
        this.getMosesBulletins();
    }

    async getMosesBulletins () {
        try {
            const res = await api.rgApi.getMosesBulletins({ rgId: this.rgId });
            const { code, data } = res;
            if (code === 200) {
                this.bulletins = data.items;
            } else {
                this.$mtd.message({ message: res.message, type: 'error' });
            }
        } catch (e) {
            console.log(e);
        }
    }

    startEditingBulletin (bulletinData: any) {
        if (isEmpty(bulletinData)) {
            // 如果正在添加，直接中止
            const lastItem = this.bulletins[this.bulletins.length - 1];
            if (lastItem && lastItem.id === null) {
                return;
            }
            const newItem = {
                id: null,
                title: '',
                content: ''
            };
            this.bulletins.push(newItem);
            this.bulletinEditingStage.content = newItem.content;
            return;
        }
        // 开始编辑
        this.bulletinEditingStage.id = bulletinData.id;
        this.bulletinEditingStage.content = bulletinData.content;
    }

    cancelEditingBulletin (bulletinData: any) {
        // reset 编辑区
        this.bulletinEditingStage = { id: null, content: null };
        if (bulletinData.id == null) {
            this.bulletins.pop();
        }
    }

    deletBulletin (bulletinData: any) {
        this.$mtd.confirm({
            message: '确认删除？',
            onOk: async () => {
                const res = await api.rgApi.deleteBulletin(bulletinData.id);
                if (res.code === 200) {
                    this.$mtd.message({ message: '删除成功', type: 'success' });
                    this.getMosesBulletins();
                } else {
                    this.$mtd.message({ message: '删除失败', type: 'error' });
                }
            }
        }).catch(e => {
            console.log(e);
        });
    }

    validateBulletin (): Promise<boolean> {
        return new Promise((resolve) => {
            (this.$refs.bulletinEditingForm as Form).validate((valid) => {
                resolve(valid);
            }).catch(e => {
                console.log(e);
                resolve(false);
            });
        });
    }

    async saveEditingBulletin () {
        const valid = await this.validateBulletin();
        if (!valid) return;

        if (this.bulletinEditingStage.id == null) {
            try {
                const res = await api.rgApi.addMosesBulletin({
                    rgId: this.rgId,
                    content: this.bulletinEditingStage.content
                });
                if (res.code === 200) {
                    const idx = this.bulletins.map(item => (item.id || null)).indexOf(this.bulletinEditingStage.id);
                    const addeBulletin = res.data;
                    this.bulletins[idx] = { ...addeBulletin };
                    this.bulletinEditingStage = { id: null, content: null };
                } else {
                    this.$mtd.message({ message: res.message, type: 'error' });
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            try {
                const res = await api.rgApi.updateBulletin({
                    rgId: this.rgId,
                    id: this.bulletinEditingStage.id,
                    content: this.bulletinEditingStage.content,
                    enable: true
                });
                if (res.code === 200) {
                    const idx = this.bulletins.map(item => (item.id || null)).indexOf(this.bulletinEditingStage.id);
                    const updateBulletin = res.data;
                    this.bulletins[idx] = { ...updateBulletin };

                    this.$mtd.message({ message: '修改成功', type: 'success' });
                    this.bulletinEditingStage = { id: null, content: null };
                } else {
                    this.$mtd.message({ message: res.message, type: 'error' });
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    // 设置 bulletin 是否启用
    async toggleBulletinEnable (bulletinData: any, enable: boolean) {
        const { id } = bulletinData;
        if (id == null) {
            return;
        }
        const res = await api.rgApi.updateBulletin({ ...bulletinData, enable });
        if (res.code === 200) {
            this.$mtd.message({ message: '设置成功', type: 'success' });
            this.getMosesBulletins();
        }
    }
}
</script>
<style lang="postcss">
.rg-moses-bulletin {
    .bulletins-table-title {
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
    .bulletins-table {
        margin-top: 8px;
        .mtd-textarea {
            width: 100%;
            height: 97px;
        }
    }
    .line-clamp {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        /* FIXME: 这里有一个神奇的 bug，这条规则在构建产物中是不生效的，应该是 scss 的锅 */
        -webkit-box-orient: vertical;
    }
}
</style>
