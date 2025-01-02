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
define(["./defaultValue-89a13f50","./PrimitivePipeline-c3c5fafe","./createTaskProcessorWorker","./Transforms-a9503dfe","./Matrix2-387f8f26","./ComponentDatatype-db8f58a6","./WebGLConstants-eaab9970","./RuntimeError-7605ca09","./combine-cab8776d","./GeometryAttribute-c28edea0","./GeometryAttributes-e846f617","./GeometryPipeline-9529e1f5","./AttributeCompression-e1245712","./EncodedCartesian3-da50618b","./IndexDatatype-55faa54f","./IntersectionTests-a10643a2","./Plane-b9e7006f","./WebMercatorProjection-858bec7d"],(function(e,t,r,n,o,a,i,s,f,c,u,d,m,b,l,p,y,P){"use strict";const k={};function C(t){let r=k[t];return e.defined(r)||("object"==typeof exports?k[r]=r=require(`Workers/${t}`):require([`Workers/${t}`],(function(e){r=e,k[r]=e}))),r}return r((function(r,n){const o=r.subTasks,a=o.length,i=new Array(a);for(let t=0;t<a;t++){const r=o[t],n=r.geometry,a=r.moduleName;if(e.defined(a)){const e=C(a);i[t]=e(n,r.offset)}else i[t]=n}return Promise.all(i).then((function(e){return t.PrimitivePipeline.packCreateGeometryResults(e,n)}))}))}));
