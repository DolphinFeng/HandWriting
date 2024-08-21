<template>
    <div class="oncall-shift-container">
        <div class="title-wrapper">
            <span>班次信息</span>
            <mtd-button
                class="add-user-btn tt-pure-btn"
                icon="mtdicon mtdicon-add"
                @click="addShift"
                type="primary">新增班次</mtd-button>
        </div>
        <mtd-table :loading="tableLoading" :data="shiftList">
            <mtd-table-column
                prop="name"
                min-width="30%"
                label="班次名称" />
            <mtd-table-column
                prop="abbreviation"
                min-width="15%"
                label="班次简称" />
            <mtd-table-column
                prop="displayTime"
                min-width="25%"
                label="出勤时间" />
            <mtd-table-column
                prop="period"
                min-width="15%"
                label="出勤时长">
                <template slot-scope="scope">
                    {{ scope.row.displayDuration + 'h' }}
                </template>
            </mtd-table-column>
            <pm-table-column-operation
                label="操作"
                min-width="15%"
                prop="operations"
                pm-type="text"
                :pm-operations="operations"
                :pm-disable-method="disableMethod" />
        </mtd-table>
        <add-shift-modal
            v-if="showShiftModal"
            :form-data="editShift"
            :type="modalType"
            @success="onAddSuccess"
            :visible.sync="showShiftModal" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import AddShiftModal from '../components/modals/addShiftModal.vue';
import * as api from '@/api';

@Component({
    components: {
        AddShiftModal
    }
})
export default class OncallShiftSetting extends Vue {
    shiftList: CommonTypes.mapObject[] = [];
    editShift: CommonTypes.mapObject = {};
    defaultColorOptions: CommonTypes.mapObject[] = [];
    modalType: 'add' | 'update' = 'add';
    showShiftModal: boolean = false;
    tableLoading: boolean = false;

    created () {
        this.getShifts();
    }
    async getShifts () {
        this.tableLoading = true;
        try {
            const res = await api.oncallApi.getShifts(this.rgId);
            const { data, code } = res;
            if (code === 200 && data) {
                this.tableLoading = false;
                this.shiftList = data.items || [];
                this.formatColorOptions();
            }
        } catch (e) {
            this.tableLoading = false;
            console.log(e);
        }
    }
    onAddSuccess () {
        this.getShifts();
    }
    formatColorOptions () {
        this.defaultColorOptions = [];
        const selectedColorList = this.shiftList.map(shift => shift.color);
        let hasDefaultSelect: boolean = false;
        for (let index = 0; index < 5; index++) {
            const option = {
                color: `COLOR_${index + 1}`,
                label: '',
                selected: false,
                disabled: selectedColorList.includes(`COLOR_${index + 1}`)
            };
            if (!hasDefaultSelect && !option.disabled) {
                option.selected = true;
                hasDefaultSelect = true;
            }
            this.defaultColorOptions.push(option);
        }
        this.shiftList.forEach(shift => {
            shift.colorOptions = this.defaultColorOptions.map(item => {
                const option = { ...item };
                if (item.color === shift.color) {
                    option.selected = true;
                    option.disabled = false;
                } else {
                    option.selected = false;
                    option.disabled = selectedColorList.includes(item.color);
                }
                return option;
            });
        });
    }
    addShift () {
        this.editShift = {
            colorOptions: this.defaultColorOptions
        };
        this.modalType = 'add';
        this.showShiftModal = true;
    }
    disableMethod (action: string, { row }: any) {
        return action === 'delete' && !row.deletable;
    }
    get operations () {
        return [{
            label: '编辑',
            action: 'edit',
            props: {
                class: 'table-link'
            },
            click: (action: string, scope: any) => {
                this.editShift = scope.row;
                this.modalType = 'update';
                this.showShiftModal = true;
            }
        }, {
            label: '删除',
            action: 'delete',
            props: {
                class: 'table-link'
            },
            click: (action: string, scope: any) => {
                this.$mtd.confirm({
                    title: '是否确认删除该班次？',
                    width: '433px',
                    showCancelButton: true,
                    type: 'warning',
                    okButtonText: '删除',
                    className: 'common-modal',
                    okButtonProps: {
                        type: 'danger',
                        class: 'tt-pure-btn'
                    },
                    cancelButtonProps: {
                        class: 'tt-pure-btn'
                    },
                    onOk: async () => {
                        try {
                            const res = await api.oncallApi.deleteShift(scope.row.id);
                            const { code } = res;
                            if (code === 200) {
                                this.$mtd.message({
                                    message: '删除班次成功',
                                    type: 'success'
                                });
                                this.getShifts();
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }).catch(e => e);
            },
            tip: '当前班次参与未来值班，无法删除'
        }];
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="postcss">
.oncall-shift-container {
    .title-wrapper {
        padding: 12px 0;
        text-align: left;
        font-weight: 600;
        font-size: 16px;
        line-height: 32px;
        .mtd-btn {
            float: right;
        }
    }
    .mtd-table {
        .mtd-btn {
            font-size: 14px;
        }
    }
}
</style>
