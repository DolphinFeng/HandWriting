import EventEmitter  from 'eventemitter3';
export class Base extends EventEmitter {
  constructor(context) {
    super();
    this.context = context;
  }
}
