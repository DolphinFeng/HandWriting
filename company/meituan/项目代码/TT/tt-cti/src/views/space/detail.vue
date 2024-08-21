<template>
    <div class="space-detail-container">
        <h1>
            <span @click="goback" class="back-home">首页</span>
            <i class="iconfont icon-you-" />
            {{ spaceDetailInfo.name }}</h1>
        <div class="space-instruction">
            <p>空间是 TT 独立的业务板块，各个空间有独立的访问链接，目录也相互独立。</p>
            <p>空间首页地址：
                <a :href="`//${spaceDetailInfo.accessLink}`" target="_blank">{{ spaceDetailInfo.accessLink }}</a>
                <i
                    class="mtdicon mtdicon-copy-o"
                    v-clipboard="spaceDetailInfo.accessLink"
                    @success="handleCopySuccess" />
            </p>
            <!-- <p>空间模板访问地址（暂未开放）：
                <a :href="`//${spaceDetailInfo.formListLink}`" target="_blank">{{ spaceDetailInfo.formListLink }}</a>
            </p> -->
        </div>
        <div>
            <mtd-tabs v-model="activeName" @tab-click="handleChangeTab">
                <mtd-tab-pane
                    :key="tab.value"
                    v-for="tab in tabs"
                    :label="tab.label"
                    :value="tab.value" />
            </mtd-tabs>
            <router-view />
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { SpaceDetailTabs } from '@/config/map.conf';
import * as api from '@/api';

/**
 * 空间详情
 *
 * @author liyuyao
 * @date 08/10/2020
 */
@Component({
    components: {
    }
})
export default class SpaceDetail extends Vue {
    tabs: CommonTypes.valueLabel[] = SpaceDetailTabs;
    activeName: string = 'space_admin';
    spaceDetailInfo: CommonTypes.mapObject = {
        name: '测试标题',
        formListLink: '',
        accessLink: ''
    };
    @Watch('$route.name', { immediate: true })
    onRouterChange (routeName) {
        const includesRoute = SpaceDetailTabs.map(item => item.value).includes(routeName);
        // this.activeName = routeName.includes('space_template') ? 'space_template' : ( includesRoute ? routeName : 'space_admin');
        this.activeName = includesRoute ? routeName : 'space_admin';
    }
    get spaceId () {
        return parseInt(this.$route.params.id, 10);
    }
    mounted () {
        this.getSpaceDetail();
    }
    async getSpaceDetail () {
        try {
            const res = await api.spaceApi.getSpaceDetail(this.spaceId);
            const { code, data } = res;
            if (code === 200) {
                this.spaceDetailInfo.name = data.name;
                this.spaceDetailInfo.formListLink = data.formListLink;
                this.spaceDetailInfo.accessLink = data.accessLink;
            }
        } catch (e) {
            console.log(e);
        }
    }
    goback () {
        this.$router.push({
            name: 'space'
        }).catch(e => e);
    }
    handleChangeTab () {
        this.$router.push({
            name: this.activeName
        }).catch(e => e);
    }
    handleCopySuccess () {
        this.$mtd.message.success('复制成功');
    }
}
</script>
<style lang="postcss" scoped>
.space-detail-container {
    padding: 0 24px;
    .back-home {
        vertical-align: text-bottom;
        font-size: 16px;
        color: #464646;
        cursor: pointer;
        &:hover {
            color: #FF8800;
        }
    }
    h1 {
        padding: 12px 0;
        font-family: PingFangSC-Medium;
        font-size: 20px;
        color: rgba(0, 0, 0, 0.84);
        line-height: 28px;
    }
    .space-instruction {
        padding: 12px;
        background: #F5F5F5;
        border-radius: 4px;
        p {
            line-height: 2;
        }
        .mtdicon-copy-o {
            cursor: pointer;
            vertical-align: middle;
        }
    }
}
</style>
