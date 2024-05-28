import { useMemo } from "react";
import { FileSystem } from "./FileSystem";

const FILESYSTEM = new FileSystem();

export function useFileSystem() {
  const fs = useMemo(() => {
    return FILESYSTEM;
  }, []);

  return fs;
}
