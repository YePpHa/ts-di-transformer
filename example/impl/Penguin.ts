import { IBird } from "../models/IBird";

export class Penguin implements IBird {
  public canFly() {
    return false;
  }
}