import {MeshCenterInfo} from "./meshCenterInfo.js";

/**
 * 图幅计算工具
 */
class MeshTools {
    constructor(level) {
        this.level = level;
        this.cntLon = 1 << level + 1;
        this.delta = Math.abs(360 / this.cntLon);
    }

    /**
     * @param mortonCode{bigint}
     * @param level{number}
     * @return {bigint}
     */
    getTileId(mortonCode, level) {
        let tileId = mortonCode >> 62n - BigInt(2 * level);
        let tileLevel = BigInt(1 << 16 + level);
        return tileId | tileLevel;
    }

    /**
     * @param lon
     * @param lat
     * @return {bigint}
     */
    getMortonCode(lon, lat) {
        const x = BigInt(~~(1.073741824e9 * lon / 90));
        const y = BigInt(~~(1.073741824e9 * lat / 90));
        return this.part(x) | this.part(y & 2147483647n) << 1n;
    }

    /**
     * @param val{bigint}
     * @return {bigint}
     */
    part(val) {
        if (val < 0) {
            val &= 4294967295n;
        }
        val = (val | val << 16n) & 281470681808895n;
        val = (val | val << 8n) & 71777214294589695n;
        val = (val | val << 4n) & 1085102592571150095n;
        val = (val | val << 2n) & 3689348814741910323n;
        val = (val | val << 1n) & 6148914691236517205n;
        return val;
    }

    getLonIdx(lon) {
        return BigInt(Math.ceil((lon + 180) / this.delta));
    }

    getLatIdx(lat) {
        return BigInt(Math.ceil((lat + 90) / this.delta));
    }

    /**
     * @param lonIdx{bigint}
     * @param latIdx{bigint}
     * @return {MeshCenterInfo}
     */
    getTileCenter(lonIdx, latIdx) {
        return new MeshCenterInfo((Number(lonIdx) - 0.5) * this.delta - 180, (Number(latIdx) - 0.5) * this.delta - 90);
    }

    /**
     * 获取屏幕范围内的图幅
     * @return {number[]}
     * @param lbLon{number}左下角经度
     * @param lbLat{number}左下角纬度
     * @param rtLon{number}右上角经度
     * @param rtLat{number}右上角纬度
     */
    intersectsTile(lbLon, lbLat, rtLon, rtLat) {
        let res = [];
        const minLon = this.getLonIdx(lbLon);
        const minLat = this.getLatIdx(lbLat);
        const maxLon = this.getLonIdx(rtLon);
        const maxLat = this.getLatIdx(rtLat);

        for (let i = minLon; i <= maxLon; i++) {
            for (let j = minLat; j <= maxLat; j++) {
                const centerInfo = this.getTileCenter(i, j);
                const mortonCode = this.getMortonCode(centerInfo.lon, centerInfo.lat);
                const tileId = this.getTileId(mortonCode, this.level);
                res.push(Number(tileId));
            }
        }
        return res;
    }
}

const meshTolls = new MeshTools(13);
export {meshTolls};
