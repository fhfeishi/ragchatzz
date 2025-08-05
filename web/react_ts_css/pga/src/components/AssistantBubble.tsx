// src/components/AssistantBubble.tsx
import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { saveAs } from 'file-saver';   // 轻量下载库
// npm i file-saver
// npm i -D @types/file-saver
import * as docx from 'docx';


interface Props {
  content: string;
}

const AssistantBubble: React.FC<Props> = ({ content }) => {
  // 保存 Markdown
  const saveMd = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, 'answer.md');
  };

  // 保存 Word
  const saveDocx = async () => {
    const doc = new docx.Document({
      sections: [
        {
          properties: {},
          children: [
            new docx.Paragraph({
              text: content,
              style: 'BodyText',
            }),
          ],
        },
      ],
    });

    const buffer = await docx.Packer.toBlob(doc);
    saveAs(buffer, 'answer.docx');
  };

  return (
    <div
      style={{
        alignSelf: 'flex-start',
        maxWidth: '80%',
        padding: '12px 16px',
        borderRadius: '12px',
        background: '#f2f4f7',
        color: '#111',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <MarkdownRenderer source={content} />

      {/* 保存按钮行 */}
      <div style={{ marginTop: 8, textAlign: 'right' }}>
        <button onClick={saveMd} style={{ marginRight: 6 }}>
          保存为 .md
        </button>
        <button onClick={saveDocx}>保存为 .docx</button>
      </div>
    </div>
  );
};

export default AssistantBubble;