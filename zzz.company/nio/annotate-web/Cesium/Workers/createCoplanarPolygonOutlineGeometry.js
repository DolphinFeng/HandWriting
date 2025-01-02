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
define(["./arrayRemoveDuplicates-d98580c0","./Transforms-a9503dfe","./Matrix2-387f8f26","./ComponentDatatype-db8f58a6","./CoplanarPolygonGeometryLibrary-aa797c27","./defaultValue-89a13f50","./GeometryAttribute-c28edea0","./GeometryAttributes-e846f617","./GeometryInstance-20fd3f13","./GeometryPipeline-9529e1f5","./IndexDatatype-55faa54f","./PolygonGeometryLibrary-296dd897","./combine-cab8776d","./RuntimeError-7605ca09","./WebGLConstants-eaab9970","./OrientedBoundingBox-4f3ae27b","./EllipsoidTangentPlane-cb71dfd6","./AxisAlignedBoundingBox-5ca65eba","./IntersectionTests-a10643a2","./Plane-b9e7006f","./AttributeCompression-e1245712","./EncodedCartesian3-da50618b","./ArcType-dff9a34b","./EllipsoidRhumbLine-3a0dd668","./PolygonPipeline-df76932b"],(function(e,t,n,o,r,i,a,y,l,s,c,u,p,d,f,m,g,b,h,P,G,L,C,T,E){"use strict";function A(e){const t=e.length,n=new Float64Array(3*t),r=c.IndexDatatype.createTypedArray(t,2*t);let i=0,l=0;for(let o=0;o<t;o++){const a=e[o];n[i++]=a.x,n[i++]=a.y,n[i++]=a.z,r[l++]=o,r[l++]=(o+1)%t}const s=new y.GeometryAttributes({position:new a.GeometryAttribute({componentDatatype:o.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:n})});return new a.Geometry({attributes:s,indices:r,primitiveType:a.PrimitiveType.LINES})}function H(e){const t=(e=i.defaultValue(e,i.defaultValue.EMPTY_OBJECT)).polygonHierarchy;this._polygonHierarchy=t,this._workerName="createCoplanarPolygonOutlineGeometry",this.packedLength=u.PolygonGeometryLibrary.computeHierarchyPackedLength(t,n.Cartesian3)+1}H.fromPositions=function(e){return new H({polygonHierarchy:{positions:(e=i.defaultValue(e,i.defaultValue.EMPTY_OBJECT)).positions}})},H.pack=function(e,t,o){return o=i.defaultValue(o,0),t[o=u.PolygonGeometryLibrary.packPolygonHierarchy(e._polygonHierarchy,t,o,n.Cartesian3)]=e.packedLength,t};const k={polygonHierarchy:{}};return H.unpack=function(e,t,o){t=i.defaultValue(t,0);const r=u.PolygonGeometryLibrary.unpackPolygonHierarchy(e,t,n.Cartesian3);t=r.startingIndex,delete r.startingIndex;const a=e[t];return i.defined(o)||(o=new H(k)),o._polygonHierarchy=r,o.packedLength=a,o},H.createGeometry=function(o){const i=o._polygonHierarchy;let y=i.positions;if(y=e.arrayRemoveDuplicates(y,n.Cartesian3.equalsEpsilon,!0),y.length<3)return;if(!r.CoplanarPolygonGeometryLibrary.validOutline(y))return;const c=u.PolygonGeometryLibrary.polygonOutlinesFromHierarchy(i,!1);if(0===c.length)return;const p=[];for(let e=0;e<c.length;e++){const t=new l.GeometryInstance({geometry:A(c[e])});p.push(t)}const d=s.GeometryPipeline.combineInstances(p)[0],f=t.BoundingSphere.fromPoints(i.positions);return new a.Geometry({attributes:d.attributes,indices:d.indices,primitiveType:d.primitiveType,boundingSphere:f})},function(e,t){return i.defined(t)&&(e=H.unpack(e,t)),e._ellipsoid=n.Ellipsoid.clone(e._ellipsoid),H.createGeometry(e)}}));
