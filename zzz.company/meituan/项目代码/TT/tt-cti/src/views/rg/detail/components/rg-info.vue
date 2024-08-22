<template>
    <div class="rg-info-container">
        <div class="rg-header">
            <span @click="goback" class="back-home">首页</span>
            <i class="iconfont icon-you-" />
            <span class="rg-name">
                {{ rgInfo.name }}
            </span>
            <span class="rg-createdAt">
                创建时间  <span class="content-color">{{ rgInfo.createdAt | formatTime }}</span>
            </span>
            <span class="rg-owner">
                负责人  <span class="content-color">{{ `${rgInfo.ownerDisplayName}(${rgInfo.owner})` }}
                    <span class="quit-tag" v-if="rgInfo.jobStatus === 16">离职</span></span>
            </span>
            <div
                class="rg-edit"
                @click="editRgVisible = true"
                v-if="permission">
                <i class="iconfont icon-edit" />编辑
            </div>
        </div>
        <div class="rg-info">
            {{ rgInfo.description }}
        </div>
        <add-rg
            :is-edit="true"
            :rg-info="rgInfo"
            :visible.sync="editRgVisible"
            @success="getRgInfo" />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import * as api from '@/api';
import { State } from 'vuex-class';
import AddRg from './add-rg.vue';
/**
 * rg header信息
 *
 * @author zhouchangshun
 * @date 01/11/2019
 */
@Component({
    components: {
        AddRg
    }
})
export default class RgInfo extends Vue {
    @State(state => state.cti.permission.rg_entity)
    permission: boolean;

    rgInfo: any = {};
    searchLoading: boolean = false;
    userList: any = [];
    rgId: number = null;
    editRgVisible: Boolean = false;

    mounted () {
        this.rgId = Number(this.$route.query.rgId);
        this.getRgInfo();
    }
    async getRgInfo () {
        try {
            const res = await api.rgApi.getRgList({
                id: this.rgId
            });
            this.rgInfo = res.data.items[0];
            this.remoteMethod(this.rgInfo.owner);
        } catch (e) {
            console.log(e);
        }
    }
    goback () {
        this.$router.push({
            name: 'rg'
        }).catch(e => e);
    }
    async remoteMethod (query) {
        this.searchLoading = true;
        try {
            const res = await api.rgApi.searchUser({ keyword: query });
            this.userList = res.data.items;
        } catch (e) {
            this.userList = [];
            console.log(e);
        }
        this.searchLoading = false;
    }
}
</script>

<style lang="postcss">
.rg-info-container {
    padding: 15px 0;
    .rg-header {
        margin-bottom: 6px;
        .back-home {
            vertical-align: text-bottom;
            font-size: 16px;
            color: #464646;
            cursor: pointer;
            &:hover {
                color: #FF8800;
            }
        }
        .icon-you- {
            color: #818BAF;
            font-size: 18px;
        }
        .rg-name {
            font-family: PingFangSC-Semibold;
            font-size: 20px;
            color: #464646;
            letter-spacing: 0;
        }
        .rg-edit {
            display: inline-block;
            margin-left: 16px;
            font-size: 14px;
            color: #464646;
            letter-spacing: 0;
            cursor: pointer;
            .icon-edit {
                color: #FF8800;
                margin-right: 8px;
                cursor: pointer;
            }
            &:hover {
                color: #FF8800;
            }
        }
        .rg-owner,
        .rg-createdAt {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: #9AA2B4;
            letter-spacing: 0;
            margin-left: 10px;
            .content-color {
                color: #464646;
            }
        }
    }
    .rg-info {
        margin-left: 51px;
        height: auto;
        overflow: hidden;
        font-size: 14px;
        font-family: PingFangSC-Regular;
        color: #6F6F6F;
    }
}
.form-dialog {
    .mtd-loading-nested {
        width: 100px;
    }
    .avatar {
        width: 100px;
        height: 100px;
        display: block;
        border-radius: 10px;
        border: 1px solid #C3CFDB;
    }
    .avatar-uploader {
        padding-left: 15px;
    }
    .icon-question-circle-o {
        vertical-align: middle;
        color: #999999;
    }
}
</style>
