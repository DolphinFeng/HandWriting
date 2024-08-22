<template>
    <mtd-tooltip
        placement="top"
        popper-class="user-header-popper"
        :content="tooltipContent || username">
        <div class="user-wrapper">
            <mtd-badge
                dot
                :hidden="!showOnline"
                :class="['online-badge-dot', {'offline': !online}]">
                <img
                    class="header-img-container"
                    :src="avatar || defaultAvatar"
                    alt="头像">
            </mtd-badge>
            <span class="user-name">{{ displayName || username }}</span>
        </div>
    </mtd-tooltip>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { DEFAULT_AVATAR } from '@/config/map.conf';

@Component
export default class UserAvatar extends Vue {
    @Prop({ default: '' })
    username: string;

    @Prop({ default: '' })
    displayName: string;

    @Prop({ default: DEFAULT_AVATAR })
    avatar: string;

    @Prop({ default: false })
    online: boolean;

    @Prop({ default: false })
    showOnline: boolean;

    @Prop({ default: '' })
    tooltipContent: string;

    defaultAvatar: string = DEFAULT_AVATAR;
}
</script>

<style lang="scss">
.user-wrapper {
    display: inline-block;
    .user-name {
        font-size: 14px;
        margin-left: 6px;
        vertical-align: middle;
    }
    .header-img-container {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        vertical-align: middle;
    }
    .online-badge-dot {
        .mtd-badge-dot {
            background: #00BA73;
            border: 2px solid #FFFFFF;
            width: 12px;
            height: 12px;
            left: 18px;
            top: 18px;
        }
        &.offline {
            .mtd-badge-dot {
                background: #999999;
            }
        }
    }
}
</style>
