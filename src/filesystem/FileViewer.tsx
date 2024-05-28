import { useEffect, useState } from "react";
import { FileList } from "./filesystem.types";
import { useFileViewer } from "./useFileViewer";

const type_map = {
  text: [
    "txt",
    "json",
    "mat",
    "glsl",
    "obj",
    "tmx",
    "tmj",
    "tsj",
    "tiled-project",
    "tiled-session",
  ],
  image: ["jpg", "jpeg", "png"],
};

function TextViewer(props: {
  text: string;
  file: FileList[0];
  fv: ReturnType<typeof useFileViewer>;
}) {
  const { text } = props;
  const { name } = props.file;
  const [contents, setContents] = useState<string>(text ?? "");

  useEffect(() => {
    setContents(text);
  }, [name, text]);

  return (
    <div>
      <button
        onClick={async (e) => {
          e.preventDefault();

          const handle = props.file.handle;
          if (!(handle instanceof FileSystemFileHandle)) return;
          const newFile = props.fv.fs.createVirtualTextFile(
            props.file.name,
            contents
          );
          await props.fv.fs.updateFile(handle, newFile);
        }}
      >
        Save File
      </button>
      <textarea
        style={{ display: "block", width: "100%", height: "400px" }}
        value={contents}
        onChange={(e) => {
          e.preventDefault();
          setContents(e.target.value);
        }}
      />
    </div>
  );
}

function ImageViewer(props: { src: string }) {
  return <img style={{ width: "400px" }} src={props.src} />;
}

function getFileType(name: string): keyof typeof type_map {
  const ext = name.split(".")[1] ?? "";

  let fileType: keyof typeof type_map = "text";
  const keys = Object.keys(type_map) as Array<keyof typeof type_map>;
  for (const key of keys) {
    if (type_map[key].includes(ext)) {
      fileType = key;
    }
  }

  return fileType;
}

export function FileViewer(props: {
  file: FileList[0];
  fv: ReturnType<typeof useFileViewer>;
}) {
  const [file, setFile] = useState<string | null>(null);

  useEffect(() => {
    if (props?.file?.handle instanceof FileSystemFileHandle) {
      const handle = props.file.handle;
      handle
        .getFile()
        .then((file) => {
          const fileType = getFileType(file.name);
          switch (fileType) {
            case "image": {
              const reader = new FileReader();
              return new Promise<string>((res) => {
                reader.onload = () => {
                  const result = reader.result;
                  if (result && typeof result === "string") {
                    res(result);
                  }
                };
                reader.readAsDataURL(file);
              });
            }
            case "text": {
              return file.text();
            }
          }
        })
        .then((file) => {
          setFile(file);
        });
    }
  });

  if (props?.file?.type !== "file") {
    return <></>;
  }
  if (file === null) {
    return <></>;
  }

  const fileType = getFileType(props.file.name);

  switch (fileType) {
    case "text":
      return <TextViewer fv={props.fv} file={props.file} text={file ?? ""} />;
    case "image":
      return <ImageViewer src={file ?? ""} />;
    default:
      return <></>;
  }
}
