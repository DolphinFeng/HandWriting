<template>
    <div>
        <div class="linkage-dropdown-container">
            <mtd-select
                :invalid="linkageInvalid"
                class="linkage-dropdown-domain"
                :placeholder="$getText('change_tag_select_domain_placeholder', '选择领域')"
                @change="dominChange"
                v-model="domain">
                <mtd-option
                    v-for="item in dominData"
                    :key="item.categoryId"
                    :label="item.categoryName"
                    :value="item.categoryName" />
            </mtd-select>
            <mtd-select
                class="linkage-dropdown-intention"
                ref="intentionSelect"
                v-model="intention"
                :invalid="linkageInvalid"
                :disabled="intentionDisabled"
                :placeholder="$getText('change_tag_select_intention_placeholder', '选择意图')"
                @update:visible="selectUptade">
                <mtd-option-group
                    :style="{'width': noData ? '267px' : '264px'}"
                    class="intention-option">
                    <mtd-option
                        v-for="item in selectData"
                        :key="item.id"
                        :label="item.intentName"
                        :value="item.intentName" />
                </mtd-option-group>
                <div class="editText">
                    <div
                        class="add-text"
                        @click="add"
                        v-if="!editing">
                        <i class="mtdicon mtdicon-add add-text-icon" />
                        <span style="margin-left:4px;">{{ $getText('change_tag_add_intention', '添加意图') }}</span>
                    </div>
                    <div
                        class="text-content"
                        v-else>
                        <mtd-input
                            class="edit-input"
                            ref="editInput"
                            type="text"
                            :placeholder="$getText('change_tag_input_placeholder', '请输入添加内容')"
                            :invalid="textInvalid"
                            v-model="newText" />
                        <span class="edit-btn confirm" @click="addText">{{ $getText('change_tag_confirm', '确定') }}</span>
                        <span class="edit-btn cancel" @click="cancelText">{{ $getText('change_tag_cancel', '取消') }}</span>
                    </div>
                </div>
            </mtd-select>
        </div>
        <div v-if="linkageInvalid" class="mtd-form-item-error-tip">{{ $getText('change_tag_select_intention_tip', '请选择意图') }}</div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';

/**
 * 沉淀摩西知识库
 *
 * @author hongweizhang
 * @date 03/26/2021
 */
@Component
export default class ChangeTag extends Vue {
    @Prop({ default: 0 })
    rgId: number;
    dominData: any = [];
    linkageInvalid: Boolean = false;
    domain: String = '';
    intention: String = '';
    intentionDisabled: Boolean = true;
    selectData: any = [{}];
    editing: Boolean = false;
    newText: String = '';
    textInvalid: Boolean = false;
    noData: Boolean = true;

    mounted () {
        this.getCategoryList();
    }

    @Watch('domain')
    onDominChanged (val) {
        if (val !== '') {
            this.intentionDisabled = false;
        } else {
            this.intentionDisabled = true;
        }
        this.$emit('selectChange', { domain: val, intention: this.intention, linkageInvalid: this.linkageInvalid });
    }

    @Watch('intention')
    onIntentionChanged (val) {
        this.$emit('selectChange', { domain: this.domain, intention: val, linkageInvalid: this.linkageInvalid });
    }
    async getCategoryList () {
        if (this.rgId === 0) {
            return;
        }
        const res = await api.ctiApi.categoryList(this.rgId);
        this.dominData = res.data.item;
    }

    getCategoryId () {
        const categoryId = this.dominData.filter(item => {
            return item.categoryName === this.domain;
        });
        const id: Number = this.domain === '' ? '' : categoryId[0]?.categoryId;
        return id;
    }

    async dominChange (val: any) {
        this.intention = '';
        this.getIntentList();
    }

    async getIntentList (type: string) {
        const id: Number = this.getCategoryId();
        if (id) {
            const res: Ajax.AxiosResponse = await api.ctiApi.intentList(this.rgId, id);
            this.selectData = res.data.item;
            if (res.data.item) {
                this.noData = res.data.item?.length === 0;
            }
        }
    }

    selectUptade (visible: Boolean) {
        this.editing = false;
        this.newText = '';
        if (this.domain !== '' && !visible) {
            if (this.intention === '') {
                this.linkageInvalid = true;
            } else {
                this.linkageInvalid = false;
            }
            this.$emit('selectChange', { domain: this.domain, intention: this.intention, linkageInvalid: this.linkageInvalid });
        }
    }

    add () {
        this.editing = true;
    }

    async addText () {
        const text: string = this.newText;
        if (text === '') {
            this.textInvalid = true;
            return;
        }
        const id: number = this.getCategoryId();
        const res: Ajax.AxiosResponse = await api.ctiApi.addIntent({
            categoryId: id,
            intentName: text
        });
        if (res.code === 200) {
            this.getIntentList('add');
            this.intention = text;
            this.$refs.intentionSelect.toggle();
        }
        this.newText = '';
    }

    addAnswerAndGrammar (desc: string) {
        if (this.domain === '' || this.intention === '') {
            return;
        }
        const intention: string = this.intention;
        const intentList: any = this.selectData;
        const theIntent: any = intentList.filter(item => {
            return item.intentName === intention;
        });
        const id: number = theIntent[0]?.id;
        if (id) {
            api.ctiApi.addIntentAnswer(this.rgId, {
                intentId: id,
                intentAnswer: desc
            });
            api.ctiApi.addIntentGrammar(this.rgId, {
                intentId: id,
                grammarList: [theIntent[0].intentName]
            });
        }
    }

    cancelText () {
        this.newText = '';
        this.editing = false;
    }
}
</script>

<style lang="scss" scoped>
.linkage-dropdown-container {
    display: flex;
    .linkage-dropdown-domain {
        /deep/ .mtd-input-wrapper .mtd-input {
            border-right: 0;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
    }
    .linkage-dropdown-intention {
        /deep/ .mtd-input-wrapper .mtd-input {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
    }
}
.intention-option {
    margin-bottom: 44px;
}
.editText {
    box-sizing: border-box;
    width: 268px;
    height: 44px;
    padding: 6px 16px 6px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    color: #ffc300;
    position: absolute;
    bottom: 0;
    background: #fff;
    border-radius: 4px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    .add-text-icon {
        font-size: 12.5px;
        height: 13px;
    }
    .add-text {
        display: flex;
        align-items: center;
    }
    .edit-input {
        width: 160px;
    }
    .edit-btn {
        border: 0;
        width: 28px;
        padding: 0;
    }
    .confirm {
        margin-left: 8px;
    }
    .cancel {
        color: rgba(0, 0, 0, 0.6);
        margin-left: 2px;
    }
}
</style>
