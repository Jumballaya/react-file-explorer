import { useState } from "react";
import { FileList } from "./filesystem.types";
import { useFileViewer } from "./useFileViewer";

export function EntryIconLarge(props: {
  entry: FileList[0];
  fv: ReturnType<typeof useFileViewer>;
}) {
  const fv = props.fv;
  const [name, setName] = useState<string>(props.entry.name);
  return (
    <li
      draggable
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={async (e) => {
        e.preventDefault();
        const name = e.dataTransfer.getData("name");
        const moveTarget = fv.files.filter((f) => f.name === name)[0]?.handle;
        if (moveTarget) {
          const target = props.entry.handle;

          // dropping on another file wont work, has to be a directory
          if (!(target instanceof FileSystemDirectoryHandle)) return;

          if (moveTarget instanceof FileSystemDirectoryHandle) {
            await fv.fs.moveDirectory(moveTarget, target);
          }

          if (moveTarget instanceof FileSystemFileHandle) {
            await fv.fs.moveFile(moveTarget, target);
          }

          await fv.updateFiles();
        }
      }}
      onDragStart={(e) => {
        console.log(props.entry.name);
        e.dataTransfer.setData("name", props.entry.name);
      }}
      onClick={async () => {
        await fv.updateFiles(
          fv.files.map((file) => {
            if (file.name === props.entry.name) {
              file.highlighted = true;
              return file;
            }
            file.highlighted = false;
            return file;
          })
        );
      }}
      className={`file-list--entry medium ${
        props.entry.highlighted ? "selected" : ""
      }`}
      onDoubleClick={async () => {
        if (props.entry.editing) return;
        if (!fv.fs.directory) return;
        if (props.entry.type === "directory") {
          const handle = await fv.fs.directory.getDirectoryHandle(
            props.entry.name
          );
          if (handle) {
            await fv.changeDirectory(handle);
          }
          return;
        }
        const handle = await fv.fs.directory.getFileHandle(props.entry.name);
        if (handle) {
          console.log(await handle.getFile());
        }
      }}
    >
      <img
        className="icon medium"
        src={
          props.entry.type === "directory"
            ? "icons/folder-512.png"
            : "icons/file-256.png"
        }
      />
      {props.entry.editing ? (
        <textarea
          value={name}
          autoFocus
          onChange={(e) => {
            e.preventDefault();
            setName(e.target.value);
          }}
          onBlur={async (e) => {
            e.preventDefault();
            if (!fv.fs.directory) return;
            if (props.entry.type === "file") {
              const handle = await fv.fs.directory.getFileHandle(
                props.entry.name
              );
              if (handle) {
                await fv.fs.renameFile(handle, name);
                await fv.updateFiles(
                  fv.files.map((file) => {
                    file.editing = false;
                    return file;
                  })
                );
              }
              return;
            }
            const handle = await fv.fs.directory.getDirectoryHandle(
              props.entry.name
            );
            if (handle) {
              await fv.fs.renameDirectory(handle, name);
              await fv.updateFiles(
                fv.files.map((file) => {
                  file.editing = false;
                  return file;
                })
              );
            }
          }}
        />
      ) : (
        <p
          className="file-list--entry__name"
          onClick={() => {
            fv.updateFiles(
              fv.files.map((file) => {
                if (file.name === props.entry.name) {
                  file.editing = true;
                  return file;
                }
                file.editing = false;
                return file;
              })
            );
          }}
        >
          {props.entry.name}
        </p>
      )}
    </li>
  );
}
