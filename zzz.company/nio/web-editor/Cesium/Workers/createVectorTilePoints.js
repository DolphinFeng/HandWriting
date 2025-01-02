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
define(["./AttributeCompression-e1245712","./Matrix2-387f8f26","./ComponentDatatype-db8f58a6","./createTaskProcessorWorker","./defaultValue-89a13f50","./RuntimeError-7605ca09","./WebGLConstants-eaab9970"],(function(e,a,t,r,n,o,i){"use strict";const s=32767,c=new a.Cartographic,u=new a.Cartesian3,p=new a.Rectangle,l=new a.Ellipsoid,f={min:void 0,max:void 0};return r((function(r,n){const o=new Uint16Array(r.positions);!function(e){e=new Float64Array(e);let t=0;f.min=e[t++],f.max=e[t++],a.Rectangle.unpack(e,t,p),t+=a.Rectangle.packedLength,a.Ellipsoid.unpack(e,t,l)}(r.packedBuffer);const i=p,m=l,h=f.min,C=f.max,d=o.length/3,g=o.subarray(0,d),b=o.subarray(d,2*d),w=o.subarray(2*d,3*d);e.AttributeCompression.zigZagDeltaDecode(g,b,w);const k=new Float64Array(o.length);for(let e=0;e<d;++e){const r=g[e],n=b[e],o=w[e],p=t.CesiumMath.lerp(i.west,i.east,r/s),l=t.CesiumMath.lerp(i.south,i.north,n/s),f=t.CesiumMath.lerp(h,C,o/s),d=a.Cartographic.fromRadians(p,l,f,c),y=m.cartographicToCartesian(d,u);a.Cartesian3.pack(y,k,3*e)}return n.push(k.buffer),{positions:k.buffer}}))}));
