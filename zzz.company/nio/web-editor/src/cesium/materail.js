import {
    ColorGeometryInstanceAttribute,
    Color,
    PolylineGlowMaterialProperty,
    ColorMaterialProperty,
    PolylineColorAppearance, PolylineMaterialAppearance, Material
} from "cesium";

//自定义颜色
export const DefineColor = {
    WHITE_ALPHA_ATTRIBUTE: ColorGeometryInstanceAttribute.fromColor(Color.WHITE.withAlpha(.5)),
    WHITE_ATTRIBUTE: ColorGeometryInstanceAttribute.fromColor(Color.WHITE),
    WHITE_ALPHA_VALUE: ColorGeometryInstanceAttribute.toValue(Color.WHITE.withAlpha(.5)),
    YELLOW_VALUE: ColorGeometryInstanceAttribute.toValue(Color.YELLOW),
    POLYGON_PURPLE: Color.PURPLE,
}

//自定义材质
export const DefineMaterial = {
    EDIT_POLYLINE: new PolylineGlowMaterialProperty({
        glowPower: .2,
        taperPower: 1,
        color: Color.ORANGERED
    }),
    EDIT_POLYLINE_HIGHLIGHT: new PolylineGlowMaterialProperty({
        glowPower: .2,
        taperPower: 1,
        color: Color.CORNFLOWERBLUE
    }),
    EDIT_POLYGON: Color.WHITE,
    EDIT_POLYGON_HIGHLIGHT: Color.ORANGERED,
}

export const DefineAppearance = {
    //old道路边线
    BOUNDARY_POLYLINE: new PolylineColorAppearance({
        translucent: false,
    }),
    //中心线
    CENTER_POLYLINE: new PolylineMaterialAppearance({
        material: Material.fromType(Material.PolylineDashType, {
            color: Color.WHITE,
            gapColor: Color.TRANSPARENT,
            dashLength: 6,
        }),
    }),
    //发光线
    EDIT_POLYLINE: new PolylineMaterialAppearance({
        material: Material.fromType('PolylineGlow', {
            color: Color.ORANGERED,
            glowPower: .2,
            taperPower: 1,
        })
    })
}
