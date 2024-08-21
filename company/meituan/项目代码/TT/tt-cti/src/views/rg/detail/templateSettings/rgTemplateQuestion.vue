<template>
    <div>
        <RgTemplateTable
            api="Faq"
            title="常见问题" />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import RgTemplateTable from './rgTemplateTable.vue';

@Component({
    components: {
        RgTemplateTable
    }
})
export default class RgTemplateQuestion extends Vue {

}

</script>
