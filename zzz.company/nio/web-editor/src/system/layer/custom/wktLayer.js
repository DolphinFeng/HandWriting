import {
    Cartesian3, Color, ColorGeometryInstanceAttribute,
    GeometryInstance, Material,
    MaterialAppearance,
    PolygonGeometry,
    PolygonHierarchy, PolylineGeometry, PolylineMaterialAppearance,
    Primitive,
    PrimitiveCollection,
    Math as CMath
} from "cesium";
import {NioMessage, NioNotification} from "../../../utils/utils.js";
import {LayerStyle} from "../style/layerStyle.js";
import {createViewer} from "../../../cesium/initMap.js";
import {Layer} from "../Layer.js";

class WKTStyle extends LayerStyle{
    constructor() {
        super();
    }
}

export class WKTLayer extends Layer {
    locPos;
    polygonCoordinates = [];
    polylineCoordinates = [];
    viewer = createViewer();
    constructor(name, arr) {
        super(true, name, [], new PrimitiveCollection(), true, true);
        this.group(arr);
        this.asShape();
        this.initLocPos(arr[0].coordinates[0]);
    }

    initLocPos(array) {
        let sumX = 0, sumY = 0;
        for (let i = 0; i < array.length; i++) {
            sumX += array[i][0];
            sumY += array[i][1];
        }
        this.locPos = Cartesian3.fromDegrees(sumX / array.length, sumY / array.length, 500);
    }

    group(arr) {
        let shape;
        for (let i = 0; i < arr.length; i++) {
            shape = arr[i];
            switch (shape.type) {
                case 'Polygon':
                    this.polygonCoordinates.push(shape.coordinates[0]);
                    break;
                case 'Polyline':
                    this.polylineCoordinates.push(shape.coordinates[0]);
                    break;
                default:
                    NioNotification('warning', '暂不支持该类型', shape.type, 3000);
            }
        }
    }

    asShape() {
        const polygonInstances = [], polylineInstances = [];
        let coordinates;
        for (let i = 0; i < this.polygonCoordinates.length; i++) {
            coordinates = this.polygonCoordinates[i].map(item => {
                return Cartesian3.fromDegrees(item[0], item[1], 1);
            });
            polygonInstances.push(new GeometryInstance({
                geometry: new PolygonGeometry({
                    height: 0,
                    polygonHierarchy: new PolygonHierarchy(coordinates),
                }),
            }));
            polylineInstances.push(new GeometryInstance({
                geometry: new PolylineGeometry({
                    positions: coordinates,
                    width: 4,
                    vertexFormat: PolylineMaterialAppearance.VERTEX_FORMAT,
                }),
            }));
        }
        this.dataSource.add(new Primitive({
            geometryInstances: polygonInstances,
            appearance: new MaterialAppearance({
                material: Material.fromType('Color', {
                    color: Color.fromCssColorString('#409EFF'),
                }),
            }),
            releaseGeometryInstances: true,
            asynchronous: true,
            allowPicking: false,
        }));
        this.dataSource.add(new Primitive({
            geometryInstances: polylineInstances,
            appearance: new PolylineMaterialAppearance({
                material: Material.fromType('PolylineGlow', {
                    color: Color.ORANGERED,
                    glowPower: .2,
                    taperPower: 1,
                })
            }),
            asynchronous: true,
            allowPicking: false,
        }));
    }

    destroy() {
        super.destroy();
    }

    location() {
        this.viewer.camera.flyTo({
            destination: this.locPos,
            orientation: {
                heading: CMath.toRadians(0),
                pitch: CMath.toRadians(-90),
                roll: 0,
            },
            duration: 2,
        });
    }
}
