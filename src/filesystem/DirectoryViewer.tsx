import { EntryIconLarge } from "./EntryIconLarge";
import { useFileViewer } from "./useFileViewer";

export function DirectoryViewer(props: {
  fv: ReturnType<typeof useFileViewer>;
}) {
  const fv = props.fv;
  return (
    <ul className="file-list">
      {fv.files.map((entry) => (
        <EntryIconLarge fv={fv} key={entry.name} entry={entry} />
      ))}
    </ul>
  );
}
