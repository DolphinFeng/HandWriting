import { DataCmd } from "./data-cmd.ts";
import { DataManager, NioGeometryType } from "./feature.ts";
import { NioGeoPoint } from "./point.ts";
import {
  AddFeatureCmd,
  ModifyFeatureCmd,
  DeleteFeatureCmd,
} from "./data-cmd.ts";

class EditCtrl {
  constructor() {}

  cmdList: Array<Array<DataCmd>> = [];

  nextCmdIter: number = 0;

  curCmdCount: number = 0;

  maxCmdCount: number = 64;

  dataManager: DataManager = new DataManager();

  beginEdit() {
    //清空nextCmdIter指向的cmd，及后面的cmd
    if (this.cmdList.length > this.nextCmdIter) {
      this.cmdList.splice(this.nextCmdIter);
    }

    this.cmdList.push(new Array<DataCmd>());
    this.nextCmdIter = this.cmdList.length - 1;

    if (this.cmdList.length + 1 >= this.maxCmdCount) {
      this.cmdList.shift();
      this.nextCmdIter--;
    }
  }

  endEdit() {
    if (this.cmdList.length == this.nextCmdIter) {
      return;
    }

    if (this.cmdList.length < this.nextCmdIter) {
      throw "error: endEdit length not valid";
    }

    this.nextCmdIter++;
  }

  undo() {
    if (this.nextCmdIter == 0 || this.cmdList.length == 0) {
      return;
    }

    if (this.nextCmdIter <= 0) {
      throw `error: undo cmditer value: ${this.nextCmdIter}`;
    }

    if (this.cmdList.length < this.nextCmdIter) {
      throw "error: undo length not valid";
    }

    this.nextCmdIter--;
    let cmds = this.cmdList.at(this.nextCmdIter);
    if (cmds) {
      for (let i = cmds.length - 1; i >= 0; i--) {
        let cmd: DataCmd = cmds[i];
        cmd.undo();
      }
    }
  }

  redo() {
    if ((this.nextCmdIter = this.cmdList.length)) {
      return;
    }

    if (this.cmdList.length < this.nextCmdIter) {
      throw "error: redo length not valid";
    }

    let cmds: Array<DataCmd> = this.cmdList[this.nextCmdIter];
    for (let cmd of cmds) {
      cmd.redo();
    }

    this.nextCmdIter++;
  }

  canUndo() {
    return this.cmdList.length > 0 && this.nextCmdIter != 0;
  }

  canRedo() {
    return this.nextCmdIter != this.cmdList.length;
  }

  addNewFeature(option: {
    layerName: string;
    properties?: {};
    points?: NioGeoPoint[];
    geometryType?: NioGeometryType;
  }) {
    let cmd = new AddFeatureCmd(option);
    cmd.do();
  }
}

export const editCtrl = new EditCtrl();
