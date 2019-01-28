import { IOperator } from "../models/IOperator";

export class MyOperator implements IOperator {
  public add(x: number, y: number) {
    return x + y;
  }
}