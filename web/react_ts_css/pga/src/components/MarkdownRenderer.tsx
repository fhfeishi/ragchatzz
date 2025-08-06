// src/components/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import styles from '@/components/MarkdownRenderer.module.css';

interface Props {
  source: string;
}

const MarkdownRenderer: React.FC<Props> = ({ source }) => {
  return (
    <div className={styles.markdown}> {/* 在外层包裹 */}
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
                borderRadius: 8,
                marginTop: 8,
              }}
              alt={props.alt || 'image'}
            />
          ),
          blockquote: ({ children }) => (
            <blockquote
              style={{
                margin: '8px 0',
                paddingLeft: 12,
                borderLeft: '4px solid #ccc',
                color: '#555',
              }}
            >
              {children}
            </blockquote>
          ),
          // 其他标签如 h1, p, a 等也可以自定义
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;