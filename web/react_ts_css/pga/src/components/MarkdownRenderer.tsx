// src/components/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface Props {
  source: string;
}

const MarkdownRenderer: React.FC<Props> = ({ source }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
      components={{
        img: ({ ...props }) => (
          <img
            {...props}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
              marginTop: '8px',
            }}
            alt={props.alt || 'image'}
          />
        ),
        blockquote: ({ children }) => (
          <blockquote
            style={{
              margin: '8px 0',
              paddingLeft: '12px',
              borderLeft: '4px solid #ccc',
              color: '#555',
            }}
          >
            {children}
          </blockquote>
        ),
      }}
    >
      {source}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;