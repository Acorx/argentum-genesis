import React from 'react';
import { Diff, Hunk, parseDiff } from 'react-diff-view';

interface DiffViewProps {
  oldContent: string;
  newContent: string;
}

const DiffView: React.FC<DiffViewProps> = ({ oldContent, newContent }) => {
  const diffText = [`diff --git a/old b/new
index abc1234..def5678 100644
--- a/old
+++ b/new
@@ -1 +1 @@
-${oldContent}
+${newContent}`];
  const diffs = parseDiff(diffText, { nearbySequences: 'zip' });

  return (
    <div style={{ height: '80vh', overflow: 'auto', border: '1px solid #ccc' }}>
      {diffs.map((diff, index) => (
        <Diff key={index} viewType="split" diffType={diff.type} hunks={diff.hunks}>
          {hunks => hunks.map(hunk => <Hunk key={hunk.content} hunk={hunk} />)}
        </Diff>
      ))}
    </div>
  );
};

export default DiffView;