import { IBird } from "../models/IBird";
import { Test } from "./Test";

export class App {
  constructor(bird: IBird, test: Test) {
    if (bird.canFly()) {
      console.log("Bird can fly");
    } else {
      console.log("Bird can't fly");
    }

    test.say("Amy");
  }
}