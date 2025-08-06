// src/components/AssistantBubble.tsx

import React from 'react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { saveAs } from 'file-saver';   // 轻量下载库
// npm i file-saver
// npm i -D @types/file-saver
import * as docx from 'docx';
import styles from '@/components/AssistantBubble.module.css';

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
    <div className={styles.bubble}>
      <MarkdownRenderer source={content} />

      {/* 保存按钮行 */}
      <div className={styles.bubble}>
        <button onClick={saveMd} style={{ marginRight: 6 }}>保存为 .md</button>
        <button onClick={saveDocx}>保存为 .docx</button>
      </div>
    </div>
  );
};

export default AssistantBubble;