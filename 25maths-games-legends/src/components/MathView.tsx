import katex from 'katex';

export const MathView = ({ tex, inline = true, className = "" }: { tex: string | number; inline?: boolean; className?: string; key?: any }) => {
  try {
    const html = katex.renderToString(String(tex), {
      throwOnError: false,
      displayMode: !inline
    });
    return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <span className={className}>{String(tex)}</span>;
  }
};

export const LatexText = ({ text, className = "" }: { text: string; className?: string }) => {
  // Split by newlines first, then by LaTeX delimiters within each line
  const lines = text.split('\n');
  return (
    <span className={className} style={{ display: 'inline' }}>
      {lines.map((line, li) => {
        // Match $...$ but not empty $$ (which would be display math)
        const parts = line.split(/(\$(?!\$).*?\$)/g);
        // Use inline-flex wrap for each line so text + formulas auto-wrap
        return (
          <span key={li} style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0 0.15em', maxWidth: '100%' }}>
            {li > 0 && <br />}
            {parts.map((part, pi) => {
              if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
                return <MathView key={pi} tex={part.slice(1, -1)} />;
              }
              // Split plain text into word-level chunks for wrapping
              if (!part) return null;
              return <span key={pi} style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{part}</span>;
            })}
          </span>
        );
      })}
    </span>
  );
};
