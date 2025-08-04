import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
}

const MarkdownRenderer: React.FC<Props> = ({ content }) => (
  <div className="prose prose-sm max-w-none">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  </div>
);

export default MarkdownRenderer;