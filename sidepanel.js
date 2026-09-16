// 默认数据结构
const defaultResumeData = {
  basic: {
    name: "",
    gender: "",
    ethnicity: "",        // 新增：民族
    birth: "",
    height: "",           // 新增：身高
    weight: "",           // 新增：体重
    phone: "",
    email: "",
    political: "",
    city: "",
    nativePlace: "",
    website: "",
    github: "",           // 新增：GitHub主页
    emergencyContact: "", // 新增：紧急联系人姓名
    emergencyRelation: "",// 新增：与紧急联系人关系
    emergencyPhone: "",   // 新增：紧急联系人电话
    jobIntent: "",
    selfEval: "",
    selfDescription: "",  // 新增：自我描述
    highestDegree: "",    // 新增：最高学历
    country: "",          // 新增：当前所在国家
    acceptRelocation: "", // 新增：是否接受调剂
    extraInfo: "",        // 新增：补充说明
    idCard: "",           // 新增：身份证号
    wechat: "",           // 新增：微信号
    residence: ""         // 新增：现居地（详细地址）
  },
  education: [], // { school: "", degree: "", major: "", start: "", end: "", gpa: "", supervisor: "", courses: "", researchDirection: "", department: "", labExperience: "", studentId: "", schoolLocation: "" }
  internship: [], // { company: "", position: "", start: "", end: "", desc: "" }
  project: [], // { name: "", role: "", start: "", end: "", desc: "", duty: "", result: "", tech: "" }
  competition: [], // 新增：赛事经验
  paper: [], // 新增：论文/期刊
  skills: "",
  languages: "", // 新增：语言能力
  honors: [], // { name: "", date: "", level: "" }
  family: []  // { relation: "", name: "", company: "", position: "", phone: "" }
};

let resumeData = JSON.parse(JSON.stringify(defaultResumeData));
let resumesList = [];
let activeResumeId = "default";

// DOM 元素加载完成后执行
document.addEventListener("DOMContentLoaded", async () => {
  // 初始化加载数据
  await loadFromStorage();
  await loadApiConfig(); // 加载 API 接口配置

  // 初始化绑定事件
  initTabEvents();
  initFormBindings();
  initListActionEvents();
  initSystemActionEvents();

  // 渲染动态列表
  renderAllLists();

  // 填充 API 接口配置表单
  fillApiConfigForm();

  // 延迟调整所有文本框高度以适配内容
  setTimeout(adjustAllTextareas, 50);
});

// 从 Chrome Storage 加载数据
async function loadFromStorage() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["resumesList", "activeResumeId", "resumeData"], (result) => {
        if (result.resumesList && result.resumesList.length > 0) {
          resumesList = result.resumesList;
          activeResumeId = result.activeResumeId || resumesList[0].id;
        } else if (result.resumeData) {
          // 自动从旧版单简历数据迁移
          console.log("检测到旧版简历数据，正在自动迁移为多版本列表...");
          resumesList = [{
            id: "default",
            name: "默认简历",
            data: result.resumeData
          }];
          activeResumeId = "default";
          
          // 保存迁移后的列表并清除旧的单简历键
          chrome.storage.local.set({ resumesList, activeResumeId });
          chrome.storage.local.remove("resumeData");
        } else {
          // 初始化默认数据
          resumesList = [{
            id: "default",
            name: "默认简历",
            data: JSON.parse(JSON.stringify(defaultResumeData))
          }];
          activeResumeId = "default";
        }
        
        // 获取当前激活 of 简历数据
        const activeResume = resumesList.find(r => r.id === activeResumeId) || resumesList[0];
        resumeData = mergeWithDefault(activeResume.data, defaultResumeData);
        
        // 渲染版本下拉框
        renderResumeVersionDropdown();
        fillBasicForm();
        resolve();
      });
    } else {
      // 兼容非插件环境测试
      const localList = localStorage.getItem("resumesList");
      const localActiveId = localStorage.getItem("activeResumeId");
      const oldLocalData = localStorage.getItem("resumeData");
      
      if (localList) {
        resumesList = JSON.parse(localList);
        activeResumeId = localActiveId || resumesList[0].id;
      } else if (oldLocalData) {
        resumesList = [{
          id: "default",
          name: "默认简历",
          data: JSON.parse(oldLocalData)
        }];
        activeResumeId = "default";
        localStorage.setItem("resumesList", JSON.stringify(resumesList));
        localStorage.setItem("activeResumeId", activeResumeId);
        localStorage.removeItem("resumeData");
      } else {
        resumesList = [{
          id: "default",
          name: "默认简历",
          data: JSON.parse(JSON.stringify(defaultResumeData))
        }];
        activeResumeId = "default";
      }
      
      const activeResume = resumesList.find(r => r.id === activeResumeId) || resumesList[0];
      resumeData = mergeWithDefault(activeResume.data, defaultResumeData);
      
      renderResumeVersionDropdown();
      fillBasicForm();
      resolve();
    }
  });
}

// 递归合并对象，确保旧数据升级时拥有新字段
function mergeWithDefault(obj, defaults) {
  if (obj === null || typeof obj !== 'object') return defaults;
  const result = Array.isArray(obj) ? [] : {};
  
  // 复制默认结构
  for (let key in defaults) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = mergeWithDefault(obj[key], defaults[key]);
      } else {
        result[key] = obj[key];
      }
    } else {
      result[key] = JSON.parse(JSON.stringify(defaults[key]));
    }
  }
  
  // 保留 obj 中原本拥有但 defaults 里没有的字段（如有）
  for (let key in obj) {
    if (!result.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

// 保存数据到 Chrome Storage
function saveToStorage() {
  // 同步当前活跃简历的数据到 resumesList 中
  const activeIdx = resumesList.findIndex(r => r.id === activeResumeId);
  if (activeIdx !== -1) {
    resumesList[activeIdx].data = resumeData;
  }
  
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ resumesList, activeResumeId }, () => {
      console.log("数据已自动保存");
    });
  } else {
    localStorage.setItem("resumesList", JSON.stringify(resumesList));
    localStorage.setItem("activeResumeId", activeResumeId);
  }
}

// 填充基本信息和专业技能的表单
function fillBasicForm() {
  // 填充基本信息输入框
  document.querySelectorAll("[data-key^='basic.']").forEach((input) => {
    const key = input.getAttribute("data-key").split(".")[1];
    input.value = resumeData.basic[key] || "";
  });

  // 填充技能文本域
  const skillsTextarea = document.querySelector("[data-key='skills']");
  if (skillsTextarea) {
    skillsTextarea.value = resumeData.skills || "";
  }

  // 填充语言能力文本域
  const languagesTextarea = document.querySelector("[data-key='languages']");
  if (languagesTextarea) {
    languagesTextarea.value = resumeData.languages || "";
  }
}

// ==================== UI 渲染与动态绑定 ====================

// 渲染所有动态列表
function renderAllLists() {
  renderEducationList();
  renderInternshipList();
  renderProjectList();
  renderHonorsList();
  renderCompetitionList();
  renderPaperList();
  adjustAllTextareas();
}

// 渲染教育经历列表
function renderEducationList() {
  const container = document.getElementById("education-list");
  container.innerHTML = "";

  if (resumeData.education.length === 0) {
    container.innerHTML = `<div class="empty-tip">暂无教育经历，请点击下方按钮添加</div>`;
    return;
  }

  resumeData.education.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-index", index);
    card.innerHTML = `
      <div class="card-header">
        <span class="card-title">教育经历 #${index + 1}</span>
        <div class="card-actions">
          <button class="btn btn-secondary btn-sm btn-fill-section" data-type="education" data-index="${index}" title="填充本段教育经历">
            填充此项
          </button>
          <button class="btn btn-danger btn-sm btn-delete-card" data-type="education" data-index="${index}">
            删除
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">学校名称</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="education" data-index="${index}" data-key="school" value="${item.school || ''}" placeholder="如：北京大学">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="education.${index}.school" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="education.${index}.school" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">学历学位</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="education" data-index="${index}" data-key="degree" value="${item.degree || ''}" placeholder="如：本科/硕士/博士">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="education.${index}.degree" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="education.${index}.degree" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">学号</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="education" data-index="${index}" data-key="studentId" value="${item.studentId || ''}" placeholder="如：2020123456">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="education.${index}.studentId" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="education.${index}.studentId" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">学校所在地</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="education" data-index="${index}" data-key="schoolLocation" value="${item.schoolLocation || ''}" placeholder="如：北京市海淀区">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="education.${index}.schoolLocation" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="education.${index}.schoolLocation" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">所学专业</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="education" data-index="${index}" data-key="major" value="${item.major || ''}" placeholder="如：计算机科学与技术">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="education.${index}.major" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="education.${index}.major" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">GPA/成绩排名</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="education" data-index="${index}" data-key="gpa" value="${item.gpa || ''}" placeholder="如：3.8/4.0 或 前10%">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="education.${index}.gpa" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="education.${index}.gpa" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">入学时间</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="education" data-index="${index}" data-key="start" value="${item.start || ''}" placeholder="如：2020-09">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="education.${index}.start" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="education.${index}.start" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">毕业时间</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="education" data-index="${index}" data-key="end" value="${item.end || ''}" placeholder="如：2024-06">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="education.${index}.end" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="education.${index}.end" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">院系名称</label>
          <div class="form-input-wrapper">
            <input type="text" class="form-control card-input" data-type="education" data-index="${index}" data-key="department" value="${item.department || ''}" placeholder="如：计算机科学与技术学院">
            <div class="field-actions">
              <button class="field-btn btn-copy" data-ref="education.${index}.department" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="education.${index}.department" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">导师姓名</label>
          <div class="form-input-wrapper">
            <input type="text" class="form-control card-input" data-type="education" data-index="${index}" data-key="supervisor" value="${item.supervisor || ''}" placeholder="如：李教授 / 张老师">
            <div class="field-actions">
              <button class="field-btn btn-copy" data-ref="education.${index}.supervisor" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="education.${index}.supervisor" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">专业描述</label>
          <div class="form-input-wrapper">
            <textarea class="form-control card-input" data-type="education" data-index="${index}" data-key="majorDescription" placeholder="专业特色、主修方向、专业概述说明...">${item.majorDescription || ''}</textarea>
            <div class="field-actions" style="top: 8px;">
              <button class="field-btn btn-ai-modify" data-ref="education.${index}.majorDescription" title="AI 优化本项"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93(MD5)l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg></button>
              <button class="field-btn btn-copy" data-ref="education.${index}.majorDescription" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="education.${index}.majorDescription" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">毕业论文/设计/作品</label>
          <div class="form-input-wrapper">
            <textarea class="form-control card-input" data-type="education" data-index="${index}" data-key="thesisTopic" placeholder="毕设题目、毕业设计或作品主要内容...">${item.thesisTopic || ''}</textarea>
            <div class="field-actions" style="top: 8px;">
              <button class="field-btn btn-ai-modify" data-ref="education.${index}.thesisTopic" title="AI 优化本项"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93(MD5)l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg></button>
              <button class="field-btn btn-copy" data-ref="education.${index}.thesisTopic" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="education.${index}.thesisTopic" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">主修课程</label>
          <div class="form-input-wrapper">
            <textarea class="form-control card-input" data-type="education" data-index="${index}" data-key="courses" placeholder="核心课程，以逗号隔开">${item.courses || ''}</textarea>
            <div class="field-actions" style="top: 8px;">
              <button class="field-btn btn-ai-modify" data-ref="education.${index}.courses" title="AI 优化本项"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93(MD5)l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg></button>
              <button class="field-btn btn-copy" data-ref="education.${index}.courses" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="education.${index}.courses" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">研究方向</label>
          <div class="form-input-wrapper">
            <input type="text" class="form-control card-input" data-type="education" data-index="${index}" data-key="researchDirection" value="${item.researchDirection || ''}" placeholder="如：计算机视觉 / 自然语言处理 / 大模型应用">
            <div class="field-actions">
              <button class="field-btn btn-copy" data-ref="education.${index}.researchDirection" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="education.${index}.researchDirection" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">是否有实验室经历 / 科研经历说明</label>
          <div class="form-input-wrapper">
            <textarea class="form-control card-input" data-type="education" data-index="${index}" data-key="labExperience" placeholder="描述你的实验室科研项目、主要贡献、担任角色等...">${item.labExperience || ''}</textarea>
            <div class="field-actions" style="top: 8px;">
              <button class="field-btn btn-ai-modify" data-ref="education.${index}.labExperience" title="AI 优化本项"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg></button>
              <button class="field-btn btn-copy" data-ref="education.${index}.labExperience" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="education.${index}.labExperience" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// 渲染实习经历列表
function renderInternshipList() {
  const container = document.getElementById("internship-list");
  container.innerHTML = "";

  if (resumeData.internship.length === 0) {
    container.innerHTML = `<div class="empty-tip">暂无工作实习经历，请点击下方按钮添加</div>`;
    return;
  }

  resumeData.internship.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-index", index);
    card.innerHTML = `
      <div class="card-header">
        <span class="card-title">工作实习 #${index + 1}</span>
        <div class="card-actions">
          <button class="btn btn-secondary btn-sm btn-fill-section" data-type="internship" data-index="${index}" title="填充本段工作实习经历">
            填充此项
          </button>
          <button class="btn btn-danger btn-sm btn-delete-card" data-type="internship" data-index="${index}">
            删除
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">公司/组织</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="internship" data-index="${index}" data-key="company" value="${item.company || ''}" placeholder="如：字节跳动">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="internship.${index}.company" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="internship.${index}.company" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">职位名称</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="internship" data-index="${index}" data-key="position" value="${item.position || ''}" placeholder="如：前端开发实习生">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="internship.${index}.position" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="internship.${index}.position" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">开始时间</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="internship" data-index="${index}" data-key="start" value="${item.start || ''}" placeholder="如：2023-06">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="internship.${index}.start" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="internship.${index}.start" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">结束时间</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="internship" data-index="${index}" data-key="end" value="${item.end || ''}" placeholder="如：2023-09 或 至今">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="internship.${index}.end" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="internship.${index}.end" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">职责与工作内容</label>
          <div class="form-input-wrapper">
            <textarea class="form-control card-input" data-type="internship" data-index="${index}" data-key="desc" placeholder="简述你的工作职责，开发内容，技术产出等...">${item.desc || ''}</textarea>
            <div class="field-actions" style="top: 8px;">
              <button class="field-btn btn-ai-modify" data-ref="internship.${index}.desc" title="AI 优化本项"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg></button>
              <button class="field-btn btn-copy" data-ref="internship.${index}.desc" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="internship.${index}.desc" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// 渲染项目经历列表
function renderProjectList() {
  const container = document.getElementById("project-list");
  container.innerHTML = "";

  if (resumeData.project.length === 0) {
    container.innerHTML = `<div class="empty-tip">暂无项目经历，请点击下方按钮添加</div>`;
    return;
  }

  resumeData.project.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-index", index);
    card.innerHTML = `
      <div class="card-header">
        <span class="card-title">项目经历 #${index + 1}</span>
        <div class="card-actions">
          <button class="btn btn-secondary btn-sm btn-fill-section" data-type="project" data-index="${index}" title="填充本段项目经历">
            填充此项
          </button>
          <button class="btn btn-danger btn-sm btn-delete-card" data-type="project" data-index="${index}">
            删除
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">项目名称</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="project" data-index="${index}" data-key="name" value="${item.name || ''}" placeholder="如：在线简历助手">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="project.${index}.name" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="project.${index}.name" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">担任角色</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="project" data-index="${index}" data-key="role" value="${item.role || ''}" placeholder="如：项目负责人/前端开发">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="project.${index}.role" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="project.${index}.role" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">开始时间</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="project" data-index="${index}" data-key="start" value="${item.start || ''}" placeholder="如：2023-10">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="project.${index}.start" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="project.${index}.start" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">结束时间</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="project" data-index="${index}" data-key="end" value="${item.end || ''}" placeholder="如：2023-12">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="project.${index}.end" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="project.${index}.end" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">主要技术栈</label>
          <div class="form-input-wrapper">
            <input type="text" class="form-control card-input" data-type="project" data-index="${index}" data-key="tech" value="${item.tech || ''}" placeholder="如：React, FastAPI, Docker">
            <div class="field-actions">
              <button class="field-btn btn-copy" data-ref="project.${index}.tech" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="project.${index}.tech" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">项目描述</label>
          <div class="form-input-wrapper">
            <textarea class="form-control card-input" data-type="project" data-index="${index}" data-key="desc" placeholder="描述项目背景、目标定位、业务场景与系统核心架构...">${item.desc || ''}</textarea>
            <div class="field-actions" style="top: 8px;">
              <button class="field-btn btn-ai-modify" data-ref="project.${index}.desc" title="AI 优化本项"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg></button>
              <button class="field-btn btn-copy" data-ref="project.${index}.desc" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="project.${index}.desc" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">项目职责</label>
          <div class="form-input-wrapper">
            <textarea class="form-control card-input" data-type="project" data-index="${index}" data-key="duty" placeholder="描述你在项目中承担的核心角色职责、负责的具体模块开发与技术工作...">${item.duty || ''}</textarea>
            <div class="field-actions" style="top: 8px;">
              <button class="field-btn btn-ai-modify" data-ref="project.${index}.duty" title="AI 优化本项"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg></button>
              <button class="field-btn btn-copy" data-ref="project.${index}.duty" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="project.${index}.duty" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">项目成果</label>
          <div class="form-input-wrapper">
            <textarea class="form-control card-input" data-type="project" data-index="${index}" data-key="result" placeholder="描述项目的量化指标提升、业务收益、线上成效或竞赛获奖成果...">${item.result || ''}</textarea>
            <div class="field-actions" style="top: 8px;">
              <button class="field-btn btn-ai-modify" data-ref="project.${index}.result" title="AI 优化本项"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg></button>
              <button class="field-btn btn-copy" data-ref="project.${index}.result" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="project.${index}.result" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// 渲染荣誉奖项列表
function renderHonorsList() {
  const container = document.getElementById("honors-list");
  container.innerHTML = "";

  if (resumeData.honors.length === 0) {
    container.innerHTML = `<div class="empty-tip">暂无荣誉奖项</div>`;
    return;
  }

  resumeData.honors.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-index", index);
    card.innerHTML = `
      <div class="card-header">
        <span class="card-title">奖项 #${index + 1}</span>
        <div class="card-actions">
          <button class="btn btn-secondary btn-sm btn-fill-section" data-type="honors" data-index="${index}">
            填充此项
          </button>
          <button class="btn btn-danger btn-sm btn-delete-card" data-type="honors" data-index="${index}">
            删除
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">奖项名称</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="honors" data-index="${index}" data-key="name" value="${item.name || ''}" placeholder="如：国家奖学金/美赛一等奖">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="honors.${index}.name" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="honors.${index}.name" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">获奖时间</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="honors" data-index="${index}" data-key="date" value="${item.date || ''}" placeholder="如：2023-11">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="honors.${index}.date" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="honors.${index}.date" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">颁发机构/级别</label>
          <div class="form-input-wrapper">
            <input type="text" class="form-control card-input" data-type="honors" data-index="${index}" data-key="level" value="${item.level || ''}" placeholder="如：教育部 / 全国一等奖">
            <div class="field-actions">
              <button class="field-btn btn-copy" data-ref="honors.${index}.level" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="honors.${index}.level" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==================== 事件初始化 ====================

// 初始化选项卡切换事件
function initTabEvents() {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      // 移除当前活动状态
      document.querySelector(".tab-btn.active").classList.remove("active");
      document.querySelector(".tab-panel.active").classList.remove("active");

      // 激活点击的选项卡
      button.classList.add("active");
      const tabId = button.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");

      // Tab 切换后延迟调整其中文本框高度（只有显示出来的元素才能计算出正确的 scrollHeight）
      setTimeout(adjustAllTextareas, 20);
    });
  });
}

// 初始化表单即时保存绑定
function initFormBindings() {
  // 监听基本信息输入框变化
  document.querySelectorAll("[data-key^='basic.']").forEach((input) => {
    input.addEventListener("input", (e) => {
      const key = e.target.getAttribute("data-key").split(".")[1];
      resumeData.basic[key] = e.target.value;
      saveToStorage();
    });
  });

  // 监听技能输入框变化
  const skillsTextarea = document.querySelector("[data-key='skills']");
  if (skillsTextarea) {
    skillsTextarea.addEventListener("input", (e) => {
      resumeData.skills = e.target.value;
      saveToStorage();
    });
  }

  // 监听语言能力输入框变化
  const languagesTextarea = document.querySelector("[data-key='languages']");
  if (languagesTextarea) {
    languagesTextarea.addEventListener("input", (e) => {
      resumeData.languages = e.target.value;
      saveToStorage();
    });
  }

  // 利用事件代理监听动态列表卡片内的输入框变化
  document.addEventListener("input", (e) => {
    if (e.target.classList.contains("card-input")) {
      const type = e.target.getAttribute("data-type");
      const index = parseInt(e.target.getAttribute("data-index"), 10);
      const key = e.target.getAttribute("data-key");

      if (resumeData[type] && resumeData[type][index]) {
        resumeData[type][index][key] = e.target.value;
        saveToStorage();
      }
    }
  });

  // 监听所有文本框的输入事件，动态调整高度
  document.addEventListener("input", (e) => {
    if (e.target.tagName === "TEXTAREA" && e.target.classList.contains("form-control")) {
      autoResizeTextarea(e.target);
    }
  });

  // 监听 AI 修改快捷按钮点击（利用事件代理，处理动态增加的卡片）
  document.addEventListener("click", (e) => {
    const aiBtn = e.target.closest(".btn-ai-modify");
    if (aiBtn) {
      const wrapper = aiBtn.closest(".form-input-wrapper");
      if (!wrapper) return;

      // 检查是否已经存在 prompt 输入盒，如果存在则直接移除（起到开关作用）
      let promptBox = wrapper.parentElement.querySelector(".ai-prompt-box");
      if (promptBox) {
        promptBox.remove();
        return;
      }

      // 创建新的 prompt 优化编辑盒子
      promptBox = document.createElement("div");
      promptBox.className = "ai-prompt-box";
      promptBox.style.marginTop = "8px";
      promptBox.style.border = "1px solid var(--primary-color)";
      promptBox.style.borderRadius = "var(--radius-md)";
      promptBox.style.padding = "10px";
      promptBox.style.backgroundColor = "var(--primary-light)";
      promptBox.style.display = "flex";
      promptBox.style.flexDirection = "column";
      promptBox.style.gap = "8px";
      promptBox.style.zIndex = "5";

      promptBox.innerHTML = `
        <div style="font-size: 11px; font-weight: bold; color: var(--primary-color); display: flex; align-items: center; gap: 4px;">
          <span>🪄 AI 快捷优化本项内容</span>
        </div>
        <textarea class="form-control ai-prompt-input" style="min-height: 50px; font-size: 12px; padding: 6px; background-color: #ffffff;" placeholder="输入优化指令，如：用STAR法则润色 / 翻译成英文 / 突出大模型集成经历..."></textarea>
        <div style="display: flex; gap: 6px; justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm btn-ai-cancel">取消</button>
          <button class="btn btn-primary btn-sm btn-ai-generate">生成优化</button>
        </div>
      `;

      wrapper.insertAdjacentElement("afterend", promptBox);
      const promptInput = promptBox.querySelector(".ai-prompt-input");
      promptInput.focus();

      // 绑定取消按钮
      promptBox.querySelector(".btn-ai-cancel").addEventListener("click", () => {
        promptBox.remove();
      });

      // 绑定生成按钮
      promptBox.querySelector(".btn-ai-generate").addEventListener("click", async () => {
        const instruction = promptInput.value.trim();
        if (!instruction) {
          showToast("请输入优化指令");
          return;
        }

        const textarea = wrapper.querySelector("textarea");
        if (!textarea) return;
        
        const originalText = textarea.value.trim();
        const generateBtn = promptBox.querySelector(".btn-ai-generate");
        const cancelBtn = promptBox.querySelector(".btn-ai-cancel");

        generateBtn.disabled = true;
        generateBtn.textContent = "优化中...";
        cancelBtn.disabled = true;

        try {
          const systemPrompt = "你是一个专业的简历打磨助手。请根据用户的优化指令，润色并修改用户提供的这段简历文本。你需要遵循以下原则：\\n1. 只返回修改后的简历文本本身，不要添加任何解释、导语、Markdown 代码块标记（如 \`\`\`），也不要在前后加引号，直接返回纯文本。\\n2. 保持简历的真实度，不要编造不存在的核心事实（如公司、学校等），只对语言表述进行优化、专业化或按字数精简。\\n3. 如果指令要求翻译为英文，则输出对应的英文表述。";
          const prompt = `优化指令：${instruction}\\n\\n原内容：\\n${originalText || "[空]"}`;

          const optimizedText = await callLLM(prompt, systemPrompt);
          
          // 更新文本框并自适应高度
          textarea.value = optimizedText;
          autoResizeTextarea(textarea);

          // 更新底层数据模型
          const ref = aiBtn.getAttribute("data-ref");
          updateResumeDataByRef(ref, optimizedText);

          saveToStorage();
          showToast("内容优化成功并已保存！");
          promptBox.remove();
        } catch (err) {
          showToast("优化失败：" + err.message);
          console.error(err);
          generateBtn.disabled = false;
          generateBtn.textContent = "生成优化";
          cancelBtn.disabled = false;
        }
      });
    }
  });
}

// 初始化列表操作事件 (添加 / 删除)
function initListActionEvents() {
  // 添加教育背景
  document.getElementById("btn-add-education").addEventListener("click", () => {
    resumeData.education.push({ school: "", degree: "", major: "", start: "", end: "", gpa: "", supervisor: "", majorDescription: "", thesisTopic: "", courses: "", researchDirection: "", department: "", labExperience: "", studentId: "", schoolLocation: "" });
    saveToStorage();
    renderEducationList();
    showToast("已新增一段教育经历");
  });

  // 添加工作实习
  document.getElementById("btn-add-internship").addEventListener("click", () => {
    resumeData.internship.push({ company: "", position: "", start: "", end: "", desc: "" });
    saveToStorage();
    renderInternshipList();
    showToast("已新增一段工作实习经历");
  });

  // 添加项目经历
  document.getElementById("btn-add-project").addEventListener("click", () => {
    resumeData.project.push({ name: "", role: "", start: "", end: "", desc: "", duty: "", result: "", tech: "" });
    saveToStorage();
    renderProjectList();
    showToast("已新增一段项目经历");
  });

  // 添加荣誉奖项
  document.getElementById("btn-add-honor").addEventListener("click", () => {
    resumeData.honors.push({ name: "", date: "", level: "" });
    saveToStorage();
    renderHonorsList();
    showToast("已新增一段荣誉奖项");
  });

  // 添加赛事经验
  document.getElementById("btn-add-competition").addEventListener("click", () => {
    resumeData.competition.push({ name: "", start: "", end: "", desc: "" });
    saveToStorage();
    renderCompetitionList();
    showToast("已新增一段赛事经验");
  });

  // 添加论文/期刊/专利
  document.getElementById("btn-add-paper").addEventListener("click", () => {
    resumeData.paper.push({ title: "", desc: "", result: "" });
    saveToStorage();
    renderPaperList();
    showToast("已新增一篇论文/期刊/专利");
  });

  // 删除卡片逻辑（使用事件代理）
  document.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".btn-delete-card");
    if (deleteBtn) {
      const type = deleteBtn.getAttribute("data-type");
      const index = parseInt(deleteBtn.getAttribute("data-index"), 10);
      
      if (confirm(`确定要删除此项内容吗？`)) {
        resumeData[type].splice(index, 1);
        saveToStorage();
        if (type === "education") renderEducationList();
        if (type === "internship") renderInternshipList();
        if (type === "project") renderProjectList();
        if (type === "honors") renderHonorsList();
        if (type === "competition") renderCompetitionList();
        if (type === "paper") renderPaperList();
        showToast("已删除对应内容");
      }
    }
  });
}

// 初始化系统操作事件 (导入/导出/清空/一键填充等)
function initSystemActionEvents() {
  // 一键智能填充整页
  document.getElementById("btn-smart-fill").addEventListener("click", async () => {
    await sendMsgToContentScript({
      action: "smartFillPage",
      data: resumeData
    });
  });

  // 单字段“填充”按钮逻辑
  document.addEventListener("click", async (e) => {
    const fillBtn = e.target.closest(".btn-fill-field");
    if (fillBtn) {
      const ref = fillBtn.getAttribute("data-ref");
      const value = getValueByRef(ref);
      
      if (!value) {
        showToast("字段内容为空，无法填充");
        return;
      }

      await sendMsgToContentScript({
        action: "fillFocusedInput",
        value: value
      });
    }
  });

  // 定向局部段落填充按钮逻辑
  document.addEventListener("click", async (e) => {
    const fillSectionBtn = e.target.closest(".btn-fill-section");
    if (fillSectionBtn) {
      const type = fillSectionBtn.getAttribute("data-type");
      const index = parseInt(fillSectionBtn.getAttribute("data-index"), 10);
      const sectionData = resumeData[type][index];

      if (!sectionData) return;

      await sendMsgToContentScript({
        action: "fillSection",
        type: type,
        data: sectionData
      });
    }
  });

  // 单字段复制按钮逻辑
  document.addEventListener("click", (e) => {
    const copyBtn = e.target.closest(".btn-copy");
    if (copyBtn) {
      const ref = copyBtn.getAttribute("data-ref");
      const value = getValueByRef(ref);

      if (value) {
        navigator.clipboard.writeText(value)
          .then(() => showToast("已成功复制到剪贴板"))
          .catch(() => showToast("复制失败，请手动选择复制"));
      } else {
        showToast("内容为空，无法复制");
      }
    }
  });

  // 导出 JSON
  document.getElementById("btn-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("配置已导出");
  });

  // 点击导入按钮，触发隐藏的文件输入框
  document.getElementById("btn-import").addEventListener("click", () => {
    document.getElementById("import-file-input").click();
  });

  // 导入文件逻辑
  document.getElementById("import-file-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        resumeData = mergeWithDefault(importedData, defaultResumeData);
        saveToStorage();
        fillBasicForm();
        renderAllLists();
        showToast("简历数据导入成功！");
      } catch (err) {
        showToast("导入失败，JSON 格式不正确");
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // 重置 input
  });

  // 清空数据
  document.getElementById("btn-clear").addEventListener("click", () => {
    if (confirm("确定要清空所有已保存的简历数据吗？此操作无法恢复！")) {
      resumeData = JSON.parse(JSON.stringify(defaultResumeData));
      saveToStorage();
      fillBasicForm();
      renderAllLists();
      showToast("数据已清空");
    }
  });

  // 保存 API 接口配置
  document.getElementById("btn-save-api-config").addEventListener("click", () => {
    apiConfig.protocol = document.getElementById("ai-protocol").value;
    apiConfig.baseUrl = document.getElementById("ai-base-url").value.trim();
    apiConfig.apiKey = document.getElementById("ai-api-key").value.trim();
    apiConfig.model = document.getElementById("ai-model").value.trim();

    saveApiConfig();
  });

  // 一键对齐优化按钮点击
  document.getElementById("btn-ai-optimize-resume").addEventListener("click", async () => {
    const jdText = document.getElementById("ai-jd-input").value.trim();
    const customPrompt = document.getElementById("ai-custom-prompt").value.trim();

    if (!jdText) {
      showToast("请先粘贴目标岗位的 JD 描述");
      return;
    }

    const optimizeBtn = document.getElementById("btn-ai-optimize-resume");
    optimizeBtn.disabled = true;
    optimizeBtn.textContent = "分析优化中, 请稍候...";

    try {
      const systemPrompt = "你是一位专业的求职招聘顾问。请根据用户提供的目标岗位 JD (Job Description) 以及优化指令，针对性优化用户的简历信息，使其最大限度对齐岗位需求。\\n请直接返回修改后的 JSON 结构，不要包含任何 Markdown 包装（不要用 \`\`\`json 包装，不要有任何解释说明），直接返回一个合法的 JSON 字符串。\\n你需要返回的 JSON 结构只包含你想更新的部分（支持 basic.jobIntent, basic.selfEval 以及 skills 字段）。结构如下：\\n{\\n  \\\"basic\\\": {\\n    \\\"jobIntent\\\": \\\"修改后的求职意向\\\",\\n    \\\"selfEval\\\": \\\"修改后的自我评价内容（结合JD进行润色）\\\"\\n  },\\n  \\\"skills\\\": \\\"修改后的专业技能描述（合理对齐JD要求的技术栈）\\\"\\n}";
      
      const prompt = `【当前简历基本信息】\\n求职意向：\${resumeData.basic.jobIntent || "[空]"}\\n自我评价：\${resumeData.basic.selfEval || "[空]"}\\n\\n【当前简历专业技能】\\n\${resumeData.skills || "[空]"}\\n\\n【目标岗位 JD】\\n\${jdText}\\n\\n【优化要求指令】\\n\${customPrompt || "请根据 JD 针对性润色自我评价与专业技能描述，突出匹配的技术栈和项目职责。"}`;

      const responseText = await callLLM(prompt, systemPrompt);
      
      // 清洗 Markdown 包裹
      let cleanedJson = responseText.trim();
      if (cleanedJson.startsWith("\`\`\`")) {
        cleanedJson = cleanedJson.replace(/^\`\`\`[a-zA-Z]*\\n/, "").replace(/\\n\`\`\`$/, "");
      }
      
      const result = JSON.parse(cleanedJson);
      
      if (result.basic) {
        if (result.basic.jobIntent) resumeData.basic.jobIntent = result.basic.jobIntent;
        if (result.basic.selfEval) resumeData.basic.selfEval = result.basic.selfEval;
      }
      if (result.skills) {
        resumeData.skills = result.skills;
      }

      saveToStorage();
      fillBasicForm();
      adjustAllTextareas();
      
      showToast("简历优化成功！已更新求职意向、自我评价和专业技能！");
    } catch (err) {
      showToast("全局优化失败：" + err.message);
      console.error(err);
    } finally {
      optimizeBtn.disabled = false;
      optimizeBtn.textContent = "一键智能对齐优化";
    }
  });

  // 切换简历版本
  document.getElementById("select-resume-version").addEventListener("change", (e) => {
    const newId = e.target.value;
    switchResumeVersion(newId);
  });

  // 新建简历版本 (另存为)
  document.getElementById("btn-resume-add").addEventListener("click", () => {
    const newName = prompt("请输入新简历版本的名称（例如：Java开发版 / AI方向版）：");
    if (!newName) return;
    
    const cleanName = newName.trim();
    if (!cleanName) return;

    // 复制当前活跃的数据
    const copiedData = JSON.parse(JSON.stringify(resumeData));
    const newId = Date.now().toString();

    resumesList.push({
      id: newId,
      name: cleanName,
      data: copiedData
    });

    activeResumeId = newId;
    resumeData = copiedData;

    saveToStorage();
    renderResumeVersionDropdown();
    fillBasicForm();
    renderAllLists();
    showToast(`新建版本并切换成功: ${cleanName}`);
  });

  // 重命名当前简历版本
  document.getElementById("btn-resume-rename").addEventListener("click", () => {
    const activeIdx = resumesList.findIndex(r => r.id === activeResumeId);
    if (activeIdx === -1) return;

    const currentName = resumesList[activeIdx].name;
    const newName = prompt(`请输入简历版本 [${currentName}] 的新名称：`, currentName);
    if (!newName) return;

    const cleanName = newName.trim();
    if (!cleanName || cleanName === currentName) return;

    resumesList[activeIdx].name = cleanName;
    saveToStorage();
    renderResumeVersionDropdown();
    showToast("重命名当前版本成功");
  });

  // 删除当前简历版本
  document.getElementById("btn-resume-delete").addEventListener("click", () => {
    if (resumesList.length <= 1) {
      showToast("必须保留至少一个简历版本！");
      return;
    }

    const activeIdx = resumesList.findIndex(r => r.id === activeResumeId);
    if (activeIdx === -1) return;

    const currentName = resumesList[activeIdx].name;
    if (confirm(`确定要删除简历版本 [${currentName}] 吗？此操作无法恢复！`)) {
      resumesList.splice(activeIdx, 1);
      
      // 切换到第一个剩余版本
      activeResumeId = resumesList[0].id;
      resumeData = mergeWithDefault(resumesList[0].data, defaultResumeData);

      saveToStorage();
      renderResumeVersionDropdown();
      fillBasicForm();
      renderAllLists();
      showToast(`已删除该版本，已自动切换至: ${resumesList[0].name}`);
    }
  });
}

// ==================== 跨脚本通信 ====================

// 向当前标签页的 content.js 发送消息
async function sendMsgToContentScript(msg) {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    showToast("当前环境不支持与网页通信，请在网页中以插件形式运行");
    return;
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      showToast("未找到活动网页标签");
      return;
    }
    
    // 发送消息
    chrome.tabs.sendMessage(tab.id, msg, (response) => {
      // 检查错误
      if (chrome.runtime.lastError) {
        showToast("请先刷新网页，再进行填充操作");
        console.warn("Communication error:", chrome.runtime.lastError.message);
        return;
      }
      
      if (response && response.status === "success") {
        if (response.count !== undefined) {
          showToast(`成功填充了 ${response.count} 个字段`);
        } else {
          showToast("填充成功");
        }
      } else if (response && response.status === "no_focus") {
        showToast("请先在网页上点击一个输入框以指定位置");
      } else {
        showToast("填充未起效，请重试");
      }
    });
  } catch (err) {
    showToast("通信异常，请刷新页面重试");
    console.error(err);
  }
}

// ==================== Toast 提示 ====================
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";
  
  // 3秒后自动隐藏（CSS 动画有 2.5s，这里设置 2.5s 后隐藏 DOM）
  setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

// ==================== 文本框高度动态自适应 ====================
function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight + 2) + 'px';
}

function adjustAllTextareas() {
  document.querySelectorAll("textarea.form-control").forEach((textarea) => {
    // 仅在元素可见时调整，隐藏的 textarea 无法获取正确的 scrollHeight，防止初始化折叠为 0
    if (textarea.offsetWidth > 0 || textarea.offsetHeight > 0) {
      autoResizeTextarea(textarea);
    }
  });
}

// ==================== 第三方大模型 API 配置与调用 ====================
let apiConfig = {
  protocol: "openai",
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini"
};

// 从 Storage 加载 API 配置
function loadApiConfig() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get("apiConfig", (result) => {
        if (result.apiConfig) {
          apiConfig = result.apiConfig;
        }
        resolve();
      });
    } else {
      const local = localStorage.getItem("apiConfig");
      if (local) apiConfig = JSON.parse(local);
      resolve();
    }
  });
}

// 保存 API 配置到 Storage
function saveApiConfig() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ apiConfig }, () => {
      showToast("接口配置保存成功");
    });
  } else {
    localStorage.setItem("apiConfig", JSON.stringify(apiConfig));
    showToast("接口配置保存成功");
  }
}

// 填充 API 配置表单
function fillApiConfigForm() {
  const protocolEl = document.getElementById("ai-protocol");
  const baseUrlEl = document.getElementById("ai-base-url");
  const apiKeyEl = document.getElementById("ai-api-key");
  const modelEl = document.getElementById("ai-model");
  
  if (protocolEl) protocolEl.value = apiConfig.protocol || "openai";
  if (baseUrlEl) baseUrlEl.value = apiConfig.baseUrl || "https://api.openai.com/v1";
  if (apiKeyEl) apiKeyEl.value = apiConfig.apiKey || "";
  if (modelEl) modelEl.value = apiConfig.model || "gpt-4o-mini";
}

// 统一的 LLM 调用接口，支持 OpenAI 和 Claude 原生协议
async function callLLM(prompt, systemPrompt = "") {
  if (!apiConfig.apiKey) {
    throw new Error("请先在【AI 优化】选项卡中配置并保存你的 API 密钥 (API Key)！");
  }

  const protocol = apiConfig.protocol;
  const baseUrl = apiConfig.baseUrl.replace(/\/$/, "");
  
  if (protocol === "openai") {
    const url = `${baseUrl}/chat/completions`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: apiConfig.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API 错误 (${response.status}): ${errText || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } else if (protocol === "claude") {
    const url = `${baseUrl}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiConfig.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: apiConfig.model,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API 错误 (${response.status}): ${errText || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text.trim();
  } else {
    throw new Error("不支持的 API 协议类型");
  }
}

// 根据 data-ref 精准更新底层数据结构中的字段
function updateResumeDataByRef(ref, value) {
  const parts = ref.split('.');
  if (parts.length === 2 && parts[0] === 'basic') {
    resumeData.basic[parts[1]] = value;
  } else if (ref === 'skills') {
    resumeData.skills = value;
  } else if (parts.length === 3) {
    const section = parts[0];
    const index = parseInt(parts[1], 10);
    const field = parts[2];
    if (resumeData[section] && resumeData[section][index]) {
      resumeData[section][index][field] = value;
    }
  }
}



// 根据 ref 获取值 (支持 basic.xxx, skills, 以及 education.0.school 等复杂路径)
function getValueByRef(ref) {
  if (!ref) return "";
  const parts = ref.split('.');
  if (parts.length === 1) {
    if (ref === 'skills') return resumeData.skills || "";
    return "";
  }
  if (parts.length === 2 && parts[0] === 'basic') {
    return resumeData.basic[parts[1]] || "";
  }
  if (parts.length === 3) {
    const section = parts[0];
    const index = parseInt(parts[1], 10);
    const field = parts[2];
    if (resumeData[section] && resumeData[section][index]) {
      return resumeData[section][index][field] || "";
    }
  }
  return "";
}

// ==================== 多简历版本管理辅助函数 ====================

// 渲染版本下拉框
function renderResumeVersionDropdown() {
  const select = document.getElementById("select-resume-version");
  if (!select) return;
  
  select.innerHTML = "";
  resumesList.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = r.name;
    if (r.id === activeResumeId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

// 切换活跃简历版本
function switchResumeVersion(newId) {
  const activeResume = resumesList.find(r => r.id === newId);
  if (!activeResume) return;

  activeResumeId = newId;
  resumeData = mergeWithDefault(activeResume.data, defaultResumeData);

  // 保存当前的活跃 ID 并刷新 UI
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ activeResumeId }, () => {
      console.log("已保存激活的简历 ID");
    });
  } else {
    localStorage.setItem("activeResumeId", activeResumeId);
  }

  fillBasicForm();
  renderAllLists();
  showToast(`已切换至版本: ${activeResume.name}`);
}

// ==================== 赛事经验 & 论文/期刊 渲染 ====================

// 渲染赛事经验列表
function renderCompetitionList() {
  const container = document.getElementById("competition-list");
  if (!container) return;
  container.innerHTML = "";

  if (!resumeData.competition || resumeData.competition.length === 0) {
    container.innerHTML = `<div class="empty-tip">暂无赛事经验，请点击下方按钮添加</div>`;
    return;
  }

  resumeData.competition.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-index", index);
    card.innerHTML = `
      <div class="card-header">
        <span class="card-title">赛事经验 #${index + 1}</span>
        <div class="card-actions">
          <button class="btn btn-secondary btn-sm btn-fill-section" data-type="competition" data-index="${index}" title="填充本段赛事经历">
            填充此项
          </button>
          <button class="btn btn-danger btn-sm btn-delete-card" data-type="competition" data-index="${index}">
            删除
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">赛事名称</label>
          <div class="form-input-wrapper">
            <input type="text" class="form-control card-input" data-type="competition" data-index="${index}" data-key="name" value="${item.name || ''}" placeholder="如：挑战杯全国一等奖 / 阿里云开发者大赛">
            <div class="field-actions">
              <button class="field-btn btn-copy" data-ref="competition.${index}.name" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="competition.${index}.name" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">开始时间</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="competition" data-index="${index}" data-key="start" value="${item.start || ''}" placeholder="如：2023-10">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="competition.${index}.start" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="competition.${index}.start" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">结束时间</label>
            <div class="form-input-wrapper">
              <input type="text" class="form-control card-input" data-type="competition" data-index="${index}" data-key="end" value="${item.end || ''}" placeholder="如：2023-12">
              <div class="field-actions">
                <button class="field-btn btn-copy" data-ref="competition.${index}.end" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="field-btn btn-fill-field" data-ref="competition.${index}.end" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">赛事描述 / 取得成果</label>
          <div class="form-input-wrapper">
            <textarea class="form-control card-input" data-type="competition" data-index="${index}" data-key="desc" placeholder="简述赛事内容、使用技术、参赛职责以及最终取得的名次等成果...">${item.desc || ''}</textarea>
            <div class="field-actions" style="top: 8px;">
              <button class="field-btn btn-ai-modify" data-ref="competition.${index}.desc" title="AI 优化本项"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg></button>
              <button class="field-btn btn-copy" data-ref="competition.${index}.desc" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="competition.${index}.desc" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// 渲染论文/期刊列表
function renderPaperList() {
  const container = document.getElementById("paper-list");
  if (!container) return;
  container.innerHTML = "";

  if (!resumeData.paper || resumeData.paper.length === 0) {
    container.innerHTML = `<div class="empty-tip">暂无需文/期刊，请点击下方按钮添加</div>`;
    return;
  }

  resumeData.paper.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-index", index);
    card.innerHTML = `
      <div class="card-header">
        <span class="card-title">论文/期刊/专利 #${index + 1}</span>
        <div class="card-actions">
          <button class="btn btn-secondary btn-sm btn-fill-section" data-type="paper" data-index="${index}" title="填充本篇论文/专利">
            填充此项
          </button>
          <button class="btn btn-danger btn-sm btn-delete-card" data-type="paper" data-index="${index}">
            删除
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">论文/期刊/专利名称</label>
          <div class="form-input-wrapper">
            <input type="text" class="form-control card-input" data-type="paper" data-index="${index}" data-key="title" value="${item.title || ''}" placeholder="如：一种基于大模型的智能问答方法及系统">
            <div class="field-actions">
              <button class="field-btn btn-copy" data-ref="paper.${index}.title" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="paper.${index}.title" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">发表状态 / 期刊级别 / 专利成果说明</label>
          <div class="form-input-wrapper">
            <input type="text" class="form-control card-input" data-type="paper" data-index="${index}" data-key="result" value="${item.result || ''}" placeholder="如：已发表于 IEEE T-PAMI / 核心期刊在投 / 第一发明人国家发明专利已受理">
            <div class="field-actions">
              <button class="field-btn btn-copy" data-ref="paper.${index}.result" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="paper.${index}.result" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">摘要 / 主要内容描述说明</label>
          <div class="form-input-wrapper">
            <textarea class="form-control card-input" data-type="paper" data-index="${index}" data-key="desc" placeholder="简述论文研究课题、解决的核心问题、使用算法、创新点与最终实验结论等...">${item.desc || ''}</textarea>
            <div class="field-actions" style="top: 8px;">
              <button class="field-btn btn-ai-modify" data-ref="paper.${index}.desc" title="AI 优化本项"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg></button>
              <button class="field-btn btn-copy" data-ref="paper.${index}.desc" title="复制"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="field-btn btn-fill-field" data-ref="paper.${index}.desc" title="填充到当前焦点输入框"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}


