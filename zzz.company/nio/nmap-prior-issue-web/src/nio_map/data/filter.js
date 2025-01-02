import { Base } from '../core/base';
import { legends, stateLegends } from './legendData';

export class DataFilter extends Base {
  constructor(context) {
    super(context);
    this.setFilters(legends);
    this.setFilterStates(stateLegends);
  }

  hasShowFilter(state) {
    if (this.showFilters[state]) {
      return true;
    }
    return false;
  }

  showFilterState(state) {
    if (this.showFilterStates[state]) {
      return true;
    }
    return false;
  }

  setFilters(defaultFilter) {
    this.showFilters = {};
    this.hideFilters = {};
    defaultFilter.forEach((filter) => {
      if (filter.display === true) {
        this.showFilters[filter.value] = filter;
      } else {
        this.hideFilters[filter.value] = filter;
      }
    });
  }

  setFilterStates(showStates) {
    this.showFilterStates = {};
    showStates.forEach((item) => {
      if (item.display) {
        this.showFilterStates[item.value] = item;
      }
    });
  }
}
