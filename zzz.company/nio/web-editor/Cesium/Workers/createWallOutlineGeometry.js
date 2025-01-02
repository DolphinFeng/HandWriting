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
define(["./defaultValue-89a13f50","./Matrix2-387f8f26","./Transforms-a9503dfe","./ComponentDatatype-db8f58a6","./GeometryAttribute-c28edea0","./GeometryAttributes-e846f617","./IndexDatatype-55faa54f","./WallGeometryLibrary-1845f717","./RuntimeError-7605ca09","./combine-cab8776d","./WebGLConstants-eaab9970","./arrayRemoveDuplicates-d98580c0","./PolylinePipeline-fdd56eba","./EllipsoidGeodesic-ddfdc0e2","./EllipsoidRhumbLine-3a0dd668","./IntersectionTests-a10643a2","./Plane-b9e7006f"],(function(e,i,t,n,a,o,s,r,l,d,m,u,p,c,f,h,g){"use strict";const y=new i.Cartesian3,_=new i.Cartesian3;function E(t){const a=(t=e.defaultValue(t,e.defaultValue.EMPTY_OBJECT)).positions,o=t.maximumHeights,s=t.minimumHeights,r=e.defaultValue(t.granularity,n.CesiumMath.RADIANS_PER_DEGREE),l=e.defaultValue(t.ellipsoid,i.Ellipsoid.WGS84);this._positions=a,this._minimumHeights=s,this._maximumHeights=o,this._granularity=r,this._ellipsoid=i.Ellipsoid.clone(l),this._workerName="createWallOutlineGeometry";let d=1+a.length*i.Cartesian3.packedLength+2;e.defined(s)&&(d+=s.length),e.defined(o)&&(d+=o.length),this.packedLength=d+i.Ellipsoid.packedLength+1}E.pack=function(t,n,a){let o;a=e.defaultValue(a,0);const s=t._positions;let r=s.length;for(n[a++]=r,o=0;o<r;++o,a+=i.Cartesian3.packedLength)i.Cartesian3.pack(s[o],n,a);const l=t._minimumHeights;if(r=e.defined(l)?l.length:0,n[a++]=r,e.defined(l))for(o=0;o<r;++o)n[a++]=l[o];const d=t._maximumHeights;if(r=e.defined(d)?d.length:0,n[a++]=r,e.defined(d))for(o=0;o<r;++o)n[a++]=d[o];return i.Ellipsoid.pack(t._ellipsoid,n,a),n[a+=i.Ellipsoid.packedLength]=t._granularity,n};const C=i.Ellipsoid.clone(i.Ellipsoid.UNIT_SPHERE),H={positions:void 0,minimumHeights:void 0,maximumHeights:void 0,ellipsoid:C,granularity:void 0};return E.unpack=function(t,n,a){let o;n=e.defaultValue(n,0);let s=t[n++];const r=new Array(s);for(o=0;o<s;++o,n+=i.Cartesian3.packedLength)r[o]=i.Cartesian3.unpack(t,n);let l,d;if(s=t[n++],s>0)for(l=new Array(s),o=0;o<s;++o)l[o]=t[n++];if(s=t[n++],s>0)for(d=new Array(s),o=0;o<s;++o)d[o]=t[n++];const m=i.Ellipsoid.unpack(t,n,C),u=t[n+=i.Ellipsoid.packedLength];return e.defined(a)?(a._positions=r,a._minimumHeights=l,a._maximumHeights=d,a._ellipsoid=i.Ellipsoid.clone(m,a._ellipsoid),a._granularity=u,a):(H.positions=r,H.minimumHeights=l,H.maximumHeights=d,H.granularity=u,new E(H))},E.fromConstantHeights=function(i){const t=(i=e.defaultValue(i,e.defaultValue.EMPTY_OBJECT)).positions;let n,a;const o=i.minimumHeight,s=i.maximumHeight,r=e.defined(o),l=e.defined(s);if(r||l){const e=t.length;n=r?new Array(e):void 0,a=l?new Array(e):void 0;for(let i=0;i<e;++i)r&&(n[i]=o),l&&(a[i]=s)}return new E({positions:t,maximumHeights:a,minimumHeights:n,ellipsoid:i.ellipsoid})},E.createGeometry=function(l){const d=l._positions,m=l._minimumHeights,u=l._maximumHeights,p=l._granularity,c=l._ellipsoid,f=r.WallGeometryLibrary.computePositions(c,d,u,m,p,!1);if(!e.defined(f))return;const h=f.bottomPositions,g=f.topPositions;let E=g.length,C=2*E;const H=new Float64Array(C);let b,A=0;for(E/=3,b=0;b<E;++b){const e=3*b,t=i.Cartesian3.fromArray(g,e,y),n=i.Cartesian3.fromArray(h,e,_);H[A++]=n.x,H[A++]=n.y,H[A++]=n.z,H[A++]=t.x,H[A++]=t.y,H[A++]=t.z}const k=new o.GeometryAttributes({position:new a.GeometryAttribute({componentDatatype:n.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:H})}),w=C/3;C=2*w-4+w;const x=s.IndexDatatype.createTypedArray(w,C);let G=0;for(b=0;b<w-2;b+=2){const e=b,t=b+2,a=i.Cartesian3.fromArray(H,3*e,y),o=i.Cartesian3.fromArray(H,3*t,_);if(i.Cartesian3.equalsEpsilon(a,o,n.CesiumMath.EPSILON10))continue;const s=b+1,r=b+3;x[G++]=s,x[G++]=e,x[G++]=s,x[G++]=r,x[G++]=e,x[G++]=t}return x[G++]=w-2,x[G++]=w-1,new a.Geometry({attributes:k,indices:x,primitiveType:a.PrimitiveType.LINES,boundingSphere:new t.BoundingSphere.fromVertices(H)})},function(t,n){return e.defined(n)&&(t=E.unpack(t,n)),t._ellipsoid=i.Ellipsoid.clone(t._ellipsoid),E.createGeometry(t)}}));
