import {Select} from 'antd';
import {useMemo} from 'react';
import {CityOptions} from '../constants/administrative-divisions/cities-provinceLevelName';

/**
 * 区域选择-传参为城市名
 */
export const CitySelectCityParam = ({
  provice_code,
  style,
  onChange,
}: {provice_code?: string} & {style?: React.CSSProperties; onChange?: (value: any) => void}) => {
  const options = useMemo(() => {
    return CityOptions;
  }, [provice_code]);

  return (
    <Select
      style={style}
      placeholder="请选择"
      options={options}
      showSearch
      allowClear
      onClear={() => onChange?.(undefined)}
      filterOption={(input, option) => {
        const label = option?.label as string;
        const value = option?.value as string;

        if (!label || !value) {
          return false;
        }

        if (label.includes(input) || value.includes(input)) {
          return true;
        }

        return false;
      }}
      onChange={onChange}
    ></Select>
  );
};
