import { IBird } from "../models/IBird";
import { IOperator } from "../models/IOperator";

export class Crow implements IBird {
  constructor(op: IOperator) {
    console.log(op.add(2, 2));
  }

  public canFly() {
    return true;
  }
}