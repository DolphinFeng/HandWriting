<template>
    <div>
        <RgTemplateTable
            api="Bulletin"
            title="公告" />
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
export default class RgTemplateAnnouncement extends Vue {

}

</script>
