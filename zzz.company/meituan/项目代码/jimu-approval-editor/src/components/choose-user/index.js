/**
 * 找人组件
 */
import React from 'react';
import { Checkbox, Input, Button, Loading, Icon, Modal } from '@ss/mtd-react';
import { debounce } from 'lodash';
import './index.less';
import { getEmployee } from '@/services/user';

export default class ChooseUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItems: [],
      data: [],
      loading: true
    };
  }

  componentDidMount = async () => {
    const { value = [] } = this.props;
    // 接口拉取
    const data = await this.fetchData();
    if (data) {
      this.setState({
        loading: false,
        data,
        selectedItems: [...value]
      });
    }
  };

  fetchData = async (name) => {
    const data = await getEmployee(name);
    return data?.pageList;
  };

  handleSearch = debounce((val) => {
    this.setState({
      loading: true
    });

    this.fetchData(val).then((data) => {
      if (data) {
        this.setState({
          loading: false,
          data
        });
      }
    });
  }, 500);

  handleCheck = (item) => {
    const { selectedItems } = this.state;
    const curIndex = selectedItems.findIndex((val) => {
      return val.id === item.id;
    });

    if (curIndex === -1) {
      selectedItems.push(item);
    } else {
      selectedItems.splice(curIndex, 1);
    }
    this.setState({
      ...this.state,
      selectedItems
    });
  };

  render() {
    const { data, selectedItems } = this.state;

    const { onClose, visible, onSave } = this.props;

    const renderPersons = (persons) => {
      return persons.map((item, index) => {
        const isChecked =
          selectedItems.findIndex((val) => {
            return item.id === val.id;
          }) > -1;

        return (
          <div
            className='item'
            key={index}
            onClick={() => {
              this.handleCheck(item);
            }}
          >
            <span className='name'>{item.label}</span>
            <span>
              <Checkbox checked={isChecked}></Checkbox>
            </span>
          </div>
        );
      });
    };

    const renderCheckedPersons = (items) => {
      return items.map((item, index) => {
        return (
          <div className='item' key={index}>
            <span className='name'>{item.label}</span>
            <span
              onClick={() => {
                this.handleCheck(item);
              }}
            >
              <Icon type='close'></Icon>
            </span>
          </div>
        );
      });
    };

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Modal
          className='candidate-choose'
          onClose={onClose}
          title='选择审批负责人'
          footer={
            <div>
              <Button onClick={onClose}>取消</Button>
              <Button
                type='primary'
                className='btnSave'
                onClick={() => {
                  onSave(this.state.selectedItems);
                }}
              >
                保存
              </Button>
            </div>
          }
          visible={visible}
        >
          <Modal.Body>
            <div className='candidate-selector'>
              <div className='selector'>
                <div className='part'>
                  <div className='search'>
                    <Input
                      placeholder='搜索'
                      onChange={(e) => {
                        const { value } = e.target;
                        this.handleSearch(value);
                      }}
                    />
                  </div>
                  <Loading loading={this.state.loading}>
                    <ul className='list'>{renderPersons(data)}</ul>
                  </Loading>
                </div>
                <div className='part'>
                  <div className='search'>
                    已选 {this.state.selectedItems.length} 人
                  </div>
                  <ul className='list'>
                    {renderCheckedPersons(selectedItems)}
                  </ul>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
