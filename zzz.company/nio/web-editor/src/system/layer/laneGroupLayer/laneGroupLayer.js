import {reactive, ref} from 'vue';
import moment from 'moment';

let timer = null;
const curTimer = moment().startOf().subtract(1, 'days').format('YYYYMMDD');
if (localStorage.getItem('timer')) {
  timer = localStorage.getItem('timer');
} else {
  timer = curTimer;
  localStorage.setItem('timer', timer);
}

//放行图层，只用于界面展示
const AllowTypes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
class AllowTypeLayerItems {
  timers = ref(timer);

  items = reactive(
    AllowTypes.map((v) => ({
      name: v,
      item_id: v,
      show: v === '2' ? false : true,
    })),
  );

  getItemById(id) {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.item_id === id) {
        return item;
      }
    }

    return undefined;
  }
}

export const allowTypeLayerItems = new AllowTypeLayerItems();
export const customAllowTypeLayerItems = new AllowTypeLayerItems();
const setTimer = (nextTimer) => {
  allowTypeLayerItems.timers.value = nextTimer;
  localStorage.setItem('timer', nextTimer ?? curTimer);
};

function allowTypeExpr() {
  let results = [];
  const types = allowTypeLayerItems.items.filter((v) => v.show);
  for (let i = 0; i < types.length; i++) {
    results.push(types[i].name);
  }

  if (results.length !== 0) {
    let expr = '';
    for (let i = 0; i < results.length; i++) {
      expr += "${feature['ALLOW_TYPE']} === " + results[i];
      if (i !== results.length - 1) {
        expr += '||';
      }
    }
    return expr;
  } else {
    return false;
  }
}
export {setTimer, allowTypeExpr};
