import { Transfer, TransferPanel } from '@ss/mtd-vue';
import Vue from 'vue';

const MyPanelDef = Object.assign(TransferPanel, {
    computed: {
        ...(TransferPanel as any).computed,
        filteredData () {
            if (!this.filterable) {
                return this.data;
            }
            const filtered = this.data.filter((item) => {
                return this.filter(this.query, item);
            });

            try {
                // 排序依据：先选中的排在前面
                const transferVal = this.$parent.value;
                filtered.sort((a, b) => {
                    const aIndex = transferVal.indexOf(a.key);
                    const bIndex = transferVal.indexOf(b.key);
                    return aIndex - bIndex;
                });
            } catch (e) {
                console.warn(e);
            }
            return filtered;
        }
    },
    name: 'override-transfer-panel',
    componentName: 'OverrideTransferPanel'
});

const OverridePanel = Vue.extend(MyPanelDef);

const MyTransferDef = Object.assign({}, Transfer, {
    components: {
        ...(Transfer as any).components,
        'mtd-transfer-panel': OverridePanel
    },
    name: 'override-transfer',
    componentName: 'OverrideTransfer'
});

export const OverrideTransfer = Vue.extend(MyTransferDef);
