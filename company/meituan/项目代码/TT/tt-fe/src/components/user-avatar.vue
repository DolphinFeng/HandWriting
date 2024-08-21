<template>
    <mtd-tooltip
        placement="top"
        popper-class="user-header-popper"
        :content="username"
        :disabled="!inside">
        <div class="user-wrapper">
            <img
                class="header-img-container"
                :src="avatar || defaultAvatar"
                alt="头像"
                v-if="inside">
            <span class="user-name">{{ i18nDisplayName || username }}</span>
        </div>
    </mtd-tooltip>
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

    @Prop({ default: '' })
    username: string;

    @Prop({ default: '' })
    i18nDisplayName: string;

    @Prop({ default: DEFAULT_AVATAR })
    avatar: string;

    defaultAvatar: string = DEFAULT_AVATAR;
}
</script>

<style lang="scss">
.user-wrapper {
    display: inline-block;
    .user-name {
        font-size: 12px;
        vertical-align: middle;
    }
    .header-img-container {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        vertical-align: middle;
    }
}
</style>