<template>
    <div class="ticket-blank-container">
        <div class="info-contanier">
            <img src="@/assets/img/no-permission.png">
            <p>对不起，您无权限访问此页面</p>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
/**
 * 无权限页面
 *
 * @author liyuyao
 * @date 1/06/2020
 */
@Component
export default class TicketBlank extends Vue {
}
</script>

<style lang="postcss">
.ticket-blank-container {
    width: 100%;
    height: 100%;
    position: relative;
    .info-contanier {
        position: absolute;
        margin: auto;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        img {
            width: 118px;
            height: 118px;
        }
    }
}
</style>
