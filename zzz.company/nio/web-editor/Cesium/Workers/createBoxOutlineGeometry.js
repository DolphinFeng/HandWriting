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
define(["./Transforms-a9503dfe","./Matrix2-387f8f26","./ComponentDatatype-db8f58a6","./defaultValue-89a13f50","./GeometryAttribute-c28edea0","./GeometryAttributes-e846f617","./GeometryOffsetAttribute-85bee275","./combine-cab8776d","./RuntimeError-7605ca09","./WebGLConstants-eaab9970"],(function(e,t,n,a,i,r,u,o,s,m){"use strict";const f=new t.Cartesian3;function c(e){const n=(e=a.defaultValue(e,a.defaultValue.EMPTY_OBJECT)).minimum,i=e.maximum;this._min=t.Cartesian3.clone(n),this._max=t.Cartesian3.clone(i),this._offsetAttribute=e.offsetAttribute,this._workerName="createBoxOutlineGeometry"}c.fromDimensions=function(e){const n=(e=a.defaultValue(e,a.defaultValue.EMPTY_OBJECT)).dimensions,i=t.Cartesian3.multiplyByScalar(n,.5,new t.Cartesian3);return new c({minimum:t.Cartesian3.negate(i,new t.Cartesian3),maximum:i,offsetAttribute:e.offsetAttribute})},c.fromAxisAlignedBoundingBox=function(e){return new c({minimum:e.minimum,maximum:e.maximum})},c.packedLength=2*t.Cartesian3.packedLength+1,c.pack=function(e,n,i){return i=a.defaultValue(i,0),t.Cartesian3.pack(e._min,n,i),t.Cartesian3.pack(e._max,n,i+t.Cartesian3.packedLength),n[i+2*t.Cartesian3.packedLength]=a.defaultValue(e._offsetAttribute,-1),n};const d=new t.Cartesian3,p=new t.Cartesian3,l={minimum:d,maximum:p,offsetAttribute:void 0};return c.unpack=function(e,n,i){n=a.defaultValue(n,0);const r=t.Cartesian3.unpack(e,n,d),u=t.Cartesian3.unpack(e,n+t.Cartesian3.packedLength,p),o=e[n+2*t.Cartesian3.packedLength];return a.defined(i)?(i._min=t.Cartesian3.clone(r,i._min),i._max=t.Cartesian3.clone(u,i._max),i._offsetAttribute=-1===o?void 0:o,i):(l.offsetAttribute=-1===o?void 0:o,new c(l))},c.createGeometry=function(o){const s=o._min,m=o._max;if(t.Cartesian3.equals(s,m))return;const c=new r.GeometryAttributes,d=new Uint16Array(24),p=new Float64Array(24);p[0]=s.x,p[1]=s.y,p[2]=s.z,p[3]=m.x,p[4]=s.y,p[5]=s.z,p[6]=m.x,p[7]=m.y,p[8]=s.z,p[9]=s.x,p[10]=m.y,p[11]=s.z,p[12]=s.x,p[13]=s.y,p[14]=m.z,p[15]=m.x,p[16]=s.y,p[17]=m.z,p[18]=m.x,p[19]=m.y,p[20]=m.z,p[21]=s.x,p[22]=m.y,p[23]=m.z,c.position=new i.GeometryAttribute({componentDatatype:n.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:p}),d[0]=4,d[1]=5,d[2]=5,d[3]=6,d[4]=6,d[5]=7,d[6]=7,d[7]=4,d[8]=0,d[9]=1,d[10]=1,d[11]=2,d[12]=2,d[13]=3,d[14]=3,d[15]=0,d[16]=0,d[17]=4,d[18]=1,d[19]=5,d[20]=2,d[21]=6,d[22]=3,d[23]=7;const l=t.Cartesian3.subtract(m,s,f),y=.5*t.Cartesian3.magnitude(l);if(a.defined(o._offsetAttribute)){const e=p.length,t=o._offsetAttribute===u.GeometryOffsetAttribute.NONE?0:1,a=new Uint8Array(e/3).fill(t);c.applyOffset=new i.GeometryAttribute({componentDatatype:n.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:a})}return new i.Geometry({attributes:c,indices:d,primitiveType:i.PrimitiveType.LINES,boundingSphere:new e.BoundingSphere(t.Cartesian3.ZERO,y),offsetAttribute:o._offsetAttribute})},function(e,t){return a.defined(t)&&(e=c.unpack(e,t)),c.createGeometry(e)}}));
