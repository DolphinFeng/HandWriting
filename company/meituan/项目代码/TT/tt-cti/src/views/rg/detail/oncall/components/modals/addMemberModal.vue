<template>
    <mtd-modal
        v-model="showModal"
        :destroy-on-close="true"
        title="添加值班人员"
        @close="close"
        class="add-oncall-member-modal common-modal"
        width="450px">
        <mtd-form
            :model="modalForm"
            :rules="rules"
            ref="modalForm">
            <mtd-form-item
                label="姓名"
                prop="name"
                :label-width="40">
                <mtd-select
                    v-model="modalForm.name"
                    :loading="loading"
                    multiple
                    placeholder="请输入添加成员的mis号"
                    :filterable="true"
                    :debounce="200"
                    :remote="true"
                    style="width: 100%;"
                    :remote-method="remoteMethod">
                    <mtd-option
                        v-for="item in userOptions"
                        :key="item.identify"
                        :label="`${item.displayName}(${item.identify})`"
                        :value="item.identify" />
                </mtd-select>
            </mtd-form-item>
        </mtd-form>
        <div slot="footer">
            <mtd-button class="tt-pure-btn" @click="close">取消</mtd-button>
            <mtd-button
                type="primary"
                class="tt-pure-btn"
                :loading="btnLoading"
                @click="addOndutyPeople">确定</mtd-button>
        </div>
    </mtd-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api';
import { Form } from '@ss/mtd-vue';
@Component({
    components: {}
})
export default class AddMemberModal extends Vue {
    @Prop({ default: false })
    visible: boolean;

    userOptions: CommonTypes.mapObject = [];
    modalForm: CommonTypes.mapObject = {
        name: []
    };
    rules: CommonTypes.mapObject = {
        name: [{
            validator: (_rule, value, callback) => {
                if (value.length === 0) {
                    callback(new Error('请输入mis号'));
                } else {
                    callback();
                }
            },
            trigger: 'blur, change'
        }]
    };
    showModal: boolean = false;
    btnLoading: boolean = false;
    loading: boolean = false;

    @Watch('visible', { immediate: true })
    onVisibleChanged () {
        this.showModal = this.visible;
    }
    // 增加值班人员
    async addOndutyPeople () {
        const modalForm = this.$refs.modalForm as Form;
        modalForm.validate(async (valid) => {
            if (valid) {
                this.btnLoading = true;
                try {
                    const params = {
                        rgId: this.rgId,
                        mis: this.modalForm.name
                    };
                    const res = await api.oncallApi.addOncallMember(params);
                    if (res && res.code === 200) {
                        this.btnLoading = false;
                        this.$mtd.message({
                            message: '添加成功',
                            type: 'success'
                        });
                        this.$emit('success');
                        this.close();
                    }
                } catch (e) {
                    this.btnLoading = false;
                    console.log(e);
                }
            } else {
                console.error('Fail!');
            }
        }).catch(e => e);
    }
    // 远程搜索用户
    async remoteMethod (query?: any) {
        const params = {
            rgId: this.rgId,
            identify: query || '',
            includeOncall: false
        };
        const res = await api.rgApi.getRgUser(params);
        if (res && res.code === 200) {
            this.userOptions = res.data.items;
            this.loading = false;
        }
    }
    close () {
        this.$emit('update:visible', false);
    }
    confirm () {
        this.close();
    }
    get rgId () {
        return parseInt(this.$route.query.rgId as string, 10);
    }
}
</script>

<style lang="scss">
.add-oncall-member-modal {
    .mtd-modal-content-wrapper {
        padding-top: 24px !important;
        padding-bottom: 12px;
    }
    .drop-tip {
        color: rgba(0, 0, 0, 0.35);
        margin-bottom: 4px;
        font-size: 12px;
        span {
            color: rgba(0, 0, 0, 0.84);
        }
    }
    .drop-filter {
        .draggable-item {
            padding: 6px 6px;
            &:hover {
                background: #F5F5F5;
                cursor: grab;
            }
            .mtdicon {
                margin-right: 8px;
            }
        }
    }
}
</style>
