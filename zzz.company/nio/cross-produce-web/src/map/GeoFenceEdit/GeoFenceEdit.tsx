import React, { useEffect, useRef, useState, useCallback } from 'react';
import nioMap from './initMap';
import { 
  defined, 
  ScreenSpaceEventHandler, 
  ScreenSpaceEventType, 
  Cartesian3, 
  Entity, 
  Viewer,
  ConstantPositionProperty,
  JulianDate
} from 'cesium';
import { message, Button, Radio, Tooltip, Space } from 'antd';
import { EditAimType, MapController, RelaGeofence, RelaGeofenceStore } from './MapController';
import { CommandHistory, OperateType } from './commands';
import { convertToLatLng } from './commons';
import { useToolbarController } from './ToolbarController';
import { 
  UndoOutlined, 
  RedoOutlined,
  AimOutlined,
  DeleteOutlined,
  NotificationOutlined,
  CopyOutlined,
  EditOutlined,
  CheckOutlined,
  WarningOutlined 
} from '@ant-design/icons';
import './styles.css';

export enum AimEditStatus {
  NOT_EXIST,
  SUCCESS,
  NOT_COMPLETE,
  ERROR
}

interface Props {
  editForAims?: EditAimType[];
  locationPointString?: string;
  relaGeofences?: RelaGeofence[];
  height?: number | string;
  wtkStrPolygon?: string | null;
  wtkStrPathLine?: string | null;
  onWktPolygonChange?: (wkt: string) => void;
  onWktPathLineChange?: (wkt: string) => void;
  onStatusChange?: (status: AimEditStatus) => void;
  onPNPSPLayerClick?: () => void;
  showPNPSPButton?: boolean;
  onSave?: () => Promise<void>;
}

interface Lng_Lat {
  lat: number;
  lng: number;
}

const GeoFenceEdit: React.FC<Props> = ({
  editForAims = ['polygon'] as EditAimType[],
  locationPointString = '',
  relaGeofences = [],
  height = '100vh',
  wtkStrPolygon = null,
  wtkStrPathLine = null,
  onWktPolygonChange,
  onWktPathLineChange,
  onStatusChange,
  onPNPSPLayerClick,
  showPNPSPButton = false,
  onSave,
}) => {
  // State
  const [curEditAim, setCurEditAim] = useState<EditAimType>(editForAims[0]);
  const [pointNum, setPointNum] = useState(0);
  const [aimPolygonStatus, setAimPolygonStatus] = useState(AimEditStatus.NOT_EXIST);
  const [statusContent, setStatusContent] = useState('请创建一个地理围栏');
  const [undoDescList, setUndoDescList] = useState<string[]>([]);
  const [redoDescList, setRedoDescList] = useState<string[]>([]);
  const [polygonWKTString, setPolygonWKTString] = useState('');
  const [pathLineWKTString, setPathLineWKTString] = useState('');
  const [showInitialFence, setShowInitialFence] = useState(false);

  // Refs
  const viewerRef = useRef<Viewer | null>(null);
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const mapCtrlRef = useRef<MapController | null>(null);
  const toolbarRef = useRef<ReturnType<typeof useToolbarController> | null>(null);
  const commandHistoryRef = useRef(new CommandHistory());
  const centerPointRef = useRef<Entity | null>(null);
  const centerRef = useRef<Lng_Lat | null>(null);
  const relaGeofencesRef = useRef<RelaGeofenceStore[]>([]);

  const setEditStatusContent = useCallback((status: AimEditStatus, errorMsg?: string) => {
    setAimPolygonStatus(status);
    onStatusChange?.(status);
    switch (status) {
      case AimEditStatus.SUCCESS:
        setStatusContent('已创建合法地理围栏');
        break;
      case AimEditStatus.ERROR:
      case AimEditStatus.NOT_COMPLETE:
        setStatusContent(errorMsg || '');
        break;
      default:
        setStatusContent('请创建一个地理围栏');
    }
  }, [onStatusChange]);

  const handleAimPolygonChange = useCallback((aimPolygon: Entity | undefined) => {
    if (!mapCtrlRef.current) return;

    if (aimPolygon !== undefined) {
      const result = mapCtrlRef.current.checkPolygonVaild(aimPolygon);
      if (!result.isSuccess) {
        setPolygonWKTString('');
        setEditStatusContent(AimEditStatus.ERROR, result.errMsg);
      } else {
        const wkt = mapCtrlRef.current.getAimPolygonWkt();
        setPolygonWKTString(wkt);
        onWktPolygonChange?.(wkt);
        if (editForAims.includes(EditAimType.PathLine) && pathLineWKTString === '') {
          setEditStatusContent(AimEditStatus.NOT_COMPLETE, '匝道还未成功绘制');
        } else {
          setEditStatusContent(AimEditStatus.SUCCESS);
        }
      }
    } else {
      setPolygonWKTString('');
      onWktPolygonChange?.('');
      setEditStatusContent(AimEditStatus.NOT_EXIST);
    }
  }, [editForAims, pathLineWKTString, onWktPolygonChange, setEditStatusContent]);

  const handleAimPathLineChange = useCallback((aimLines: Entity[] | undefined) => {
    if (!mapCtrlRef.current) return;

    if (aimLines !== undefined) {
      const result = mapCtrlRef.current.checkPathLineVaild(aimLines);
      if (!result.isSuccess) {
        setPathLineWKTString('');
        setEditStatusContent(AimEditStatus.ERROR, result.errMsg);
      } else {
        const wkt = mapCtrlRef.current.getAimPathLineWkt();
        setPathLineWKTString(wkt);
        if (editForAims.includes(EditAimType.Polygon) && polygonWKTString === '') {
          setEditStatusContent(AimEditStatus.NOT_COMPLETE, '围栏区域还未成功绘制');
        } else {
          setEditStatusContent(AimEditStatus.SUCCESS);
        }
      }
    } else {
      setPathLineWKTString('');
      setEditStatusContent(AimEditStatus.NOT_EXIST);
    }
    onWktPathLineChange?.(pathLineWKTString);
  }, [editForAims, polygonWKTString, onWktPathLineChange, setEditStatusContent]);

  const handleUserOperation = useCallback(() => {
    if (!viewerRef.current || !mapCtrlRef.current || !toolbarRef.current) {
      console.log('handleUserOperation 初始化检查失败:', {
        viewer: !!viewerRef.current,
        mapCtrl: !!mapCtrlRef.current,
        toolbar: !!toolbarRef.current
      });
      return;
    }

    handlerRef.current = new ScreenSpaceEventHandler(viewerRef.current.scene.canvas);

    // Left click
    handlerRef.current.setInputAction((click: any) => {
      console.log('左键点击事件触发');
      if (mapCtrlRef.current?.mouseHoldEntity || !viewerRef.current) return;

      if (mapCtrlRef.current?.userOptions.bCanChoosePoint) {
        const pickedObject = viewerRef.current.scene.pick(click.position);
        if (defined(pickedObject) && defined(pickedObject.id) && pickedObject.id.point) {
          mapCtrlRef.current.selectedEntity = pickedObject.id;
          mapCtrlRef.current.resetPointsStyle();
          mapCtrlRef.current.render();
          return;
        }
      }

      const cartesian = mapCtrlRef.current?.getPick(click.position);
      if (defined(cartesian) && toolbarRef.current) {
        toolbarRef.current.addPoint(cartesian as Cartesian3);
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    // Left down
    handlerRef.current.setInputAction((click: any) => {
      const pickedObject = viewerRef.current?.scene.pick(click.position);
      if (defined(pickedObject) && defined(pickedObject.id) && pickedObject.id.point) {
        if (!mapCtrlRef.current?.findPoint(pickedObject.id.id)) return;
        
        mapCtrlRef.current.mouseHoldEntity = pickedObject.id;
        mapCtrlRef.current.moveBeforeCartesian = mapCtrlRef.current.getPositionByPoint(mapCtrlRef.current.mouseHoldEntity) as Cartesian3;
        mapCtrlRef.current.disableMapMove();
      }
    }, ScreenSpaceEventType.LEFT_DOWN);

    // Mouse move
    handlerRef.current.setInputAction((movement: any) => {
      if (mapCtrlRef.current?.mouseHoldEntity) {
        const cartesian = mapCtrlRef.current.getPick(movement.endPosition);
        if (!defined(cartesian)) return;
        
        mapCtrlRef.current.movePoint(mapCtrlRef.current.mouseHoldEntity, cartesian as Cartesian3);
        mapCtrlRef.current.render();
      } else {
        const pickedObject = viewerRef.current?.scene.pick(movement.endPosition);
        if (defined(pickedObject) && defined(pickedObject.id) && pickedObject.id.point) {
          if (!mapCtrlRef.current?.mouseInPoint) {
            const ctrl = mapCtrlRef.current;
            if (ctrl) {
              ctrl.resetPointsStyle(pickedObject.id, 'Hover');
              ctrl.mouseInPoint = true;
            }
          }
        } else if (mapCtrlRef.current?.mouseInPoint) {
          mapCtrlRef.current.mouseInPoint = false;
          mapCtrlRef.current.resetPointsStyle();
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    // Left up
    handlerRef.current.setInputAction(() => {
      if (mapCtrlRef.current?.mouseHoldEntity) {
        mapCtrlRef.current.disableMapMove(false);
        toolbarRef.current?.movePoint(mapCtrlRef.current.getPositionByPoint(mapCtrlRef.current.mouseHoldEntity) as Cartesian3);
        mapCtrlRef.current.mouseHoldEntity = null;
      }
    }, ScreenSpaceEventType.LEFT_UP);

    // Right click
    handlerRef.current.setInputAction(() => {
      if ((mapCtrlRef.current?.getPoints().length || 0) >= 3) {
        toolbarRef.current?.makePolygon();
      }
    }, ScreenSpaceEventType.RIGHT_CLICK);
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!toolbarRef.current) return;

    if (event.key === 'Delete') {
      toolbarRef.current.deletePoint();
    } else if (event.key === 'Escape') {
      toolbarRef.current.unselected();
    }
  }, []);

  // 创建一个新的 hook 来处理 toolbar 的初始化
  const toolbar = useToolbarController({ 
    commandHistory: commandHistoryRef.current, 
    mapCtrl: mapCtrlRef.current as MapController 
  });

  // 使用 useEffect 来更新 toolbarRef
  useEffect(() => {
    if (toolbar) {
      toolbarRef.current = toolbar;
    }
  }, [toolbar]);

  // 主要的初始化 effect
  useEffect(() => {
    centerRef.current = convertToLatLng(locationPointString);
    if (!centerRef.current) {
      message.error('中心经纬度格式错误');
      return;
    }

    viewerRef.current = nioMap.createViewer(
      "cesium-container", 
      Cartesian3.fromDegrees(centerRef.current.lng, centerRef.current.lat, 500.0)
    );

    if (!viewerRef.current || viewerRef.current.isDestroyed()) {
      console.error('Failed to initialize Viewer');
      return;
    }

    mapCtrlRef.current = new MapController(viewerRef.current);
    
    if (editForAims.length > 0) {
      setCurEditAim(editForAims[0]);
      mapCtrlRef.current.setCurEditAim(editForAims[0]);
    }

    centerPointRef.current = mapCtrlRef.current.drawCenterPoint(
      Cartesian3.fromDegrees(centerRef.current.lng, centerRef.current.lat, 0.0)
    ) as Entity | null;

    mapCtrlRef.current.addChangeAimPolygonEvent(handleAimPolygonChange);
    mapCtrlRef.current.addChangeAimPathLineEvent(handleAimPathLineChange);
    mapCtrlRef.current.addChangePointsEvent(() => {
      setPointNum(mapCtrlRef.current?.getPoints().length || 0);
    });

    if (wtkStrPolygon) {
      mapCtrlRef.current.WKTToViewer(wtkStrPolygon);
    }
    if (wtkStrPathLine) {
      mapCtrlRef.current.WKTToViewer(wtkStrPathLine);
    }

    relaGeofencesRef.current = mapCtrlRef.current.drawRelaGeofences(relaGeofences);

    commandHistoryRef.current.addCommandRunEvent(() => {
      setUndoDescList(commandHistoryRef.current.getUndoStackDescs());
      setRedoDescList(commandHistoryRef.current.getRedoStackDescs());
    });

    handleUserOperation();
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      mapCtrlRef.current = null;
      toolbarRef.current = null;
      commandHistoryRef.current = new CommandHistory();

      if (handlerRef.current) {
        handlerRef.current.destroy();
        handlerRef.current = null;
      }
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
      nioMap.destroy();

      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [viewerRef, mapCtrlRef]);  // 移除 toolbarRef 依赖

  useEffect(() => {
    if (!centerPointRef.current?.point) return;

    const center = convertToLatLng(locationPointString);
    if (!center) return;

    centerPointRef.current.position = new ConstantPositionProperty(
      Cartesian3.fromDegrees(center.lng, center.lat, 0.0)
    );
    mapCtrlRef.current?.render();
  }, [locationPointString]);

  useEffect(() => {
    if (!relaGeofences || !relaGeofences.length) return;

    mapCtrlRef.current?.clearRelaGeoFences(relaGeofencesRef.current);
    mapCtrlRef.current?.drawRelaGeofences(relaGeofences);
    mapCtrlRef.current?.render();
  }, [relaGeofences]);

  const getStatusIcon = (status: AimEditStatus) => {
    switch(status) {
      case AimEditStatus.SUCCESS: return <CheckOutlined />;
      case AimEditStatus.ERROR: return <WarningOutlined />;
      default: return <EditOutlined />;
    }
  };

  const getStatusButtonType = (status: AimEditStatus): "default" | "primary" | "dashed" | "link" | "text" | undefined => {
    switch(status) {
      case AimEditStatus.SUCCESS: return "primary";
      case AimEditStatus.ERROR: return "text";
      default: return "default";
    }
  };

  return (
    <div className="geofence" style={{ height, width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="toolbar" style={{ width: '100%', minHeight: 50, padding: '8px 16px' }}>
        <Radio.Group 
          value={curEditAim} 
          onChange={e => {
            setCurEditAim(e.target.value);
            mapCtrlRef.current?.setCurEditAim(e.target.value);
          }}
          className="aim-tab"
        >
          {editForAims.includes(EditAimType.Polygon) && (
            <Radio.Button value="polygon">围栏</Radio.Button>
          )}
          {editForAims.includes(EditAimType.PathLine) && (
            <Radio.Button value="pathline">匝道</Radio.Button>
          )}
        </Radio.Group>

        <Space className="ml-4">
          <Tooltip title="撤销">
            <Button 
              icon={<UndoOutlined />} 
              disabled={undoDescList.length === 0}
              onClick={() => commandHistoryRef.current.undo()}
            />
          </Tooltip>
          <Tooltip title="恢复">
            <Button 
              icon={<RedoOutlined />} 
              disabled={redoDescList.length === 0}
              onClick={() => commandHistoryRef.current.redo()}
            />
          </Tooltip>
          <Tooltip title="回到站心">
            <Button 
              icon={<AimOutlined />} 
              disabled={!locationPointString}
              onClick={() => mapCtrlRef.current?.toCenter(Cartesian3.fromDegrees(centerRef.current?.lng || 0, centerRef.current?.lat || 0, 500.0))}
            />
          </Tooltip>
          <Tooltip title="删除选择点，或删除最后一个放置的点（Delete）">
            <Button 
              icon={<DeleteOutlined />} 
              disabled={pointNum === 0}
              onClick={() => toolbarRef.current?.deletePoint()}
            />
          </Tooltip>
          {curEditAim === 'polygon' && (
            <Tooltip title="将当前多个点形成闭合区域（右键）">
              <Button 
                icon={<NotificationOutlined />} 
                disabled={pointNum <= 2}
                onClick={() => toolbarRef.current?.makePolygon()}
              />
            </Tooltip>
          )}
          <Tooltip title="复制目标的WKT字符串">
            <Button 
              icon={<CopyOutlined />} 
              disabled={aimPolygonStatus !== AimEditStatus.SUCCESS}
              onClick={() => toolbarRef.current?.copyWKTString()}
            />
          </Tooltip>
          {showPNPSPButton && (
            <Button 
              type={showInitialFence ? "primary" : "default"}
              style={{ 
                backgroundColor: showInitialFence ? '#b7eb8f' : undefined,
                borderColor: showInitialFence ? '#b7eb8f' : undefined
              }}
              onClick={() => {
                setShowInitialFence(!showInitialFence);
                if (mapCtrlRef.current) {
                  if (!showInitialFence) {
                    mapCtrlRef.current.showInitialPolygon(wtkStrPolygon, '#52c41a');
                  } else {
                    mapCtrlRef.current.hideInitialPolygon();
                  }
                }
              }}
            >
              PN/PSP图层
            </Button>
          )}
        </Space>

        <Tooltip title={statusContent}>
          <Button
            icon={getStatusIcon(aimPolygonStatus)}
            type={getStatusButtonType(aimPolygonStatus)}
            className="check-status"
            onClick={onSave}
            disabled={aimPolygonStatus !== AimEditStatus.SUCCESS}
          />
        </Tooltip>
      </div>
      <div id="cesium-container" />
    </div>
  );
};

export default GeoFenceEdit;
export type { Props };