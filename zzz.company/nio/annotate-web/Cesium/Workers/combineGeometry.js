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
define(["./PrimitivePipeline-c3c5fafe","./createTaskProcessorWorker","./Transforms-a9503dfe","./Matrix2-387f8f26","./defaultValue-89a13f50","./ComponentDatatype-db8f58a6","./WebGLConstants-eaab9970","./RuntimeError-7605ca09","./combine-cab8776d","./GeometryAttribute-c28edea0","./GeometryAttributes-e846f617","./GeometryPipeline-9529e1f5","./AttributeCompression-e1245712","./EncodedCartesian3-da50618b","./IndexDatatype-55faa54f","./IntersectionTests-a10643a2","./Plane-b9e7006f","./WebMercatorProjection-858bec7d"],(function(e,t,i,r,a,n,o,c,s,m,f,b,u,P,d,p,l,y){"use strict";return t((function(t,i){const r=e.PrimitivePipeline.unpackCombineGeometryParameters(t),a=e.PrimitivePipeline.combineGeometry(r);return e.PrimitivePipeline.packCombineGeometryResults(a,i)}))}));
