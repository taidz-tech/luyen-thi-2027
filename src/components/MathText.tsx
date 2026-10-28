import React, { useMemo } from 'react';
import katex from 'katex';
import { MathDiagram } from './MathDiagram';

interface MathTextProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Renders text containing LaTeX math formulas ($...$, $$...$$, \(...\), \[...\])
 * and embedded SVG diagrams/variation tables using KaTeX and MathDiagram.
 */
export const MathText: React.FC<MathTextProps> = ({ content, className = '', inline = false }) => {
  const parts = useMemo(() => {
    if (!content) return [];

    let rawStr = String(content);

    // If string has escaped HTML entities for SVG (&lt;svg ... &lt;/svg&gt;), decode them
    if (rawStr.includes('&lt;svg') && rawStr.includes('&lt;/svg&gt;')) {
      rawStr = rawStr
        .replace(/&lt;svg/gi, '<svg')
        .replace(/&lt;\/svg&gt;/gi, '</svg>')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
    }

    // Match SVG elements OR display math ($$...$$, \[...\]) OR inline math ($...$, \(...\))
    const regex = /(<svg[\s\S]*?<\/svg>|\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$(?:\\\$|[^$])+\$|\\\([\s\S]+?\\\))/gi;
    const tokens: Array<{ type: 'text' | 'math' | 'svg'; value: string; display?: boolean }> = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(rawStr)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({
          type: 'text',
          value: rawStr.slice(lastIndex, match.index),
        });
      }

      const raw = match[0];

      if (raw.toLowerCase().startsWith('<svg') && raw.toLowerCase().endsWith('</svg>')) {
        tokens.push({
          type: 'svg',
          value: raw,
        });
      } else {
        let formula = raw;
        let display = false;

        if (raw.startsWith('$$') && raw.endsWith('$$')) {
          formula = raw.slice(2, -2).trim();
          display = true;
        } else if (raw.startsWith('\\[') && raw.endsWith('\\]')) {
          formula = raw.slice(2, -2).trim();
          display = true;
        } else if (raw.startsWith('$') && raw.endsWith('$')) {
          formula = raw.slice(1, -1).trim();
          display = false;
        } else if (raw.startsWith('\\(') && raw.endsWith('\\)')) {
          formula = raw.slice(2, -2).trim();
          display = false;
        }

        tokens.push({
          type: 'math',
          value: formula,
          display,
        });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < rawStr.length) {
      tokens.push({
        type: 'text',
        value: rawStr.slice(lastIndex),
      });
    }

    return tokens;
  }, [content]);

  if (!parts.length) {
    return <span className={className}>{content}</span>;
  }

  return (
    <span className={`${className} leading-relaxed`}>
      {parts.map((p, idx) => {
        if (p.type === 'text') {
          // If text contains HTML tags like <u>, <b>, <i>, <mark>, <br>
          const hasHtml = /<\/?(u|b|strong|i|em|mark|br|p|span)[\s>]/i.test(p.value);
          if (hasHtml) {
            // Sanitize and replace newlines with br if needed
            let formattedHtml = p.value.replace(/\n/g, '<br />');
            return (
              <span
                key={idx}
                dangerouslySetInnerHTML={{ __html: formattedHtml }}
              />
            );
          }

          // If text has newlines but no html tags
          if (p.value.includes('\n')) {
            const lines = p.value.split('\n');
            return (
              <React.Fragment key={idx}>
                {lines.map((line, lIdx) => (
                  <React.Fragment key={lIdx}>
                    {line}
                    {lIdx < lines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          }

          return <React.Fragment key={idx}>{p.value}</React.Fragment>;
        }

        if (p.type === 'svg') {
          return (
            <MathDiagram
              key={idx}
              svgContent={p.value}
              title="Sơ đồ minh họa"
              className="my-3"
            />
          );
        }

        try {
          const html = katex.renderToString(p.value, {
            displayMode: p.display || (!inline && p.display),
            throwOnError: false,
            output: 'htmlAndMathml',
          });
          return (
            <span
              key={idx}
              className={`katex-wrapper ${p.display ? 'block my-2 text-center overflow-x-auto' : 'inline-block px-0.5'}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <code key={idx} className="text-amber-300 font-mono text-xs px-1 py-0.5 bg-slate-800 rounded">
              {p.value}
            </code>
          );
        }
      })}
    </span>
  );
};
