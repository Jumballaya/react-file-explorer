import { useFileViewer } from "./useFileViewer";

export function ExplorerActions(props: {
  fv: ReturnType<typeof useFileViewer>;
}) {
  const fv = props.fv;
  return (
    <nav>
      {!fv.fs.initialized && (
        <button
          onClick={async (e) => {
            e.preventDefault();
            await fv.initialize();
          }}
        >
          Set Directory
        </button>
      )}
      <button
        onClick={async (e) => {
          e.preventDefault();
          await fv.fs.createDirectory(crypto.randomUUID());
          await fv.updateFiles();
        }}
      >
        (+) Folder
      </button>
      <button
        onClick={async (e) => {
          e.preventDefault();
          await fv.fs.createFile(`${crypto.randomUUID()}.txt`);
          await fv.updateFiles();
        }}
      >
        (+) File
      </button>
      <button
        onClick={async (e) => {
          e.preventDefault();
          if (!fv.fs.directory) return;
          const parent = await fv.fs.getParentDirectory(fv.fs.directory);
          if (!parent) return;
          await fv.changeDirectory(parent);
        }}
      >
        Go Back
      </button>
    </nav>
  );
}
