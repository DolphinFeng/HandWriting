<template>
    <div class="space-template-setting-container">
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
        if (this.$route.name === 'space_template_settings_question') {
            this.activeType = 'question';
        }
    }

    activeTypeChange (val) {
        this.$router.push({
            name: `space_template_settings_${val}`
        }).catch(e => e);
    }
}
</script>
