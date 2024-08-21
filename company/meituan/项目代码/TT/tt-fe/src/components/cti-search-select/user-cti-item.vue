<template>
    <div class="user-cti-item">
        <div
            class="user-collapse-line"
            @click="openUserCti">
            <i :class="`mtdicon ${!isOpen ? 'mtdicon-down-thick' : 'mtdicon-up-thick'}`" />
            <user-avatar
                :user="user" />
        </div>
        <ul class="user-ctis-wrapper" v-if="isOpen">
            <li
                class="cti-item"
                v-for="cti in userCtiList"
                :key="cti.itemId"
                @click="selectCti(cti)">
                <span>{{ cti.categoryId === noCatalogId ? $getText('user_cti_item_no_catalog', '不选择目录直接发起') : `${cti.categoryName} / ${cti.typeName} / ${cti.itemName} (${cti.rgName})` }}</span>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { NoCatalog } from '@/config/map.conf';
import * as api from '@/api';

import UserAvatar from './user-avatar.vue';


/**
 * 新版问题描述
 *
 * @author liyuyao
 * @date 06/24/2021
 */
@Component({
    components: {
        UserAvatar
    }
})
export default class UserCtiItem extends Vue {
    @Getter inside;
    @Getter loginType;
    @Getter spaceDomain;

    @Prop({ default: () => {
        return {
            username: '',
            displayName: '',
            avatar: ''
        };
    }})
    user: CommonTypes.mapObject;

    isOpen: boolean = false;

    userCtiList: CommonTypes.ctiItem[] = [];

    noCatalogId: number = NoCatalog.categoryId;

    openUserCti () {
        this.isOpen = !this.isOpen;
        if (this.isOpen && !this.userCtiList.length) {
            this.searchByUser();
        }
    }
    async searchByUser () {
        let result = [];
        try {
            const mis = this.user.username;
            const res: Ajax.AxiosResponse = await api.ctiApi.getUserCtiBySpace({
                assigned: mis,
                domain: this.spaceDomain
            });
            let { code, data } = res;
            if (code === 200) {
                // this.userCtiList = data;
                let noCatalogList = [];
                let catalogList = [];
                data.items.map((item, index) => {
                    if (item.categoryId === NoCatalog.categoryId) {
                        noCatalogList.push(item);
                    } else {
                        catalogList.push(item);
                    }
                });
                this.userCtiList = catalogList.concat(noCatalogList);
            }
        } catch (e) {
            console.log(e);
        }
        return result;
    }
    selectCti (cti) {
        this.$emit('change', cti, this.user);
    }
}
</script>

<style lang="scss" scoped>
.user-collapse-line {
    line-height: 36px;
    cursor: pointer;
    white-space: nowrap !important;
    .mtdicon {
        margin-right: 4px;
        color: rgba(0, 0, 0, 0.38);
    }
}
.user-ctis-wrapper {
    padding-top: 8px;
}
.cti-item {
    margin: 0 22px 14px;
    font-family: PingFang SC;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.84);
    letter-spacing: 0;
    line-height: 22px;
    font-weight: 400;
    cursor: pointer;
    &:hover {
        color: #f80;
    }
}
</style>
