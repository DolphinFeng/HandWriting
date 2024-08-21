<template>
    <div class="tt-home-page-outside-container">
        <div class="center-banner">
            <h1>{{ $getText('home_welcome_title', '欢迎使用TT') }}</h1>
            <p>{{ $getText('home_welcome_desc', 'TT是一个问题流转工具，当您碰到问题时可以通过TT快速找到问题的处理人') }}</p>
            <router-link
                :to="{ name: 'tt_create', params: { space: spaceDomain } }"
                class="create-tt-link">
                <i class="mtdicon mtdicon-add" /><span>{{ $getText('home_create_tt', '发起TT') }}</span></router-link>
        </div>
        <div class="tt-about-me">
            <h3>{{ $getText('home_my_tt_title', '查看我的TT') }}</h3>
            <div class="tt-classic-wrapper">
                <div
                    class="tt-classic"
                    :key="page.value"
                    v-for="page in ttMy"
                    @click="routeTo(page)">
                    <i :class="`iconfont ${page.icon}`" />
                    <span class="page-name">{{ page.label }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
 
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import TopNav from '@/components/topnav.vue';
import { TopNavTabsOutside } from '@/config/map.conf';

import eventBus from '@/utils/event-bus';

/**
 * 系统首页
 *
 * @author liyuyao
 * @date 04/20/2019
 */
@Component({
    components: {
        TopNav
    }
})
export default class Home extends Vue {
    @Getter inside;
    @Getter spaceDomain;

    ttMy: any = TopNavTabsOutside;

    routeTo (page) {
        eventBus.$emit('changeTab', page.value);
        this.$nextTick(() => {
            if (page.route) {
                this.$router.replace(page.route).catch(e => e);
                return ;
            }
            this.$router.push({
                name: 'tt_handle',
                params: {
                    space: this.spaceDomain
                },
                query: {
                    filter: page.value
                }
            }).catch(e => e);
        });
    }
}
</script>
 
<style lang="scss">
.tt-home-page-outside-container {
    width: 1080px;
    margin: 0 auto;
    padding: 20px 0;
    .center-banner {
        padding: 48px;
        background-image: url("../../assets/img/outside-banner.png");
        background-size: cover;
        border-radius: 4px;
    }
    h1 {
        font-family: PingFangSC-Semibold;
        font-size: 32px;
        color: rgba(0, 0, 0, 0.84);
    }
    h3 {
        margin-bottom: 12px;
        font-family: PingFangSC-Semibold;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.84);
        letter-spacing: 0;
        line-height: 24px;
    }
    p {
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.84);
        letter-spacing: 0;
        line-height: 40px;
    }
    .create-tt-link {
        display: inline-block;
        width: 128px;
        margin-top: 36px;
        padding: 0 12px;
        color: rgba(0, 0, 0, 0.84);
        line-height: 38px;
        font-size: 14px;
        background: #ffc300;
        border-radius: 4px;
        font-family: PingFangSC-Medium;
        text-align: center;
        .mtdicon-add {
            vertical-align: middle;
            font-weight: bold;
            margin-right: 5px;
            &::before {
                color: rgba(0, 0, 0, 0.84);
            }
        }
        span {
            vertical-align: middle;
        }
        &:hover {
            text-decoration: none;
            background: #ffd420;
            border-color: #ffd420;
        }
    }
    .tt-classic {
        display: inline-block;
        width: 338px;
        margin: 0 12px 12px 0;
        padding: 12px 48px;
        border: 1px solid #ededed;
        border-radius: 8px;
        color: rgba(0, 0, 0, 0.84);
        background-color: #fff;
        cursor: pointer;
        &:hover {
            border: 1px solid #ededed;
            box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.01), 0 3px 6px 3px rgba(0, 0, 0, 0.01), 0 2px 6px 0 rgba(0, 0, 0, 0.03);
        }
        .page-name {
            font-family: PingFangSC-Medium;
            font-size: 14px;
            letter-spacing: 0;
            vertical-align: middle;
            &:hover {
                font-family: PingFangSC-Semibold;
            }
        }
        .iconfont {
            font-size: 22px;
            vertical-align: middle;
        }
        &:nth-child(3n) {
            margin-right: 0;
        }
    }
    .tt-about-me {
        margin-top: 32px;
    }
}
</style>
