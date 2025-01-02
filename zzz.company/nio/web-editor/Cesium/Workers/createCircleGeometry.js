/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.98.1
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */
define(["./Matrix2-387f8f26","./defaultValue-89a13f50","./EllipseGeometry-02a03088","./VertexFormat-ea5ac67a","./ComponentDatatype-db8f58a6","./WebGLConstants-eaab9970","./RuntimeError-7605ca09","./Transforms-a9503dfe","./combine-cab8776d","./EllipseGeometryLibrary-cc8ef452","./GeometryAttribute-c28edea0","./GeometryAttributes-e846f617","./GeometryInstance-20fd3f13","./GeometryOffsetAttribute-85bee275","./GeometryPipeline-9529e1f5","./AttributeCompression-e1245712","./EncodedCartesian3-da50618b","./IndexDatatype-55faa54f","./IntersectionTests-a10643a2","./Plane-b9e7006f"],(function(e,t,i,r,o,a,n,s,l,m,d,u,c,p,y,_,G,x,f,h){"use strict";function g(e){const r=(e=t.defaultValue(e,t.defaultValue.EMPTY_OBJECT)).radius,o={center:e.center,semiMajorAxis:r,semiMinorAxis:r,ellipsoid:e.ellipsoid,height:e.height,extrudedHeight:e.extrudedHeight,granularity:e.granularity,vertexFormat:e.vertexFormat,stRotation:e.stRotation,shadowVolume:e.shadowVolume};this._ellipseGeometry=new i.EllipseGeometry(o),this._workerName="createCircleGeometry"}g.packedLength=i.EllipseGeometry.packedLength,g.pack=function(e,t,r){return i.EllipseGeometry.pack(e._ellipseGeometry,t,r)};const E=new i.EllipseGeometry({center:new e.Cartesian3,semiMajorAxis:1,semiMinorAxis:1}),w={center:new e.Cartesian3,radius:void 0,ellipsoid:e.Ellipsoid.clone(e.Ellipsoid.UNIT_SPHERE),height:void 0,extrudedHeight:void 0,granularity:void 0,vertexFormat:new r.VertexFormat,stRotation:void 0,semiMajorAxis:void 0,semiMinorAxis:void 0,shadowVolume:void 0};return g.unpack=function(o,a,n){const s=i.EllipseGeometry.unpack(o,a,E);return w.center=e.Cartesian3.clone(s._center,w.center),w.ellipsoid=e.Ellipsoid.clone(s._ellipsoid,w.ellipsoid),w.height=s._height,w.extrudedHeight=s._extrudedHeight,w.granularity=s._granularity,w.vertexFormat=r.VertexFormat.clone(s._vertexFormat,w.vertexFormat),w.stRotation=s._stRotation,w.shadowVolume=s._shadowVolume,t.defined(n)?(w.semiMajorAxis=s._semiMajorAxis,w.semiMinorAxis=s._semiMinorAxis,n._ellipseGeometry=new i.EllipseGeometry(w),n):(w.radius=s._semiMajorAxis,new g(w))},g.createGeometry=function(e){return i.EllipseGeometry.createGeometry(e._ellipseGeometry)},g.createShadowVolume=function(e,t,i){const o=e._ellipseGeometry._granularity,a=e._ellipseGeometry._ellipsoid,n=t(o,a),s=i(o,a);return new g({center:e._ellipseGeometry._center,radius:e._ellipseGeometry._semiMajorAxis,ellipsoid:a,stRotation:e._ellipseGeometry._stRotation,granularity:o,extrudedHeight:n,height:s,vertexFormat:r.VertexFormat.POSITION_ONLY,shadowVolume:!0})},Object.defineProperties(g.prototype,{rectangle:{get:function(){return this._ellipseGeometry.rectangle}},textureCoordinateRotationPoints:{get:function(){return this._ellipseGeometry.textureCoordinateRotationPoints}}}),function(i,r){return t.defined(r)&&(i=g.unpack(i,r)),i._ellipseGeometry._center=e.Cartesian3.clone(i._ellipseGeometry._center),i._ellipseGeometry._ellipsoid=e.Ellipsoid.clone(i._ellipseGeometry._ellipsoid),g.createGeometry(i)}}));
