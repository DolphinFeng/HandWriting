<template>
    <div class="ticket-helpdesk">
        <div class="ticket-helpdesk-rg-container ticket-helpdesk__item">
            <div class="ticket-helpdesk__content">
                <h2 class="rg-title">{{ rgName }}</h2>
                <ul class="rg-group-list" v-loading="tableLoading">
                    <li
                        v-for="item in templateList"
                        :key="item.id">
                        <router-link
                            :to="{ name: 'tt_helpdesk_create', params: {id: item.id, rgId: item.rgId, space: spaceDomain} }"
                            class="help-desk-link">
                            <h4 class="hover-color">{{ item.name }}</h4>
                            <p>{{ item.instruction }}</p>
                        </router-link>
                    </li>
                </ul>
                <div
                    class="load-more"
                    @click="getSpaceTemplate"
                    v-if="templateList.length < total">{{ $getText('space_custom_list_load_more', '加载更多') }}</div>
            </div>
        </div>
        <div class="ticket-helpdesk_funcbar ticket-helpdesk__item">
            <div class="ticket-helpdesk__content" v-if="annoucement">
                <h2 class="funcbar-title"><i class="mtdicon mtdicon-bell-o" /><span>{{ $getText('space_custom_list_announcement_title', '最新公告') }}</span></h2>
                <p class="funcbar-content">
                    {{ annoucement.content }}
                </p>
            </div>
            <div class="ticket-helpdesk__content" v-if="faqList.length">
                <h2 class="funcbar-title"><i class="mtdicon mtdicon-question-circle-o" /><span>{{ $getText('space_custom_list_faq_title', '常见问题') }}</span></h2>
                <ul class="funcbar-content mgl-20">
                    <li v-for="(item, index) in faqList" :key="index">
                        <a :href="item.content" target="_blank">{{ item.title }}</a>
                    </li>
                </ul>
                <div class="funcbar-footer">
                    <mtd-pagination
                        simple
                        size="small"
                        :total="tn"
                        @change="change"
                        :current-page.sync="cn" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import * as api from '@/api';
import { PaginationMixin } from '../../utils/mixin';

/**
 * TicketHelpDesk 控制台
 *
 * @author zhanglinna
 * @date 03/16/2020
 */
@Component
export default class SpaceCustomList extends PaginationMixin {
    @Getter spaceDomain;

    tableLoading: boolean = false;
    templateList: CommonTypes.mapObject[] = [];
    rgName: string = '';
    limit: number = 100;
    cn: number = 1;
    sn: number = 10;
    tn: number = 0;
    faqList: any = [];
    annoucement: string = '';

    get rgId () {
        return this.$route.params.rgId;
    }

    created () {
        this.getRgName();
        this.getSpaceTemplate();
        this.getAnnouncement();
        this.getFaqList();
    }

    change (current, size) {
        this.cn = current;
        this.sn = size;
        this.getFaqList();
    }

    async getAnnouncement () {
        const res: Ajax.AxiosResponse = await api.ctiApi.getAnnouncement({
            rgId: this.rgId * 1,
            enable: true,
            sn: 1,
            cn: 1
        });
        if (res.code === 200) {
            const announcementList = res.data.items;
            this.annoucement = announcementList[0];
        }
    }

    async getFaqList () {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRgFaq({
            rgId: this.rgId * 1,
            enable: true,
            cn: this.cn,
            sn: this.sn
        });
        if (res.code === 200) {
            this.faqList = res.data.items;
            this.tn = res.data.tn;
        }
    }

    async getSpaceTemplate () {
        this.tableLoading = true;
        try {
            const res: Ajax.AxiosResponse = await api.spaceApi.getSpaceTemplate({
                cn: this.currentPage,
                sn: this.limit,
                type: 'CUSTOM',
                domain: this.spaceDomain
            });
            let { code, data } = res;
            if (code === 200 && data.items && data.items.length) {
                this.total = data.tn;
                // 如果当前列表只有一个模板，自动跳转到模板
                if (this.total === 1 && data.items[0]) {
                    this.$router.push({
                        name: 'tt_helpdesk_create',
                        params: {
                            id: data.items[0].id,
                            rgId: this.rgId,
                            space: this.spaceDomain
                        }
                    }).catch(e => e);
                    return;
                }
                this.templateList = this.templateList.concat(data.items);
                this.currentPage ++ ;
            }
        } catch (e) {
            console.log(e);
        }
        this.tableLoading = false;
    }
    // 填补rgName
    async getRgName () {
        const res: Ajax.AxiosResponse = await api.ctiApi.getRgList({
            id: this.rgId
        });
        let { code, data } = res;
        if (code === 200) {
            this.rgName = data.items[0] && data.items[0].name || '';
        }
    }
}
</script>

<style lang="scss">
/* PC端 */
.ticket-helpdesk {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    .ticket-helpdesk_funcbar {
        width: 30%;
    }
    .ticket-helpdesk__item {
        padding: 20px;
    }
    .ticket-helpdesk__content {
        border: 1px solid rgba(0, 0, 0, 0.06);
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.01), 0 3px 6px 3px rgba(0, 0, 0, 0.01), 0 2px 6px 0 rgba(0, 0, 0, 0.03);
        padding: 20px;
        margin-bottom: 20px;
    }
}
.funcbar-title {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 16px;
    line-height: 22px;
    margin-bottom: 16px;
}
.mgl-20 {
    margin-left: 20px;
}
.funcbar-content {
    font-size: 14px;
    line-height: 22px;
    margin-bottom: 20px;
    li {
        list-style: disc;
    }
    a {
        text-decoration: none;
        &:hover {
            text-decoration: none;
            color: #f80;
        }
    }
}
.funcbar-footer {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
}
.ticket-helpdesk-rg-container {
    width: 70%;
    height: 100%;
    padding-top: 20px;
    .help-desk-link {
        color: rgba(0, 0, 0, 0.6);
        transition: color 0s;
        font-weight: normal;
        text-decoration: none;
    }
    .item {
        background: #fff;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 4px;
        padding: 16px 20px;
    }
    .rg-title {
        margin-bottom: 20px;
        font-family: PingFangSC-Medium;
        font-size: 20px;
        color: rgba(0, 0, 0, 0.84);
        line-height: 28px;
    }
    .rg-group-list {
        border-top: 1px solid #eee;
        li {
            padding: 12px;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.6);
            line-height: 34px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            h4 {
                font-family: PingFangSC-Medium;
                color: rgba(0, 0, 0, 0.84);
                line-height: 20px;
            }

            cursor: pointer;
            &:hover {
                background: #f7f7f7;
                .hover-color {
                    color: #f80;
                }
            }
        }
    }
    .load-more {
        height: 30px;
        font-family: PingFangSC-Semibold;
        cursor: pointer;
    }
}
.funcbar-footer {
    .mtd-pager-item {
        vertical-align: bottom;
    }
}
</style>
