import { useCallback, useState } from "react";
import { FileList } from "./filesystem.types";
import { FileSystem } from "../FileSystem";

const FILESYSTEM = new FileSystem();

export function useFileViewer() {
  const fs = FILESYSTEM;
  const [files, setFiles] = useState<FileList>([]);

  const init = useCallback(async () => {
    const handle = await fs.initialize();
    if (handle) {
      const xtract = await extractFileData(handle, files);
      setFiles(xtract);
    }
  }, [files, fs]);

  const updateFiles = useCallback(
    async (updates = files) => {
      if (fs.directory) {
        setFiles(await extractFileData(fs.directory, updates));
      }
    },
    [files, fs]
  );

  const cd = useCallback(
    async (dir: FileSystemDirectoryHandle) => {
      await fs.changeDirectory(dir);
      setFiles(await extractFileData(dir, files));
    },
    [files, fs]
  );

  return {
    fs,
    files,
    updateFiles,
    initialize: init,
    changeDirectory: cd,
  };
}

//
//
//
async function extractFileData(
  directory: FileSystemDirectoryHandle,
  current: FileList
): Promise<FileList> {
  const fileList: FileList = [];
  for await (const file of directory.entries()) {
    const type = file[1].kind;
    const entry = current?.filter((e) => e.name === file[0])[0] ?? null;
    fileList.push({
      name: file[0],
      highlighted: entry?.highlighted ?? false,
      editing: entry?.editing ?? false,
      type,
      handle: file[1],
    });
  }
  return fileList;
}
