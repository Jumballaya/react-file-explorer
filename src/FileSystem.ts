export class FileSystem {
  private root: FileSystemDirectoryHandle | null = null;
  private currentDirectory: FileSystemDirectoryHandle | null = null;

  private _initialized = false;
  private pathList: string[] = [];

  public pathDelimiter = "/";

  public async initialize() {
    if (this._initialized) return;
    const handle = await showDirectoryPicker();
    if (handle) {
      this.root = handle;
      this.currentDirectory = handle;
    }
    this._initialized = true;
    return handle;
  }

  public async getParentDirectory(
    entry: FileSystemHandle
  ): Promise<FileSystemDirectoryHandle | null> {
    if (!this._initialized || !this.root) return null;
    const stack = (await this.root?.resolve(entry)) ?? [];
    if (stack) {
      if (stack.length === 0) {
        return this.root;
      }
      let next = stack.shift();
      if (next) {
        let handle = await this.root.getDirectoryHandle(next);
        while (stack[0] !== entry.name && stack.length > 0) {
          next = stack.shift();
          if (next) handle = await handle.getDirectoryHandle(next);
        }
        if (stack.length === 0) {
          return this.root;
        }
        return handle;
      }
    }
    return null;
  }

  // Files
  public createVirtualFile(name: string, contents: BlobPart[]): File {
    const newFile = new File(contents, name);
    return newFile;
  }

  public createVirtualTextFile(name: string, contents: string): File {
    const encoder = new TextEncoder();
    return this.createVirtualFile(name, [encoder.encode(contents)]);
  }

  public async updateFile(file: FileSystemFileHandle, contents: File) {
    const writable = await file.createWritable();
    await writable.write(contents);
    await writable.close();
  }

  public async renameFile(file: FileSystemFileHandle, newName: string) {
    if (!this._initialized) return;
    await file.move(newName);
  }

  public async moveFile(
    file: FileSystemFileHandle,
    newFolder: FileSystemDirectoryHandle
  ) {
    if (!this._initialized) return;
    await file.move(newFolder);
  }

  public async createFile(name?: string) {
    if (!this._initialized) return;
    if (!name) name = crypto.randomUUID();
    await this.currentDirectory?.getFileHandle(`${crypto.randomUUID()}.txt`, {
      create: true,
    });
  }

  public async deleteFile(handle: FileSystemFileHandle) {
    if (!this._initialized) return;
    await this.currentDirectory?.removeEntry(handle.name);
  }

  // Directories
  public async renameDirectory(
    dir: FileSystemDirectoryHandle,
    newName: string
  ) {
    if (!this._initialized) return;
    if (dir.name === newName) return;
    const parent = await this.getParentDirectory(dir);
    if (!parent) return;
    const newHandle = await parent.getDirectoryHandle(newName, {
      create: true,
    });
    await this.moveDirectory(dir, newHandle);
    await parent.removeEntry(dir.name, { recursive: true });
  }

  public async moveDirectory(
    directory: FileSystemDirectoryHandle,
    intoDirectory: FileSystemDirectoryHandle
  ) {
    if (!this._initialized) return;
    const to = await intoDirectory.getDirectoryHandle(directory.name, {
      create: true,
    });
    await recMoveDirectory(directory, to);
  }

  public async createDirectory(name?: string) {
    if (!this._initialized) return;
    if (!this.currentDirectory) return;
    if (!name) name = crypto.randomUUID();
    await this.currentDirectory.getDirectoryHandle(crypto.randomUUID(), {
      create: true,
    });
  }

  public async deleteDirectory(directory: FileSystemDirectoryHandle) {
    if (!this._initialized) return;
    await this.currentDirectory?.removeEntry(directory.name);
  }

  public async changeDirectory(dir: FileSystemDirectoryHandle) {
    this.currentDirectory = dir;
    this.pathList = (await this.root?.resolve(this.currentDirectory)) ?? [];
  }

  public get path(): string {
    return this.pathList.join(this.pathDelimiter);
  }

  public get initialized(): boolean {
    return this._initialized;
  }

  public get entries(): AsyncIterable<[string, FileSystemHandle]> | null {
    if (!this.currentDirectory) {
      return (async function* () {})();
    }
    return this.currentDirectory.entries();
  }

  public get directory(): FileSystemDirectoryHandle | null {
    return this.currentDirectory;
  }
}

//
//
//
async function recMoveDirectory(
  from: FileSystemDirectoryHandle,
  to: FileSystemDirectoryHandle
) {
  for await (const [name, handle] of from.entries()) {
    if (handle.kind === "file") {
      await handle.move(to);
      continue;
    }
    const newHandle = await to.getDirectoryHandle(name, { create: true });
    await recMoveDirectory(handle, newHandle);
  }
}
