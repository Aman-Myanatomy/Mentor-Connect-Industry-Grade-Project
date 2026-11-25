const kindOf = (name) => (/LLM/.test(name) ? 'LLM' : /RAG|retrieve/i.test(name) ? 'RAG' : 'Code');
const clean = (name) => name.replace(/^\d+\.\s*/, '').replace(/\s*\(.*\)\s*$/, '');

// Orchestration made visible: one row per pipeline step, who did the work (Code / RAG / LLM), how long it took.
export const TraceList = ({ trace }) => {
  const max = Math.max(1, ...trace.map((t) => t.ms));
  return (
    <ol className="trace">
      {trace.map((t, i) => {
        const kind = kindOf(t.step);
        return (
          <li key={t.step} className="trace-row" style={{ '--i': i }}>
            <span className="trace-index">{i + 1}</span>
            <div className="trace-body">
              <div className="trace-line">
                <span className="trace-name">{clean(t.step)}</span>
                <span className={`tag tag-${kind.toLowerCase()}`}>{kind}</span>
                <span className="trace-ms">{t.ms} ms</span>
              </div>
              <div className="trace-bar">
                <span style={{ transform: `scaleX(${Math.max(0.02, t.ms / max)})` }} />
              </div>
              <details>
                <summary>Output</summary>
                <pre>{typeof t.detail === 'string' ? t.detail : JSON.stringify(t.detail, null, 2)}</pre>
              </details>
            </div>
          </li>
        );
      })}
    </ol>
  );
};
