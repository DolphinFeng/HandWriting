import {oddLayer} from "../system/odd/oddLayer.js";
import {hoverOddLayer} from "../system/odd/hoverOddLayer.js";

export function printInfo() {
    let infos = {
        oddLaneSize: oddLayer.oddLanes.size,
        hoverEventSize: oddLayer.hoverEvent.size,
        eventMapSize: oddLayer.eventMap.size,
        hoverLaneSize: hoverOddLayer.hoverLanes.size,
        hoverLaneGroupSize: hoverOddLayer.hoverLaneGroup.size,
        oddLanes: [...oddLayer.oddLanes.values()],
    };
    console.table(infos);
}
