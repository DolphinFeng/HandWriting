<template>
    <div class="ticket-moses-helper-container">
        <div class="page-wrapper">
            <!-- 如果没有启用机器人 -->
            <div class="error-message" v-if="enableRobot === false">
                <mtd-announcement
                    :title="errorMessage + (remainingSeconds == null ? '' : `(${remainingSeconds}s)`)"
                    show-icon
                    type="warning" />
            </div>
            <template v-if="robotId && enableRobot">
                <div class="announcement" v-if="bulletin && bulletin.enable">
                    <h3 class="announcement-title">温馨提示</h3>
                    <mtd-tooltip :content="bulletin && bulletin.content" popper-class="moses-helper-bulletin-tooltip">
                        <div class="announcement-content line-clamp" style="-webkit-box-orient: vertical;">
                            {{ bulletin && bulletin.content }}
                        </div>
                    </mtd-tooltip>
                </div>
                <div class="main-content">
                    <div class="left-side">
                        <section class="faqs-container">
                            <div class="faqs-section-title">
                                <h2><i class="mtdicon mtdicon-question-circle-o" /> 常见问题</h2>
                            </div>
                            <ul class="faqs">
                                <li
                                    class="faq"
                                    v-for="faq in faqs"
                                    :key="faq.id">
                                    <a
                                        class="faq-link"
                                        :href="faq.content"
                                        target="_blank">{{ faq.title }}</a>
                                </li>
                            </ul>
                        </section>
                        <section class="created-by-me">
                            <a
                                href="/ticket/list?filter=createdBy"
                                class="created-by-me-title"
                                target="_blank">
                                <h2>
                                    <i class="mtdicon mtdicon-avatar-o" />
                                    我历史发起的 <i class="mtdicon mtdicon-right-thick" />
                                </h2>
                            </a>
                        </section>
                    </div>
                    <div class="right-side moses-bot-container" ref="mosesBotContainer" />
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import { Getter, State } from 'vuex-class';

interface Faq {
    content: string;
    title: string;
    id: number;
}

interface Bulletin {
    content: string;
    enable: boolean;
}

@Component({})
export default class TicketMosesHelper extends Vue {
    @Getter spaceDomain;

    @State(state => state.tt.userInfo)
    userInfo: CommonTypes.UserInfoItem;

    rgId: number = null;
    robotId: string = null;
    enableRobot: boolean = null;

    faqs: Array<Faq> = [];
    bulletin: Bulletin = { content: null, enable: null };

    getInitRgId () {
        const rgIdQuery = this.$route.query.rgId;
        if (typeof rgIdQuery === 'string') {
            return parseInt(rgIdQuery, 10);
        }
        return null;
    }

    async mounted () {
        this.rgId = this.getInitRgId();
        if (this.rgId == null || window.isNaN(this.rgId)) {
            this.$mtd.message({ type: 'error', message: '访问非法: rgId 参数不存在' });
            return;
        }

        await this.getMosesSetting();

        if (!this.enableRobot || !this.robotId) {
            await this.countdown(5);
            this.$router.push('/');
        } else {
            this.getMosesFaqs();
            this.getMosesBulletins();
        }
    }

    @Watch('userInfo.username')
    @Watch('robotId')
    initMosesBot (newVal: string) {
        if (!newVal) return;
        const robotId = this.robotId;
        const username = this.userInfo.username;
        const mosesBotContainer = this.$refs.mosesBotContainer as HTMLDivElement;

        if (robotId && username) {
            const iframe = document.createElement('iframe');
            const url = `https://moses.meituan.com/chat?robotKey=${robotId}&userId=${username}&theme=primary&isFrame=0`;
            iframe.src = url;
            if (mosesBotContainer?.firstElementChild instanceof HTMLIFrameElement) {
                // Edge case: 如果已经初始化，就替换 iframe
                mosesBotContainer.replaceChild(iframe, mosesBotContainer.firstElementChild);
            } else {
                mosesBotContainer?.appendChild(iframe);
            }
        }
    }

    async getMosesBulletins () {
        try {
            const res = await api.ctiApi.getMosesBulletins({ rgId: this.rgId });
            const { code, data } = res;
            if (code === 200) {
                if (Array.isArray(data.items) && data.items.length > 0) {
                    const bulletin = data.items[0];
                    this.bulletin = bulletin;
                }
            } else {
                this.$mtd.message({ message: res.message, type: 'error' });
            }
        } catch (e) {
            console.log(e);
        }
    }
    async getMosesFaqs () {
        try {
            const res = await api.ctiApi.getMosesFaqs({
                rgId: this.rgId,
                enable: true,
                cn: 1,
                sn: 1000
            });
            const { code, data } = res;
            if (code === 200) {
                this.faqs = data.items;
            } else {
                this.$mtd.message({ message: res.message, type: 'error' });
            }
        } catch (e) {
            console.log(e);
        }
    }

    async getMosesSetting () {
        try {
            const res = await api.ctiApi.getMosesSetting(this.rgId);
            const { code, data, msg } = res;
            if (code === 200) {
                this.robotId = data.mosesId;
                this.enableRobot = data.active || false;
            } else {
                this.$mtd.message({ message: msg, type: 'error' });
            }
        } catch (e) {
            console.log(e);
        }
    }

    remainingSeconds: number = null;
    countdown (totalSeconds) {
        this.remainingSeconds = totalSeconds;
        return new Promise((resolve) => {
            const countOneSec = (nSecond) => {
                setTimeout(() => {
                    this.remainingSeconds = nSecond;
                    if (nSecond <= 0) {
                        resolve(true);
                    } else {
                        countOneSec(nSecond - 1);
                    }
                }, 1000, nSecond);
            };
            countOneSec(totalSeconds);
        });
    }

    get errorMessage () {
        if (!this.enableRobot && !this.robotId) {
            return '机器人会话页不存在，即将为您跳转到新的页面';
        }
        if (this.enableRobot && this.robotId) {
            return '机器人会话页面已消失，即将为您跳转新的页面';
        }
        return null;
    }
}
</script>

<style lang="scss">
.ticket-moses-helper-container {
    height: 100%;
    background-color: #f6f6f6;
    .page-wrapper {
        display: flex;
        flex-direction: column;
        margin: 0 auto;
        height: calc(100vh - 104px);
        min-height: 741px;
        width: 71%;
        min-width: 1024px;
        padding-top: 12px;
        padding-bottom: 20px;
        justify-content: space-between;
        align-items: flex-start;
        .announcement {
            max-height: 92px;
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #e3ca91;
            background: #fff9e6;
            border-radius: 4px;
            .announcement-title {
                font-family: PingFangSC-Medium;
                color: #592d00;
                font-size: 14px;
                line-height: 22px;
                font-weight: 500;
            }
            .line-clamp {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                /* FIXME: 这里有一个神奇的 bug，这条规则在构建产物中是不生效的，应该是 scss 的锅 */
                -webkit-box-orient: vertical;
            }
            .announcement-content {
                color: #592d00;
                position: relative;
                font-size: 12px;
                max-height: 44px;
                line-height: 22px;
                overflow: hidden;
            }
        }
        .main-content {
            flex: 1;
            display: flex;
            justify-content: space-between;
            width: 100%;
            height: calc(100% - 32px);
            margin-top: 12px;
            .left-side {
                background-color: #fff;
                box-shadow: 0 1px 4px 0 rgba(201, 201, 202, 0.74);
                width: 34%;
                border-radius: 4px 0 0 4px;
                display: flex;
                flex-direction: column;
                .faqs-container {
                    flex: 1;
                    height: calc(100% - 52px);
                    .faqs-section-title {
                        height: 52px;
                        padding: 16px;
                        h2 {
                            font-family: PingFangSC-Medium;
                            font-size: 16px;
                            color: rgba(0, 0, 0, 0.84);
                            font-weight: 500;
                            line-height: 1.25;
                            padding-left: 6px;
                            .mtdicon-question-circle-o {
                                vertical-align: -3px;
                            }
                        }
                    }
                    ul.faqs {
                        border-top: 1px solid #ededed;
                        padding: 10px 16px;
                        padding-left: 23px;
                        height: calc(100% - 52px);
                        overflow: auto;
                        li.faq {
                            position: relative;
                            left: 16px;
                            list-style-type: square;
                            margin-top: 20px;
                            &:first-child {
                                margin-top: 0;
                            }
                            &::marker {
                                font-size: 10px;
                            }
                            a.faq-link {
                                font-size: 14px;
                                color: rgba(0, 0, 0, 0.84);
                                line-height: 22px;
                                font-weight: 400;
                            }
                        }
                    }
                }
                .created-by-me {
                    height: 52px;
                    padding: 16px;
                    border-top: 1px solid #ededed;
                    .created-by-me-title {
                        display: inline-block;
                        color: rgba(0, 0, 0, 0.84);
                        h2 {
                            font-family: PingFangSC-Medium;
                            font-size: 16px;
                            font-weight: 500;
                            line-height: 1.25;
                            .mtdicon-avatar-o {
                                vertical-align: -2px;
                            }
                        }
                    }
                }
            }
            .right-side {
                background: #fff;
                box-shadow: 0 1px 4px 0 rgba(201, 201, 202, 0.74);
                border-radius: 4px;
                width: 65%;
                iframe {
                    border: none;
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
}
.moses-helper-bulletin-tooltip {
    white-space: pre-wrap;
    max-width: 500px;
}
</style>
