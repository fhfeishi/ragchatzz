// src/pages/Chat.tsx
import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import AssistantBubble from '@/components/AssistantBubble';
import { useChatStore } from '@/stores/chatStore';
import styles from './Chat.module.css';


// 示例回答    --->  todo. 之后就是获取 llm-answer的markdown
const fakeMarkdown = `
以下 3 件最新公开的灵巧手相关专利，分别从“驱动-传动-感知”三大维度展示了目前行业最关注的创新点，可供后续研发快速借鉴。
## 1. 灵巧智能《一种三自由度腱绳驱动灵巧手指》公开号：CN1155xxxxxA（2025-03）
### 亮点速读
- 单指 3 DOF：第一、二指节由“微型电机＋涡轮蜗杆＋绞盘＋钢丝绳”间接驱动，第三指节由同轴电机直驱，实现“两级腱绳＋一级直驱”的混合传动，兼顾大抓握力与末端精细控制[引用1-原创力文档](https://max.book118.com/html/2024/0529/7064063015006114.shtm)
- 结构紧凑：所有执行器均藏在手掌内，手指本体外径≤14 mm，可直接替换现有夹爪末端。
- 低成本复用：钢丝绳采用标准 0.3 mm 航空级钢索，维修时无需拆整手，30 秒快拆更换。
  
![图1-图1的相关描述](/demoss/图1.jpg)
<center>图1-图1的相关描述</center>


## 2. 新剑机电《无框力矩电机＋行星滚柱丝杠灵巧手》公开号：CN1178xxxxxA（2024-12）
### 亮点速读
- 15 DOF 全驱方案：每根手指均用一颗 20 mm 无框力矩电机驱动，通过行星滚柱丝杠将旋转运动变为直线，再经 3 级连杆放大为关节转角，整手仅需 5 颗电机即可实现 15 个主动自由度。[引用2-原创力·专利](https://zhuanli.book118.com/view/191212024fs25t2112421096.html)
- 高负载-低回差：丝杠导程 0.5 mm，理论传动效率 90%，在指尖可输出 5 kg 持续力而回差＜0.1°，满足工业插拔、拧紧等高精度场景。
- 模块化手指：拇指、食指可热插拔为 3 DOF 高灵活度模块，其余手指可替换 1 DOF 低成本模块，同一手掌兼容两种配置。

![图2-图2的相关描述](/demoss/图2.jpg)
<center>图2-图2的相关描述</center>


## 3. 腾讯 Robotics X《TRX-Hand 刚柔混合驱动灵巧手》公开号：CN1169xxxxxA（2024-06）
### 亮点速读
- 刚柔混合驱动：8 个关节中 3 个采用“微型伺服电机＋谐波减速”刚性驱动，5 个采用“形状记忆合金弹簧＋柔性铰链”弹性驱动，既保证高速大负载（指尖 15 N、关节 600 °/s），又能在碰撞时通过柔性关节吸收能量，整机寿命提升 10 倍。[引用3-搜狐](https://www.sohu.com/a/670524247_320333)
-  全掌高密度感知：指尖、指腹、掌面共布置 240 点柔性触觉阵列＋1 颗微型激光雷达，实现 3 mm 分辨率、0.05 g 力变化检测，支持“盲抓”柔软物体。[引用4腾讯网](https://news.qq.com/rain/a/20230425A05J7700)
- 算法开源：配套发布 ROS2 驱动包和抓取数据集，开发者可直接调用 MoveIt! 和 YOLO-Grasp 模型完成二次开发。[引用5-知乎](https://zhuanlan.zhihu.com/p/625631528)

![图3-图3的相关描述](/demoss/图3.jpg)
<center>图3-图3的相关描述</center>
`;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const Chat: React.FC = () => {
  const {
    addMessage,
    activeId,
    conversations,
  } = useChatStore();

  const activeConv = conversations.find(c => c.id === activeId);
  const messages = activeConv?.messages ?? [];

  const [input, setInput] = React.useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatMainRef = useRef<HTMLDivElement>(null);

  // 获取多轮对话区域的宽度
  const chatWidth = chatMainRef.current?.clientWidth || 0;

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // 滚动到底部
  useEffect(() => {
    if (chatMainRef.current) {
      chatMainRef.current.scrollTop = chatMainRef.current.scrollHeight;
    }
  }, [messages]);

  // 用户发送
  const handleSend = () => {
    if (!input.trim()) return;
    // 把用户消息加到当前会话
    addMessage(activeId!, { role: 'user', content: input });
    setInput('');

    // 模拟 LLM 回答
    setTimeout(() => {
      addMessage(activeId!, { role: 'assistant', content: fakeMarkdown });
    }, 600);
  };

  // 键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.chatContainer}>
      {/* 对话列表 */}
      <main className={styles.chatMain} ref={chatMainRef}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>开始你的第一段对话吧！</div>
        ): (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`${styles.messageBubble} ${
                msg.role === 'user' ? styles.userBubble : styles.assistantBubble
              }`}
            >
              {msg.role === 'assistant' ? (
                <AssistantBubble content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          ))
        )}
      </main>

      {/* 输入区域 */}
      <footer className={styles.chatFooter}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="回车发送，Shift+Enter 换行"
          style={{ resize: 'none', overflow: 'hidden' }}
        />
        <button onClick={handleSend} className={styles.sendBtn}>发送</button>
      </footer>
    </div>
  );
};

export default Chat;