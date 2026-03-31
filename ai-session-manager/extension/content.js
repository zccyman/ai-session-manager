/**
 * TabBit Chat Export - Content Script
 *
 * TabBitBrowser 聊天页面 DOM 结构:
 * - 页面基于 Next.js + React Server Components
 * - 每条消息有 [data-message-index] 和 [data-message-type] 属性:
 *     data-message-type="user"      -> 用户提问
 *     data-message-type="assistant" -> AI 回答
 * - 用户消息内含 .theme-user-message 容器
 * - AI 回答内含渲染后的 markdown (p/h3/ol/li 等带 node="[object Object]" 属性)
 * - AI 回答末尾有 [data-message-action-bar] 操作栏 (复制按钮)
 * - URL 格式: https://web.tabbitbrowser.com/chat/{uuid}
 */

(function () {
  'use strict';

  function extractConversation() {
    var messages = [];

    messages = extractByMessageType();
    if (messages.length > 0) return buildResult(messages);

    messages = extractByActionBarPattern();
    if (messages.length > 0) return buildResult(messages);

    messages = extractByThemeUserMessage();
    if (messages.length > 0) return buildResult(messages);

    return buildResult([]);
  }

  function buildResult(messages) {
    var title = document.title
      ? document.title.replace(/\s*[-|].*$/, '').trim()
      : '对话记录';
    return {
      messages: messages,
      pageTitle: title,
      markdown: formatMarkdown(messages, title)
    };
  }

  function isChatInputArea(el) {
    if (!el) return false;
    var cls = el.className || '';
    if (typeof cls === 'string' && (cls.includes('ChatInput') || cls.includes('chat-input'))) return true;
    if (el.getAttribute && el.getAttribute('label') === 'ChatInput') return true;
    return false;
  }

  function cleanClone(container) {
    var clone = container.cloneNode(true);
    var remove = clone.querySelectorAll(
      'button, [data-message-action-bar], style, script, [label="ChatInput"], [contenteditable]'
    );
    for (var i = 0; i < remove.length; i++) remove[i].remove();
    return (clone.innerText || clone.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
  }

  /**
   * 策略1 (主要): 利用 [data-message-type] 属性
   * 每条消息的顶层容器都有 data-message-type="user" 或 "assistant"
   */
  function extractByMessageType() {
    var messages = [];
    var msgElements = document.querySelectorAll('[data-message-type]');

    if (msgElements.length === 0) return messages;

    var sorted = Array.prototype.slice.call(msgElements);
    sorted.sort(function (a, b) {
      return (parseInt(a.getAttribute('data-message-index'), 10) || 0) -
             (parseInt(b.getAttribute('data-message-index'), 10) || 0);
    });

    for (var i = 0; i < sorted.length; i++) {
      var el = sorted[i];
      var type = el.getAttribute('data-message-type');
      if (isChatInputArea(el)) continue;

      var text = cleanClone(el);
      if (text.length === 0) continue;

      messages.push({
        role: type === 'user' ? 'user' : 'assistant',
        content: text
      });
    }

    return messages;
  }

  /**
   * 策略2: 利用 theme-user-message 类提取用户消息,
   * 用 data-message-action-bar 提取 AI 回答
   */
  function extractByThemeUserMessage() {
    var messages = [];
    var userBubbles = document.querySelectorAll('.theme-user-message');
    var actionBars = document.querySelectorAll('[data-message-action-bar]');

    if (userBubbles.length === 0 && actionBars.length === 0) return messages;

    var items = [];

    for (var i = 0; i < userBubbles.length; i++) {
      var bubble = userBubbles[i];
      var text = (bubble.innerText || '').trim();
      if (text.length > 0) {
        items.push({ role: 'user', content: text, el: bubble });
      }
    }

    for (var j = 0; j < actionBars.length; j++) {
      var actionBar = actionBars[j];
      var aiContainer = actionBar.parentElement;
      if (aiContainer) {
        var aiText = cleanClone(aiContainer);
        if (aiText.length > 0) {
          items.push({ role: 'assistant', content: aiText, el: actionBar });
        }
      }
    }

    items.sort(function (a, b) {
      if (!a.el || !b.el) return 0;
      var rA = a.el.getBoundingClientRect();
      var rB = b.el.getBoundingClientRect();
      return rA.top - rB.top;
    });

    for (var k = 0; k < items.length; k++) {
      messages.push({ role: items[k].role, content: items[k].content });
    }

    return messages;
  }

  /**
   * 策略3: 利用 data-message-action-bar 锚点,
   * 通过 [data-message-type] 向上查找消息容器来配对用户提问
   */
  function extractByActionBarPattern() {
    var messages = [];
    var actionBars = document.querySelectorAll('[data-message-action-bar]');

    if (actionBars.length === 0) return messages;

    for (var i = 0; i < actionBars.length; i++) {
      var actionBar = actionBars[i];

      var aiMsgEl = findAncestorByAttr(actionBar, 'data-message-type');
      if (aiMsgEl) {
        var aiText = cleanClone(aiMsgEl);
        if (aiText.length > 0) {
          var prevUser = findPrevSiblingByType(aiMsgEl, 'user');
          if (prevUser) {
            var userText = cleanClone(prevUser);
            if (userText.length > 0) {
              messages.push({ role: 'user', content: userText });
            }
          }
          messages.push({ role: 'assistant', content: aiText });
        }
      } else {
        var parent = actionBar.parentElement;
        if (parent) {
          var text = cleanClone(parent);
          if (text.length > 0) {
            messages.push({ role: 'assistant', content: text });
          }
        }
      }
    }

    return messages;
  }

  function findAncestorByAttr(el, attr) {
    var current = el.parentElement;
    var depth = 15;
    while (current && depth-- > 0) {
      if (current.getAttribute && current.getAttribute(attr) !== null) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  function findPrevSiblingByType(el, type) {
    var current = el.previousElementSibling;
    while (current) {
      var msgType = current.getAttribute('data-message-type');
      if (msgType === type) return current;
      if (msgType !== null) return null;
      current = current.previousElementSibling;
    }
    return null;
  }

  /**
   * 格式化为 Markdown
   */
  function formatMarkdown(messages, title) {
    var md = '';
    if (title) {
      md += '# ' + title + '\n\n';
    }
    md += '---\n\n';

    var qNum = 0;
    var aNum = 0;

    for (var i = 0; i < messages.length; i++) {
      var msg = messages[i];
      if (msg.role === 'user') {
        qNum++;
        md += '### 提问 ' + qNum + '\n\n';
        md += msg.content + '\n\n';
      } else {
        aNum++;
        md += '### 回答 ' + aNum + '\n\n';
        md += msg.content + '\n\n';
        md += '---\n\n';
      }
    }

    return md.trim();
  }

  // === 消息监听 ===
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'extractConversation') {
      try {
        var result = extractConversation();
        sendResponse({ success: true, data: result });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
      return true;
    }

    if (request.action === 'ping') {
      sendResponse({ success: true, pong: true });
      return true;
    }
  });

})();
