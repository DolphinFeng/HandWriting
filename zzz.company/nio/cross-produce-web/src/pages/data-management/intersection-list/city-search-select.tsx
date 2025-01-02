import {Form} from 'antd';
import {CitySelect} from '../../../components/city-select';

export const CitySearchSelect = () => {
  return (
    <Form.Item label="城市" name="cityCode">
      <CitySelect style={{width: '200px'}}></CitySelect>
    </Form.Item>
  );
};
