<template>
    <pm-draggable-drawer
        class="ticket-tool"
        :mode="mode"
        :default-config="config"
        :start-config="startConfig"
        @close="close">
        <span class="ticket-tool-title" slot="title">知识库</span>
        <span v-if="exchangeable" slot="operate">
            <i :class="[ 'iconfont', isStatic ? 'icon-danchu' : 'icon-shouqi']" @click="changeMode" />
        </span>
        <div class="tool-container" v-if="inHome">
            <div class="tool-header">
                <i
                    v-if="inResult"
                    class="mtdicon mtdicon-left tool-header-operation"
                    @click="toHome" />
                <mtd-dropdown
                    class="tool-flex-grow"
                    trigger="click"
                    :visible="suggestVisible">
                    <mtd-input
                        class="tool-input"
                        prefix-icon="mtdicon mtdicon-search"
                        placeholder="搜索知识"
                        v-model="searchValue"
                        clearable
                        @click.stop
                        @keydown.enter="preSearchMoses"
                        @clear="clearSuggestValues"
                        @focus="showSearchSuggest"
                        @blur="hideSearchSuggest"
                        @change="getSearchValues" />
                    <mtd-dropdown-menu slot="dropdown">
                        <mtd-dropdown-menu-item
                            v-for="(item, $index) in suggestValues"
                            class="demo-dropdown-menu-item"
                            :key="$index"
                            @click="setSearchValue(item.value)">
                            <span v-html="item.label" />
                        </mtd-dropdown-menu-item>
                    </mtd-dropdown-menu>
                </mtd-dropdown>
            </div>
            <mtd-tabs v-model="homeType" @input="changeListType">
                <mtd-tab-pane value="index" :label="`${inResult ? '摩西回复' : '推荐知识'}`" />
                <mtd-tab-pane
                    v-if="!inResult"
                    value="favorites"
                    label="我的收藏" />
            </mtd-tabs>
            <div class="tool-content">
                <div class="moses-panel-header" @click="toggleMosesPanel">
                    <span class="moses-logo" />
                    &nbsp;摩西回复推荐
                    <i :class="[ 'mtdicon fr', shownMosesPanel ? 'mtdicon-up-thick' : 'mtdicon-down-thick' ]" />
                </div>
                <div v-if="shownMosesPanel">
                    <div
                        class="moses-row"
                        v-for="(row, $index) in mosesList"
                        :key="`${row.rootCategoryId}_${row.intentId}`">
                        <div class="moses-row-header">
                            <div
                                v-if="inResult"
                                class="moses-row-title"
                                v-html="getMosesTitle(row.question)" />
                            <div v-else class="moses-row-title">{{ row.question || '' }}</div>
                            <mtd-tooltip :content="`${row.isFavorites ? '取消' : ''}收藏`" size="small">
                                <i :class="[ 'mtdicon tool-icon', row.isFavorites ? 'mtdicon-star highlight-icon' : 'mtdicon-star-o' ]" @click="updateFavorites($index)" />
                            </mtd-tooltip>
                            <mtd-tooltip content="复制短语" size="small">
                                <i class="mtdicon mtdicon-copy-o tool-icon" @click="copyMoses(row)" />
                            </mtd-tooltip>
                        </div>
                        <div class="moses-row-description">
                            <pre v-html="MarkHyperLink(row.solution || '')" />
                            <!--                            <div class="moses-row-mask" @click="toDetail($index)">-->
                            <!--                                <span class="moses-row-more">更多</span>-->
                            <!--                            </div>-->
                            <span
                                v-if="row.solution"
                                class="moses-row-more"
                                @click="toDetail($index)">更多</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="tool-footer" v-if="inResult">
                <div class="tip-text tip-text-operation fr" @click="toForm">新建摩西回复<i class="mtdicon mtdicon-right" /></div>
                <div v-if="satisfactionAble">
                    <div class="tip-text">搜索结果是否满意？</div>
                    <span class="tool-footer-operation" @click="setMosesQuestionSatisfaction(true)">
                        <i :class="[ 'mtdicon', satisfaction === 'YES' ? 'mtdicon-fabulous-fill highlight-icon' : 'mtdicon-fabulous' ]" />
                        <span>&nbsp;满意</span>
                    </span>
                    <span class="tool-footer-operation" @click="setMosesQuestionSatisfaction(false)">
                        <i :class="[ 'mtdicon rotate-icon', satisfaction === 'NO' ? 'mtdicon-fabulous-fill highlight-icon' : 'mtdicon-fabulous' ]" />
                        <span>&nbsp;不满意</span>
                    </span>
                </div>
            </div>
        </div>
        <div class="tool-container" v-else-if="type === 'detail'">
            <div class="tool-header">
                <span class="tool-header-operation" @click="goBack">
                    <i class="mtdicon mtdicon-left" />
                    返回
                </span>
                <div class="tool-flex-grow">
                    <mtd-tooltip
                        class="fr"
                        content="复制短语"
                        size="small">
                        <i class="mtdicon mtdicon-link-o tool-icon" @click="copyMoses(moses)" />
                    </mtd-tooltip>
                    <mtd-tooltip
                        class="fr"
                        :content="`${moses.isFavorites ? '取消' : ''}收藏`"
                        size="small">
                        <i :class="[ 'mtdicon tool-icon', moses.isFavorites ? 'mtdicon-star highlight-icon' : 'mtdicon-star-o' ]" @click="updateDetailFavorites" />
                    </mtd-tooltip>
                </div>
            </div>
            <div class="tool-content">
                <div class="moses-detail-title">{{ moses.question || '' }}</div>
                <div class="moses-detail-description">
                    <pre v-html="MarkHyperLink(moses.solution || '')" />
                </div>
            </div>
            <div class="tool-footer">
                <div v-if="satisfactionAble">
                    <div class="tip-text">这篇回复对您有用吗？</div>
                    <span class="tool-footer-operation" @click="setMosesSatisfaction(true)">
                        <i :class="[ 'mtdicon', satisfaction === 'YES' ? 'mtdicon-fabulous-fill highlight-icon' : 'mtdicon-fabulous' ]" />
                        <span>&nbsp;有用</span>
                    </span>
                    <span class="tool-footer-operation" @click="setMosesSatisfaction(false)">
                        <i :class="[ 'mtdicon rotate-icon', satisfaction === 'NO' ? 'mtdicon-fabulous-fill highlight-icon' : 'mtdicon-fabulous' ]" />
                        <span>&nbsp;无用</span>
                    </span>
                </div>
            </div>
        </div>
        <div class="tool-container" v-else>
            <div class="tool-header">
                <span class="tool-header-operation" @click="goBack">
                    <i class="mtdicon mtdicon-left" />
                    返回
                </span>
            </div>
            <div class="tool-content moses-form-content">
                <div class="moses-detail-title">新建摩西回复</div>
                <mtd-form
                    :model="moses"
                    :rules="mosesRules"
                    ref="moses"
                    label-position="top">
                    <mtd-form-item
                        label="选择领域："
                        prop="category">
                        <mtd-select
                            class="tool-input"
                            v-model="moses.category"
                            placeholder="请选择"
                            @change="changeMosesCategory">
                            <mtd-option
                                v-for="item in categories"
                                :value="item.categoryId"
                                :label="item.categoryName"
                                :key="item.categoryId">
                                {{ item.categoryName }}
                            </mtd-option>
                        </mtd-select>
                    </mtd-form-item>
                    <mtd-form-item
                        label="选择意图："
                        prop="intention">
                        <mtd-select
                            class="tool-input"
                            v-model="moses.intention"
                            placeholder="请选择"
                            :disabled="!moses.category"
                            @update:visible="clearIntention">
                            <mtd-option-group>
                                <mtd-option
                                    v-for="item in intentions"
                                    :key="item.id"
                                    :label="item.intentName"
                                    :value="item.id">
                                    {{ item.intentName }}
                                </mtd-option>
                            </mtd-option-group>
                            <mtd-option-group class="moses-form-intention-group">
                                <mtd-button
                                    v-if="!editingIntention"
                                    type="text-primary"
                                    icon="mtdicon mtdicon-add"
                                    @click="preAddIntention">添加意图</mtd-button>
                                <div class="moses-form-intention-row" v-else>
                                    <mtd-input
                                        class="tool-flex-grow"
                                        placeholder="请输入添加意图"
                                        v-model="intentionName" />
                                    <mtd-button type="text-primary" @click="addIntention">确定</mtd-button>
                                    <mtd-button type="text" @click="clearIntention">取消</mtd-button>
                                </div>
                            </mtd-option-group>
                            <div class="moses-form-intention-empty" slot="empty">
                                <mtd-button
                                    v-if="!editingIntention"
                                    type="text-primary"
                                    icon="mtdicon mtdicon-add"
                                    @click="preAddIntention">添加意图</mtd-button>
                                <div class="moses-form-intention-row" v-else>
                                    <mtd-input
                                        class="tool-flex-grow"
                                        placeholder="请输入添加意图"
                                        v-model="intentionName" />
                                    <mtd-button type="text-primary" @click="addIntention">确定</mtd-button>
                                    <mtd-button type="text" @click="clearIntention">取消</mtd-button>
                                </div>
                            </div>
                        </mtd-select>
                    </mtd-form-item>
                    <mtd-form-item
                        label="回复内容："
                        prop="answer">
                        <mtd-textarea
                            class="tool-input"
                            placeholder="请输入"
                            maxlength="20000"
                            v-model="moses.answer" />
                    </mtd-form-item>
                </mtd-form>
            </div>
            <div class="tool-footer moses-form-footer">
                <mtd-button class="moses-form-operation" @click="toResult">取消</mtd-button>
                <mtd-button
                    class="moses-form-operation"
                    type="primary"
                    @click="addMosesAnswer">确定</mtd-button>
            </div>
        </div>
    </pm-draggable-drawer>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as api from '@/api';
import { INSPECTION_KNOWLEDGE_MAP } from '@/config/lx_map.conf';
import { lxReportClick } from '@/utils/directive/lxanaly';
import { markHyperLink } from '@/utils/tools';
@Component
export default class TicketToolDetail extends Vue {
    @State(state => state.tt.userInfo) userInfo;
    @Prop({ default: 'static' }) mode: string;
    @Prop({ default: false }) exchangeable: boolean;
    @Prop({ default: () => ({}) }) config: any;
    @Prop({ default: true }) robotKey: string;
    @Prop({ default: '' }) rgId: string;
    @Prop() ticketId: number;
    MarkHyperLink: Function = markHyperLink;
    type: 'home' | 'result' | 'detail' | 'form' = 'home';
    historyType: 'home' | 'result' | 'detail' | 'form' = 'home';
    homeType: string = 'index';
    searchValue: string = '';
    searchTimeout: any = null;
    suggestVisible: boolean = false;
    suggestValues: any = [];
    shownMosesPanel: boolean = true;
    mosesList: any = [];
    moses: any = {};
    satisfaction: string = '';

    intentions: any = [];
    categories: any = [];
    intentionName: string = '';
    editingIntention: boolean = false;
    satisfactionAble: boolean = false;

    get inHome () {
        return [ 'home', 'result' ].includes(this.type);
    }

    get inResult () {
        return this.type === 'result';
    }

    get isStatic () {
        return this.mode === 'static';
    }

    get mosesRules () {
        return {
            category: [{ required: true, message: '请选择领域' }],
            intention: [{ required: true, message: '请输入意图' }],
            answer: [{ required: true, message: '请输入回复内容' }]
        };
    }

    get startConfig () {
        return {
            transform: 'translateX(580px)'
        };
    }

    get trimSearchValue () {
        if (!this.searchValue) return '';
        return this.searchValue.trim();
    }

    changeListType (type: string) {
        if (type === 'favorites') {
            this.getMosesFavorites();
            return ;
        }
        if (this.type === 'home') {
            this.getMosesRecommends();
            return ;
        }
        this.preSearchMoses();
    }

    getSearchValues () {
        clearTimeout(this.searchTimeout);
        // 无有效输入，直接清空suggest
        if (!this.trimSearchValue) {
            this.suggestVisible = false;
            this.clearSuggestValues();
            return;
        }
        this.searchTimeout = setTimeout(async () => {
            await this.getMosesIntentAssociation();
            this.showSearchSuggest();
        }, 100);
        lxReportClick(INSPECTION_KNOWLEDGE_MAP['search_knowledge'], {
            rgId: this.rgId
        });
    }
    // 清空下拉suggest
    clearSuggestValues () {
        this.suggestValues = [];
    }
    // 下拉框设置值
    setSearchValue (value: string) {
        this.searchValue = value;
        this.clearSuggestValues();
        this.preSearchMoses();
    }
    showSearchSuggest () {
        if (this.suggestValues.length) {
            this.suggestVisible = true;
        }
    }
    hideSearchSuggest () {
        this.suggestVisible = false;
    }

    preSearchMoses () {
        if (!this.trimSearchValue) return ;
        this.toResult();
        this.homeType = 'index';
        this.suggestVisible = false;
        this.searchMoses(this.trimSearchValue);
        this.getMosesQuestionSatisfaction(this.trimSearchValue);
    }

    toggleMosesPanel () {
        this.shownMosesPanel = !this.shownMosesPanel;
    }

    updateFavorites (index: number) {
        const row: any = this.mosesList[index];
        const isFavorites: boolean = row.isFavorites;
        this.mosesList.splice(index, 1, { ...row, isFavorites: !isFavorites });
        if (isFavorites) {
            this.decreaseMosesFavorites(row, () => {
                this.mosesList.splice(index, 1, row);
            });
        } else {
            this.increaseMosesFavorites(row, () => {
                this.mosesList.splice(index, 1, row);
            });
        }
    }

    updateDetailFavorites () {
        const { isFavorites } = this.moses;
        this.moses = { ...this.moses, isFavorites: !isFavorites };
        if (isFavorites) {
            this.decreaseMosesFavorites(this.moses, () => {
                this.moses = { ...this.moses, isFavorites };
            });
        } else {
            this.increaseMosesFavorites(this.moses, () => {
                this.moses = { ...this.moses, isFavorites };
            });
        }
    }

    async increaseMosesFavorites (row: any, reject: any) {
        const { question, solution, rootCategoryId, intentId } = row;
        const res: Ajax.AxiosResponse = await api.ticketApi.increaseMosesFavorites({
            mosesId: this.robotKey,
            question,
            solution,
            rootCategoryId,
            intentId,
            knowledgeType: 'MOSES'
        });
        let { code } = res;
        if (code === 200) {
            this.$mtd.message.success('加入收藏成功');
        } else if (reject) {
            reject();
        }
    }

    async decreaseMosesFavorites (row: any, reject: any) {
        const { rootCategoryId, intentId } = row;
        const res: Ajax.AxiosResponse = await api.ticketApi.decreaseMosesFavorites({
            mis: this.userInfo.username,
            mosesId: this.robotKey,
            rootCategoryId,
            intentId
        });
        let { code } = res;
        if (code === 200) {
            this.$mtd.message.success('取消收藏成功');
        } else if (reject) {
            reject();
        }
    }

    copyMoses (row: any) {
        const $el: any = document.createElement('pre');
        $el.innerHTML = row.solution || '';
        navigator.clipboard?.writeText($el.textContent);
        this.$mtd.message.success('复制成功');
        lxReportClick(INSPECTION_KNOWLEDGE_MAP['copy_knowledge'], {
            rgId: this.rgId
        });
    }

    async validate () {
        const $el: any = this.$refs.moses;
        if (!$el) return ;
        try {
            await $el.validate();
            return true;
        } catch (e) {
            return false;
        }
    }

    preAddIntention () {
        this.editingIntention = true;
    }

    clearIntention () {
        this.intentionName = '';
        this.editingIntention = false;
    }

    getMosesTitle (title: string) {
        if (!title) return '';
        return title.replace(this.trimSearchValue, `<span style="color: #FF8800;">$&</span>`);
    }

    async addIntention () {
        const name: string = this.intentionName && this.intentionName.trim();
        if (!name || name.length > 30) return this.$mtd.message.error('输入不能为空且不能超过30个字');
        const { category: categoryId } = this.moses;
        const res: Ajax.AxiosResponse = await api.ctiApi.addMosesIntention({
            categoryId,
            intentName: name
        });
        let { code } = res;
        if (code === 200) {
            this.$mtd.message.success('新建成功');
        }
        this.clearIntention();
        return this.getMosesIntentions();
    }

    changeMode () {
        this.$emit('change', this.isStatic ? 'float' : 'static');
    }

    close () {
        this.$emit('close');
    }

    async getMosesRecommends () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getMosesRecommends(this.ticketId, this.robotKey);
        let { code, data } = res;
        if (code === 200) {
            this.mosesList = data.mosesRecommendResults || [];
        }
    }

    async getMosesIntentAssociation () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getMosesIntentAssociation({
            robotKey: this.robotKey,
            keyWord: this.trimSearchValue
        });
        let { code, data } = res;
        if (code === 200) {
            const values: any = data.items || [];
            this.suggestValues = values.map((item: any) => {
                const { question, highlightWords = [] } = item;
                const label: string = highlightWords.reduce((value, str: string) => {
                    return question.replace(str, `<span style="color: #FF8800;">$&</span>`);
                }, question);
                return { label, value: question };
            });
        }
    }

    async getMosesFavorites () {
        const res: Ajax.AxiosResponse = await api.ticketApi.getMosesFavorites({
            mis: this.userInfo.username,
            knowledgeBaseType: 'MOSES'
        });
        let { code, data } = res;
        if (code === 200) {
            const items: any = data.items || [];
            this.mosesList = items.map((item: any) => ({ ...item, isFavorites: true }));
        }
    }

    async searchMoses (keyWord: string) {
        const res: Ajax.AxiosResponse = await api.ticketApi.searchMoses({
            ticketId: this.ticketId,
            robotKey: this.robotKey,
            keyWord
        });
        let { code, data } = res;
        if (code === 200) {
            this.mosesList = data.mosesRecommendResults || [];
        }
    }

    async getMosesQuestionSatisfaction (question: string) {
        this.satisfaction = '';
        const res: Ajax.AxiosResponse = await api.ticketApi.getMosesQuestionSatisfaction({
            ticketId: this.ticketId,
            question,
            evaluateUser: this.userInfo.username
        });
        let { code, data } = res;
        if (code === 200) {
            this.satisfactionAble = !!data.alterable;
        }
    }

    async setMosesQuestionSatisfaction (isSatisfy: boolean) {
        if (!this.trimSearchValue) return ;
        this.satisfaction = isSatisfy ? 'YES' : 'NO';
        const res: Ajax.AxiosResponse = await api.ticketApi.setMosesQuestionSatisfaction({
            ticketId: this.ticketId,
            question: this.trimSearchValue,
            isSatisfy,
            knowledgeType: 'MOSES',
            evaluateUser: this.userInfo.username
        });
        let { code } = res;
        if (code === 200) {
            this.$mtd.message.success('已反馈，感谢您的参与');
            this.satisfactionAble = false;
        }
    }

    async setMosesSatisfaction (isSatisfy: boolean) {
        if (!this.moses) return ;
        const { useful, useless } = this.moses;
        this.satisfaction = isSatisfy ? 'YES' : 'NO';
        const res: Ajax.AxiosResponse = await api.ticketApi.setMosesSatisfaction(isSatisfy ? useful : useless);
        let { code } = res;
        if (code === 200) {
            this.$mtd.message.success('已反馈，感谢您的参与');
            this.satisfactionAble = false;
        }
    }

    async getMosesCategories () {
        const res: Ajax.AxiosResponse = await api.ctiApi.getMosesCategories(this.rgId, 2);
        let { code, data } = res;
        if (code === 200) {
            this.categories = data?.item || [];
            if (this.categories.length && !this.moses.category) {
                this.moses = { ...this.moses, category: this.categories[0].categoryId };
                return this.getMosesIntentions();
            }
        }
    }

    async getMosesIntentions () {
        const { category: categoryId } = this.moses;
        if (!categoryId) return ;
        const res: Ajax.AxiosResponse = await api.ctiApi.getMosesIntentions({
            rgId: this.rgId,
            categoryId,
            mosesStageType: 2
        });
        let { code, data } = res;
        if (code === 200) {
            this.intentions = data?.item || [];
        }
    }


    async addMosesAnswer () {
        const valid: boolean = await this.validate();
        if (!valid) return ;
        const { category: categoryId, intention: intentId, answer: intentAnswer } = this.moses;
        const res: Ajax.AxiosResponse = await api.ctiApi.addMosesAnswer({
            rgId: this.rgId,
            categoryId,
            intentId,
            intentAnswer,
            mosesStageType: 2
        });
        let { code } = res;
        if (code === 200) {
            this.$mtd.message.success('新建摩西回复成功');
            this.toResult();
        }
    }

    changeMosesCategory () {
        this.getMosesIntentions();
        this.moses = { ...this.moses, intention: '' };
    }

    toHome () {
        this.historyType = this.type;
        this.type = 'home';
        this.searchValue = '';
        this.getMosesRecommends();
    }

    toResult () {
        this.historyType = this.type;
        this.type = 'result';
    }

    toDetail (index: number) {
        const row: any = this.mosesList[index];
        if (!row) return ;
        this.moses = { ...row };
        this.historyType = this.type;
        this.type = 'detail';
        this.satisfaction = '';
        this.satisfactionAble = row.useful && row.useless;
    }

    toForm () {
        this.getMosesCategories();
        this.moses = {};
        this.historyType = this.type;
        this.type = 'form';
    }

    goBack () {
        this.type = this.historyType;
        this.changeListType(this.homeType);
    }

    created () {
        this.toHome();
    }

    // 更新依赖ticketId和robotKeyId，在父组件已进行控制，ticketId更新时其他已更新完成
    @Watch('ticketId')
    updateHome () {
        if (this.trimSearchValue) {
            this.getMosesIntentAssociation();
        }
        if (this.type !== 'home' || this.homeType !== 'index') return ;
        this.getMosesRecommends();
    }
}
</script>

<style lang="scss" scoped>
.ticket-tool {
    padding: 12px;
    background-color: #fff;
    box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
}
.ticket-tool-title {
    font-size: 16px;
}
.tool-header {
    display: flex;
    align-items: center;
    &-operation {
        display: inline-flex;
        align-items: center;
        color: rgba(0, 0, 0, 0.9);
        line-height: 16px;
        padding-right: 4px;
        cursor: pointer;
    }
}
.tool-input {
    width: 100%;
    resize: none;
}
.tool-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}
.tool-content {
    flex-grow: 1;
    overflow: auto;
    margin-top: 14px;
    margin-bottom: 12px;
}
.tool-flex-grow {
    flex-grow: 1;
}
.moses-panel {
    &-header {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 4px;
        cursor: pointer;
        user-select: none;
    }
}
.moses-row {
    padding: 8px;
    margin-bottom: 8px;
    border-radius: 6px;
    &:hover {
        background-color: rgba(0, 0, 0, 0.04);
        .moses-row-more {
            background-color: #f5f5f5;
        }
    }
    &-header {
        display: flex;
        align-items: center;
        padding-bottom: 4px;
    }
    &-title {
        font-family: PingFangSC-Medium;
        flex-grow: 1;
        color: rgba(0, 0, 0, 0.84);
        line-height: 24px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    &-description {
        position: relative;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.84);
        text-align: justify;
        max-height: 54px;
        overflow: hidden;
        /deep/ img {
            max-width: 100%;
        }
    }
    //&-mask {
    //    position: absolute;
    //    top: 0;
    //    bottom: 0;
    //    width: 100%;
    //    cursor: pointer;
    //    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
    //}
    &-more {
        position: absolute;
        right: 0;
        bottom: 0;
        color: #0a70f5;
        background-color: #fff;
        cursor: pointer;
        padding-left: 3px;
        border-radius: 3px 0 0;
    }
}
.moses-detail {
    &-title {
        font-family: PingFangSC-Medium;
        font-size: 24px;
        color: rgba(0, 0, 0, 0.84);
        line-height: 32px;
        font-weight: 500;
        margin-bottom: 12px;
    }
    &-description {
        font-weight: 400;
        /deep/ img {
            max-width: 100%;
        }
    }
}
.tool-footer {
    color: rgba(0, 0, 0, 0.7);
    &-operation {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        & + .tool-footer-operation {
            margin-left: 8px;
        }
    }
    .tip-text {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.35);
        line-height: 20px;
        margin-bottom: 12px;
        &-operation {
            display: inline-flex;
            align-items: center;
            cursor: pointer;
        }
    }
}
.moses-form {
    &-content {
        padding-bottom: 60px;
    }
    &-footer {
        position: absolute;
        display: flex;
        width: 100%;
        left: 0;
        bottom: 0;
        padding: 12px 16px;
        background-color: #fff;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
    }
    &-operation {
        flex-grow: 1;
        & + .moses-form-operation {
            margin-left: 8px;
        }
    }
    &-intention-group {
        padding: 5px 2px;
        border-top: 1px solid rgba(0, 0, 0, 0.07);
    }
    &-intention-empty {
        padding: 0 2px;
    }
    &-intention-row {
        display: flex;
        align-items: center;
        /deep/ .mtd-input {
            border: 1px solid rgba(0, 0, 0, 0.12);
        }
    }
}
.tool-icon {
    padding: 4px;
    line-height: 16px;
    border-radius: 50%;
    cursor: pointer;
    &:hover {
        background-color: rgba(0, 0, 0, 0.06);
    }
}
.highlight-icon {
    color: #ffc300;
}
.rotate-icon {
    transform: rotate(180deg);
}
.moses-logo {
    display: inline-block;
    width: 12px;
    height: 12px;
    background-image: url("../../../src/assets/img/moses-logo.jpg");
    background-size: contain;
    background-repeat: no-repeat;
}
.fr {
    float: right;
    margin-left: auto;
}
</style>