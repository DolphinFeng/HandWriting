<template>
    <div class="template-container">
        <mtd-tabs v-model="activeType" @input="activeTypeChange">
            <mtd-tab-pane label="公告" value="announcement" />
            <mtd-tab-pane label="常见问题" value="question" />
        </mtd-tabs>
        <router-view />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({
    components: {}
})
export default class RgTemplateSettings extends Vue {
    activeType: string = 'announcement';

    created () {
        if (this.$route.name === 'rg_template_question') {
            this.activeType = 'question';
        }
    }

    activeTypeChange (val) {
        this.$router.push({
            name: `rg_template_${val}`,
            query: {
                ...this.$route.query
            }
        }).catch(e => e);
    }
}
</script>
