/**
 * AI Session Manager - Browser Extension Popup
 * 提取标签页内容并发送到 AI Session Manager
 */

(function () {
  'use strict';

  var statusEl = document.getElementById('status');
  var statsSection = document.getElementById('statsSection');
  var questionCountEl = document.getElementById('questionCount');
  var answerCountEl = document.getElementById('answerCount');
  var charCountEl = document.getElementById('charCount');
  var extractBtn = document.getElementById('extractBtn');
  var extractAllBtn = document.getElementById('extractAllBtn');
  var sendBtn = document.getElementById('sendBtn');
  var sendAllBtn = document.getElementById('sendAllBtn');
  var copyBtn = document.getElementById('copyBtn');
  var downloadBtn = document.getElementById('downloadBtn');
  var apiUrlInput = document.getElementById('apiUrl');

  var extractedData = null;
  var allExtractedData = [];

  // 从 storage 加载 API URL
  chrome.storage.local.get(['apiUrl'], function (result) {
    if (result.apiUrl) {
      apiUrlInput.value = result.apiUrl;
    }
  });

  // 保存 API URL
  apiUrlInput.addEventListener('change', function () {
    chrome.storage.local.set({ apiUrl: apiUrlInput.value });
  });

  function showStatus(type, text) {
    statusEl.className = 'status ' + type;
    statusEl.textContent = text;
    statusEl.classList.remove('hidden');
  }

  function updateStats(data) {
    if (!data) {
      statsSection.classList.add('hidden');
      return;
    }
    var q = data.messages.filter(function (m) { return m.role === 'user'; });
    var a = data.messages.filter(function (m) { return m.role === 'assistant'; });
    questionCountEl.textContent = q.length;
    answerCountEl.textContent = a.length;
    charCountEl.textContent = data.markdown.length;
    statsSection.classList.remove('hidden');
  }

  function getCurrentTab() {
    return chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
      return tabs[0];
    });
  }

  function getAllTabs() {
    return chrome.tabs.query({ url: '*://*.tabbitbrowser.com/chat/*' });
  }

  function isTabBitPage(url) {
    return url && url.includes('tabbitbrowser.com') && url.includes('/chat/');
  }

  async function ensureContentScript(tabId) {
    try {
      var response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
      if (response && response.pong) return true;
    } catch (e) {}

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      await new Promise(function (r) { setTimeout(r, 200); });
      return true;
    } catch (e) {
      console.error('Failed to inject content script:', e);
      return false;
    }
  }

  async function extractFromTab(tab) {
    if (!isTabBitPage(tab.url)) {
      return null;
    }

    var injected = await ensureContentScript(tab.id);
    if (!injected) {
      return null;
    }

    try {
      var response = await chrome.tabs.sendMessage(tab.id, { action: 'extractConversation' });
      if (!response || !response.success || !response.data.messages || response.data.messages.length === 0) {
        return null;
      }
      return {
        ...response.data,
        url: tab.url,
        tabId: tab.id
      };
    } catch (error) {
      console.error('Extract failed for tab:', tab.id, error);
      return null;
    }
  }

  async function extractConversation() {
    var tab = await getCurrentTab();

    if (!tab) {
      showStatus('error', '无法获取当前标签页');
      return null;
    }

    if (!isTabBitPage(tab.url)) {
      showStatus('error', '请在 TabBitBrowser 的聊天页面中使用');
      return null;
    }

    showStatus('info', '正在提取对话...');

    var data = await extractFromTab(tab);

    if (!data) {
      showStatus('error', '未找到对话内容');
      return null;
    }

    extractedData = data;
    showStatus('success', '✓ 成功提取 ' + extractedData.messages.length + ' 条消息');
    updateStats(extractedData);

    sendBtn.classList.remove('hidden');
    copyBtn.classList.remove('hidden');
    downloadBtn.classList.remove('hidden');

    return extractedData;
  }

  async function extractAllTabs() {
    showStatus('info', '正在查找所有 TabBitBrowser 标签页...');

    var tabs = await getAllTabs();

    if (tabs.length === 0) {
      showStatus('error', '未找到 TabBitBrowser 聊天标签页');
      return;
    }

    showStatus('info', '找到 ' + tabs.length + ' 个标签页，正在提取...');

    allExtractedData = [];
    var successCount = 0;
    var failCount = 0;

    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      showStatus('info', '正在提取 (' + (i + 1) + '/' + tabs.length + '): ' + (tab.title || '标签页'));

      var data = await extractFromTab(tab);
      if (data) {
        allExtractedData.push(data);
        successCount++;
      } else {
        failCount++;
      }
    }

    if (allExtractedData.length === 0) {
      showStatus('error', '未能提取任何内容');
      return;
    }

    showStatus('success', '✓ 成功提取 ' + successCount + ' 个标签页' + (failCount > 0 ? '，失败 ' + failCount + ' 个' : ''));

    // 更新统计
    var totalMessages = allExtractedData.reduce(function (sum, d) { return sum + d.messages.length; }, 0);
    var totalChars = allExtractedData.reduce(function (sum, d) { return sum + d.markdown.length; }, 0);
    questionCountEl.textContent = allExtractedData.length;
    answerCountEl.textContent = totalMessages;
    charCountEl.textContent = totalChars;
    statsSection.classList.remove('hidden');

    sendAllBtn.classList.remove('hidden');
  }

  async function sendToServer() {
    if (!extractedData) {
      showStatus('error', '请先提取对话内容');
      return;
    }

    var apiUrl = apiUrlInput.value.trim();
    if (!apiUrl) {
      showStatus('error', '请输入 API 地址');
      return;
    }

    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="spinner"></span><span>发送中...</span>';

    try {
      var response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: extractedData.pageTitle,
          url: extractedData.url,
          markdown: extractedData.markdown,
          messages: extractedData.messages,
          source: 'tabbit'
        })
      });

      if (!response.ok) {
        throw new Error('服务器错误: ' + response.status);
      }

      var result = await response.json();
      showStatus('success', '✓ 已发送到 AI Session Manager');
    } catch (error) {
      showStatus('error', '发送失败: ' + error.message);
    } finally {
      sendBtn.innerHTML = '<span>🚀</span><span>发送到 AI Session Manager</span>';
      sendBtn.disabled = false;
    }
  }

  async function sendAllToServer() {
    if (allExtractedData.length === 0) {
      showStatus('error', '请先提取标签页内容');
      return;
    }

    var apiUrl = apiUrlInput.value.trim();
    if (!apiUrl) {
      showStatus('error', '请输入 API 地址');
      return;
    }

    sendAllBtn.disabled = true;
    sendAllBtn.innerHTML = '<span class="spinner"></span><span>发送中...</span>';

    var successCount = 0;
    var failCount = 0;

    for (var i = 0; i < allExtractedData.length; i++) {
      var data = allExtractedData[i];
      showStatus('info', '正在发送 (' + (i + 1) + '/' + allExtractedData.length + '): ' + (data.pageTitle || '标签页'));

      try {
        var response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.pageTitle,
            url: data.url,
            markdown: data.markdown,
            messages: data.messages,
            source: 'tabbit'
          })
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    showStatus('success', '✓ 成功发送 ' + successCount + ' 个标签页' + (failCount > 0 ? '，失败 ' + failCount + ' 个' : ''));

    sendAllBtn.innerHTML = '<span>🚀</span><span>一键发送所有</span>';
    sendAllBtn.disabled = false;
  }

  async function copyToClipboard() {
    if (!extractedData) return;

    try {
      await navigator.clipboard.writeText(extractedData.markdown);
      showStatus('success', '✓ 已复制到剪贴板');
    } catch (e) {
      var ta = document.createElement('textarea');
      ta.value = extractedData.markdown;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showStatus('success', '✓ 已复制到剪贴板');
      } catch (err) {
        showStatus('error', '复制失败');
      }
      document.body.removeChild(ta);
    }
  }

  function downloadMarkdown() {
    if (!extractedData) return;

    var blob = new Blob([extractedData.markdown], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (extractedData.pageTitle || '对话记录').replace(/[<>:"/\\|?*]/g, '_') + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showStatus('success', '✓ 文件已开始下载');
  }

  extractBtn.addEventListener('click', extractConversation);
  extractAllBtn.addEventListener('click', extractAllTabs);
  sendBtn.addEventListener('click', sendToServer);
  sendAllBtn.addEventListener('click', sendAllToServer);
  copyBtn.addEventListener('click', copyToClipboard);
  downloadBtn.addEventListener('click', downloadMarkdown);

  // 初始化
  getCurrentTab().then(function (tab) {
    if (!tab || !isTabBitPage(tab.url)) {
      showStatus('info', '请在 TabBitBrowser 聊天页面中使用');
      extractBtn.disabled = true;
    } else {
      showStatus('info', '准备就绪，点击按钮提取对话');
    }
  });
})();
