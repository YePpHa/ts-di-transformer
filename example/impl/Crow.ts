import { IBird } from "../models/IBird";
import { IOperator } from "../models/IOperator";

export class Crow implements IBird {
  constructor(ops: IOperator[]) {
    let i = 0;
    for (const op of ops) {
      console.log("OP", i++, op, op.add(2, 2));
    }
  }

  public canFly() {
    return true;
  }
}