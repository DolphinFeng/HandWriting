<template>
    <div class="deduction-container">
        <table class="deduction-table">
            <thead>
                <tr>
                    <th width="320">扣分项名称</th>
                    <th width="140">命中扣分</th>
                    <th width="480">扣分项说明</th>
                    <th>操作</th>
                </tr>
            </thead>
            <Container
                tag="tbody"
                class="mtd-table"
                lock-axis="y"
                @drop="onDrop">
                <Draggable
                    v-for="(item, index) in tableData"
                    :key="index"
                    class="mtd-table-row"
                    tag="tr">
                    <td width="320"><div class="mtd-table-cell item-col">
                        <i class="mtdicon mtdicon-handle" />
                        <div>
                            <mtd-textarea
                                placeholder="输入扣分项名称，如“违规关单”"
                                v-model="item.name"
                                style="width: 220px;"
                                rows="3"
                                @input="handleChange(index, 'name', $event)"
                                autosize
                                :class="{'mtd-textarea-invalid': item.showTip}"
                                maxlength="20" />
                            <div class="mtd-form-item-error-tip" v-if="item.showTip">请填写扣分项名称</div>
                        </div>
                    </div></td>
                    <td width="140"><div class="mtd-table-cell">
                        <mtd-input-number
                            v-model="item.value"
                            :precision="0"
                            :min="0"
                            :max="9999"
                            @input="handleChange(index, 'count')"
                            style="width: 48px;"
                            :controls="false" />
                    </div></td>
                    <td width="480"><div class="mtd-table-cell">
                        <mtd-textarea
                            placeholder="输入内容不超过80个字"
                            v-model="item.desc"
                            style="width: 440px;"
                            rows="3"
                            autosize
                            @input="handleChange(index, 'desc')"
                            maxlength="80" />
                    </div></td>
                    <td><div class="mtd-table-cell">
                        <mtd-button
                            type="text-primary"
                            @click="handleDelete(index)">
                            删除
                        </mtd-button></div></td>
                </Draggable>
            </Container>
        </table>
        <div
            class="table-empty-block"
            v-if="!tableData.length">
            暂无数据
        </div>
        <mtd-button
            class="add-deduction-btn"
            type="text-primary"
            @click="addDeductionItem"
            icon="mtdicon mtdicon-add">添加扣分项</mtd-button>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Container, Draggable } from 'vue-smooth-dnd';

@Component({
    components: {
        Container,
        Draggable
    }
})
export default class DeductionForm extends Vue {
    @Prop() data: CommonTypes.mapObject[];
    tableData: CommonTypes.mapObject[] = [];

    @Watch('data', { immediate: true, deep: true })
    getDataChanged () {
        this.tableData = Object.assign([], this.data);
    }
    async addDeductionItem () {
        await this.validateDeduction();
        this.tableData.push({
            name: '',
            value: 10,
            desc: '',
            valueType: 'NUMERIC',
            fieldType: 'CUSTOM'
        });
    }

    validateDeduction () {
        // 判断当前 tableData 中必填的扣分项有没有填写
        return new Promise((resolve, reject) => {
            this.tableData.forEach((item, index) => {
                if (!item.name) {
                    this.$set(this.tableData[index], 'showTip', true);
                    reject(new Error('请完成必填项'));
                }
            });
            resolve('');
        });
    }
    handleDelete (index: number) {
        this.tableData.splice(index, 1);
        this.emitChange();
    }
    onDrop (result: any) {
        const { removedIndex, addedIndex } = result;
        const lableList = this.tableData;
        const keyLable = lableList[removedIndex];
        lableList.splice(removedIndex, 1);
        lableList.splice(addedIndex, 0, keyLable);
        this.tableData = lableList;
        this.emitChange();
    }
    handleChange (index: number, type: string, val?: any) {
        if (this.tableData[index] && this.tableData[index].id) delete this.tableData[index].id;
        if (type === 'name') this.tableData[index].showTip = !val;
        this.emitChange();
    }
    emitChange () {
        this.$emit('change', this.tableData);
    }
}
</script>
<style lang="postcss">
.deduction-table {
    width: 1040px;
    thead {
        tr {
            background-color: #FFFFFF;
            th {
                border-top: 1px solid rgba(0, 0, 0, 0.06);
                border-bottom: 1px solid rgba(0, 0, 0, 0.06);
                padding: 7px 12px;
                font-weight: 500;
                font-family: PingFangSC-Medium;
                color: rgba(0, 0, 0, 0.6);
                &:nth-child(1),
                &:nth-child(2) {
                    &::before {
                        font-family: SimSun, sans-serif;
                        display: inline-block;
                        margin-right: 4px;
                        content: "*";
                        color: #F5483B;
                    }
                }
                &:nth-child(1) {
                    padding-left: 32px;
                }
            }
        }
    }
    tr {
        display: table-row !important;
        .mtd-btn-text-primary {
            padding: 0;
        }
        .item-col {
            display: flex;
            align-items: center;
            .mtdicon-handle {
                color: rgba(0, 0, 0, 0.38);
                font-size: 16px;
                margin-right: 6px;
            }
        }
        .mtd-input-number-wrapper {
            &:hover,
            &:focus {
                border-color: #F9D272;
            }
        }
    }
}
.deduction-container {
    margin-top: 16px;
    text-align: center;
    .add-deduction-btn {
        display: inline-block;
        margin-top: 8px;
    }
    .header {
        th {
            background-color: #FFFFFF;
            border-top: 1px solid rgba(0, 0, 0, 0.06);
            .mtd-table-cell {
                font-weight: 500;
                font-family: PingFangSC-Medium;
                color: rgba(0, 0, 0, 0.6);
            }
        }
    }
    .setting-col {
        .mtd-btn {
            padding: 0;
        }
    }
    .table-empty-block {
        padding: 17px 0;
    }
}
</style>
