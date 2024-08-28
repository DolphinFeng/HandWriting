import { Component } from 'react';
import { Popover, Input, Button } from '@ss/mtd-react';
import './index.less';

export default class ChooseIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleIcons: false,
      icons: [
        'https://p0.meituan.net/travelcube/fab0501608ef3c0d491028b1c9f3e3323160.png',
        'https://p0.meituan.net/travelcube/fe7adda4332bcb067114f87e965f62a72562.png',
        'https://p0.meituan.net/travelcube/1632d1b30df57b34cd9fc73e2e0294fb2290.png',
        'https://p1.meituan.net/travelcube/e7e92302f624941de24c57c88615446c2070.png',
        'https://p0.meituan.net/travelcube/90f901ed6c09b1271f1ca9d4f06949f42168.png',
        'https://p0.meituan.net/travelcube/d687514d5b9f5462e7a4f3bc1d7464312046.png',
        'https://p1.meituan.net/travelcube/d490e0fa4a9bd4f2a346393291d3b97c1933.png'
      ],
      defaultIcon:
        'https://p1.meituan.net/travelcube/d490e0fa4a9bd4f2a346393291d3b97c1933.png'
    };
  }

  render() {
    const { visibleIcons, icons, defaultIcon } = this.state;
    const { icon, setInfo } = this.props;
    const IconsList = (
      <div className='icons-list'>
        {icons.map((item, index) => {
          return (
            <div
              className='icon-item'
              key={index}
              onClick={() => {
                setInfo('icon', item);
                this.setState({
                  visibleIcons: false
                });
              }}
            >
              <img src={item} alt='img' />
            </div>
          );
        })}
      </div>
    );

    return (
      <Popover
        placement='bottomLeft'
        trigger='click'
        visible={visibleIcons}
        onDocumentClick={() => {
          this.setState({
            visibleIcons: false
          });
        }}
        content={IconsList}
      >
        <div className='approval-item-icon'>
          <div className='approval-icon'>
            <img src={icon || defaultIcon} alt='' />
            <Input
              style={{ display: 'none' }}
              value={icon || defaultIcon}
              toFormItem
            />
          </div>
          <Button
            onClick={() => {
              this.setState({
                visibleIcons: true
              });
            }}
          >
            修改
          </Button>
        </div>
      </Popover>
    );
  }
}
