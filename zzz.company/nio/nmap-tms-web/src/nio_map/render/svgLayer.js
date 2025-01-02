import { SVG, LatLng } from 'leaflet';
import { geoTransform, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import { TileStyle, getDomId } from '../data/style';
import { PopUpFactory } from './popup';

export class SvgLayer extends SVG {
  constructor(context, mapState) {
    super();
    this.context = context;
    this.mapState = mapState;
    this.style = new TileStyle(context);
    this.popupModal = new PopUpFactory(context);
    this.cacheCenterTile = {};
  }

  _getPath() {
    const map = this.context.lmap;
    function projectPoint(x, y) {
      const point = map.latLngToLayerPoint(new LatLng(y, x));
      this.stream.point(point.x, point.y);
    }
    const transform = geoTransform({ point: projectPoint });
    const path = geoPath().projection(transform);
    return path;
  }

  _getTilePath() {
    const path = this._getPath();
    const cache = {};
    const svgpath = function (tile) {
      if (tile.id in cache) {
        return cache[tile.id];
      }
      return cache[tile.id] = path(tile.asGeoJSON());
    };

    svgpath.geojson = function (d) {
      if (d.__featurehash__ !== undefined) {
        if (d.__featurehash__ in cache) {
          return cache[d.__featurehash__];
        }
        return cache[d.__featurehash__] = path(d);
      }
      return path(d);
    };

    return svgpath;
  }

  _getTileCenterCoord(d) {
    if (this.cacheCenterTile[d.id] === undefined) {
      const map = this.context.lmap;
      const coord = map.latLngToLayerPoint(d.getCenter());
      this.cacheCenterTile[d.id] = coord;
    }
    return this.cacheCenterTile[d.id];
  }

  _update() {
    super._update();
  }

  _updatePath() {
    const path = this._getPath();
    select(this._container)
      .selectAll('path')
      .attr('d', path);
  }

  _updateTiles() {
    const path = this._getTilePath();
    select(this._container)
      .selectAll('path')
      .attr('d', path);

    select(this._container)
      .selectAll('rect')
      .attr('x', (d) => {
        const coord = this._getTileCenterCoord(d);
        const pathCoords = path(d);
        const { width } = this.getRectWidthHeight(pathCoords);
        return coord.x - width / 2;
      })
      .attr('y', (d) => {
        const coord = this._getTileCenterCoord(d);
        const pathCoords = path(d);
        const { height } = this.getRectWidthHeight(pathCoords);
        return coord.y - height / 2;
      })
      .attr('width', (d) => {
        const pathCoords = path(d);
        const { width } = this.getRectWidthHeight(pathCoords);
        return width;
      })
      .attr('height', (d) => {
        const pathCoords = path(d);
        const { height } = this.getRectWidthHeight(pathCoords);
        return height;
      });
  }

  updateSelectTiles(selectId, isSelected) {
    const container = select(this._container);

    container.selectAll(`#${getDomId(selectId)}-rect`)
      .classed('meshSelected', isSelected)
      .raise();
  }

  setSelectId(selectId) {
    select(this._container)
      .selectAll('.selected')
      .classed('selected', false);

    const container = select(this._container);

    container.selectAll(`#${[getDomId(selectId), 'rect'].join('-')}`)
      .classed('selected', true)
      .raise();
  }

  setVersion1Tiles(tiles, isSelected) {
    const container = select(this._container);
    tiles.forEach((tileId) => {
      container.selectAll(`#${getDomId(tileId)}-rect`)
      .classed('version1', isSelected)
      .raise();
    })
  }

  setVersion2Tiles(tiles, isSelected) {
    const container = select(this._container);
    tiles.forEach((tileId) => {
      container.selectAll(`#${getDomId(tileId)}-rect`)
      .classed('version2', isSelected)
      .raise();
    })
  }


  renderTiles(tiles) {
    this.cacheCenterTile = {};
    const state = this.mapState;
    const updateData = select(this._container).selectAll('path')
      .data(tiles, tile => tile.renderId);
    const { dataManager } = this.context;
    const { popupModal } = this;
    updateData
      .exit()
      .remove();

    const enterels = updateData.enter()
      .append('path')
      .attr('style', (d) => {
        const legend = this.style.getStyle(d);
        return  legend ? `fill: ${legend.color};fill-opacity:0.8;` : '';
      })
      .attr('class', (d) => {
        const selected = (d.id === dataManager.selectId);
        return `tile ${selected === true ? 'selected' : ''}`;
      })
      .attr('id', d => getDomId(d.id, d));

    enterels
      .append('title')
      .html((d) => {
        const legend = this.style.getStyle(d);
        return `编号:${d.id}\r\n状态:${legend.label}`;
      });

    enterels.on('mousedown', function (d) {
      const tile = this.__data__;
      if (!d.altKey) {
        tile.mouse = [d.screenX, d.screenY];
        return;
      }
      if (state === 2) {
        // 编辑Map，支持选中操作
        tile.meshSelected = !dataManager.selectIds.includes(tile.id);
      }
    }).on('mouseup', function (d) {
      const tile = this.__data__;
      const { mouse, meshSelected } = tile;
      if ((!d.altKey && tile.id === dataManager.selectId)) {
        return;
      }
      if (!d.altKey && mouse) {
        const currentMouse = [d.screenX, d.screenY];
        if (Math.abs(currentMouse[0] - mouse[0]) <= 3
         && Math.abs(currentMouse[1] - mouse[1]) <= 3) {
          popupModal.close();
          dataManager.setSelectId(tile.id);
          popupModal.showup(tile);
        }
      }
      if (d.altKey && state === 2) {
        dataManager.updateSelectTiles(tile.id, meshSelected);
      }
    });

    const rectData = select(this._container).selectAll('rect')
      .data(tiles, tile => tile.renderId);
    rectData
      .exit()
      .remove();
    rectData.enter()
      .append('rect')
      .attr('class', 'stateRect')
      .attr('class', d => this.getRectClass(dataManager,d))
      .attr('id', d => [getDomId(d.id, d), 'rect'].join('-'));

    this._updateTiles();
  }

  getRectClass(dataManager, tile) {
    let rectClass = 'tile';
    if (dataManager.selectIds.includes(tile.id)) {
      rectClass += ' meshSelected';
    }
    if (dataManager.version1Tiles.includes(tile.id)) {
      rectClass += ' version1';
    }
    if (dataManager.version2Tiles.includes(tile.id)) {
      rectClass += ' version2';
    }
    return rectClass;
  }
  getCircleRadius(pathCoordStr) {
    const dataArr = pathCoordStr.slice(1, -1).split('L')
      .map(item => item.split(','));
    function getDiameter(a, b) {
      let poor = a - b;
      poor = poor > 0 ? poor : -poor;
      return poor;
    }
    const diameterX = getDiameter(+dataArr[1][0], +dataArr[0][0]);
    const diameterY = getDiameter(+dataArr[1][1], +dataArr[2][1]);
    const r = diameterX < diameterY ? diameterX : diameterY;
    return r * 0.32;
  }

  getRectWidthHeight(pathCoordStr) {
    const dataArr = pathCoordStr.slice(1, -1).split('L')
      .map(item => item.split(','));
    function getDiameter(a, b) {
      let poor = a - b;
      poor = poor > 0 ? poor : -poor;
      return poor;
    }
    const diameterX = getDiameter(+dataArr[1][0], +dataArr[0][0]);
    const diameterY = getDiameter(+dataArr[1][1], +dataArr[2][1]);
    const offset = 3;
    const width = Math.min(diameterX, diameterY) - offset;
    const height = Math.max(diameterX, diameterY) - offset;
    return { width, height };
  }

  transformCircleData(d, i, nodes) {
    const dataArr = nodes[i]?.attributes.d.nodeValue.slice(1, -1).split('L')
      .map(item => item.split(','));
    function getDiameter(a, b) {
      let poor = a - b;
      poor = poor > 0 ? poor : -poor;
      return poor;
    }
    const diameterX = getDiameter(+dataArr[1][0], +dataArr[0][0]);
    const diameterY = getDiameter(+dataArr[1][1], +dataArr[2][1]);
    const r = diameterX < diameterY ? diameterX : diameterY;
    const cx = +dataArr[0][0] + diameterX * 0.5;
    const cy = +dataArr[0][1] - diameterY * 0.5;
    return {
      cx,
      cy,
      r: r * 0.4,
    };
  }

  renderGeoJson(datas) {
    select(this._container).selectAll('path')
      .data(datas.features)
      .enter()
      .append('path');
    this._update();
  }
}
