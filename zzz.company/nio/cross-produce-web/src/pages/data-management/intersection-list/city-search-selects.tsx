import {Select} from 'antd';
import {useMemo} from 'react';
import {CityOptions} from '../../../constants/administrative-divisions/cities';

/**
 * 区域选择
 */
//城市 - 支持多选
export const CitySelects = ({
  provice_code,
  style,
  disabled,
  onChange,
}: {provice_code?: string} & {disabled?: boolean; } & {style?: React.CSSProperties; onChange?: (value: any) => void}) => {
  const options = useMemo(() => {
    return CityOptions;
  }, [provice_code]);

  return (
    <Select
      mode="multiple"
      style={style}
      placeholder="请选择"
      options={options}
      showSearch
      allowClear
      disabled={disabled}
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
