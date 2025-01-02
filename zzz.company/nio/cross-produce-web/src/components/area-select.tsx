import {Select} from 'antd';
import {forwardRef, useMemo} from 'react';
import {AreaOptions, AreaOptionsByCityCode} from '../constants/administrative-divisions/areas';

/**
 * 区域选择
 */
export const AreaSelect = forwardRef(
  (
    {
      city_code,
      style,
      onChange,
      value,
    }: {city_code?: string; onChange?: (value: any) => void; value?: string} & {style?: React.CSSProperties},
    ref: any,
  ) => {
    const options = useMemo(() => {
      if (city_code) {
        return AreaOptionsByCityCode[city_code] as {label: string; value: string}[];
      }
      return AreaOptions;
    }, [city_code]);

    return (
      <Select
        ref={ref}
        value={value}
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
  },
);
