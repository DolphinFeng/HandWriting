<template>
    <div
        class="ask-card-wrapper"
        v-lxay
        lxay-act="moduleClick"
        lxay-bid="b_techportal_g0incoc0_mc"
        @click="routerChange">
        <div class="ask-card">
            <i :class="['iconfont', icon, color]" />
            <div class="question-and-cti">
                <h5>{{ title }}</h5>
                <div class="detail-content">{{ `${cti.categoryName}/${cti.typeName}/${cti.itemName}` }}</div>
            </div>
        </div>
        <div
            class="hover-button">
            <mtd-button
                type="primary"
                size="small">{{ $getText('ask_card_create_btn', '发起') }}</mtd-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

/**
 * 系统首页-猜你想问card
 *
 * @author liyuyao
 * @date 11/03/2020
 */
@Component
export default class AskCard extends Vue {
    @Getter spaceDomain;

    @Prop({ default: '' })
    title: string;


    @Prop({ default: '' })
    icon: string;

    @Prop({ default: '' })
    color: string;

    @Prop({ default: () => {
        return {};
    } })
    cti: CommonTypes.mapObject;

    routerChange () {
        this.$router.push({
            name: 'tt_create',
            params: {
                space: this.spaceDomain
            },
            query: {
                cid: this.cti.categoryId,
                tid: this.cti.typeId,
                iid: this.cti.itemId
            }
        }).catch(e => e);
    }
}
</script>

<style lang="scss" scoped>
.ask-card-wrapper {
    width: calc((100% - 46px) / 3);
    height: 56px;
    margin: 0 23px 28px 0;
    display: inline-block;
    box-sizing: border-box;
    cursor: pointer;
    &:nth-child(3n + 1) {
        margin-right: 0;
    }
    &:hover {
        .ask-card {
            background: #f5f5f5;
        }
        .hover-button {
            opacity: 1;
            .mtd-button {
                display: block;
            }
        }
    }
    .hover-button {
        opacity: 0;
        .mtd-button {
            display: none;
        }
    }
}
.hover-button {
    position: relative;
    z-index: 1;
    top: -56px;
    width: 100%;
    height: 100%;
    text-align: right;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), #f4f4f4 90%);
    background: -moz-linear-gradient(90deg, rgba(255, 255, 255, 0), #f4f4f4 90%);
    background: -webkit-linear-gradient(90deg, rgba(255, 255, 255, 0), #f4f4f4 90%);
    background: -o-linear-gradient(90deg, rgba(255, 255, 255, 0), #f4f4f4 90%);
    border-radius: 4px;
    .mtd-btn-small {
        position: relative;
        top: 16px;
        right: 10px;
    }
}
.detail-content {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.36);
    line-height: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.ask-card {
    display: flex;
    padding: 6px 8px;
    border-radius: 4px;
    .question-and-cti {
        flex: 1;
        width: calc(100% - 26px);
        h5 {
            margin-bottom: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
    .iconfont {
        margin-right: 12px;
        font-size: 26px;
        &.red {
            color: #f5483b;
        }
        &.orange {
            color: #f80;
        }
        &.yellow {
            color: #ffc300;
        }
        &.green {
            color: #00b365;
        }
        &.blue {
            color: #0a70f5;
        }
    }
}
</style>
