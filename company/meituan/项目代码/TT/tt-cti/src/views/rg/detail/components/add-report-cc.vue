<template>
    <div class="change-cc-container">
        <search-user-dropdown @change="userChange" placement="bottom-start">
            <span class="add-button"><i class="iconfont icon-add" /> 添加抄送人</span>
        </search-user-dropdown>
        <div class="cc-container">
            <mtd-tag
                v-for="(user, index) in ccListResult"
                :key="user.username"
                theme="gray"
                type="unbordered"
                closeable
                @close="removeTag(index)">{{ `${user.displayName}(${user.username})` }}
            </mtd-tag>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import SearchUserDropdown from './search-user-dropdown.vue';
import * as api from '@/api';
/**
 * 修改抄送人
 *
 * @author liyuyao
 * @date 04/22/2019
 */
@Component({
    components: {
        SearchUserDropdown
    }
})
export default class ChangeCC extends Vue {
    @Prop()
    ccList: any;

    ccInfo: any = [];
    ccListResult: any = [];
    @Watch('ccList', { immediate: true })
    async onGetCClist () {
        if (this.ccList && this.ccList.length) {
            await this.searchDisplayNameList(this.ccList);
            this.ccListResult = [];
            this.ccInfo.forEach((item, index) => {
                const nameObj = {
                    displayName: item.displayName,
                    username: this.ccList[index],
                    isQuit: item.jobStatus === 16
                };
                this.ccListResult.push(nameObj);
            });
        }
    }
    async searchDisplayNameList (userArr) {
        const res = await api.ctiApi.searchDisplayNameList(userArr);
        const { code, data } = res;
        if (code === 200) {
            this.ccInfo = userArr.map((user) => {
                return data[user] || user;
            });
        }
    }
    userChange (username, displayName) {
        if (this.ccListResult.length > 19) {
            this.$mtd.message({
                message: '抄送人不能多于20个',
                type: 'error'
            });
            return;
        }
        this.ccListResult.push({
            username: username,
            displayName: displayName,
            isQuit: false
        });
        this.$emit('change', this.pureCcResult);
    }
    removeTag (index) {
        this.ccListResult.splice(index, 1);
        this.$emit('change', this.pureCcResult);
    }
    get pureCcResult () {
        const result = this.ccListResult.map((user) => {
            return user.username;
        });
        return result;
    }
}
</script>

<style lang="postcss">
.change-cc-container {
    max-width: 600px;
    .mtd-tag {
        margin-right: 5px;
    }
    .add-button {
        color: #FF8800;
        cursor: pointer;
        .icon-add {
            font-size: 12px;
        }
    }
}
</style>
