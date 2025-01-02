import { message } from 'antd'; // Using Ant Design instead of Element Plus
import { convertToLatLng } from "./commons";
import { Cartesian3 } from "cesium";
import { AddPointCommand, CommandHistory, MakePolygonCommand, MovePointCommand, RemovePointCommand } from "./commands";
import { MapController } from "./MapController";
import { useCallback } from 'react';
import copy from 'copy-to-clipboard'; // Using simpler clipboard library

interface ToolbarControllerProps {
  commandHistory: CommandHistory;
  mapCtrl: MapController;
}

export const useToolbarController = ({ commandHistory, mapCtrl }: ToolbarControllerProps) => {
  const render = useCallback(() => {
    mapCtrl.render();
  }, [mapCtrl]);

  const undo = useCallback(() => {
    commandHistory.undo();
    render();
  }, [commandHistory, render]);

  const redo = useCallback(() => {
    commandHistory.redo();
    render();
  }, [commandHistory, render]);

  const toCenter = useCallback((locationPoint: { lat: number; lng: number }) => {
    mapCtrl.toCenter(Cartesian3.fromDegrees(locationPoint.lng, locationPoint.lat, 500.0));
    render();
  }, [mapCtrl, render]);

  const deletePoint = useCallback(() => {
    if (mapCtrl.selectedEntity) {
      commandHistory.executeCommand(new RemovePointCommand(mapCtrl, mapCtrl.selectedEntity));
    } else {
      commandHistory.executeCommand(new RemovePointCommand(mapCtrl, null));
    }
    render();
  }, [mapCtrl, commandHistory, render]);

  const copyWKTString = useCallback(() => {
    try {
      const success = copy(mapCtrl.getCurWkt());
      if (success) {
        message.success('WKT string copied successfully');
      } else {
        message.error('Failed to copy WKT string');
      }
    } catch (err) {
      message.error('Failed to copy WKT string');
    }
  }, [mapCtrl]);

  const unselected = useCallback(() => {
    if (mapCtrl.selectedEntity) {
      mapCtrl.selectedEntity = null;
      mapCtrl.resetPointsStyle();
      render();
    }
  }, [mapCtrl, render]);

  const makePolygon = useCallback(() => {
    if (mapCtrl.hasAimPolygon()) {
      return;
    }
    commandHistory.executeCommand(new MakePolygonCommand(mapCtrl));
    render();
  }, [mapCtrl, commandHistory, render]);

  const addPoint = useCallback((cartesian: Cartesian3) => {
    const command = new AddPointCommand(mapCtrl, cartesian);
    commandHistory.executeCommand(command);
    render();
  }, [mapCtrl, commandHistory, render]);

  const movePoint = useCallback((cartesian: Cartesian3) => {
    if (!mapCtrl.mouseHoldEntity || !mapCtrl.moveBeforeCartesian) {
      return;
    }
    commandHistory.executeCommand(
      new MovePointCommand(
        mapCtrl,
        mapCtrl.mouseHoldEntity,
        mapCtrl.moveBeforeCartesian,
        cartesian
      )
    );
    render();
  }, [mapCtrl, commandHistory, render]);

  // Return methods for external use
  return {
    undo,
    redo,
    toCenter,
    deletePoint,
    copyWKTString,
    unselected,
    makePolygon,
    addPoint,
    movePoint
  };
};