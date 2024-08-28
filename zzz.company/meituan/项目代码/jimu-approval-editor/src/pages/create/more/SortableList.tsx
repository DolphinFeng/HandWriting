import React, { useMemo } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { Icon } from '@ss/mtd-react';
import './sortableList.less';

export interface SortableItemType {
  id: string;
  name?: string;
}

interface IProps {
  list: SortableItemType[];
  onSortChange: Function;
}

const SortableList = (props: IProps) => {
  const { list = [] as SortableItemType[], onSortChange } = props;

  const memoizedList = useMemo(() => {
    return (
      <ReactSortable
        className='drag-sort-list'
        animation={200}
        ghostClass='drag-background-class'
        list={list}
        setList={(items) => {
          onSortChange(items);
        }}
      >
        {list.map((item, itemIndex) => {
          return (
            <div key={item.id} className='drag-sort-list-item'>
              <div>{item.name}</div>
              <div
                className='drag-sort-list-action'
                onClick={() => {
                  const newArray = list.slice();
                  newArray.splice(itemIndex, 1);
                  onSortChange(newArray);
                }}
              >
                <Icon type='delete-o'></Icon>
              </div>
            </div>
          );
        })}
      </ReactSortable>
    );
  }, [list]);

  return memoizedList;
};

export default SortableList;
