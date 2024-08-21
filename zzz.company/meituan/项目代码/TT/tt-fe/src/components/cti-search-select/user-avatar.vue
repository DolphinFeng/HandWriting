<template>
    <div class="user-wrapper">
        <img
            class="header-img-container"
            :src="user.avatar || defaultAvatar"
            alt="头像"
            v-if="inside">
        <span class="user-name">{{ user.i18nDisplayName ? `${user.i18nDisplayName}/${user.username}` : (user.displayName ? `${user.displayName}/${user.username}` : user.username) }}</span>
        <span
            class="user-tag"
            v-if="user.external">{{ $getText('user_avatar_user_tag_external', '外部') }}</span>
        <span
            class="user-tag"
            v-if="user.isQuit">{{ $getText('user_avatar_user_tag_quit', '离职') }}</span>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { DEFAULT_AVATAR } from '@/config/map.conf';
/**
 * 用户头像
 *
 * @author liyuyao
 * @date 04/17/2020
 */
@Component
export default class UserAvatar extends Vue {
    @Getter inside;

    @Prop({ default: () => {
        return {
            username: '',
            displayName: '',
            avatar: ''
        };
    }})
    user: CommonTypes.mapObject;

    defaultAvatar: string = DEFAULT_AVATAR;
}
</script>

<style lang="scss" scoped>
.user-wrapper {
    display: inline-block;
    white-space: nowrap !important;
    .user-name {
        font-size: 14px;
        font-family: PingFangSC-Medium;
        color: rgba(0, 0, 0, 0.87);
        vertical-align: middle;
        line-height: 20px;
    }
    .header-img-container {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        vertical-align: middle;
    }
    .user-tag {
        display: inline-block;
        padding: 0 4px;
        font-family: PingFang SC;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.36);
        letter-spacing: 0;
        text-align: left;
        line-height: 18px;
        font-weight: 400;
        background: rgba(0, 0, 0, 0.06);
        border-radius: 2px;
    }
}
</style>