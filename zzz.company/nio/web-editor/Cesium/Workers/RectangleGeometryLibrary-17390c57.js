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
define(["exports","./Matrix2-387f8f26","./defaultValue-89a13f50","./Transforms-a9503dfe","./ComponentDatatype-db8f58a6"],(function(t,n,a,e,o){"use strict";const r=Math.cos,s=Math.sin,i=Math.sqrt,c={computePosition:function(t,n,e,o,c,g,u){const h=n.radiiSquared,l=t.nwCorner,C=t.boundingRectangle;let S=l.latitude-t.granYCos*o+c*t.granXSin;const d=r(S),w=s(S),M=h.z*w;let f=l.longitude+o*t.granYSin+c*t.granXCos;const X=d*r(f),Y=d*s(f),m=h.x*X,p=h.y*Y,x=i(m*X+p*Y+M*w);if(g.x=m/x,g.y=p/x,g.z=M/x,e){const n=t.stNwCorner;a.defined(n)?(S=n.latitude-t.stGranYCos*o+c*t.stGranXSin,f=n.longitude+o*t.stGranYSin+c*t.stGranXCos,u.x=(f-t.stWest)*t.lonScalar,u.y=(S-t.stSouth)*t.latScalar):(u.x=(f-C.west)*t.lonScalar,u.y=(S-C.south)*t.latScalar)}}},g=new n.Matrix2;let u=new n.Cartesian3;const h=new n.Cartographic;let l=new n.Cartesian3;const C=new e.GeographicProjection;function S(t,a,e,o,r,s,i){const c=Math.cos(a),h=o*c,S=e*c,d=Math.sin(a),w=o*d,M=e*d;u=C.project(t,u),u=n.Cartesian3.subtract(u,l,u);const f=n.Matrix2.fromRotation(a,g);u=n.Matrix2.multiplyByVector(f,u,u),u=n.Cartesian3.add(u,l,u),s-=1,i-=1;const X=(t=C.unproject(u,t)).latitude,Y=X+s*M,m=X-h*i,p=X-h*i+s*M,x=Math.max(X,Y,m,p),G=Math.min(X,Y,m,p),R=t.longitude,y=R+s*S,O=R+i*w,P=R+i*w+s*S;return{north:x,south:G,east:Math.max(R,y,O,P),west:Math.min(R,y,O,P),granYCos:h,granYSin:w,granXCos:S,granXSin:M,nwCorner:t}}c.computeOptions=function(t,a,e,r,s,i,c){let g,u=t.east,d=t.west,w=t.north,M=t.south,f=!1,X=!1;w===o.CesiumMath.PI_OVER_TWO&&(f=!0),M===-o.CesiumMath.PI_OVER_TWO&&(X=!0);const Y=w-M;g=d>u?o.CesiumMath.TWO_PI-d+u:u-d;const m=Math.ceil(g/a)+1,p=Math.ceil(Y/a)+1,x=g/(m-1),G=Y/(p-1),R=n.Rectangle.northwest(t,i),y=n.Rectangle.center(t,h);0===e&&0===r||(y.longitude<R.longitude&&(y.longitude+=o.CesiumMath.TWO_PI),l=C.project(y,l));const O=G,P=x,W=n.Rectangle.clone(t,s),_={granYCos:O,granYSin:0,granXCos:P,granXSin:0,nwCorner:R,boundingRectangle:W,width:m,height:p,northCap:f,southCap:X};if(0!==e){const t=S(R,e,x,G,0,m,p);w=t.north,M=t.south,u=t.east,d=t.west,_.granYCos=t.granYCos,_.granYSin=t.granYSin,_.granXCos=t.granXCos,_.granXSin=t.granXSin,W.north=w,W.south=M,W.east=u,W.west=d}if(0!==r){e-=r;const t=n.Rectangle.northwest(W,c),a=S(t,e,x,G,0,m,p);_.stGranYCos=a.granYCos,_.stGranXCos=a.granXCos,_.stGranYSin=a.granYSin,_.stGranXSin=a.granXSin,_.stNwCorner=t,_.stWest=a.west,_.stSouth=a.south}return _};var d=c;t.RectangleGeometryLibrary=d}));
