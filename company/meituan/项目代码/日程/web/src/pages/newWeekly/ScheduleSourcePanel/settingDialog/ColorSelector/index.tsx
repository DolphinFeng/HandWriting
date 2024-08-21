import React from 'react';
import { Icon } from '@ss/mtd-react';
import styles from './index.less';

interface IPropsType {
  selectedColor: string;
  changeColor: Function;
  mainColors: [];
}

// const colors = ['#F50000', '#FF5E00', '#FF9D00', '#00B460', '#00B4B4', '#3888FF', '#166FF7', '#7D1AFF', '#FE1985', '#B56B1A'];

function ColorSelector(props: IPropsType) {
  const {
    selectedColor, changeColor, mainColors,
  } = props;
  return (
    <div className={styles.colorGrid}>
      {mainColors.map((mainColor) => {
        return (
          <div key={mainColor} className={styles.colorItem} style={{ backgroundColor: mainColor }} onClick={() => changeColor(mainColor)}>
            {selectedColor === mainColor && <Icon className={styles.check}
              type='checkmini' />}
          </div>
        );
      })}
    </div>
  );
}
export default ColorSelector;
