import { IBird } from "../models/IBird";
import { Test } from "./Test";
import { IFileWriter } from "models/IFileWriter";
import { IFileReader } from "models/IFileReader";

export class App {
  constructor(bird: IBird, test: Test, reader: IFileReader, writer: IFileWriter) {
    if (bird.canFly()) {
      console.log("Bird can fly");
    } else {
      console.log("Bird can't fly");
    }

    test.say("Amy");

    console.log("read", reader.read("MyFile.txt"));
    writer.write("nothere.json", "ANANANAN");
  }
}