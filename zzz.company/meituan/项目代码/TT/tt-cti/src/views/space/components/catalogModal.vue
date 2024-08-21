<template>
    <mtd-modal
        :title="level === 1 ? '新建一级目录' : '新建下一级目录'"
        v-model="newCatalog"
        width="400px">
        <mtd-form
            :model="formCustom"
            ref="formCustom"
            :rules="ruleCustom">
            <mtd-form-item
                label="当前目录:"
                prop="parentName"
                v-if="level !== 1">
                {{ name }}
            </mtd-form-item>
            <mtd-form-item label="名称:" prop="name">
                <mtd-input
                    type="text"
                    v-model="formCustom.name"
                    style="width: 260px;" />
            </mtd-form-item>
            <mtd-form-item
                label="绑定RG:"
                prop="rgId"
                v-if="level === 3">
                <mtd-select
                    v-model="formCustom.rgId"
                    class="select-width"
                    :loading="loading"
                    :filterable="true"
                    :remote="true"
                    :remote-method="remoteMethod">
                    <mtd-option
                        v-for="item in options"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id" />
                </mtd-select>
            </mtd-form-item>
        </mtd-form>
        <div slot="footer" class="demo-modal-footer">
            <mtd-button @click="closeModal">取消</mtd-button>
            <mtd-button type="primary" @click="createTree">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Form } from '@ss/mtd-vue';
import * as api from '@/api';
import { get } from 'lodash';

@Component({

})
export default class CatalogModal extends Vue {
    @Prop()
    level: number;
    @Prop({ required: true })
    show: boolean;
    @Prop()
    id: number;
    @Prop()
    name: string;

    @Watch('show')
    handleModalVisible () {
        this.newCatalog = !this.newCatalog;
    }

    formCustom: any = {
        parentName: '',
        name: '',
        rgId: null
    };
    newCatalog: boolean = false;
    loading: boolean = false;
    ruleCustom: any = {
        name: {
            min: 2,
            max: 20,
            required: true
        },
        rgId: {
            required: true
        }
    };
    options: any = [];

    created () {
        this.remoteMethod('');
    }

    resetForm () {
        (this.$refs.formCustom as Form).resetFields();
    }

    closeModal () {
        this.newCatalog = !this.newCatalog;
    }

    async validateForm () {
        return new Promise((resolve, reject) => {
            (this.$refs.formCustom as Form).validate((valid) => {
                if (valid) {
                    resolve('ok');
                } else {
                    const e = new Error('校验未通过');
                    reject(e);
                }
            }).catch(e => e);
        }).catch();
    }

    async createTree () {
        const v = await this.validateForm();
        if (v === 'ok') {
            this.$emit('updateTree', this.formCustom, this.level, this.id);
            this.resetForm();
        }
    }

    async remoteMethod (query) {
        const spaceId = parseInt(this.$route.params.id, 10);
        const res = await api.ctiApi.getAllSpaceRg({
            spaceId,
            name: query
        });
        this.options = get(res, ['data', 'items']);
    }
}
</script>
