// static/js/chat.js

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");
const loading = document.getElementById("loading");

// 自动调整 textarea 高度
userInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 120) + "px";
});

// 发送消息
function send() {
  const question = userInput.value.trim();
  if (!question) return;

  // 显示用户消息
  addMessage("user", question);
  userInput.value = "";
  userInput.style.height = "auto";

  // 显示加载状态
  loading.classList.remove("hidden");
  scrollToBottom();

  // 请求流式回答
  const eventSource = new EventSource(`/api/chat/stream?question=${encodeURIComponent(question)}`);
  let answer = "";

  eventSource.onmessage = function (event) {
    const data = event.data;

    if (data === "[END]") {
      eventSource.close();
      loading.classList.add("hidden");
      return;
    }

    if (data.startsWith("[ERROR]")) {
      addMessage("bot", "抱歉，发生错误：" + data.slice(8));
      eventSource.close();
      loading.classList.add("hidden");
      return;
    }

    // 累积 token
    answer += data;

    // 如果还没有 bot 消息，先创建一个
    if (answer.length === data.length) {
      addMessage("bot", "");
    }

    // 更新最后一条 bot 消息
    const botMessages = chatBox.getElementsByClassName("bot");
    if (botMessages.length > 0) {
      botMessages[botMessages.length - 1].querySelector("p").textContent = answer;
    }

    scrollToBottom();
  };

  eventSource.onerror = function () {
    if (loading.classList.contains("hidden")) return;
    addMessage("bot", "网络错误，无法获取回答。");
    loading.classList.add("hidden");
    eventSource.close();
    scrollToBottom();
  };
}

// 添加消息
function addMessage(sender, text) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.innerHTML = `<p>${text}</p>`;
  chatBox.appendChild(div);
  scrollToBottom();
}

// 滚动到底部
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 回车发送（Shift+Enter 换行）
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

// 点击发送按钮
sendButton.addEventListener("click", send);