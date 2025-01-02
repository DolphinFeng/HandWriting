import QualityResult from "../enum/QualityResult.js";
import QualityStatus from "../enum/QualityStatus.js";
import QualityType from "../enum/QualityType.js";
import {createBillBoardHandler} from "../billboard/billboard.js";
import {markRaw} from "vue";

//质检标
export default class QualityTag {
    /**
     * @constructor
     * @param position {Cartesian3} 质检标坐标
     * @param type 质检标类型
     * @param desc 质检标描述
     * @param result 质检标结果
     * @param status 质检标状态
     * @param id {null|number} 质检标id
     * @param user 质检员名称
     * @param branchName 作业库
     */
    constructor(
        position,
        user,
        branchName,
        type = QualityType.OVER,
        desc = '',
        result = QualityResult.WAIT_MODIFY,
        status = QualityStatus.NORMAL,
        id = null,
    ) {
        this.position = position;
        this.user = user;
        this.type = type;
        this.desc = desc;
        this.result = result;
        this.billBoard = createBillBoardHandler(true, position, this);
        this.status = status;
        this.id = id;
        return markRaw(this);
    }
}

export const tagTypeList = [
  {name: '多', value: 1},
  {name: '错', value: 2},
  {name: '漏', value: 3},
];

export const tagTypeMap = {
  '1': '多',
  '2': '错',
  '3': '漏'
};

export const tagResultList = [
  {name: '待修改', value: 1},
  {name: '已修改', value: 2},
  {name: '无需修改', value: 3},
];

export const tagResultMap = 
{
  '1': '待修改',
  '2': '已修改',
  '3': '无需修改'
};