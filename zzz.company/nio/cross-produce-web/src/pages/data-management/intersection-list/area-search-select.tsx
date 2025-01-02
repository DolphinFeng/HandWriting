import {Form} from 'antd';
import {AreaSelect} from '../../../components/area-select';

export const AreaSearchSelect = ({city_code}: {city_code?: string}) => {
  return (
    <Form.Item label="区县" name="adminCodes">
      <AreaSelect city_code={city_code} style={{width: '200px'}}></AreaSelect>
    </Form.Item>
  );
};
