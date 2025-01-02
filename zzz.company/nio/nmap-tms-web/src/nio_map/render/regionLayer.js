import { LayerGroup, Polygon, Marker, DivIcon } from 'leaflet';
// eslint-disable-next-line no-unused-vars
import { getCenter, getClipedCenter } from '../geo/geo';

export class RegionLayer extends LayerGroup {
  constructor(context) {
    super();
    this.context = context;
    this.regionData = [];
    this.regionMarkers = new Map();
    this.regionEdges = new Map();
    this.displayMarkers = new Map();
    this.displayEdges = new Map();
    this.options = this.options || {};
  }

  init(regionData) {
    this.setRegionData(regionData);
    this.render();
    this.renderText();
  }

  render() {
    if (this.regionData.length === 0) return;
    const displayIds = this.displayEdges.keys();
    if (displayIds.length !== 0) {
      for (const id of displayIds) {
        const edge = this.displayEdges.get(id);
        this.displayMarkers.delete(id);
        this.removeLayer(edge.regionPolygon);
      }
    }
    const layerIds = this.regionEdges.keys();
    for (const id of layerIds) {
      const layer = this.regionEdges.get(id);
      if (layer.display) {
        this.addLayer(layer.regionPolygon);
        this.displayEdges.set(id, layer);
      }
    }
    this.addTo(this.context.lmap);
  }

  renderText() {
    if (this.regionData.length === 0) return;
    const displayIds = this.displayMarkers.keys();
    if (displayIds.length !== 0) {
      for (const id of displayIds) {
        const marker = this.displayMarkers.get(id);
        this.displayMarkers.delete(id);
        this.removeLayer(marker.regionMarker);
      }
    }
    const bounds = this.context.lmap.getBounds();
    const layerIds = this.regionMarkers.keys();
    for (const id of layerIds) {
      const layer = this.regionMarkers.get(id);
      const layerData = this.regionData.find(item => item.id === id);
      if (layer.display) {
        this.updateCenter(layer, layerData.polygon, bounds);
        this.addLayer(layer.regionMarker);
        this.displayMarkers.set(id, layer);
      }
    }
  }

  updateCenter(layer, polygon, bounds) {
    const center = getClipedCenter(polygon, bounds);
    if (center.length) {
      layer.regionMarker.setLatLng(center);
    }
  }

  setRegionData(data) {
    this.regionData = data;
    for (const layer of this.regionData) {
      const { id, label, polygon, display } = layer;
      const regionPolygon = new Polygon(polygon, {
        color: '#FF0000',
        fillOpacity: 0.065,
      });
      this.regionEdges.set(id, {
        id,
        regionPolygon,
        display,
      });

      const center = getCenter(polygon);
      const regionText = new DivIcon({
        html: label,
        className: 'region-text',
        iconSize: [245, 84],
        id,
      });
      const regionMarker = new Marker(center, { icon: regionText });
      this.regionMarkers.set(id, {
        id,
        regionMarker,
        display,
      });
    }
  }

  setLayer(id) {
    const edgeLayer = this.regionEdges.get(id);
    const markerLayer = this.regionMarkers.get(id);
    const layerData = this.regionData.find(item => item.id === id);
    if (layerData.display) {
      this.addLayer(edgeLayer.regionPolygon);
      this.addLayer(markerLayer.regionMarker);
      edgeLayer.display = true;
      markerLayer.display = true;
      const bounds = this.context.lmap.getBounds();
      this.updateCenter(markerLayer, layerData.polygon, bounds);
      this.displayEdges.set(id, edgeLayer);
      this.displayMarkers.set(id, markerLayer);
    } else {
      this.removeLayer(edgeLayer.regionPolygon);
      this.removeLayer(markerLayer.regionMarker);
      edgeLayer.display = false;
      markerLayer.display = false;
      this.displayEdges.delete(id);
      this.displayMarkers.delete(id);
    }
  }
}
