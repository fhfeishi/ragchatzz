// src/components/chat/MarkdownRenderer.tsx


import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const parseMarkdown = (text: string): React.ReactNode => {
    const blocks = text.split(/\n\s*\n/).filter(block => block.trim() !== '');
    const elements: React.ReactNode[] = [];

    blocks.forEach((block, blockIndex) => {
      const trimmedBlock = block.trim();
      
      // Handle headings
      const headingMatch = trimmedBlock.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();
        const headingLevel = `h${level}`;
        
        elements.push(
          React.createElement(
            headingLevel,
            { 
              key: `h-${blockIndex}`,
              className: `font-bold mt-6 mb-3 text-${Math.max(2, 4 - level)}xl`
            },
            parseInlineMarkdown(text)
          )
        );
        return;
      }

      // Handle unordered lists
      if (/^[-*]\s+/.test(trimmedBlock)) {
        const items = trimmedBlock.split(/\n[-*]\s+/).filter(i => i);
        if (items.length > 0) {
          items[0] = items[0].replace(/^[-*]\s+/, '');
          elements.push(
            <ul key={`ul-${blockIndex}`} className="list-disc pl-6 mb-4 space-y-2">
              {items.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {parseInlineMarkdown(item.trim())}
                </li>
              ))}
            </ul>
          );
        }
        return;
      }

      // Handle ordered lists
      if (/^\d+\.\s+/.test(trimmedBlock)) {
        const items = trimmedBlock.split(/\n\d+\.\s+/).filter(i => i);
        if (items.length > 0) {
          items[0] = items[0].replace(/^\d+\.\s+/, '');
          elements.push(
            <ol key={`ol-${blockIndex}`} className="list-decimal pl-6 mb-4 space-y-2">
              {items.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {parseInlineMarkdown(item.trim())}
                </li>
              ))}
            </ol>
          );
        }
        return;
      }

      // Handle paragraphs
      elements.push(
        <p key={`p-${blockIndex}`} className="mb-4 leading-relaxed">
          {parseInlineMarkdown(trimmedBlock)}
        </p>
      );
    });

    return elements;
  };

  const parseInlineMarkdown = (text: string): React.ReactNode => {
    const processedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" class="max-w-full h-auto my-4 rounded-lg shadow" />')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    const parts = processedText.split(/(<[^>]+>)/).filter(Boolean);

    return parts.map((part, index) => {
      if (part.startsWith('<')) {
        const tagMatch = part.match(/<([a-z]+)\b/);
        if (!tagMatch) return part;
        
        const tag = tagMatch[1];
        switch (tag) {
          case 'strong':
            return <strong key={index} className="font-bold">{part.replace(/<\/?strong>/g, '')}</strong>;
          case 'em':
            return <em key={index} className="italic">{part.replace(/<\/?em>/g, '')}</em>;
          case 'img':
            const srcMatch = part.match(/src="([^"]+)"/);
            const altMatch = part.match(/alt="([^"]+)"/);
            return (
              <img 
                key={index} 
                src={srcMatch ? srcMatch[1] : ''} 
                alt={altMatch ? altMatch[1] : ''} 
                className="max-w-full h-auto my-4 rounded-lg shadow"
              />
            );
          case 'a':
            const hrefMatch = part.match(/href="([^"]+)"/);
            const textMatch = part.match(/>([^<]+)</);
            return (
              <a 
                key={index} 
                href={hrefMatch ? hrefMatch[1] : '#'} 
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {textMatch ? textMatch[1] : ''}
              </a>
            );
          default:
            return part;
        }
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  return (
    <div className="prose prose-blue max-w-none">
      {parseMarkdown(content)}
    </div>
  );
};