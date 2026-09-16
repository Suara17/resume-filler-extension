// 监听扩展图标点击，优先切换当前页面上的悬浮卡片展开/折叠
chrome.action.onClicked.addListener(async (tab) => {
  if (tab && tab.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: "toggleFloatingCard" });
    } catch (e) {
      // 降级支持：在受限页面 (如 chrome://) 打开侧边栏
      if (chrome.sidePanel && chrome.sidePanel.open) {
        chrome.sidePanel.open({ tabId: tab.id }).catch(() => {});
      }
    }
  }
});

// 监听安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log("简历自动填充助手已成功安装！页面悬浮卡片已启用。");
});
