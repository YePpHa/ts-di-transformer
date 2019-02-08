import { IFileReader } from "../models/IFileReader";
import { IFileWriter } from "../models/IFileWriter";
import { IOperator } from "models/IOperator";

export class FileWriterReader implements IFileReader, IFileWriter {
  private _operator: IOperator;
  private _id: number;

  public constructor(operator: IOperator) {
    this._operator = operator;
    this._id = Math.random()*10000;
  }

  public read(file: string): string {
    return this._id + ": " + file + " + content: " + this._operator.add(2, 3);
  }
  
  public write(file: string, content: string): void {
    console.log(this._id + ": Data written to " + file + ": " + content);
  }
}