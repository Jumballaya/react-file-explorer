import { DirectoryViewer } from "./filesystem/DirectoryViewer";
import { ExplorerActions } from "./filesystem/ExplorerActions";
import { FileViewer } from "./filesystem/FileViewer";
import { useFileViewer } from "./filesystem/useFileViewer";

function App() {
  const fv = useFileViewer();
  return (
    <main>
      <ExplorerActions fv={fv} />
      <h2 style={{ margin: 0, marginTop: "12px", fontFamily: "sans-serif" }}>
        {fv.fs.path}
      </h2>
      <DirectoryViewer fv={fv} />
      <FileViewer
        fv={fv}
        file={fv.files.filter((f) => f.highlighted)[0] ?? null}
      />
    </main>
  );
}

export default App;
