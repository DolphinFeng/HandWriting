import { i18nClient } from '@sailor/i18n-web';
import React, { useCallback } from 'react';
import { Input } from '@ss/mtd-react';
import classNames from 'classnames';
import { maxRemarkNum } from '@/consts/weekly';
import styles from './index.less';

// 参数类型
interface IPropsType {
  value: string; // 内容
  length: number; // 输入框文字长度
  onChange: Function; // 改变值
  closeMtdComponent?: Function; // 关闭【重复选择器】
}

/**
 * 备注输入框
 */
export default function Remark(props: IPropsType) {
  const {
    value = '',
    length = maxRemarkNum,
    onChange,
    closeMtdComponent
  } = props;

  /**
   * 修改值
   */
  const handleChangeValue = useCallback((e) => {
    onChange && onChange(e.target.value);
  }, []);

  return (
    <div
      className={classNames(styles.container, {
        [styles.warn]: value?.length > length
      })}
    >
      <Input.TextArea
        className={styles.remarks}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        value={value}
        onChange={handleChangeValue}
        autosize={{ minRows: 4, maxRows: 4 }}
        placeholder={i18nClient.t(
          'remark_target_proceedings_outputs_materials',
          '会议目标：为什么要开这场会？\n会议议程：如何利用会议时间？\n预计产出：会议结束后要得到什么？\n材料链接：提前准备好材料，沟通事半功倍哦~'
        )}
        onFocus={() => closeMtdComponent()}
      />
      <div className={styles.num}>
        <span>
          {value?.length > length
            && i18nClient.t(
              'remark_cannot_exceed_hundred_font',
              '不能超过{length}个字',
              { length }
            )}
        </span>
        <span>
          {value?.length}/{length}
        </span>
      </div>
    </div>
  );
}
