export interface IFileWriter {
  write(file: string, content: string): void;
}