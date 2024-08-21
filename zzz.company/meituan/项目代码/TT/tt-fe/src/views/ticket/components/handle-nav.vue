<template>
    <div
        class="handle-list-nav-container"
        id="handleListNav"
        ref="handleListNav">
        <div class="handle-top-wrapper">
            <h5>{{ $getText('handle_list_all', '所有的') }}</h5>
            <i
                class="mtdicon mtdicon-refresh-o"
                @click="refresh" />
        </div>
        <div
            class="handle-list-nav"
            v-if="list && list.length > 0"
            v-infinite-scroll="load"
            :infinite-scroll-disabled="noMore"
            :infinite-scroll-delay="500"
            :infinite-scroll-distance="10"
            :infinite-scroll-immediate="false">
            <div class="handle-list-wrapper">
                <handle-nav-item
                    v-for="ticket in list"
                    :key="ticket.id"
                    :active="+detailId === ticket.id"
                    :ticket="ticket"
                    :comment-state.sync="commentStateFromMessage[ticket.id]"
                    @dx-tag-change="onDxMessageChanged"
                    @click.native="changeEmit(ticket.id)" />
            </div>
            <div class="if-more">
                {{ noMore ? $getText('handle_list_no_more', '没有更多了') : $getText('handle_list_load_more', '滑动加载更多') }}
            </div>
            <el-backtop
                target=".handle-list-nav-container .handle-list-nav"
                class="return-top-icon"
                :visibility-height="400"
                :bottom="16"
                :right="16"
                ref="backToTop">
                <i class="mtdicon mtdicon-top" />
            </el-backtop>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import HandleNavItem from './handle-nav-item.vue';
import { InfiniteScroll, Backtop } from 'element-ui';
Vue.use(InfiniteScroll);
Vue.use(Backtop);

import Pike from '@dp/pike-message-web';
import eventBus from '@/utils/event-bus';

import { hidden, visibilityChange } from '@/utils/tools/pageActive';
import { env } from '@/env';

const pikeEnv = {
    'prod': 'product',
    'staging': 'stage',
    'test': 'test'
};

/**
 * 处理TT
 *
 * @author liyuyao
 * @date 10/22/2020
 */
@Component({
    components: {
        HandleNavItem
    }
})
export default class HandleList extends Vue {
    @Getter misX;

    @Prop({ default: () => {
        return [];
    } })
    list: any;

    @Prop({ default: null })
    detailId: number;

    @Prop({ default: 0 })
    tn: number;

    commentStateFromMessage: CommonTypes.mapObject = {};
    pike: any = null;
    handleList: any = [];

    get needPike () {
        return this.$route.query && this.$route.query.filter === 'todo';
    }
    get noMore () {
        return this.list && this.list.length >= this.tn;
    }

    @Watch('list', { immediate: true, deep: true })
    onListChanged () {
        if (this.needPike) {
            if (this.handleList.length) {
                const isIdEqual = this.list[0]?.id === this.handleList[0]?.id;
                const isLengthShorter = this.handleList.length < this.list.length;
                if (isLengthShorter && isIdEqual) {
                    // 滚动加载了更多TT
                    this.sendPikeMessage('onRestart', this.list.slice(this.handleList.length));
                } else if (!isIdEqual) {
                    // 点击刷新按钮加载了第一页TT，且数据有更新
                    this.sendPikeMessage('onRestart', this.list);
                }
            }
            this.handleList = Object.assign(this.list);
        }
    }
    @Watch('misX', { immediate: true })
    getUserMis (mis) {
        if (mis && this.needPike) this.pikeMessageServiceInit();
    }

    @Watch('$route.query.filter')
    refreshBackToTop () {
        const backToTop = this.$refs.backToTop && this.$refs.backToTop.$el;
        if (backToTop && backToTop.click) {
            backToTop.click();
        }
        if (this.needPike) {
            console.log('pike 重连');
            this.pike && this.pike.restart();
        } else {
            console.log('pike 关闭');
            this.pike && this.pike.stop();
            this.commentStateFromMessage = {};
        }
    }

    mounted () {
        window.addEventListener(visibilityChange, this.pageFocus, false);
    }
    pageFocus () {
        const pageActive = !document[hidden];
        // 活跃则重连
        if (this.needPike && this.pike && pageActive) {
            console.log('pike 重连');
            this.pike.restart();
        }
    }

    pikeMessageServiceInit () {
        this.pike = new Pike(`TroubleTracker_Pike_message`, {
            env: pikeEnv[env],
            autoConnect: false,
            alias: this.misX,
            isDebug: env !== 'prod',
            swimlane: '26365-hvlho'
        });
        this.pike?.onStart(() => {
            this.sendPikeMessage('onRestart', this.handleList);
        });
        this.pike?.start();
        this.pike?.onMessage(data => {
            console.log('message', data);
            let msg = data.replace(/\\/g, '');
            msg = JSON.parse(msg);
            let { ticketId, isNewComment, isAboutToTimeout, isUnreadMessage } = msg;
            if ((isNewComment !== undefined && isAboutToTimeout !== undefined)) {
                // 选中某条TT时推送的message不会包含未读字段，未读消息不会由TT主动请求
                this.$set(this.commentStateFromMessage, ticketId, {
                    ...this.commentStateFromMessage[ticketId],
                    isNewComment,
                    isAboutToTimeout
                });
            }
            // 有未读消息推送时，不会携带其他字段
            if (isUnreadMessage !== undefined) {
                this.$set(this.commentStateFromMessage, ticketId, {
                    ...this.commentStateFromMessage[ticketId],
                    isUnreadMessage
                });
            }
            eventBus.$emit('message', msg);
        });
        this.pike?.onClose(() => {
            this.sendPikeMessage('onClose', this.handleList);
        });
    }
    sendPikeMessage (event, list) {
        let msg = `${event}:` + list.map(li => li.id).join(',');
        console.log('msg: ', msg);
        this.pike?.send(msg)
            .then(res => {
                // 消息发送成功啦 😁...
                console.log('消息发送成功', res);
            }).catch(e => {
                // 消息发送失败 😤...
                console.log('消息发送失败', e);
            });
    }
    changeEmit (id) {
        this.$emit('change', id);
    }
    load () {
        this.$emit('scroll-load');
    }
    refresh () {
        this.commentStateFromMessage = {};
        this.refreshBackToTop();
        this.$emit('refresh');
    }
    beforeDestroy () {
        console.log('pike 关闭');
        this.commentStateFromMessage = {};
        this.pike && this.pike.stop();
        window.removeEventListener(visibilityChange, this.pageFocus);
    }
    onDxMessageChanged (id, val) {
        this.$emit('dx-tag-change', id, val);
    }
}
</script>

<style lang="scss">
.handle-list-nav-container {
    width: 346px;
    height: 100%;
    margin-right: -3px;
    background: #fff;
    box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
    border-radius: 6px;
}
.handle-top-wrapper {
    display: flex;
    align-items: center;
    margin: 0 14px;
    padding: 10px 0;
    color: rgba(0, 0, 0, 0.84);
    line-height: 24px;
    font-size: 14px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);
    .mtdicon-refresh-o {
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        &:hover {
            background: #ebebeb;
        }
    }
    h5 {
        flex: 1;
    }
}
.handle-list-nav {
    width: 100%;
    height: calc(100% - 52px);
    // border-right: 3px solid #e6e6e6;
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 0 4px 0 8px;
    .if-more {
        text-align: center;
        padding: 12px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        line-height: 20px;
        font-weight: 400;
    }
    .return-top-icon {
        // width: 16px;
        // height: 16px;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.6);
        box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
    }
}
.return-top-icon {
    right: 20px;
    width: 32px;
    height: 32px;
    background: #fff;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.08);
    border-radius: 4px;
    color: rgba(0, 0, 0, 0.84);
    font-size: 14px;
    position: absolute;
    z-index: 99;
    &:hover {
        background-color: #ffc300;
    }
}
</style>
