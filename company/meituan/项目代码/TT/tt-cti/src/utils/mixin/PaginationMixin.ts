import { Vue, Component } from 'vue-property-decorator';
/**
 * 分页信息mixin.
 *
 * @author xiaokunyu
 * @date 11/09/2018
 */
@Component
export default class PaginationMixin extends Vue {
    total: number = 0;
    limit: number = 10;
    currentPage: number = 1;
    pageSizes: number[] = [10, 20, 50, 100];
    layout: string = 'prev, pager, next, sizes, total';

    get offset (): number {
        return this.limit * (this.currentPage - 1);
    }
}
