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
define(["./Matrix2-387f8f26","./defaultValue-89a13f50","./EllipseGeometry-02a03088","./ComponentDatatype-db8f58a6","./WebGLConstants-eaab9970","./RuntimeError-7605ca09","./Transforms-a9503dfe","./combine-cab8776d","./EllipseGeometryLibrary-cc8ef452","./GeometryAttribute-c28edea0","./GeometryAttributes-e846f617","./GeometryInstance-20fd3f13","./GeometryOffsetAttribute-85bee275","./GeometryPipeline-9529e1f5","./AttributeCompression-e1245712","./EncodedCartesian3-da50618b","./IndexDatatype-55faa54f","./IntersectionTests-a10643a2","./Plane-b9e7006f","./VertexFormat-ea5ac67a"],(function(e,t,a,r,n,i,o,s,f,l,c,d,m,b,p,u,y,G,E,C){"use strict";return function(r,n){return t.defined(n)&&(r=a.EllipseGeometry.unpack(r,n)),r._center=e.Cartesian3.clone(r._center),r._ellipsoid=e.Ellipsoid.clone(r._ellipsoid),a.EllipseGeometry.createGeometry(r)}}));
