<template>
    <mtd-modal
        :title="$getText('export_confirm_dialog_title', '导出数据设置')"
        class="export-confirm-dialog-container"
        :mask-closable="false"
        width="820px"
        @close="handleClose"
        v-model="visible">
        <div class="content-wrapper">
            <div class="left-wrapper">
                <div class="title">{{ $getText('export_confirm_dialog_all_fields', '所有字段') }}</div>
                <span class="tips">{{ $getText('export_confirm_dialog_select_fields_tip', '您可以在此选择Excel表包含的字段，数据范围请通过筛选器选择') }}</span>
                <div v-for="item in labelList" :key="item.category">
                    <div class="category">{{ $getText(DataExportFieldsMap[item.category]) }}</div>
                    <div class="group">
                        <mtd-checkbox
                            v-model="field.selected"
                            @change="checkboxChanged($event, field)"
                            v-for="field in item.fieldList"
                            :key="field.name">
                            {{ '' }}
                            <mtd-tooltip 
                                :content="field.displayName"
                                size="small"
                                placement="bottom">
                                <span
                                    style="cursor: pointer;
                                    width: 100px;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    display: inline-block;
                                    vertical-align: bottom;">{{ field.displayName }}</span>
                            </mtd-tooltip>
                            <mtd-tooltip
                                :content="$getText('export_confirm_dialog_checkbox_tooltip', '勾选字段不代表导出excel中的表头名称，会包含各环节处理人、处理时长、目录等数据。由于导出性能问题，暂时只支持导出前五次流转数据。')"
                                size="small"
                                v-if="field.name === 'transferDetail'"
                                placement="bottom">
                                <i class="mtdicon mtdicon-question-circle-o" />
                            </mtd-tooltip>
                        </mtd-checkbox>
                    </div>
                </div>
            </div>
            <div class="right-wrapper">
                <div class="title">{{ $getText('export_confirm_dialog_selected_fields', '已选字段') }}</div>
                <span class="tips">{{ $getText('export_confirm_dialog_selected_fields_tip', '支持上下拖拽排序，保存后生效') }}</span>
                <Container
                    class="options"
                    @drop="onDropForShow"
                    group-name="data-export-fields">
                    <Draggable v-for="item in checkedList" :key="item.name">
                        <mtd-tooltip 
                            :content="item.displayName"
                            size="small"
                            placement="bottom">
                            <div class="option">
                                <span><i class="mtdicon mtdicon-handle" /></span>
                                <span class="text-label">{{ item.displayName }}</span>
                                <span @click="removeShowLabel(item)"><i class="mtdicon mtdicon-close add-visible" /></span>
                            </div>
                        </mtd-tooltip>
                    </Draggable>
                </Container>
            </div>
        </div>
        <div slot="footer">
            <mtd-button @click="handleClose">{{ $getText('export_confirm_dialog_cancel_btn', '取消') }}</mtd-button>
            <mtd-button
                type="primary"
                @click="setDataExportSetting">{{ $getText('export_confirm_dialog_save_btn', '保存') }}</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import * as api from '@/api';
import { DataExportFieldsMap } from '@/config/map.conf';
import { Container, Draggable } from 'vue-smooth-dnd';
/**
 * 导出数据 确认弹窗
 *
 * @author liyuyao
 * @date 03/02/2021
 */

@Component({
    components: {
        Container,
        Draggable
    }
})
export default class ExportConfirmDialog extends Vue {
    visible: Boolean = true;
    exportType: string[] = [];
    spaceExportType: string = 'SPACE_DEAL';
    labelList: any[] = [];
    checkedList: any[] = [];
    DataExportFieldsMap: any = DataExportFieldsMap;

    mounted () {
        this.getDataExportSetting();
    }

    handleClose () {
        this.$emit('close');
        this.visible = false;
    }
    removeShowLabel (result) {
        this.checkedList = this.checkedList.filter((item: any) => {
            const isKeyLabel = item.name === result.name;
            // 取消左侧的已选状态
            if (isKeyLabel) {
                // 在labelList中取消选中状态
                this.labelList.forEach(category => {
                    category.fieldList.forEach(field => {
                        if (field.name === result.name) {
                            field.selected = false;
                        }
                    });
                });
            }
            return !isKeyLabel;
        });
    }
    onDropForShow (result) {
        const { removedIndex, addedIndex } = result;
        const labelList = this.checkedList;
        const keyLabel = labelList[removedIndex];
        labelList.splice(removedIndex, 1);
        labelList.splice(addedIndex, 0, keyLabel);
        this.checkedList = labelList;
    }
    checkboxChanged (event, tag) {
        if (event) {
            this.checkedList.push(tag);
        } else {
            const targetIndex = this.checkedList.findIndex(item => item.name === tag.name);
            this.checkedList.splice(targetIndex, 1);
        }
    }

    async setDataExportSetting () {
        const res: Ajax.AxiosResponse = await api.ticketApi.setDataExportSetting({
            fieldList: this.checkedList.map(item => item.name)
        });
        let { code, data } = res;
        if (code === 200 && data) {
            if (data.result) {
                this.$mtd.message.success(this.$getText('export_confirm_dialog_save_success', '设置成功'));
                this.handleClose();
            } else {
                this.$mtd.message.error(this.$getText('export_confirm_dialog_save_fail', '设置失败，请重试'));
            }
        }
    }

    async getDataExportSetting () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getDataExportSetting();
        let { code, data } = res;
        if (code === 200) {
            this.labelList = data.allFieldList || [];
            this.checkedList = data.selectedFieldList || [];
        }
    }
}
</script>
<style lang="postcss">
.export-confirm-dialog-container {
    .mtd-modal-header {
        border-bottom: 1px solid #e5e5e5;
    }
    .mtd-modal-footer {
        border-top: 1px solid #e5e5e5;
        padding: 13px 24px;
    }
    .content-wrapper {
        display: flex;
        .left-wrapper {
            padding-top: 12px;
            width: 478px;
            .group {
                display: flex;
                -ms-flex-wrap: wrap;
                flex-wrap: wrap;
                .mtd-checkbox {
                    margin: 0 0 10px 0;
                    width: 159px;
                    .mtd-checkbox-text {
                        width: 130px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        display: inline-block;
                        .mtdicon-question-circle-o {
                            color: rgba(0, 0, 0, 0.84);
                            line-height: 21px;
                            vertical-align: bottom;
                        }
                    }
                }
            }
        }
        .tips {
            font-family: PingFangSC-Medium;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.36);
        }
        .right-wrapper {
            padding-top: 12px;
            -webkit-box-flex: 1;
            -ms-flex: 1;
            flex: 1;
            margin-left: 70px;
            padding-left: 14px;
            border-left: 1px solid #e5e5e5;
            .options {
                margin-top: 20px;
                .option {
                    line-height: 20px;
                    padding: 8px 8px 8px 0;
                    .add-visible {
                        visibility: hidden;
                    }
                    &:hover {
                        background-color: #f5f5f5;
                        .add-visible {
                            visibility: visible;
                            float: right;
                            line-height: 20px;
                        }
                    }
                }
                .text-label {
                    display: inline-block;
                    max-width: 140px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    line-height: 20px;
                    vertical-align: middle;
                }
            }
        }
        .title {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.84);
            font-family: PingFangSC-Medium;
        }
        .category {
            width: 478px;
            font-family: PingFangSC-Medium;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.72);
            border-bottom: 1px solid #e5e5e5;
            margin-top: 24px;
            margin-bottom: 11px;
        }
    }
}
</style>