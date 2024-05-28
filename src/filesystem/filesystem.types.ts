export type FileList = Array<{
  name: string;
  highlighted: boolean;
  editing: boolean;
  type: "file" | "directory";
  handle: FileSystemHandle;
}>;
