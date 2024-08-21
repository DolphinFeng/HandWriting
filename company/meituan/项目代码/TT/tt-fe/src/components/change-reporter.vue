<template>
    <div class="change-reporter-container">
        <span style="vertical-align: middle;">{{ reporterDisplay.displayName || reporter }}</span>
        <search-user-dropdown
            :visible="dropdownVisible"
            @change="userChange"
            @close="dropdownVisible = false"
            placement="bottom-start"
            :placeholder="$getText('change_reporter_placeholder', '请输入发起人姓名或mis号')"
            v-if="inside">
            <i @click="dropdownVisible = true" class="mtdicon mtdicon-edit-o" />
        </search-user-dropdown>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter, State } from 'vuex-class';
import SearchUserDropdown from '@/components/search-user-dropdown.vue';
import { submitAndGetUserInfo } from '@/utils/tools';

/**
 * 用户搜索框
 *
 * @author liyuyao
 * @date 04/22/2019
 */
@Component({
    components: {
        SearchUserDropdown
    }
})
export default class ChangeReporter extends Vue {
    @Prop({ default: '' })
    reporter: string;

    @State(state => state.tt.userDisplayInfo)
    userDisplayInfo: CommonTypes.userDisplayItem[];

    @Getter inside;

    reporterDisplay: CommonTypes.userDisplayItem = {};
    dropdownVisible: boolean = false;

    userChange (username) {
        this.dropdownVisible = false;
        this.$emit('change', username);
    }
    @Watch('reporter')
    async onReporterChange (val) {
        if (this.reporter) {
            this.reporterDisplay = await submitAndGetUserInfo(this.userDisplayInfo, this.reporter);
        }
    }
}
</script>

<style lang="scss">
.change-reporter-container {
    .search-user-dropdown-container {
        display: inline-block;
    }
    .mtdicon-edit-o {
        font-size: 18px;
        cursor: pointer;
    }
}
</style>