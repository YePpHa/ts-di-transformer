import { Test } from "./Test";

export class MyTest extends Test {
  say(name: string): void {
    console.log("Hello, " + name);
  }
}