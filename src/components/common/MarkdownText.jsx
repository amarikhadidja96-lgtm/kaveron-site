import React from 'react';

/**
 * Lightweight, zero-dependency Markdown renderer.
 * Supports: **bold**, *italic*, [links](url), lists (- or numbers), and line breaks.
 */
export const MarkdownText = ({ content = '', isRtl = false, onLinkClick }) => {
  if (!content) return null;

  // Split into lines
  const lines = content.split('\n');

  const renderFormattedInline = (text) => {
    // Replace markdown patterns using regex
    // 1. Links: [text](url)
    const parts = [];
    let keyIdx = 0;

    // Combined regex for links and bold
    const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      // Preceding text
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      if (match[1]) {
        // Link: [text](url)
        const linkText = match[2];
        let linkUrl = match[3].trim();

        // Strip any absolute localhost or dev URL
        linkUrl = linkUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '');
        if (typeof window !== 'undefined' && (linkUrl.startsWith('http://') || linkUrl.startsWith('https://'))) {
          if (linkUrl.startsWith(window.location.origin)) {
            linkUrl = linkUrl.substring(window.location.origin.length) || '/';
          }
        }

        const isInternal = linkUrl.startsWith('/') || linkUrl.startsWith('#');

        parts.push(
          <a
            key={`link-${keyIdx++}`}
            href={linkUrl}
            target={isInternal ? '_self' : '_blank'}
            rel="noopener noreferrer"
            onClick={(e) => {
              if (isInternal) {
                e.preventDefault();
                if (onLinkClick) {
                  onLinkClick(linkUrl, e);
                } else if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', linkUrl);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }
            }}
            className="text-[#00FF88] underline hover:text-[#00E57A] transition-colors underline-offset-2 cursor-pointer font-medium"
          >
            {linkText}
          </a>
        );
      } else if (match[4]) {
        // Bold: **text**
        parts.push(
          <strong key={`bold-${keyIdx++}`} className="font-bold text-white">
            {match[5]}
          </strong>
        );
      } else if (match[6]) {
        // Italic: *text*
        parts.push(
          <em key={`italic-${keyIdx++}`} className="italic">
            {match[7]}
          </em>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={`space-y-1.5 leading-relaxed text-sm ${isRtl ? 'font-arabic text-right' : 'font-body text-left'}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Bullet list — use a small dash/dot, never ● which leaks into plain text
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 ps-1">
              <span className="text-[#00FF88] mt-1 shrink-0 select-none" aria-hidden="true">–</span>
              <span>{renderFormattedInline(trimmed.substring(2))}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 ps-1">
              <span className="font-mono text-[#00FF88] text-xs font-bold mt-0.5 shrink-0">
                {numMatch[1]}.
              </span>
              <span>{renderFormattedInline(numMatch[2])}</span>
            </div>
          );
        }

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Regular paragraph
        return <p key={idx}>{renderFormattedInline(line)}</p>;
      })}
    </div>
  );
};

export default MarkdownText;

