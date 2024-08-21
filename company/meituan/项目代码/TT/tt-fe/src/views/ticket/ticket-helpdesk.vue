<template>
    <div class="ticket-help-desk-container">
        <Waterfall
            :gutter-width="30"
            :min-col="4"
            :max-col="4"
            align="left"
            :gutter-height="30">
            <WaterfallItem
                v-for="(waterfallItem, waterfallItemIndex) in waterfallData"
                :key="waterfallItemIndex"
                :width="360"
                class="item animated fadeIn">
                <div>
                    <p class="rg-title">{{ waterfallItem.key }}
                        <mtd-tooltip
                            theme="dark"
                            placement="right"
                            :content="$getText('ticket_helpdesk_visit_form', '访问该服务组的表单')">
                            <i class="mtdicon mtdicon-share-o" @click="gotoRg(waterfallItem.rgId)" />
                        </mtd-tooltip>
                    </p>
                    <ul class="rg-group-list" v-if="waterfallItem.show">
                        <li
                            v-for="(item, index) in waterfallItem.list"
                            :key="index">
                            <router-link
                                :to="{ name: 'tt_helpdesk_create', params: {id: item.id, rgId: item.rgId, space: spaceDomain} }"
                                class="help-desk-link">{{ item.name }}</router-link>
                        <li />
                    </ul>
                    <ul class="rg-group-list" v-else>
                        <li
                            v-for="(item, index) in waterfallItem.list"
                            :key="index">
                            <router-link
                                v-if="index < 5"
                                :to="{ name: 'tt_helpdesk_create', params: {id: item.id, rgId: item.rgId, space: spaceDomain} }"
                                class="help-desk-link">{{ item.name }}</router-link>
                        <li />
                    </ul>
                    <div
                        v-if="waterfallItem.list.length > 5"
                        class="show-or-hide"
                        @click="clickShowOrhide(waterfallItem)">{{ waterfallItem.show ? $getText('ticket_helpdesk_fold', '收起') : $getText('ticket_helpdesk_expand', '展开') }}<i :class="[`${waterfallItem.show ? 'icon-expand-up-' : 'icon-expand-down-' }`, 'iconfont']" />({{ waterfallItem.show ? 0 : waterfallItem.list.length - 5 }})</div>
                </div>
            </WaterfallItem>
        </Waterfall>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import * as api from '@/api';
import { Waterfall, WaterfallItem } from 'vue2-waterfall';
interface RgFormItem {
    name: string;
    type: string;
    rgId: number;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
}
interface RgFormList {
    key: string;
    list: RgFormItem[];
    show?: boolean;
    rgId?: number;
}
/**
 * TicketHelpDesk 控制台
 *
 * @author zhanglinna
 * @date 03/16/2020
 */
@Component({
    components: {
        Waterfall,
        WaterfallItem
    }
})
export default class TicketHelpDesk extends Vue {
    @Getter spaceDomain;

    items: RgFormList[] = [];
    cuttentPage: number = 1;
    waterfallData: RgFormList[] = [];
    next: boolean = false;
    async generateRandomItems () {
        try {
            const params = {
                cn: this.cuttentPage,
                sn: 200
            };
            const res: Ajax.AxiosResponse = await api.ticketApi.getRgFormList(params);
            const { data } = res;
            const { items } = data;
            const waterfallData: any[] = [];
            this.next = items.length !== 0;
            items.forEach((item: RgFormList) => {
                let obj = {
                    key: item.key,
                    list: item.list,
                    show: false,
                    rgId: item.rgId
                };
                waterfallData.push(obj);
            });
            this.waterfallData = this.waterfallData.concat(waterfallData);
        } catch (e) {
            console.log(e);
        }
    }
    clickShowOrhide (waterfallItem: RgFormList) {
        waterfallItem.show = !waterfallItem.show;
    }
    gotoRg (rgId) {
        this.$router.push({
            name: 'tt_helpdesk_rg',
            params: {
                rgId: rgId,
                space: this.spaceDomain
            }
        }).catch(e => e);
    }
    async mounted () {
        await this.generateRandomItems();
        // const scroller = document.querySelector(
        //     '.el-main.cti-main'
        // );
        // if (scroller) {
        //     scroller.addEventListener('scroll', this.scrollLoad);
        // }
    }

    scrollLoad () {
        // 滚动加载的逻辑，一期的时候暂时不需要
        // const _that = this;
        // const scroller = document.querySelector(
        //     '.el-main.cti-main'
        // );
        // if (scroller) {
        //     scroller.addEventListener('scroll', () => {
        //         const scrollTop = scroller.scrollTop;
        //         const windowHeight = scroller.offsetHeight;
        //         const docHeight = scroller.scrollHeight;
        //         if (scrollTop + windowHeight >= docHeight && this.next) {
        //             this.cuttentPage ++;
        //             _that.generateRandomItems();
        //         }
        //     });
        // }
    }
}
</script>

<style lang="scss">
/* PC端 */
.ticket-help-desk-container {
    height: 100%;
    padding-top: 20px;
    .help-desk-link {
        color: rgba(0, 0, 0, 0.6);
        transition: color 0s;
        font-weight: normal;
        text-decoration: none;
        &:hover {
            color: #1c6cdc;
            i::before {
                color: #1c6cdc;
            }
        }
    }
    .item {
        background: #fff;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 4px;
        padding: 16px 20px;
    }
    .rg-title {
        font-family: PingFangSC-Semibold;
        font-size: 18px;
        color: rgba(0, 0, 0, 0.84);
        .mtdicon-share-o {
            float: right;
            cursor: pointer;
        }
    }
    .rg-group-list {
        li {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.84);
            letter-spacing: 0;
            line-height: 26px;
        }
    }
    .show-or-hide {
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: -3px;
    }
}
</style>
