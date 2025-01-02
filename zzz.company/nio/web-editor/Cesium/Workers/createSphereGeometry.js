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
define(["./defaultValue-89a13f50","./Matrix2-387f8f26","./EllipsoidGeometry-554694b1","./VertexFormat-ea5ac67a","./ComponentDatatype-db8f58a6","./WebGLConstants-eaab9970","./RuntimeError-7605ca09","./Transforms-a9503dfe","./combine-cab8776d","./GeometryAttribute-c28edea0","./GeometryAttributes-e846f617","./GeometryOffsetAttribute-85bee275","./IndexDatatype-55faa54f"],(function(e,t,i,r,a,o,n,s,c,d,l,m,u){"use strict";function p(r){const a=e.defaultValue(r.radius,1),o={radii:new t.Cartesian3(a,a,a),stackPartitions:r.stackPartitions,slicePartitions:r.slicePartitions,vertexFormat:r.vertexFormat};this._ellipsoidGeometry=new i.EllipsoidGeometry(o),this._workerName="createSphereGeometry"}p.packedLength=i.EllipsoidGeometry.packedLength,p.pack=function(e,t,r){return i.EllipsoidGeometry.pack(e._ellipsoidGeometry,t,r)};const f=new i.EllipsoidGeometry,y={radius:void 0,radii:new t.Cartesian3,vertexFormat:new r.VertexFormat,stackPartitions:void 0,slicePartitions:void 0};return p.unpack=function(a,o,n){const s=i.EllipsoidGeometry.unpack(a,o,f);return y.vertexFormat=r.VertexFormat.clone(s._vertexFormat,y.vertexFormat),y.stackPartitions=s._stackPartitions,y.slicePartitions=s._slicePartitions,e.defined(n)?(t.Cartesian3.clone(s._radii,y.radii),n._ellipsoidGeometry=new i.EllipsoidGeometry(y),n):(y.radius=s._radii.x,new p(y))},p.createGeometry=function(e){return i.EllipsoidGeometry.createGeometry(e._ellipsoidGeometry)},function(t,i){return e.defined(i)&&(t=p.unpack(t,i)),p.createGeometry(t)}}));
