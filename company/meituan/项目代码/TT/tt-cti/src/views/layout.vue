<template>
    <div id="layout">
        <div>
            <TopNav
                :user-avatar="userAvatar" />
        </div>
        <div class="cti-topnav-wrapper">
            <mtd-tabs
                v-model="activeName"
                size="large"
                @tab-click="handleSelect">
                <mtd-tab-pane label="服务黄页(CTI)" value="cti" />
                <mtd-tab-pane label="服务组(RG)" value="rg" />
                <mtd-tab-pane
                    label="空间管理"
                    value="space"
                    v-if="hasSpacePermission" />
            </mtd-tabs>
        </div>
        <main class="cti-main">
            <router-view />
            <mtd-modal
                class="instruction-modal"
                width="588px"
                :title="activeInstructionTitle"
                v-model="shouldShowInstruction"
                destroy-on-close>
                <div>
                    <el-carousel
                        ref="instructionCarousel"
                        height="426px"
                        @change="onCarouselChange"
                        :loop="false"
                        :autoplay="false"
                        trigger="click">
                        <el-carousel-item v-for="(item, key) in instruction" :key="`ins-carousel-${key}`">
                            <div v-if="item.videoUrl">
                                <video
                                    ref="`video-${key}`"
                                    width="588"
                                    height="344"
                                    autoplay
                                    muted
                                    controls
                                    :src="item.videoUrl"
                                    :poster="item.imgUrl" />
                            </div>
                            <div
                                v-else
                                class="carousel-img-bg"
                                :style="{ 'background-image': `url(${item.imgUrl})` }" />
                            <div class="text">
                                <!--<h1>{{ item.title }}</h1>-->
                                <p>{{ item.title }}</p>
                            </div>
                        </el-carousel-item>
                    </el-carousel>
                </div>
                <div slot="footer" class="demo-modal-footer">
                    <mtd-button
                        type="primary"
                        @click="handleModalBtn">{{ isCarouselNotOnLastPage ? '继 续' : '立 即 体 验' }}</mtd-button>
                    <!--<mtd-button type='primary' @click="closeModal1">确定</mtd-button>-->
                </div>
            </mtd-modal>
        </main>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Carousel, CarouselItem } from 'element-ui';
import { get } from 'lodash';

import { DEFAULT_AVATAR } from '@/config/map.conf';
import TopNav from './topNavbar.vue';

import * as api from '@/api';
import store from '@/store';

/**
 * 页面布局
 *
 * @author xiaokunyu
 * @date 01/11/2019
 */
@Component({
    components: {
        Carousel,
        CarouselItem,
        TopNav
    }
})
export default class Layout extends Vue {
    @State(state => state.cti.env)
    env: string;
    activeName: string = 'cti';
    mis: string = '';
    name: string = '';
    instructionVer: string = '';
    instruction: any = [];
    visible: Boolean = false;
    shouldShowInstruction: Boolean = false;
    activeInstructionIndex: number = 0;

    hasSpacePermission: boolean = false;

    userAvatar: string = 'DEFAULT_AVATAR';

    $refs: { instructionCarousel: Carousel };

    handleSelect () {
        this.$router.push({ name: this.activeName }).catch(e => e);
    }
    // TODO: MTD支持onClose后 使用onclose回调替换watch.
    // 用户手动关闭模态框之后，记录行为，不再展示同一个模态框。
    @Watch('shouldShowInstruction')
    onInstructionModalDisappear (newShould) {
        if (newShould === false) {
            localStorage.setItem('lastInstructionVer', this.instructionVer);
        }
    }
    mounted () {
        this.getUserInfo();
        this.getSpacePermission();
        // 用户引导
        this.getUserInstruction();
        this.activeTabOnRefresh();
    }
    activeTabOnRefresh () {
        const mainRouteName = this.$route.name.split('_')[0];
        this.activeName = mainRouteName || 'cti';
    }
    onCarouselChange (newIndex) {
        this.activeInstructionIndex = newIndex;
    }
    handleModalBtn () {
        if (this.isCarouselNotOnLastPage) {
            this.activeInstructionIndex++;
            this.$refs.instructionCarousel.setActiveItem(this.activeInstructionIndex);
        } else {
            this.shouldShowInstruction = false;
        }
    }
    async getUserInfo () {
        try {
            const res = await api.ctiApi.getUserInfo();
            this.name = res.data.displayname;
            this.mis = res.data.username;
            store.commit('GET_USER_INFO', res.data);
            this.getUserAvatar();
        } catch (e) {
            console.log(e);
        }
    }
    async getSpacePermission () {
        try {
            const res = await api.spaceApi.getSpacePermission();
            const { code, data } = res;
            if (code === 200) this.hasSpacePermission = data.hasSpacePermission;
        } catch (e) {
            console.log(e);
        }
    }
    async getUserInstruction () {
        try {
            const res = await api.ctiApi.getUserInstruction();
            // 从localstorage取出之前看过的version: str
            const prevVer = localStorage.getItem('lastInstructionVer');
            // const { version: versionInt, items: instruction } = res.data || {};
            // const { version, items: instruction } = mockInstructions;
            // 小心的取出接口返回的version: int
            const versionInt = get(res, 'data.version');
            // 小心的取出接口返回的instruction: array
            const instruction = get(res, 'data.items', []);
            // 接口有version的话，把int转成str，否则version undefined
            const version = versionInt ? versionInt.toString() : undefined;
            // 如果有version，而且跟之前看过的不一致，把version和instruction放到store里面，打开modal
            if (version && (prevVer !== version)) {
                this.instruction = instruction;
                this.instructionVer = version;
                this.shouldShowInstruction = true;
            }
        } catch (e) {
            console.log(e);
        }
    }
    // 获取头像
    async getUserAvatar () {
        const res = await api.ctiApi.searchDisplayNameList([this.mis]);
        const { code, data } = res;
        if (code === 200) {
            this.userAvatar = data[this.mis] && data[this.mis].avatar || DEFAULT_AVATAR;
        }
    }
    get ticketUrl () {
        return this.env === 'prod' ? '//tt.sankuai.com' : '//tt.cloud.test.sankuai.com';
    }
    get callBackUrl () {
        return '//tt.sankuai.com/ticket/create?cid=112&tid=2190&iid=9397';
    }
    get helpUrl () {
        return 'https://km.sankuai.com/page/134109797';
    }
    // 用户引导还没翻到最后一页
    get isCarouselNotOnLastPage () {
        const pageTotal = this.instruction.length || 0;
        return this.activeInstructionIndex + 1 < pageTotal;
    }
    // 设置sso登出地址
    get logoutUrl () {
        return '/sso/logout';
    }
    // 根据index获取当前用户引导内容
    get activeInstructionTitle () {
        if (!this.shouldShowInstruction) return '';
        return get(this, `instruction.${this.activeInstructionIndex}.title`, '');
    }
}
</script>

<style lang="postcss">
#layout {
    height: 100%;
    .cti-topnav-wrapper {
        padding: 6px 24px 0 24px;
    }
    .cti-topnav {
        border-bottom: 0;
        box-shadow: 0 1px 6px 0 rgba(192, 196, 204, 0.39);
        .el-menu-item * {
            vertical-align: top;
        }
        & > .el-menu-item {
            height: 52px;
            padding: 0 8px;
            line-height: 52px;
            font-family: PingFangSC-Regular;
            font-size: 16px;
            &.is-active {
                border-bottom: 2px solid #FF8800;
                font-family: PingFangSC-Semibold;
                color: #FF8800;
            }
        }
        .cti-topnav-title {
            margin: 0 24px;
            border-bottom-color: transparent;
            cursor: initial;
            font-family: MFLiHei-Regular;
            font-size: 16px;
            color: #474B5A;
            letter-spacing: 0;
            img {
                width: 120px;
                vertical-align: middle;
            }
        }
        .cti-topnav-link {
            float: right;
            margin-right: 20px;
            font-weight: bold;
            font-family: PingFangSC-Medium;
            color: #808AB1;
            transition: color 0s;
            font-size: 14px;
            a {
                text-decoration: none;
            }
            i {
                margin-right: 6px;
                font-size: 20px;
                font-weight: normal;
                color: #808AB1;
                vertical-align: bottom;
            }
            &:hover {
                color: #FF8800;
                i {
                    color: #FF8800;
                }
            }
        }
        .cti-topnav-img {
            float: right;
            margin-right: 4px;
            .cti-user-img {
                width: 32px;
                height: 32px;
                border: 1px solid #D1D1D1;
                border-radius: 50%;
                vertical-align: middle;
            }
        }
        .icon-CTIRG {
            font-size: 16px;
            color: #474B5A;
        }
    }
    .cti-main {
        height: calc(100% - 105px);
        background-color: #FFFFFF;
    }
}
.instruction-modal {
    .mtd-modal {
        min-height: 480px;
        .mtd-modal-header {
            display: none;
        }
        .mtd-modal-content-wrapper {
            /* 去掉默认留白 */
            padding: 0;
            /* 防止modal内容滚动 */
            overflow-y: auto;
            /* modal主内容部分容器高度 */
            /* 组件库定义modal总高度不高于82vh */
            /* max-height: 400px; */
            border-radius: 10px;
            p {
                font-size: 16px;
                margin-bottom: 20px;
            }
            .mtd-modal-content {
                ul.el-carousel__indicators {
                    .el-carousel__indicator {
                        button {
                            background: rgba(0, 0, 0, 0.1);
                            border: rgba(0, 0, 0, 0.1);
                        }
                        &.is-active {
                            button {
                                background: #396FCC;
                                border: #396FCC;
                            }
                        }
                    }
                }
                .el-carousel {
                    .el-carousel__item {
                        .carousel-img-bg {
                            /* background: red; */
                            background-size: cover;
                            background-repeat: no-repeat;
                            height: 344px;
                        }
                        .text {
                            padding: 24px;
                            p,
                            h1 {
                                color: rgba(0, 0, 0, 0.6);
                                line-height: 22px;
                                text-align: center;
                            }
                        }
                    }
                }
            }
        }
        .mtd-modal-footer {
            /* margin-top: 20px; */
            .demo-modal-footer {
                text-align: center;
                button.mtd-btn.mtd-btn-primary {
                    height: 30px;
                    span {
                        line-height: 28px;
                    }
                }
            }
        }
        .mtd-modal-close {
            z-index: 20;
        }
        /* min-height: 600px; */
        img {
            width: 100%;
        }
    }
}
.logout-dropdown {
    .icon-tuichu- {
        margin-right: 8px;
        color: #808AB1;
        vertical-align: middle;
    }
    .logout-text {
        margin-right: 65px;
        vertical-align: middle;
    }
    .logout-link {
        text-decoration: none;
    }
    .mtd-dropdown-menu-item {
        line-height: 32px;
        height: 36px;
        width: 154px;
    }
    a {
        text-decoration: none;
        color: rgba(0, 0, 0, 0.84);
        &:hover {
            text-decoration: none;
            color: rgba(0, 0, 0, 0.84);
        }
    }
    .nav-handover-wrapper {
        line-height: 32px;
        height: 36px;
        padding: 0 16px;
        text-align: left;
        cursor: pointer;
        position: relative;
        &:hover {
            background-color: rgba(0, 0, 0, 0.04);
            color: rgba(0, 0, 0, 0.84);
        }
        .mtdicon {
            position: absolute;
            right: 16px;
            top: 10px;
            line-height: 14px;
        }
    }
    .handover-link-item {
        line-height: 32px;
        height: 36px;
        padding-left: 32px;
        a {
            width: 100%;
        }
        &:hover {
            background-color: rgba(0, 0, 0, 0.04);
            color: rgba(0, 0, 0, 0.84);
        }
    }
    .handover-link-item-single {
        padding-left: 16px;
    }
}
</style>
