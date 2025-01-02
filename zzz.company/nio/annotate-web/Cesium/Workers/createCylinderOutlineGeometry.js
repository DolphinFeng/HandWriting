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
define(["./Transforms-a9503dfe","./Matrix2-387f8f26","./ComponentDatatype-db8f58a6","./CylinderGeometryLibrary-5a8f960b","./defaultValue-89a13f50","./GeometryAttribute-c28edea0","./GeometryAttributes-e846f617","./GeometryOffsetAttribute-85bee275","./IndexDatatype-55faa54f","./combine-cab8776d","./RuntimeError-7605ca09","./WebGLConstants-eaab9970"],(function(t,e,i,n,o,a,r,s,u,f,d,c){"use strict";const l=new e.Cartesian2;function m(t){const e=(t=o.defaultValue(t,o.defaultValue.EMPTY_OBJECT)).length,i=t.topRadius,n=t.bottomRadius,a=o.defaultValue(t.slices,128),r=Math.max(o.defaultValue(t.numberOfVerticalLines,16),0);this._length=e,this._topRadius=i,this._bottomRadius=n,this._slices=a,this._numberOfVerticalLines=r,this._offsetAttribute=t.offsetAttribute,this._workerName="createCylinderOutlineGeometry"}m.packedLength=6,m.pack=function(t,e,i){return i=o.defaultValue(i,0),e[i++]=t._length,e[i++]=t._topRadius,e[i++]=t._bottomRadius,e[i++]=t._slices,e[i++]=t._numberOfVerticalLines,e[i]=o.defaultValue(t._offsetAttribute,-1),e};const b={length:void 0,topRadius:void 0,bottomRadius:void 0,slices:void 0,numberOfVerticalLines:void 0,offsetAttribute:void 0};return m.unpack=function(t,e,i){e=o.defaultValue(e,0);const n=t[e++],a=t[e++],r=t[e++],s=t[e++],u=t[e++],f=t[e];return o.defined(i)?(i._length=n,i._topRadius=a,i._bottomRadius=r,i._slices=s,i._numberOfVerticalLines=u,i._offsetAttribute=-1===f?void 0:f,i):(b.length=n,b.topRadius=a,b.bottomRadius=r,b.slices=s,b.numberOfVerticalLines=u,b.offsetAttribute=-1===f?void 0:f,new m(b))},m.createGeometry=function(f){let d=f._length;const c=f._topRadius,m=f._bottomRadius,b=f._slices,p=f._numberOfVerticalLines;if(d<=0||c<0||m<0||0===c&&0===m)return;const y=2*b,_=n.CylinderGeometryLibrary.computePositions(d,c,m,b,!1);let h,A=2*b;if(p>0){const t=Math.min(p,b);h=Math.round(b/t),A+=t}const R=u.IndexDatatype.createTypedArray(y,2*A);let G,O=0;for(G=0;G<b-1;G++)R[O++]=G,R[O++]=G+1,R[O++]=G+b,R[O++]=G+1+b;if(R[O++]=b-1,R[O++]=0,R[O++]=b+b-1,R[O++]=b,p>0)for(G=0;G<b;G+=h)R[O++]=G,R[O++]=G+b;const V=new r.GeometryAttributes;V.position=new a.GeometryAttribute({componentDatatype:i.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:_}),l.x=.5*d,l.y=Math.max(m,c);const L=new t.BoundingSphere(e.Cartesian3.ZERO,e.Cartesian2.magnitude(l));if(o.defined(f._offsetAttribute)){d=_.length;const t=f._offsetAttribute===s.GeometryOffsetAttribute.NONE?0:1,e=new Uint8Array(d/3).fill(t);V.applyOffset=new a.GeometryAttribute({componentDatatype:i.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:e})}return new a.Geometry({attributes:V,indices:R,primitiveType:a.PrimitiveType.LINES,boundingSphere:L,offsetAttribute:f._offsetAttribute})},function(t,e){return o.defined(e)&&(t=m.unpack(t,e)),m.createGeometry(t)}}));
