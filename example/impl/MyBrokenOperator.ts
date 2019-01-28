import { IOperator } from "../models/IOperator";

export class MyBrokenOperator implements IOperator {
  public add(x: number, y: number) {
    return x*2 + y;
  }
}