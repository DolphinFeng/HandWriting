import { components } from "../../models/openapi-build-map";
import {Form, Input, Modal, message, Select, Button, Table, Space, Tooltip, App} from 'antd';
import {useForm} from 'antd/es/form/Form';
import {useEffect, useState} from 'react';
import {cpmService} from '../../services/cpw-service';
import axios from 'axios';
import GeoFenceEdit, { AimEditStatus } from '../../map/GeoFenceEdit/GeoFenceEdit';
import { EditAimType } from '../../map/GeoFenceEdit/MapController';
import {buildMapService} from '../../services/build-map-service';
import { capitalizeOptions } from '../../libs/client/util';

interface Geofence {
  id: number;
  name: string;
  pointString: string;
  wktString: string;
}

interface CreateSiteParams {
    projectName: string;
    projectDesc: string;
    operator?: string;
    locationWkt?: string;
    mesh?: string;
    address?: string;
    adminCode?: string;
    bizType?: number;
    siteKind?: number;
    siteId?: string;
    descName?: string;
    regionWkt?: string;
    related?: string;
  }

interface Props {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title: string;
  initialCoordinates?: string;
  showChangeInfoModal?: boolean;
  changeInfoData?: any;
  onChangeInfoSubmit?: (values: any) => void;
  fromTaskDetail?: boolean;
  editData?: any;
  fromVerify?: boolean;
  saveSiteInfoOptToStorage?: (logId: number, data: any) => void;
}

interface SiteInfo {
  siteId: string;
  kind?: number;
  descName?: string;
  locationWkt?: string;
  address?: string;
  adminCode?: string;
  mesh?: string;
  regionWkt?: string;
  related?: string;
}

// Add this interface near the top with other interfaces
interface OptCheckItem {
  adminCode?: string;
  bizType?: number;
  checkOptType?: string;
  cityCode?: string;
  createTime?: string;
  deleteOldCollect?: boolean;
  descName?: string;
  kind?: number;
  locationWkt?: string;
  mesh?: string;
  needNewCollect?: boolean;
  otherInfo?: string;
  regionWkt?: string;
  related?: string;
  siteId?: string;
  status?: number;
  tag?: number;
  type?: number;
  updateTime?: string;
}

/**
 * 场景列表弹窗 & 变更信息弹窗
 * @returns
 */
export const CreateSceneList = ({
  visible,
  onSuccess,
  onCancel,
  title,
  initialCoordinates,
  showChangeInfoModal = false,
  changeInfoData = null,
  onChangeInfoSubmit,
  fromTaskDetail = false,
  editData,
  fromVerify = false,
  saveSiteInfoOptToStorage,
}: Props) => {
  const [businessType, setBusinessType] = useState<{ label: string; value: number; }[]>([]);
  const [selectedBusinessType, setSelectedBusinessType] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [nearGeofences, setNearGeofences] = useState<Geofence[]>([]);
  const [modalWidth, setModalWidth] = useState(600);
  const [form] = useForm<{
    projectName: string;
    projectDesc: string;
    operator?: string;
    isGeoFenceEditShow?: boolean;
    id?: string;
    businessType?: string;
    locationWkt: string;
    mesh: string;
    address: string;
    adminCode: string;
    bizType: string;
    siteKind: string;
    siteId: string;
    descName: string;
    regionWkt: string;
    related: string;
  }>();
  const [sceneKinds, setSceneKinds] = useState<{ label: string; value: number; }[]>([]);

  // 添加新的状态来跟踪已操作的站点
  const [processedSites, setProcessedSites] = useState<Set<string>>(new Set());
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  // 添加场景种别映射
  const sceneKindMap: Record<number, string> = {
    20000: 'PSP',
    10000: 'PN',
    40000: 'PNV',
    2: 'FORK',
    2000: 'ROUNDABOUT',
    1: 'CROSS',
    1000: 'SITE_GROUP',
    21: 'MAIN',
    30000: 'FDM',
    50000: 'P2P',
  };

  const handleCreateOrUpdate = async () => {
    try {
      // 如果是核实场景
      if (fromVerify) {
        // 检查是否所有站点都已操作
        const siteInfoList = changeInfoData?.siteInfoList || [];
        const allSitesProcessed = siteInfoList.every((site: components['schemas']['SiteInfo']) => 
          processedSites.has(site.siteId || '')
        );

        if (!allSitesProcessed) {
          message.error('请确保所有站点都已操作（更新/无需更新/废弃）');
          return;
        }

        if (!changeInfoData?.id) {
          message.error('未获取到任务ID');
          return;
        }

        // 从 localStorage 获取 optCheckList
        const stored = localStorage.getItem('siteInfoOptRecords');
        const storedData = stored ? JSON.parse(stored) : {};
        const optCheckList = Object.values(storedData) as components['schemas']['SiteInfoOpt'][];

        // 调用核实接口
        const response = await buildMapService.checkOptLogUsingPOST({
          optCheckList,
          optLogId: changeInfoData.id
        });

        if (response.code !== 0) {
          throw new Error(response.msg || '保存失败');
        }
        
        message.success('保存成功');
        localStorage.removeItem('siteInfoOptRecords');
        onSuccess();
      } 
      // 如果是编辑场景（从场景列表进入）
      else if (editData) {
        const values = await form.validateFields();
        // 调用更新接口
        const response = await buildMapService.updateSite({
          ...values,
          bizType: Number(values.bizType),
          kind: Number(values.siteKind)
        });

        if (response.code !== 0) {
          throw new Error(response.msg || '更新失败');
        }

        message.success('更新成功');
        onSuccess();
      } 
      // 如果是创建场景
      else {
        const values = await form.validateFields();
        // 调用创建接口
        const response = await buildMapService.createSite({
          ...values,
          bizType: Number(values.bizType),
          kind: Number(values.siteKind)
        });

        if (response.code !== 0) {
          throw new Error(response.msg || '创建失败');
        }

        message.success('创建成功');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error in handleCreateOrUpdate:', error);
      message.error(error.message || '未知错误');
    }
  };

  const handleCancel = () => {
    const hasChanges = form.isFieldsTouched();

    if (hasChanges) {
      Modal.confirm({
        title: '是否需要取消已有操作',
        content: '如果点击确定，则直接关闭窗口，不保存场景信息，以及右侧的围栏变更信息。',
        onOk: () => {
          onCancel();
          form.resetFields();
          setNearGeofences([]);
          form.setFieldsValue({ regionWkt: '' });
          setIsGeoFenceEditShow(false);
          setCurEditCenterPoint('');
          setModalWidth(600);
        },
        onCancel: () => {
          // 保留在当前页面，不做任何操作
        },
      });
    } else {
      onCancel();
      form.resetFields();
      setNearGeofences([]);
      form.setFieldsValue({ regionWkt: '' });
      setIsGeoFenceEditShow(false);
      setCurEditCenterPoint('');
      setModalWidth(600);
    }
  };

  const loadNearGeofence = async (
    editBusinessId: string, 
    businessType: string, 
    locationPoint: string, 
    distance: number = 3
  ) => {
    try {
      const payload = {
        businessType: Number(businessType),
        locationPoint,
        distance
      };

      const res = await buildMapService.nearbyListUsingPOST(payload);

      if (res.code === 0) {
        const listGeofence = res.data?.reduce((acc: Geofence[], item: any) => {
          if (!item.locationPoint || !item.regionWkt) return acc;
          if (editBusinessId && Number(editBusinessId) === item.businessId) return acc;
          
          acc.push({
            id: item.businessId,
            name: item.businessNameCn,
            pointString: item.locationPoint,
            wktString: item.regionWkt
          });
          return acc;
        }, []) || [];

        setNearGeofences(listGeofence);
      } else {
        message.error(res.msg);
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载地理围栏失败');
    }
  };

  const isValidLatLng = (value: string): boolean => {  
    const regex = /^POINT\(-?\d{1,3}\.\d+\s-?\d{1,3}\.\d+\)$/;
    return regex.test(value);
  };

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formValues = form.getFieldsValue();
    
    // 更新表单值
    form.setFieldsValue({ locationWkt: value });
    
    if (!isValidLatLng(value) || !formValues.isGeoFenceEditShow || !selectedBusinessType) {
      return;
    }
    
    loadNearGeofence(formValues.id ?? '', selectedBusinessType.toString(), value);
  };

  const handleValidateCoordinates = async () => {
    const formValues = form.getFieldsValue(); 
    const locationPoint = formValues.locationWkt;
    
    if (formValues.isGeoFenceEditShow) {
      message.warning('请先保存场景围栏信息');
      return;
    }
  
    if (!locationPoint) {
      message.warning('请输入经纬度');
      return;
    }

    if (!isValidLatLng(locationPoint)) {
      message.warning('经纬度格式不正确');
      return;
    }

    setLoading(true);
    try {
      const response = await buildMapService.checkLocationPointUsingGET(locationPoint);
      
      if (response.code === 0) {
        form.setFieldsValue({
          mesh: response.data?.mesh,
          address: response.data?.address,
          adminCode: response.data?.areaCode || '',
        });
        
        await loadNearGeofence(
          formValues.id ?? '', 
          formValues.businessType ?? '', 
          locationPoint
        );

        openGeofenceEdit();
      } else {
        message.error(response.msg || '校验经纬度失败');
      }
    } catch (error) {
      console.error('Error validating coordinates:', error);
      message.error('校验经纬度时发生错误');
    } finally {
      setLoading(false);
    }
  };
  
  const [isGeoFenceEditShow, setIsGeoFenceEditShow] = useState(false);
  const [curEditCenterPoint, setCurEditCenterPoint] = useState<string>('');

  useEffect(() => {
    const validateAndOpenGeofence = async () => {
      if (initialCoordinates) {
        // 1. 设置表单值
        await form.setFieldsValue({ 
          locationWkt: initialCoordinates,
          // 清空之前的值
          regionWkt: '',
          mesh: '',
          address: '',
          adminCode: ''
        });
        
        // 2. 更新中心点
        setCurEditCenterPoint(initialCoordinates);
        
        // 3. 重置地理围栏编辑器状态
        setIsGeoFenceEditShow(false);
        
        // 4. 自动触发校验经纬度
        try {
          const response = await buildMapService.checkLocationPointUsingGET(initialCoordinates);
          
          if (response.code === 0) {
            // 设置校验后的数据
            form.setFieldsValue({
              mesh: response.data?.mesh,
              address: response.data?.address,
              adminCode: response.data?.areaCode || '',
            });
            
            // 如果有业务类型，加载附近围栏
            if (selectedBusinessType) {
              await loadNearGeofence(
                form.getFieldValue('id') ?? '', 
                selectedBusinessType.toString(), 
                initialCoordinates
              );
            }

            // 打开地理围栏编辑器
            openGeofenceEdit();
          } else {
            message.error(response.msg || '校验经纬度失败');
          }
        } catch (error) {
          console.error('Error validating coordinates:', error);
          message.error('校验经纬度时发生错误');
        }
      }
    };

    validateAndOpenGeofence();
  }, [initialCoordinates, selectedBusinessType]);

  const openGeofenceEdit = () => {
    try {
      const locationValue = form.getFieldValue('locationWkt');
      if (!locationValue) {
        message.warning('请先输入站心经纬度');
        return;
      }
      setCurEditCenterPoint(locationValue);
      setIsGeoFenceEditShow(true);
      setModalWidth(1200);
    } catch (error) {
      console.error('Error in openGeofenceEdit:', error);
      message.error('打开地理围栏编辑器时出错');
    }
  };
  
  const onChangeGeoFenceWKT = (wkt: string) => {
    console.log('wkt: ', wkt);
    form.setFieldsValue({ regionWkt: wkt });
  };

  const validateLocation = async (_: any, value: string) => {
    if (!value) {
      return Promise.reject('请输入经纬度');
    }
    if (!isValidLatLng(value)) {
      return Promise.reject('经纬度格式不正确');
    }
    return Promise.resolve();
  };

  useEffect(() => {
    if (visible) {
      // 如果是编辑模式且有 editData
      if (editData) {
        form.setFieldsValue(editData);
        // 设置选中的业务类型
        setSelectedBusinessType(Number(editData.bizType));
        // 获取场景种别
        fetchSceneKinds(Number(editData.bizType));
      }
      
      // 获取业务类型列表
      const fetchOptions = async () => {
        try {
          const bizTypeRes = await buildMapService.getBizType();
          const businessTypes = bizTypeRes.data ? Object.entries(bizTypeRes.data).map(([label, value]) => ({ 
            label, 
            value: Number(value) 
          })) : [];
          setBusinessType(capitalizeOptions(businessTypes));
        } catch (error) {
          console.error('获取业务类型失败:', error);
          message.error('获取业务类型失败');
        }
      };

      fetchOptions();
    }
  }, [visible, editData]);

  const handleBusinessTypeChange = async (value: number) => {
    setSelectedBusinessType(value);
    fetchSceneKinds(value);
  };

  const fetchSceneKinds = async (businessType: number) => {
    try {
      const siteKindRes = await buildMapService.getSiteKind(businessType);
      const createOptions = (data: any) => 
        data ? Object.entries(data).map(([label, value]) => ({ 
          label, 
          value: Number(value) 
        })) : [];
      
      setSceneKinds(capitalizeOptions(createOptions(siteKindRes.data)));
    } catch (error) {
      console.error('获取场景种别失败:', error);
      message.error('获取场景种别失败');
    }
  };

  // 添加状态
  const [isGeofenceValid, setIsGeofenceValid] = useState(true);

  useEffect(() => {
    if (changeInfoData) {
      // 显示问题描述
      const optDesc = changeInfoData.optDesc;
      
      // 获取第一个站点信息
      const siteInfo = changeInfoData.siteInfoList?.[0];
      
      if (siteInfo) {
        // 设置表单值
        form.setFieldsValue({
          siteKind: siteInfo.kind,
          siteId: siteInfo.siteId,
          descName: siteInfo.descName,
          locationWkt: siteInfo.locationWkt,
          address: siteInfo.address,
          adminCode: siteInfo.adminCode,
          mesh: siteInfo.mesh,
          regionWkt: siteInfo.regionWkt,
          related: siteInfo.related
        });

        // 如果有 locationWkt，设置中心点
        if (siteInfo.locationWkt) {
          setCurEditCenterPoint(siteInfo.locationWkt);
        }
      }
    }
  }, [changeInfoData]);

  // 添加状态来跟踪每个站点的操作类型
  const [siteOperations, setSiteOperations] = useState<Record<string, 'update' | 'unchanged' | 'delete'>>({});

  // 修改操作处理函数
  const handleSiteOperation = async (record: any, operation: 'locate' | 'update' | 'unchanged' | 'delete') => {
    setSelectedSiteId(record.siteId);

    // 先设置表单值
    form.setFieldsValue({
      siteKind: record.kind,
      siteId: record.siteId,
      descName: record.descName,
      locationWkt: record.locationWkt,
      address: record.address,
      adminCode: record.adminCode,
      mesh: record.mesh,
      regionWkt: record.regionWkt,
      related: record.related
    });

    // 重置地理围栏编辑器状态
    setIsGeoFenceEditShow(false);
    
    // 如果有 locationWkt，触发校验流程
    if (record.locationWkt) {
      try {
        setLoading(true);
        const response = await buildMapService.checkLocationPointUsingGET(record.locationWkt);
        
        if (response.code === 0) {
          // 设置校验后的数据
          form.setFieldsValue({
            mesh: response.data?.mesh,
            address: response.data?.address,
            adminCode: response.data?.areaCode || '',
          });
          
          // 更新中心点
          setCurEditCenterPoint(record.locationWkt);
          
          // 如果有业务类型，加载附近围栏
          if (selectedBusinessType) {
            await loadNearGeofence(
              record.siteId, 
              selectedBusinessType.toString(), 
              record.locationWkt
            );
          }

          // 打开地理围栏编辑器
          openGeofenceEdit();
        } else {
          message.error(response.msg || '校验经纬度失败');
        }
      } catch (error) {
        console.error('Error validating coordinates:', error);
        message.error('校验经纬度时发生错误');
      } finally {
        setLoading(false);
      }
    }

    // 如果不是定位操作，记录操作类型和状态
    if (operation !== 'locate') {
      // 对于"无需更新"和"废弃"操作立即变色，"更新"操作延迟到保存后
      if (operation !== 'update') {
        setProcessedSites(prev => new Set(prev).add(record.siteId));
        setSiteOperations(prev => ({
          ...prev,
          [record.siteId]: operation
        }));
      }
      
      // 如果是"无需更新"或"废弃"操作，直接保存到 localStorage
      if (operation === 'unchanged' || operation === 'delete') {
        const operationMap = {
          unchanged: 'UNCHANGE',
          delete: 'DELETE'
        } as const;

        // 从 localStorage 获取现有数据
        const stored = localStorage.getItem('siteInfoOptRecords') || '{}';
        const storedData = JSON.parse(stored);
        
        // 添加新的记录，使用 siteId 作为 key
        storedData[record.siteId] = {
          ...record,
          checkOptType: operationMap[operation]
        };
        
        // 保存回 localStorage
        localStorage.setItem('siteInfoOptRecords', JSON.stringify(storedData));
      }
    }
  };

  // 修改 handleGeoFenceSave 函数，用于处理更新和新增
  const handleGeoFenceSave = async () => {
    const formValues = form.getFieldsValue();
    const siteId = formValues.siteId;
    
    try {
      console.log('changeInfoData in save:', changeInfoData);
      const response = await buildMapService.getSiteById(siteId);
      const isNew = !response.data?.locationWkt;
      
      // 构造保存数据
      const optCheck = {
        adminCode: formValues.adminCode,
        bizType: Number(formValues.bizType),
        checkOptType: isNew ? 'ADD' : 'UPDATE',
        descName: formValues.descName,
        kind: Number(formValues.siteKind),
        locationWkt: formValues.locationWkt,
        mesh: formValues.mesh,
        regionWkt: formValues.regionWkt,
        related: formValues.related,
        siteId: formValues.siteId,
        optLogId: changeInfoData?.id,
      };

      // 从 localStorage 获取现有数据
      const stored = localStorage.getItem('siteInfoOptRecords') || '{}';
      const storedData = JSON.parse(stored);
      
      // 添加新的记录，使用 siteId 作为 key
      storedData[siteId] = optCheck;
      
      // 保存回 localStorage
      localStorage.setItem('siteInfoOptRecords', JSON.stringify(storedData));
      
      // 保存成功后才更新状态和变色
      setProcessedSites(prev => new Set(prev).add(siteId));
      setSiteOperations(prev => ({
        ...prev,
        [siteId]: 'update'
      }));
      
      message.success('保存成功');
    } catch (error) {
      console.error('Error saving site:', error);
      message.error('保存失败');
    }
  };

  useEffect(() => {
    const fetchSceneKinds = async () => {
      try {
        // 固定业务类型为 PNPSP(1)
        const siteKindRes = await buildMapService.getSiteKind(1);
        const createOptions = (data: any) => 
          data ? Object.entries(data).map(([label, value]) => ({ 
            label, 
            value: Number(value) 
          })) : [];
        
        setSceneKinds(capitalizeOptions(createOptions(siteKindRes.data)));
      } catch (error) {
        console.error('获取场景种别失败:', error);
        message.error('获取场景种别失败');
      }
    };

    fetchSceneKinds();
  }, [visible]); // 当弹窗显示时获取场景种别

  return (
    <App>
      <Modal 
        title={fromTaskDetail ? '场景信息' : title}
        onOk={handleCreateOrUpdate} 
        onCancel={handleCancel} 
        open={visible} 
        okButtonProps={{
          loading,
          disabled: form.getFieldValue('isGeoFenceEditShow') || !isGeofenceValid,
        }}
        okText="保存"
        width={showChangeInfoModal ? 
          (form.getFieldValue('locationWkt') ? 1600 : 1000)  // 有变更信息时，根据是否有 locationWkt 决定宽度
          : modalWidth  // 没有变更信息时保持原有逻辑
        }
      >
        <div style={{ display: 'flex' }}>
          {showChangeInfoModal && (
            <div style={{ 
              width: form.getFieldValue('locationWkt') ? '30%' : '40%',  // 没有 locationWkt 时变更信息区域可以宽一点
              marginRight: '20px' 
            }}>
              <h3>变更信息</h3>
              <Form layout="vertical">
                <Form.Item label="资源信息">
                  <Input.TextArea 
                    rows={8} 
                    style={{ height: '200px' }} 
                    value={changeInfoData?.deviceInfoList ? 
                      JSON.stringify(changeInfoData.deviceInfoList[0], null, 2)
                      : '无资源信息'
                    } 
                    readOnly 
                  />
                </Form.Item>
                <Form.Item label="问题信息">
                  <Input.TextArea 
                    rows={4} 
                    value={changeInfoData?.optDesc || '无问题信息'} 
                    readOnly 
                  />
                </Form.Item>
              </Form>
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',  
                border: '1px solid #f0f0f0', 
                borderRadius: '4px', 
                padding: '8px'      
              }}>
                <Table
                  columns={[
                    {
                      title: '场站 ID',
                      dataIndex: 'siteId',
                    },
                    {
                      title: '操作',
                      dataIndex: 'actions',
                      render: (_: any, record: any) => (
                        <Space>
                          <Button onClick={(e) => {
                            e.stopPropagation();  // 阻止按钮点击事件冒泡到行
                            handleSiteOperation(record, 'locate');
                          }}>定位</Button>
                          <Button onClick={(e) => {
                            e.stopPropagation();
                            handleSiteOperation(record, 'update');
                          }}>更新</Button>
                          <Button onClick={(e) => {
                            e.stopPropagation();
                            handleSiteOperation(record, 'unchanged');
                          }}>无需更新</Button>
                          <Button onClick={(e) => {
                            e.stopPropagation();
                            handleSiteOperation(record, 'delete');
                          }}>废弃</Button>
                        </Space>
                      ),
                    },
                  ]}
                  dataSource={changeInfoData?.siteInfoList || []}
                  rowKey="siteId"
                  pagination={false}
                  size="small"
                  onRow={(record) => ({
                    onClick: () => {
                      // 点击行时触发定位操作
                      handleSiteOperation(record, 'locate');
                      setSelectedSiteId(record.siteId);
                    },
                    style: {
                      backgroundColor: record.siteId === selectedSiteId ? '#e6f7ff' : 'inherit',
                      color: siteOperations[record.siteId] === 'update' ? '#52c41a' :
                            siteOperations[record.siteId] === 'unchanged' ? '#faad14' :
                            siteOperations[record.siteId] === 'delete' ? '#ff4d4f' :
                            'inherit',
                      cursor: 'pointer'  // 添加手型光标提示可点击
                    }
                  })}
                />
              </div>
            </div>
          )}
          <div style={{ 
            width: showChangeInfoModal ? 
              (form.getFieldValue('locationWkt') ? '50%' : '60%')  // 没有 locationWkt 时表单区域可以宽一点
              : (isGeoFenceEditShow ? '50%' : '100%') 
          }}>
            <Form form={form} labelCol={{span: 6}}>
              {fromTaskDetail ? (
                <>
                  <Form.Item label="场景种别" name="kind">
                    <Select
                      placeholder="请选择场景种别"
                      options={sceneKinds.map(kind => ({
                        label: sceneKindMap[kind.value] || kind.label,
                        value: kind.value
                      }))}
                    />
                  </Form.Item>
                  <Form.Item 
                    label="Map ID" 
                    name="siteId" 
                    rules={[{ required: true, message: 'Map ID未填充' }]}
                  >
                    <Input placeholder="请输入Map ID" />
                  </Form.Item>
                  <Form.Item 
                    label="业务场景中文名称" 
                    name="descName" 
                    rules={[{ required: true, message: '业务场景中文名称未填充' }]}
                  >
                    <Input placeholder="请输入业务场景中文名称" />
                  </Form.Item>
                  <Form.Item 
                    label="需求名称" 
                    name="descName" 
                    rules={[{ required: true, message: '需求名称未填充' }]}
                  >
                    <Input placeholder="请输入需求名称" />
                  </Form.Item>
                </>
              ) : (
                <>
                  <Form.Item 
                    label="业务类型" 
                    name="bizType" 
                    rules={[{ required: true, message: '业务类型未填充' }]}
                  >
                    <Select 
                      placeholder="请选择业务类型"
                      options={businessType}
                      onChange={handleBusinessTypeChange}
                    />
                  </Form.Item>
                  <Form.Item 
                    label="场景种别" 
                    name="siteKind" 
                    rules={[{ required: true, message: '场景种别未填充' }]}
                  >
                    <Select 
                      placeholder="请选择场景种别"
                      options={sceneKinds.map(siteKind => ({
                        label: sceneKindMap[siteKind.value] || siteKind.label,
                        value: siteKind.value
                      }))}
                    />
                  </Form.Item>
                  <Form.Item 
                    label="Map ID" 
                    name="siteId" 
                    rules={[{ required: true, message: 'Map ID未填充' }]}
                  >
                    <Input placeholder="请输入Map ID" />
                  </Form.Item>
                  <Form.Item 
                    label="业务场景中文名称" 
                    name="descName" 
                    rules={[{ required: true, message: '业务场景中文名称未填充' }]}
                  >
                    <Input placeholder="请输入业务场景中文名称" />
                  </Form.Item>
                </>
              )}
              <Form.Item 
                label="站心经纬度" 
                name="locationWkt"
                rules={[
                  { required: true, message: '站心经纬度未填充' },
                  { validator: validateLocation }
                ]}
              >
                <Input.Group compact style={{ display: 'flex' }}>
                  <Input 
                    style={{ width: 'calc(100% - 100px)', flex: 1 }} 
                    placeholder="示例：POINT(112.71 37.68)" 
                    onChange={(e) => {
                      form.setFieldsValue({ locationWkt: e.target.value });
                      handleLocationChange(e);
                    }}
                  />
                  <Tooltip title={form.getFieldValue('isGeoFenceEditShow') ? "先保存场景围栏信息" : ""}>
                    <Button 
                      type="primary" 
                      onClick={async () => {                    
                        try {
                          await form.validateFields(['locationWkt']);
                          handleValidateCoordinates();
                          openGeofenceEdit();
                        } catch (error) {
                          // Validation error is already handled by the form
                        }
                      }}
                      loading={loading}
                      disabled={form.getFieldValue('isGeoFenceEditShow')}
                    >
                      校验经纬度
                    </Button>
                  </Tooltip>
                </Input.Group>
              </Form.Item>
              <Form.Item label="所在区县" name="address" >
                <Input placeholder="请输入所在区县" />
              </Form.Item>
              <Form.Item label="所在区划" name="adminCode" >
                <Input placeholder="请输入所在区划" />
              </Form.Item>
              <Form.Item label="图幅号" name="mesh" >
                <Input placeholder="请输入图幅号" />
              </Form.Item>
              <Form.Item label="地理围栏" name="regionWkt" rules={[{ required: true, message: '地理围栏未填充' }]}>
                <Input.TextArea rows={4} value={form.getFieldValue('regionWkt')} placeholder="示例：POLYGON ((112.71 37.68, 112.71 37.68))" />
              </Form.Item>
              <Form.Item label="业务场景DeviceID" name="related" >
                <Input.TextArea rows={4} value={form.getFieldValue('related')} placeholder="请输入业务场景DeviceID" />
              </Form.Item>
            </Form>
          </div>
          {isGeoFenceEditShow && (
            <div style={{ width: '50%', marginLeft: '20px' }}>
              <GeoFenceEdit
                editForAims={['polygon'] as EditAimType[]}
                locationPointString={curEditCenterPoint || form.getFieldValue('locationWkt')}
                height="638px"
                wtkStrPolygon={form.getFieldValue('regionWkt')}
                relaGeofences={nearGeofences}
                onWktPolygonChange={onChangeGeoFenceWKT}
                onStatusChange={(status) => {
                  setIsGeofenceValid(status !== AimEditStatus.ERROR);
                }}
                showPNPSPButton={showChangeInfoModal}
                onSave={handleGeoFenceSave}
              />
            </div>
          )}
        </div>
      </Modal>
    </App>
  );
};