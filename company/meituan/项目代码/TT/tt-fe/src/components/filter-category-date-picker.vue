<template>
    <el-date-picker
        v-model="filterTime"
        type="datetimerange"
        :start-placeholder="$getText('filter_category_start_placeholder','请选择开始创建时间')"
        :end-placeholder="$getText('filter_category_end_placeholder', '请选择结束创建时间')"
        :default-time="['00:00:00', '23:59:59']"
        lxay-bid="b_onecloud_4cnrtnid_mc"
        :disabled="listLoading"
        value-format="yyyy-MM-dd HH:mm:ss"
        @change="filterTimeChange"
        clearable />
    
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { DatePicker } from 'element-ui';
Vue.use(DatePicker);

@Component
export default class FilterCategoryDatePicker extends Vue {
    @Prop({ default: [] })
    defaultVal: any;
    @Prop({ default: false })
    listLoading: boolean;

    filterTime: any = [];

    filterTimeChange (val) {
        this.$emit('filterTimeChange',val);
    }

    @Watch('defaultVal')
    setDefaultVal () {
        this.filterTime = this.defaultVal; // 处理回显
        console.log('defaultVal',this.defaultVal);
    }
}
</script>