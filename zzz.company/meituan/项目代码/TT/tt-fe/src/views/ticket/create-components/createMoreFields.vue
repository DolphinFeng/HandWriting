<template>
    <div class="create-more-fields disable-select" id="more-fields">
        <h5 class="more-fields-title" @click="handleClick">{{ $getText('create_more_fields_more_fields', '更多属性') }}
            <i :class="[!fold ? 'mtdicon-up' : 'mtdicon-down', 'mtdicon']" />
        </h5>
        <div
            class="more-fields-wrapper"
            v-show="!fold">
            <custom-form
                :field-schema="inside ? basicMoreFields : outsideMoreFields"
                :text-align="textAlign"
                :rg-id="rgId"
                class="custom-more-fields"
                @change="moreFieldsChanged" />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import CustomForm from '@/views/ticket/components/customForm/customFormIndex.vue';
import { basicMoreFields, outsideMoreFields } from '@/views/ticket/components/customForm/basicConfig/basicMoreFields';


/**
 * 新版更多属性
 *
 * @author liyuyao
 * @date 06/30/2021
 */
@Component({
    components: {
        CustomForm
    }
})
export default class CreateMoreFields extends Vue {
    @Getter inside;
    @Getter loginType;

    @Prop({ default: 0 })
    rgId: number;

    get basicMoreFields (): CommonTypes.mapObject {
        return basicMoreFields.map((field) => { return { ...field, name: field.name ? this.$getText(field.name) : '' }; });
    }

    get outsideMoreFields (): CommonTypes.mapObject {
        return outsideMoreFields.map((field) => { return { ...field, name: field.name ? this.$getText(field.name) : '' }; });
    }

    fold: boolean = false;

    value: string = '';

    textAlign: string = 'left';

    created () {
        let val = localStorage.getItem('fold');
        if (val) {
            this.fold = Number(val) ? true : false;
        }
    }

    moreFieldsChanged (formData) {
        this.$emit('change', formData);
    }
    handleClick () {
        this.fold = !this.fold;
        if (typeof localStorage === 'object') {
            try {
                localStorage.setItem('fold', this.fold ? '1' : '0');
            } catch (error) {
                console.log(error);
            }
        }
        if (!this.fold) {
            let a = document.getElementById('ticket-create-center');
            console.log(a.clientHeight, a.scrollHeight, a.offsetHeight, a.scrollTop);
            this.$nextTick(() => {
                a.scrollIntoView(false);
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.create-more-fields {
    padding: 16px 20px 16px 20px;
    margin-bottom: 12px;
    margin-top: 12px;
    background-color: #fff;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
    border-radius: 4px;
    .more-fields-title {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.84);
        line-height: 22px;
        cursor: pointer;
        .mtdicon {
            color: rgba(0, 0, 0, 0.38);
            font-size: 14px;
        }
    }
    .more-fields-wrapper {
        margin-top: 16px;
        /deep/.mtd-form-item.custom-label-left {
            display: inline-block;
            // width: calc(50% - 20px);
            text-align: left;
            margin-bottom: 12px;
            .mtd-form-item-label {
                text-align: left;
                width: 80px !important;
                padding: 0;
            }
            .mtd-form-item-content {
                width: 272px;
                margin-left: 88px !important;
            }
        }
        .custom-more-fields {
            /deep/.mtd-form-item:nth-child(odd) {
                margin-right: 32px;
            }
            /deep/.mtd-form-item:nth-child(even) {
                margin-right: 0;
            }
            /deep/.mtd-form-item:nth-child(5),
            /deep/.mtd-form-item:nth-child(6) {
                margin-bottom: 4px;
            }
        }
    }
}
</style>
