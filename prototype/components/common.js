/**
 * MediData AI - 公共脚本 (重构版)
 * 包含组件加载、工具函数、交互增强、XSS防护、暗色模式
 */
;(function() {
'use strict';

const MediData = window.MediData = {};

MediData.escapeHtml = function(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

// ===== 安全DOM操作 =====
MediData.createEl = function(tag, attrs, children) {
    const el = document.createElement(tag);
    if (attrs) {
        Object.entries(attrs).forEach(([key, val]) => {
            if (key === 'className') el.className = val;
            else if (key === 'textContent') el.textContent = val;
            else if (key === 'innerHTML') el.innerHTML = val;
            else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
            else el.setAttribute(key, val);
        });
    }
    if (children) {
        (Array.isArray(children) ? children : [children]).forEach(child => {
            if (typeof child === 'string') el.appendChild(document.createTextNode(child));
            else if (child) el.appendChild(child);
        });
    }
    return el;
};

// ===== 暗色模式管理 =====
MediData.darkMode = {
    init() {
        const saved = localStorage.getItem('medidata-theme');
        if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        }
    },
    toggle() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('medidata-theme', isDark ? 'dark' : 'light');
        const icon = document.querySelector('.dark-toggle-icon');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun dark-toggle-icon' : 'fas fa-moon dark-toggle-icon';
        }
        // 派发主题变更事件，便于 ECharts 等组件响应
        document.dispatchEvent(new CustomEvent('medidata:theme-change', { detail: { isDark: isDark } }));
    },
    isDark() {
        return document.documentElement.classList.contains('dark');
    }
};

// ===== 当前页面标识 =====
const CURRENT_PAGE = window.location.pathname.split('/').pop() || 'index.html';

// ===== 导航配置 =====
const NAV_ITEMS = [
    { group: '核心功能', items: [
        { id: 'index', href: 'index.html', icon: 'fa-th-large', label: '工作台', ai: false },
        { id: 'datasource', href: 'datasource.html', icon: 'fa-database', label: '数据源管理', ai: false },
        { id: 'metadata-management', href: 'metadata-management.html', icon: 'fa-layer-group', label: '元数据管理', ai: false },
        { id: 'standard-lib', href: 'standard-lib.html', icon: 'fa-book', label: '标准库管理', ai: false },
        { id: 'field-mapping', href: 'field-mapping.html', icon: 'fa-project-diagram', label: '字段智能映射', ai: true },
        { id: 'sql-developer', href: 'sql-developer.html', icon: 'fa-code', label: 'SQL开发', ai: true },
        { id: 'dictionary', href: 'dictionary.html', icon: 'fa-language', label: '字典映射', ai: true },
        { id: 'script-generator', href: 'script-generator.html', icon: 'fa-file-code', label: '脚本生成', ai: true },
        { id: 'data-quality', href: 'data-quality.html', icon: 'fa-clipboard-check', label: '数据质量管理', ai: true },
        { id: 'lineage', href: 'lineage.html', icon: 'fa-sitemap', label: '数据血缘', ai: true },
        { id: 'task-management', href: 'task-management.html', icon: 'fa-tasks', label: '任务管理', ai: true }
    ]},
    { group: '系统', items: [
        { id: 'settings', href: 'settings.html', icon: 'fa-cog', label: '系统设置', ai: false },
        { id: 'audit-log', href: 'audit-log.html', icon: 'fa-shield-alt', label: '审计日志', ai: false }
    ]}
];

// ===== 侧边栏折叠状态 =====
MediData.sidebarCollapsed = localStorage.getItem('medidata-sidebar-collapsed') === 'true';

// ===== 渲染侧边栏 =====
function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const navHtml = NAV_ITEMS.map(group => `
        <div class="px-4 mb-2 text-xs font-semibold text-white/60 uppercase tracking-wider sidebar-group-label" role="presentation">${MediData.escapeHtml(group.group)}</div>
        ${group.items.map(item => {
            const isActive = CURRENT_PAGE === item.href;
            return `
            <a href="${item.href}" class="sidebar-item ${isActive ? 'active' : ''} flex items-center gap-3 px-4 py-3 mx-2 rounded-lg" data-page="${item.id}" title="${MediData.escapeHtml(item.label)}" ${isActive ? 'aria-current="page"' : ''}>
                <i class="fas ${item.icon} w-5 text-center" aria-hidden="true"></i>
                <span class="text-sm font-medium sidebar-label">${MediData.escapeHtml(item.label)}</span>
                ${item.ai ? '<span class="ml-auto bg-medical-400 text-xs px-2 py-0.5 rounded-full sidebar-ai-badge" aria-label="AI功能">AI</span>' : ''}
            </a>
            `;
        }).join('')}
    `).join('');

    sidebar.className = `w-64 gradient-bg text-white flex flex-col flex-shrink-0 sidebar-responsive${MediData.sidebarCollapsed ? ' sidebar-collapsed' : ''}`;
    sidebar.setAttribute('role', 'navigation');
    sidebar.setAttribute('aria-label', '主导航');

    sidebar.innerHTML = `
        <div class="p-4 border-b border-white/10 sidebar-brand flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <i class="fas fa-hospital-alt text-xl" aria-hidden="true"></i>
            </div>
            <div class="sidebar-brand-text">
                <h1 class="text-lg font-bold leading-tight">MediData AI</h1>
                <p class="text-xs text-white/60">医疗数据治理平台</p>
            </div>
        </div>
        <nav class="flex-1 overflow-y-auto py-4 scrollbar-thin" aria-label="功能导航">
            ${navHtml}
        </nav>
        <div class="p-4 border-t border-white/10">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-medical-600 flex items-center justify-center text-sm font-bold flex-shrink-0" aria-hidden="true">张</div>
                <div class="flex-1 min-w-0 sidebar-brand-text">
                    <p class="text-sm font-medium truncate">张工程师</p>
                    <p class="text-xs text-white/60 truncate">ETL高级工程师</p>
                </div>
                <button class="text-white/60 hover:text-white transition-colors" onclick="handleLogout()" title="退出登录" aria-label="退出登录">
                    <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
                </button>
            </div>
        </div>
    `;
}

function isMobileView() {
    return window.matchMedia('(max-width: 768px)').matches;
}

function updateSidebarToggleA11y(expanded) {
    const btn = document.querySelector('.js-sidebar-toggle');
    if (btn) btn.setAttribute('aria-expanded', String(expanded));
}

function openMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const scrim = document.getElementById('sidebarScrim');
    if (sidebar) sidebar.classList.add('mobile-open');
    if (scrim) {
        scrim.classList.add('active');
        scrim.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';
    updateSidebarToggleA11y(true);
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const scrim = document.getElementById('sidebarScrim');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (scrim) {
        scrim.classList.remove('active');
        scrim.setAttribute('aria-hidden', 'true');
    }
    // 仅当没有其它全屏浮层（模态 / AI 抽屉）时，才解锁页面滚动
    const modalOpen = document.querySelector('.modal.active');
    const drawer = document.getElementById('aiDrawer');
    const drawerOpen = drawer && drawer.classList.contains('open');
    if (!modalOpen && !drawerOpen) document.body.style.overflow = '';
    updateSidebarToggleA11y(false);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    // 移动端：抽出 / 收起离屏侧栏抽屉
    if (isMobileView()) {
        if (sidebar && sidebar.classList.contains('mobile-open')) {
            closeMobileSidebar();
        } else {
            openMobileSidebar();
        }
        return;
    }
    // 桌面端：折叠 / 展开侧栏
    MediData.sidebarCollapsed = !MediData.sidebarCollapsed;
    localStorage.setItem('medidata-sidebar-collapsed', MediData.sidebarCollapsed);
    if (sidebar) sidebar.classList.toggle('sidebar-collapsed', MediData.sidebarCollapsed);
    const toggleIcon = document.querySelector('.js-sidebar-toggle i');
    if (toggleIcon) {
        toggleIcon.className = MediData.sidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    }
}

// ===== 移动端侧栏遮罩层（一次性创建，全局复用） =====
function setupMobileSidebar() {
    let scrim = document.getElementById('sidebarScrim');
    if (!scrim) {
        scrim = document.createElement('div');
        scrim.id = 'sidebarScrim';
        scrim.className = 'sidebar-scrim';
        scrim.setAttribute('aria-hidden', 'true');
        scrim.addEventListener('click', closeMobileSidebar);
        document.body.appendChild(scrim);
    }
}

// ===== 滚动揭示动画（IntersectionObserver 渐进呈现，尊重 reduced-motion） =====
function initReveal() {
    const explicit = document.querySelectorAll('[data-reveal]');
    let els = explicit;
    if (els.length === 0) {
        const wrapper = document.querySelector('#main-content .overflow-y-auto');
        els = wrapper ? wrapper.children : [];
    }
    if (els.length === 0) return;

    document.body.classList.add('reveal-ready');

    if (!('IntersectionObserver' in window)) {
        Array.prototype.forEach.call(els, el => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(els, function(el, idx) {
        if (!el.hasAttribute('data-reveal')) el.classList.add('auto-reveal');
        el.style.transitionDelay = Math.min(idx * 60, 360) + 'ms';
        observer.observe(el);
    });
}

// ===== 进度条入场动画（从 0 过渡到目标宽度） =====
function animateProgressBars(reduceMotion) {
    if (reduceMotion) return;
    // 兼容：具名类（.progress-bar / .confidence-bar-fill / [data-progress]）与
    // 现有页面实际使用的内联宽度进度条（rounded-full + 高度类 + style="width:..%"）
    const candidates = document.querySelectorAll('[data-progress], .progress-bar, .confidence-bar-fill, [style*="width"]');
    Array.prototype.forEach.call(candidates, function(bar) {
        // 模态框内的进度条由各自业务流程控制（如 AI 识别进度），不参与入场动画
        if (bar.closest('.modal') || bar.closest('.confirm-modal-overlay')) return;
        const cls = typeof bar.className === 'string' ? bar.className : '';
        const isBar = /rounded-full/.test(cls) && /(^|\s)h-[0-9]/.test(cls);
        const isNamed = bar.hasAttribute('data-progress') || /progress-bar|confidence-bar-fill/.test(cls);
        if (!isBar && !isNamed) return;

        let target = bar.getAttribute('data-progress');
        if (!target) target = bar.style.width;
        if (!target) return;

        bar.style.width = '0%';
        // 双 rAF 确保浏览器已应用 0% 再过渡到目标值，触发过渡动画
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                bar.style.width = target;
            });
        });
    });
}

// ===== 渲染顶部栏 =====
function renderHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    const isDark = MediData.darkMode.isDark();

    header.innerHTML = `
        <div class="flex items-center gap-4 flex-1">
            <button class="js-sidebar-toggle p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" onclick="toggleSidebar()" title="菜单 / 折叠侧边栏" aria-label="菜单 / 折叠侧边栏" aria-expanded="${!MediData.sidebarCollapsed}">
                <i class="fas fa-bars" aria-hidden="true"></i>
            </button>
            <div class="relative w-96" id="searchWrapper" role="search">
                <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input type="text" id="globalSearch" placeholder="全局智能搜索：数据源、标准表、字段、任务..."
                       aria-label="全局搜索"
                       class="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-sm focus:ring-2 focus:ring-medical-500 focus:bg-white dark:focus:bg-gray-600 transition-all"
                       oninput="handleSearchInput(this.value)" onkeydown="handleGlobalSearch(event)">
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">⌘K</span>
                <div id="searchDropdown" class="search-dropdown" style="display:none"></div>
            </div>
        </div>
        <div class="flex items-center gap-3">
            <button class="dark-toggle" onclick="MediData.darkMode.toggle()" title="切换暗色模式" aria-label="${isDark ? '切换为亮色模式' : '切换为暗色模式'}">
                <i class="fas ${isDark ? 'fa-sun' : 'fa-moon'} dark-toggle-icon" aria-hidden="true"></i>
            </button>
            <button class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" onclick="showNotifications()" title="通知" aria-label="通知 (5条未读)">
                <i class="fas fa-bell" aria-hidden="true"></i>
                <span class="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" aria-hidden="true"></span>
            </button>
            <button class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" onclick="showMessages()" title="消息" aria-label="消息 (3条未读)">
                <i class="fas fa-envelope" aria-hidden="true"></i>
                <span class="absolute -top-0.5 -right-0.5 bg-danger-500 text-white text-[10px] px-1.5 py-0.5 rounded-full" aria-hidden="true">3</span>
            </button>
            <div class="h-6 w-px bg-gray-200 dark:bg-gray-600"></div>
            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <i class="fas fa-hospital text-medical-600"></i>
                <span class="font-medium">XX市人民医院</span>
                <span class="text-gray-400 dark:text-gray-500">|</span>
                <span class="text-xs bg-medical-50 dark:bg-medical-900 text-medical-700 dark:text-medical-300 px-2 py-1 rounded-md">数据中心建设项目 v2.0</span>
            </div>
        </div>
    `;

    document.addEventListener('click', function(e) {
        const wrapper = document.getElementById('searchWrapper');
        const dropdown = document.getElementById('searchDropdown');
        if (wrapper && dropdown && !wrapper.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// ===== 渲染面包屑 =====
function renderBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;

    const pageNames = {
        'index.html': '工作台',
        'datasource.html': '数据源管理',
        'metadata-management.html': '元数据管理',
        'standard-lib.html': '标准库管理',
        'field-mapping.html': '字段智能映射',
        'sql-developer.html': 'SQL开发',
        'dictionary.html': '字典映射',
        'script-generator.html': '脚本生成',
        'data-quality.html': '数据质量管理',
        'lineage.html': '数据血缘',
        'task-management.html': '任务管理',
        'settings.html': '系统设置',
        'audit-log.html': '审计日志'
    };

    const currentName = pageNames[CURRENT_PAGE] || '当前页面';
    breadcrumb.innerHTML = `
        <a href="index.html" class="hover:text-medical-600 transition-colors">工作台</a>
        <span class="breadcrumb-separator">/</span>
        <span class="font-medium" style="color:var(--text-primary)">${MediData.escapeHtml(currentName)}</span>
    `;
}

// ===== 搜索数据 =====
const SEARCH_DATA = [
    { name: 'HIS_主数据库', type: '数据源', href: 'datasource.html', icon: 'fa-database', color: 'medical', desc: 'Oracle 19c · 192.168.1.100' },
    { name: 'LIS_检验数据库', type: '数据源', href: 'datasource.html', icon: 'fa-database', color: 'medical', desc: 'MySQL 8.0 · 192.168.1.101' },
    { name: 'PACS_影像数据库', type: '数据源', href: 'datasource.html', icon: 'fa-database', color: 'medical', desc: 'SQL Server 2019 · 192.168.1.102' },
    { name: 'PAT_PATIENT_INFO', type: '标准表', href: 'standard-lib.html', icon: 'fa-table', color: 'primary', desc: '患者基本信息表 · 患者域' },
    { name: 'PAT_VISIT_INFO', type: '标准表', href: 'standard-lib.html', icon: 'fa-table', color: 'primary', desc: '患者就诊信息表 · 患者域' },
    { name: 'HIS_ORDER', type: '标准表', href: 'standard-lib.html', icon: 'fa-table', color: 'primary', desc: '医嘱表 · 医嘱域' },
    { name: 'PAT_PATIENT_INFO', type: '元数据', href: 'metadata-management.html', icon: 'fa-layer-group', color: 'medical', desc: '患者基本信息表 · HIS主库' },
    { name: 'LIS_TEST_RESULT', type: '元数据', href: 'metadata-management.html', icon: 'fa-layer-group', color: 'medical', desc: '检验结果表 · LIS检验库' },
    { name: '性别代码', type: '字典', href: 'dictionary.html', icon: 'fa-book', color: 'warning', desc: '基础信息类 · 已映射' },
    { name: '诊断编码 (ICD-10)', type: '字典', href: 'dictionary.html', icon: 'fa-book', color: 'warning', desc: '临床业务类 · 已映射' },
    { name: '字段智能映射', type: '功能', href: 'field-mapping.html', icon: 'fa-project-diagram', color: 'success', desc: 'AI辅助字段映射' },
    { name: 'SQL开发', type: '功能', href: 'sql-developer.html', icon: 'fa-code', color: 'success', desc: 'SQL编辑与执行' },
    { name: '脚本生成', type: '功能', href: 'script-generator.html', icon: 'fa-file-code', color: 'success', desc: 'ETL脚本生成' },
    { name: '数据质量管理', type: '功能', href: 'data-quality.html', icon: 'fa-clipboard-check', color: 'success', desc: '质量规则、检测与报告' },
    { name: '数据血缘', type: '功能', href: 'lineage.html', icon: 'fa-sitemap', color: 'success', desc: '数据血缘溯源' },
    { name: '任务管理', type: '功能', href: 'task-management.html', icon: 'fa-tasks', color: 'success', desc: '任务分配与跟踪' },
    { name: '系统设置', type: '系统', href: 'settings.html', icon: 'fa-cog', color: 'gray', desc: '系统配置管理' },
    { name: '审计日志', type: '系统', href: 'audit-log.html', icon: 'fa-shield-alt', color: 'gray', desc: '操作审计记录' }
];

// ===== 实时搜索联想 =====
let searchDebounceTimer = null;

function handleSearchInput(query) {
    clearTimeout(searchDebounceTimer);
    const dropdown = document.getElementById('searchDropdown');
    if (!dropdown) return;

    if (!query.trim()) {
        dropdown.style.display = 'none';
        return;
    }

    searchDebounceTimer = setTimeout(() => {
        const q = query.trim().toLowerCase();
        const results = SEARCH_DATA.filter(item =>
            item.name.toLowerCase().includes(q) ||
            item.type.toLowerCase().includes(q) ||
            item.desc.toLowerCase().includes(q)
        );

        if (results.length === 0) {
            dropdown.innerHTML = `
                <div class="p-6 text-center">
                    <i class="fas fa-search text-gray-300 text-2xl mb-2"></i>
                    <p class="text-sm text-gray-500">未找到 "${MediData.escapeHtml(query)}" 的相关结果</p>
                </div>
            `;
        } else {
            const grouped = {};
            results.forEach(r => {
                if (!grouped[r.type]) grouped[r.type] = [];
                grouped[r.type].push(r);
            });

            let html = '';
            Object.entries(grouped).forEach(([type, items]) => {
                html += `<div class="search-category-label">${MediData.escapeHtml(type)}</div>`;
                items.forEach(r => {
                    const highlighted = MediData.escapeHtml(r.name).replace(
                        new RegExp(`(${MediData.escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                        '<span class="search-highlight">$1</span>'
                    );
                    html += `
                        <a href="${r.href}" class="search-dropdown-item">
                            <div class="w-8 h-8 bg-${r.color}-50 dark:bg-${r.color}-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i class="fas ${r.icon} text-${r.color}-600 dark:text-${r.color}-400 text-sm"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium" style="color:var(--text-primary)">${highlighted}</p>
                                <p class="text-xs truncate" style="color:var(--text-secondary)">${MediData.escapeHtml(r.desc)}</p>
                            </div>
                            <span class="text-xs bg-${r.color}-50 dark:bg-${r.color}-900 text-${r.color}-700 dark:text-${r.color}-300 px-2 py-0.5 rounded-full flex-shrink-0">${MediData.escapeHtml(r.type)}</span>
                        </a>
                    `;
                });
            });
            dropdown.innerHTML = html;
        }
        dropdown.style.display = 'block';
    }, 300);
}

function handleGlobalSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim().toLowerCase();
        if (!query) return;
        const results = SEARCH_DATA.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query) ||
            item.desc.toLowerCase().includes(query)
        );
        if (results.length > 0) {
            showSearchResults(results, query);
        } else {
            showToast('未找到相关结果', 'warning');
        }
    }
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('searchDropdown');
        if (dropdown) dropdown.style.display = 'none';
    }
}

function showSearchResults(results, query) {
    let existing = document.getElementById('searchResultPanel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'searchResultPanel';
    panel.className = 'fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/30';
    panel.onclick = function(e) { if (e.target === panel) panel.remove(); };

    const typeColors = { '数据源': 'medical', '标准表': 'primary', '字典': 'warning', '功能': 'success', '系统': 'gray' };

    let resultsHtml = '';
    results.forEach(r => {
        const c = typeColors[r.type] || 'gray';
        resultsHtml += `
            <a href="${r.href}" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div class="w-9 h-9 bg-${c}-50 dark:bg-${c}-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i class="fas ${r.icon} text-${c}-600 dark:text-${c}-400"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium" style="color:var(--text-primary)">${MediData.escapeHtml(r.name)}</p>
                    <p class="text-xs truncate" style="color:var(--text-secondary)">${MediData.escapeHtml(r.desc)}</p>
                </div>
                <span class="text-xs bg-${c}-50 dark:bg-${c}-900 text-${c}-700 dark:text-${c}-300 px-2 py-1 rounded-full flex-shrink-0">${MediData.escapeHtml(r.type)}</span>
            </a>
        `;
    });

    panel.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl mx-4 shadow-2xl overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <i class="fas fa-search text-gray-400"></i>
                    <span class="text-sm" style="color:var(--text-secondary)">搜索 "<span class="font-medium" style="color:var(--text-primary)">${MediData.escapeHtml(query)}</span>" 找到 ${results.length} 个结果</span>
                </div>
                <button class="text-gray-400 hover:text-gray-600" onclick="document.getElementById('searchResultPanel').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="max-h-96 overflow-y-auto p-2 scrollbar-thin">
                ${resultsHtml}
            </div>
        </div>
    `;
    document.body.appendChild(panel);
}

// ===== Toast 提示 =====
function showToast(message, type, duration) {
    type = type || 'success';
    duration = duration || 3000;
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        container.setAttribute('role', 'status');
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }

    const icons = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconEl = document.createElement('i');
    iconEl.className = `fas ${icons[type] || icons.info}`;
    const textEl = document.createElement('span');
    textEl.textContent = message;
    toast.appendChild(iconEl);
    toast.appendChild(textEl);

    // 防刷屏：最多同时保留 4 条，超出移除最旧
    while (container.children.length >= 4) {
        container.firstElementChild.remove();
    }
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===== 确认弹窗（替代原生confirm） =====
function showConfirm(options, onConfirmCallback) {
    let opts;
    if (typeof options === 'string') {
        opts = { message: options, onConfirm: onConfirmCallback };
    } else {
        opts = options;
    }
    const {
        title = '确认操作',
        message = '确定要执行此操作吗？',
        confirmText = '确定',
        cancelText = '取消',
        type = 'warning',
        onConfirm,
        onCancel
    } = opts;

    const overlay = document.createElement('div');
    overlay.className = 'confirm-modal-overlay';

    const typeIcons = {
        warning: 'fa-exclamation-triangle text-warning-600',
        danger: 'fa-trash-alt text-danger-600',
        info: 'fa-info-circle text-primary-600',
        success: 'fa-check-circle text-success-600'
    };

    const typeBtnClass = type === 'danger'
        ? 'bg-danger-600 hover:bg-danger-700 text-white'
        : 'bg-medical-600 hover:bg-medical-700 text-white';

    overlay.innerHTML = `
        <div class="confirm-modal-box" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
            <div class="flex items-start gap-4 mb-5">
                <div class="w-10 h-10 rounded-lg bg-${type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'medical'}-50 dark:bg-${type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'medical'}-900 flex items-center justify-center flex-shrink-0">
                    <i class="fas ${typeIcons[type]} text-lg" aria-hidden="true"></i>
                </div>
                <div>
                    <h3 id="confirmTitle" class="text-lg font-semibold mb-1" style="color:var(--text-primary)">${MediData.escapeHtml(title)}</h3>
                    <p class="text-sm" style="color:var(--text-secondary)">${MediData.escapeHtml(message)}</p>
                </div>
            </div>
            <div class="flex justify-end gap-3">
                <button class="px-4 py-2 border rounded-lg text-sm font-medium transition-colors" style="border-color:var(--border-default);color:var(--text-secondary)" id="confirmCancelBtn">${MediData.escapeHtml(cancelText)}</button>
                <button class="px-4 py-2 ${typeBtnClass} rounded-lg text-sm font-medium transition-colors shadow-lg" id="confirmOkBtn">${MediData.escapeHtml(confirmText)}</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // 焦点管理：记录触发前焦点，弹窗打开后聚焦主按钮，关闭后归还焦点
    const prevActive = document.activeElement;
    const okBtn = overlay.querySelector('#confirmOkBtn');
    const cancelBtn = overlay.querySelector('#confirmCancelBtn');
    const closeConfirm = (isCancel) => {
        overlay.remove();
        document.removeEventListener('keydown', trapHandler, true);
        if (prevActive && typeof prevActive.focus === 'function') prevActive.focus();
        if (isCancel && onCancel) onCancel();
    };
    // 简易焦点陷阱：Tab 在两个按钮间循环
    const trapHandler = (e) => {
        if (e.key !== 'Tab') return;
        e.preventDefault();
        (document.activeElement === okBtn ? cancelBtn : okBtn).focus();
    };
    document.addEventListener('keydown', trapHandler, true);

    cancelBtn.addEventListener('click', () => closeConfirm(true));

    okBtn.addEventListener('click', () => {
        overlay.remove();
        document.removeEventListener('keydown', trapHandler, true);
        if (prevActive && typeof prevActive.focus === 'function') prevActive.focus();
        if (onConfirm) onConfirm();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeConfirm(true);
    });

    // 危险操作默认聚焦取消（防误触），其余聚焦确定
    (type === 'danger' ? cancelBtn : okBtn).focus();
}

// ===== 模态框控制 =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        modal._escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal(modalId);
            }
        };
        document.addEventListener('keydown', modal._escHandler);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (modal._escHandler) {
            document.removeEventListener('keydown', modal._escHandler);
            delete modal._escHandler;
        }
    }
}

// ===== AI 抽屉控制 =====
function toggleAIDrawer() {
    const drawer = document.getElementById('aiDrawer');
    const overlay = document.getElementById('aiDrawerOverlay');
    const btn = document.getElementById('aiToggleBtn');

    if (drawer && overlay) {
        const isOpen = drawer.classList.contains('open');
        if (isOpen) {
            drawer.classList.remove('open');
            overlay.classList.remove('open');
            btn?.classList.remove('drawer-open');
        } else {
            drawer.classList.add('open');
            overlay.classList.add('open');
            btn?.classList.add('drawer-open');
        }
    }
}

// ===== 加载状态管理 =====
MediData.loading = {
    show(container, text = '加载中...') {
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;
        el.style.position = 'relative';
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner-lg"></div>
            <span class="loading-overlay-text">${MediData.escapeHtml(text)}</span>
        `;
        el.appendChild(overlay);
        return overlay;
    },
    hide(container) {
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;
        const overlay = el.querySelector('.loading-overlay');
        if (overlay) overlay.remove();
    }
};

// ===== 按钮加载状态 =====
MediData.btnLoading = {
    show(btn, text = '处理中...') {
        if (typeof btn === 'string') btn = document.getElementById(btn);
        if (!btn) return;
        btn._originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.classList.add('btn-loading');
        const span = document.createElement('span');
        span.className = 'btn-text';
        span.textContent = text;
        btn.innerHTML = '';
        btn.appendChild(span);
    },
    hide(btn) {
        if (typeof btn === 'string') btn = document.getElementById(btn);
        if (!btn) return;
        btn.disabled = false;
        btn.classList.remove('btn-loading');
        if (btn._originalHtml) {
            btn.innerHTML = btn._originalHtml;
            delete btn._originalHtml;
        }
    }
};

// ===== 空状态组件 =====
MediData.renderEmptyState = function(container, options = {}) {
    const {
        icon = 'fa-inbox',
        title = '暂无数据',
        desc = '当前没有可显示的内容',
        actionText,
        actionFn
    } = options;

    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return;

    let actionHtml = '';
    if (actionText && actionFn) {
        actionHtml = `<button class="px-4 py-2 bg-medical-600 text-white rounded-lg text-sm font-medium hover:bg-medical-700 transition-colors" onclick="(${actionFn.toString()})()">${MediData.escapeHtml(actionText)}</button>`;
    }

    el.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">
                <i class="fas ${icon} text-2xl"></i>
            </div>
            <p class="empty-state-title">${MediData.escapeHtml(title)}</p>
            <p class="empty-state-desc">${MediData.escapeHtml(desc)}</p>
            ${actionHtml}
        </div>
    `;
};

// ===== 分页组件 =====
function renderPagination(containerId, currentPage, totalPages, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="${onPageChange}(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="${onPageChange}(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="px-2 text-gray-400">...</span>`;
        }
    }

    html += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="${onPageChange}(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    container.innerHTML = html;
}

// ===== 表格排序（支持 number/string/date/千分位/空值） =====
// type 取值：'string' | 'number' | 'date'
// 空值统一排到末尾；number 自动剥离千分位逗号；date 支持 YYYY-MM-DD / YYYY-MM-DD HH:mm:ss
function sortTable(tableId, columnIndex, type = 'string') {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // 解析单元格原始值：剥离千分位、空白、常见前缀符号
    const parseVal = function(raw) {
        const s = (raw || '').trim();
        if (s === '' || s === '-' || s === '—' || s === 'N/A') return { empty: true, num: 0, str: '', date: 0 };
        let num = NaN;
        if (type === 'number' || type === 'date') {
            // 去千分位逗号 / 空格 / ¥$ 等货币符号
            const cleaned = s.replace(/[,\s¥$￥%]/g, '');
            num = parseFloat(cleaned);
        }
        let dateTs = 0;
        if (type === 'date') {
            const m = s.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
            if (m) {
                dateTs = new Date(
                    parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]),
                    m[4] ? parseInt(m[4]) : 0,
                    m[5] ? parseInt(m[5]) : 0,
                    m[6] ? parseInt(m[6]) : 0
                ).getTime();
            } else if (!isNaN(num)) {
                dateTs = num; // 纯数字日期（如时间戳）
            }
        }
        return { empty: false, num: num, str: s, date: dateTs };
    };

    rows.sort(function(a, b) {
        const aVal = parseVal(a.cells[columnIndex]?.textContent || '');
        const bVal = parseVal(b.cells[columnIndex]?.textContent || '');

        // 空值排末尾（无论升降序）
        if (aVal.empty && bVal.empty) return 0;
        if (aVal.empty) return 1;
        if (bVal.empty) return -1;

        if (type === 'number') {
            return (isNaN(aVal.num) ? 0 : aVal.num) - (isNaN(bVal.num) ? 0 : bVal.num);
        }
        if (type === 'date') {
            return aVal.date - bVal.date;
        }
        return aVal.str.localeCompare(bVal.str, 'zh-CN');
    });

    rows.forEach(function(row) { tbody.appendChild(row); });
}

// ===== 表单验证增强 =====
MediData.validateRules = {
    required: (val) => val.trim() !== '' || '此字段为必填项',
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || '请输入有效的邮箱地址',
    ip: (val) => /^(\d{1,3}\.){3}\d{1,3}$/.test(val) && val.split('.').every(n => parseInt(n) <= 255) || '请输入有效的IP地址',
    port: (val) => { const n = parseInt(val); return (n >= 1 && n <= 65535) || '端口号范围 1-65535'; },
    minLength: (min) => (val) => val.length >= min || `最少输入 ${min} 个字符`,
    maxLength: (max) => (val) => val.length <= max || `最多输入 ${max} 个字符`,
    pattern: (regex, msg) => (val) => regex.test(val) || msg,
    custom: (fn) => fn
};

MediData.validateForm = function(formId, rules) {
    const form = document.getElementById(formId);
    if (!form) return { valid: true, errors: [] };

    const errors = [];
    let isValid = true;

    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
        const field = form.querySelector(`[name="${fieldName}"]`) || form.querySelector(`#${fieldName}`);
        if (!field) return;

        const value = field.value;
        const errorEl = field.parentElement.querySelector('.field-error');

        fieldRules.forEach(rule => {
            const result = typeof rule === 'function' ? rule(value) : true;
            if (result !== true) {
                isValid = false;
                errors.push({ field: fieldName, message: result });
                field.classList.add('border-danger-500');
                field.classList.add('ring-1');
                field.classList.add('ring-danger-500');
                if (errorEl) {
                    errorEl.textContent = result;
                    errorEl.style.display = 'block';
                }
            }
        });

        field.addEventListener('input', () => {
            field.classList.remove('border-danger-500', 'ring-1', 'ring-danger-500');
            if (errorEl) errorEl.style.display = 'none';
        }, { once: true });
    });

    return { valid: isValid, errors };
};

// ===== 通知面板（单例化 + 异步数据源） =====
// 数据源：MediData.fetchNotifications() 返回 Promise<数组>，
// 默认实现回退到 MediData.notifications（硬编码占位），
// 接入真实后端时覆盖 fetchNotifications 即可。
MediData.notifications = [
    { icon: 'fa-exclamation-triangle', color: 'warning', title: 'LIS连接告警', desc: 'LIS_检验数据库响应超时，请检查', time: '10分钟前' },
    { icon: 'fa-check-circle', color: 'success', title: 'HIS映射完成', desc: 'PAT_PATIENT_INFO字段映射已全部确认', time: '30分钟前' },
    { icon: 'fa-robot', color: 'medical', title: 'AI推荐就绪', desc: '新增12个字段映射推荐待审核', time: '1小时前' },
    { icon: 'fa-database', color: 'primary', title: '数据源上线', desc: 'EMR_电子病历库已恢复连接', time: '2小时前' },
    { icon: 'fa-code-branch', color: 'warning', title: '脚本执行失败', desc: 'PACS数据同步ETL任务失败，请处理', time: '3小时前' }
];

MediData.fetchNotifications = function() {
    // 真实环境替换为：return fetch('/api/notifications').then(r => r.json())
    return Promise.resolve(MediData.notifications || []);
};

// 单例缓存：避免每次点击重建 DOM；外层 toggle 控制显隐
let _notifPanel = null;

function showNotifications() {
    if (_notifPanel) { _notifPanel.remove(); _notifPanel = null; return; }

    const panel = document.createElement('div');
    panel.id = 'notificationPanel';
    panel.className = 'fixed top-0 right-0 w-96 h-full bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col';
    panel.style.animation = 'slideIn 0.3s ease';
    _notifPanel = panel;

    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'flex-1 overflow-y-auto scrollbar-thin';

    // 加载占位
    bodyWrap.innerHTML = '<div class="p-8 text-center text-sm text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>加载中…</div>';

    panel.innerHTML = `
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 class="font-bold" style="color:var(--text-primary)">通知中心</h3>
            <div class="flex items-center gap-3">
                <button class="text-xs text-medical-600 hover:text-medical-700 font-medium" data-action="markAllNotificationsRead">全部已读</button>
                <button class="text-gray-400 hover:text-gray-600" data-action="closeNotifications"><i class="fas fa-times"></i></button>
            </div>
        </div>
    `;
    panel.appendChild(bodyWrap);
    document.body.appendChild(panel);

    // 异步拉取数据
    MediData.fetchNotifications().then(function(list) {
        if (!Array.isArray(list)) return;
        let html = '';
        list.forEach(function(n) {
            html += `
                <div class="px-5 py-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-${n.color}-50 dark:bg-${n.color}-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i class="fas ${n.icon} text-${n.color}-600 dark:text-${n.color}-400 text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium" style="color:var(--text-primary)">${MediData.escapeHtml(n.title)}</p>
                            <p class="text-xs mt-1" style="color:var(--text-secondary)">${MediData.escapeHtml(n.desc)}</p>
                            <p class="text-xs text-gray-400 mt-2">${MediData.escapeHtml(n.time)}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        bodyWrap.innerHTML = html || '<div class="p-8 text-center text-sm text-gray-400">暂无通知</div>';
    }).catch(function() {
        bodyWrap.innerHTML = '<div class="p-8 text-center text-sm text-danger-600">通知加载失败</div>';
    });
}

// ===== 消息面板（单例化 + 异步数据源） =====
MediData.messages = [
    { name: '李工程师', initial: '李', bg: 'bg-primary-600', msg: 'HIS_ORDER的字段映射我已经审核完了，请查看', time: '5分钟前', unread: true },
    { name: '王工程师', initial: '王', bg: 'bg-warning-600', msg: 'PACS数据源的连接问题已修复，可以测试了', time: '20分钟前', unread: true },
    { name: '系统通知', initial: '系', bg: 'bg-medical-600', msg: 'AI智能映射已完成PAT_VISIT_INFO的分析', time: '1小时前', unread: true },
    { name: '李工程师', initial: '李', bg: 'bg-primary-600', msg: 'SQL优化的建议已经更新到文档了', time: '昨天', unread: false },
    { name: '系统通知', initial: '系', bg: 'bg-medical-600', msg: '每日数据质量报告已生成', time: '昨天', unread: false }
];

MediData.fetchMessages = function() {
    return Promise.resolve(MediData.messages || []);
};

let _msgPanel = null;

function showMessages() {
    if (_msgPanel) { _msgPanel.remove(); _msgPanel = null; return; }

    const panel = document.createElement('div');
    panel.id = 'messagePanel';
    panel.className = 'fixed top-0 right-0 w-96 h-full bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col';
    panel.style.animation = 'slideIn 0.3s ease';
    _msgPanel = panel;

    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'flex-1 overflow-y-auto scrollbar-thin';
    bodyWrap.innerHTML = '<div class="p-8 text-center text-sm text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>加载中…</div>';

    panel.innerHTML = `
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 class="font-bold" style="color:var(--text-primary)">消息中心</h3>
            <button class="text-gray-400 hover:text-gray-600" data-action="closeMessages"><i class="fas fa-times"></i></button>
        </div>
    `;
    panel.appendChild(bodyWrap);
    document.body.appendChild(panel);

    MediData.fetchMessages().then(function(list) {
        if (!Array.isArray(list)) return;
        let html = '';
        list.forEach(function(m) {
            html += `
                <div class="px-5 py-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${m.unread ? 'bg-medical-50/30 dark:bg-medical-900/20' : ''}">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full ${m.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">${m.initial}</div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-medium" style="color:var(--text-primary)">${MediData.escapeHtml(m.name)}</p>
                                <span class="text-xs text-gray-400">${MediData.escapeHtml(m.time)}</span>
                            </div>
                            <p class="text-xs mt-1 truncate" style="color:var(--text-secondary)">${MediData.escapeHtml(m.msg)}</p>
                        </div>
                        ${m.unread ? '<span class="w-2 h-2 bg-medical-500 rounded-full flex-shrink-0 mt-2"></span>' : ''}
                    </div>
                </div>
            `;
        });
        bodyWrap.innerHTML = html || '<div class="p-8 text-center text-sm text-gray-400">暂无消息</div>';
    }).catch(function() {
        bodyWrap.innerHTML = '<div class="p-8 text-center text-sm text-danger-600">消息加载失败</div>';
    });
}

// ===== 退出登录（使用确认弹窗） =====
function handleLogout() {
    showConfirm({
        title: '退出登录',
        message: '确定要退出登录吗？退出后需要重新输入账号密码登录。',
        confirmText: '确定退出',
        cancelText: '取消',
        type: 'warning',
        onConfirm: () => {
            showToast('已安全退出', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    });
}

// ===== 快捷键 =====
document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) searchInput.focus();
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        showToast('已保存', 'success');
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        toggleAIDrawer();
    }

    if (e.key === 'Escape') {
        const confirmOverlay = document.querySelector('.confirm-modal-overlay');
        if (confirmOverlay) {
            // 走取消按钮路径，确保焦点陷阱/焦点归还被正确清理
            const cancelBtn = confirmOverlay.querySelector('#confirmCancelBtn');
            if (cancelBtn) { cancelBtn.click(); return; }
            confirmOverlay.remove();
            return;
        }

        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
            return;
        }

        const drawer = document.getElementById('aiDrawer');
        if (drawer && drawer.classList.contains('open')) {
            toggleAIDrawer();
            return;
        }

        ['searchResultPanel', 'notificationPanel', 'messagePanel'].forEach(id => {
            const p = document.getElementById(id);
            if (p) p.remove();
        });

        const searchDropdown = document.getElementById('searchDropdown');
        if (searchDropdown) searchDropdown.style.display = 'none';
    }
});

// ===== 公共交互工具（统一各页面重复逻辑） =====

/**
 * 树节点展开/折叠
 * @param {HTMLElement} arrowEl - 点击的箭头元素
 * @param {string} childrenSelector - 子级容器选择器（相对父节点）
 */
MediData.toggleTreeNode = function(arrowEl, childrenSelector) {
    const parent = arrowEl.closest('[data-tree-node]') || arrowEl.parentElement;
    const children = parent.querySelector(childrenSelector || '.tree-children');
    if (!children) return;
    const isExpanded = children.style.display !== 'none';
    children.style.display = isExpanded ? 'none' : 'block';
    const icon = arrowEl.querySelector('i') || arrowEl;
    if (icon.tagName === 'I') {
        icon.classList.toggle('fa-chevron-right', isExpanded);
        icon.classList.toggle('fa-chevron-down', !isExpanded);
    }
};

/**
 * 树节点单选选中
 * @param {HTMLElement} el - 点击的节点
 * @param {string} itemSelector - 节点项选择器
 * @param {object} opts - { titleSelector, titleText, msg }
 */
MediData.selectTreeNode = function(el, itemSelector, opts) {
    const opts2 = opts || {};
    document.querySelectorAll(itemSelector).forEach(item => item.classList.remove('active'));
    el.classList.add('active');
    if (opts2.titleSelector && opts2.titleText) {
        const titleEl = document.querySelector(opts2.titleSelector);
        if (titleEl) titleEl.textContent = opts2.titleText;
    }
    if (opts2.msg) showToast(opts2.msg, 'success');
};

/**
 * 树过滤
 * @param {string} query - 搜索关键词
 * @param {string} containerSelector - 树容器选择器
 * @param {string} itemSelector - 节点项选择器
 */
MediData.filterTree = function(query, containerSelector, itemSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const items = container.querySelectorAll(itemSelector);
    const q = (query || '').trim().toLowerCase();
    items.forEach(item => {
        const text = (item.textContent || '').toLowerCase();
        item.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
};

/**
 * Tab 切换
 * @param {HTMLElement} btn - 点击的 Tab 按钮
 * @param {string} btnSelector - 按钮组选择器
 * @param {string} contentPrefix - 内容区 ID 前缀
 * @param {string} tabId - 当前 Tab 标识
 */
MediData.switchTab = function(btn, btnSelector, contentPrefix, tabId) {
    document.querySelectorAll(btnSelector).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (contentPrefix) {
        document.querySelectorAll('[id^="' + contentPrefix + '"]').forEach(c => {
            c.style.display = 'none';
        });
        const target = document.getElementById(contentPrefix + tabId);
        if (target) target.style.display = 'block';
    }
};

/**
 * 按钮组单选切换（统一 switchFilter / switchSettingMenu）
 * @param {HTMLElement} btn - 点击的按钮
 * @param {string} groupSelector - 按钮组选择器
 */
MediData.switchBtnGroup = function(btn, groupSelector) {
    document.querySelectorAll(groupSelector).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

// ===== data-action 事件委托（消除内联 onclick，便于 CSP 收紧） =====
//
// 用法（HTML）：
//   <button data-action="openModal" data-args="addDatasourceModal">新增</button>
//   <button data-action="closeModal" data-args="addDatasourceModal">取消</button>
//   <button data-action="showToast" data-args="保存成功|success">保存</button>
//   <a data-action="navigate" data-args="task-management.html">跳转</a>
//
// data-args 约定：
//   - openModal / closeModal / showNotifications / showMessages / toggleAIDrawer
//     / toggleSidebar / handleLogout：data-args = 模态框 id 或忽略
//   - showToast：data-args = "消息|类型|时长"，类型 success/warning/error/info
//   - navigate：data-args = 目标 URL
//   - sortTable：data-args = "tableId|columnIndex|type"
//   - 自定义：通过 MediData.registerAction('name', fn) 注册
MediData._actionHandlers = {
    openModal: (el) => openModal(el.getAttribute('data-args') || ''),
    closeModal: (el) => closeModal(el.getAttribute('data-args') || ''),
    showToast: (el) => {
        const a = (el.getAttribute('data-args') || '').split('|');
        showToast(a[0] || '', a[1] || 'info', a[2] ? parseInt(a[2]) : 3000);
    },
    navigate: (el) => { window.location.href = el.getAttribute('data-args') || 'index.html'; },
    showNotifications: () => showNotifications(),
    showMessages: () => showMessages(),
    toggleAIDrawer: () => toggleAIDrawer(),
    toggleSidebar: () => toggleSidebar(),
    handleLogout: () => handleLogout(),
    sortTable: (el) => {
        const a = (el.getAttribute('data-args') || '').split('|');
        sortTable(a[0] || '', parseInt(a[1] || '0'), a[2] || 'string');
    }
};

/**
 * 注册自定义 data-action 处理器
 * @param {string} name - action 名称
 * @param {function(HTMLElement):void} fn - 处理函数，接收触发元素
 */
MediData.registerAction = function(name, fn) {
    MediData._actionHandlers[name] = fn;
};

/**
 * 全局 click 事件委托：匹配 [data-action] 元素并派发到对应 handler
 * 在 initCommon 中通过 setupActionDelegation() 挂载。
 */
function setupActionDelegation() {
    document.addEventListener('click', function(e) {
        const el = e.target.closest('[data-action]');
        if (!el) return;
        const action = el.getAttribute('data-action');
        const handler = MediData._actionHandlers[action];
        if (handler) {
            e.preventDefault();
            handler(el);
        }
    });
}

// ===== 全局 AI 智能问答抽屉 =====
// 基于现有 .ai-drawer 样式基建，在所有页面动态挂载对话式 AI 助手。
// 演示数据：按关键词匹配预置回答，模拟医疗数据治理领域的智能问答。

const AI_QUICK_PROMPTS = [
    'HIS患者表如何映射到标准库？',
    '写一个性别字典映射SQL',
    'Kettle增量抽取的最佳实践',
    '检验结果表常见质量问题？'
];

const AI_CANNED_RESPONSES = [
    {
        keywords: ['映射', 'patient', 'his'],
        html: '<p>以 <b>HIS_PATIENT</b> → 标准表 <b>PAT_PATIENT_INFO</b> 为例，推荐映射策略：</p><ul class="list-disc pl-4 mt-1 space-y-0.5"><li><code>PATIENT_ID → patient_id</code>（主键，直接映射）</li><li><code>NAME → patient_name</code>，需去空格清洗</li><li><code>SEX_CODE → gender</code>，经字典 1→M / 2→F 转换</li><li><code>BIRTHDAY → birth_date</code>，格式统一为 <code>yyyy-MM-dd</code></li></ul><p class="mt-1">置信度约 88%，可在「字段智能映射」页一键应用后人工复核。</p>'
    },
    {
        keywords: ['sql', '字典', '性别', 'case'],
        html: '<p>性别字典映射常用两种写法：</p><pre class="ddl-code mt-1 text-xs" style="white-space:pre-wrap">-- 方式1：CASE WHEN（简单字典）\nSELECT CASE SEX_CODE\n         WHEN \'1\' THEN \'M\'\n         WHEN \'2\' THEN \'F\'\n         ELSE \'U\' END AS gender\nFROM HIS_PATIENT;\n\n-- 方式2：JOIN 标准字典表（推荐，可维护）\nSELECT d.std_code AS gender\nFROM HIS_PATIENT p\nLEFT JOIN STD_DICT_SEX d\n  ON d.src_code = p.SEX_CODE\n AND d.src_system = \'HIS\';</pre><p class="mt-1">建议优先方式2，字典变更时无需改脚本。</p>'
    },
    {
        keywords: ['kettle', '增量', '抽取', '最佳实践', '脚本'],
        html: '<p>Kettle 增量抽取关键实践：</p><ul class="list-disc pl-4 mt-1 space-y-0.5"><li>时间戳增量：<code>WHERE UPDATE_TIME &gt; ?</code> 配合参数传递</li><li>大表分批：Table input 设置 fetch size + commit 批量 1000~5000</li><li>幂等写入：目标端用 UPSERT（主键冲突更新）</li><li>失败恢复：转换级别设置重启策略，记录 LAST_SYNC_TIME 断点</li><li>日志规范：命名 <code>{系统}_{表}_{动作}</code>，如 HIS_PATIENT_SYNC</li></ul><p class="mt-1">可在「脚本生成」页选择模板自动套用以上实践。</p>'
    },
    {
        keywords: ['质量', '问题', 'lis', '检验'],
        html: '<p>LIS 检验结果表（LIS_TEST_RESULT）高频质量问题：</p><ul class="list-disc pl-4 mt-1 space-y-0.5"><li><b>完整性</b>：RESULT_VALUE 空值率约 0.3%（标本未出结果）</li><li><b>一致性</b>：单位字段 mg/dL 与 mmol/L 混用</li><li><b>有效性</b>：检验日期存在 <code>yyyyMMdd</code>/<code>yyyy-MM-dd</code> 双格式</li><li><b>唯一性</b>：重复上报导致 0.05% 重复记录</li></ul><p class="mt-1">建议在「数据质量管理」页启用对应 4 条规则，阈值告警已按科室维度配置。</p>'
    },
    {
        keywords: ['连接', '数据库', 'oracle', '配置'],
        html: '<p>医院各系统典型连接方式：</p><ul class="list-disc pl-4 mt-1 space-y-0.5"><li>HIS：Oracle 19c，建议 Service Name 方式 <code>192.168.1.100:1521/ORCL</code></li><li>LIS：SQL Server 2019，Windows 认证或账号密码均可</li><li>PACS：PostgreSQL，注意 schema 隔离</li></ul><p class="mt-1">在「数据源管理」页可使用 AI 智能配置，输入地址自动识别库类型并生成连接池参数。</p>'
    }
];

const AI_DEFAULT_RESPONSE = '<p>收到。作为医疗数据治理助手，我可以协助：</p><ul class="list-disc pl-4 mt-1 space-y-0.5"><li>解读 HIS/LIS/PACE 表结构与字段含义</li><li>生成平台标准结构的转换 SQL</li><li>推荐系统字典到标准字典的映射</li><li>解答 Kettle 脚本与调度问题</li><li>分析数据质量风险与整改建议</li></ul><p class="mt-1">请描述您的具体场景，例如"HIS 医嘱表如何对接标准库 HIS_ORDER？"</p>';

let _aiChatInitialized = false;

function _aiPickResponse(question) {
    const q = question.toLowerCase();
    for (const item of AI_CANNED_RESPONSES) {
        if (item.keywords.some(k => q.includes(k.toLowerCase()))) return item.html;
    }
    return AI_DEFAULT_RESPONSE;
}

function _aiAppendMessage(role, html, isHtml) {
    const list = document.getElementById('aiChatMessages');
    if (!list) return;
    const wrap = document.createElement('div');
    wrap.className = role === 'user' ? 'flex justify-end' : 'flex justify-start';
    if (role === 'user') {
        const bubble = document.createElement('div');
        bubble.className = 'ai-msg max-w-[85%] bg-medical-600 text-white rounded-xl rounded-br-sm text-sm shadow-sm';
        bubble.textContent = html;
        wrap.appendChild(bubble);
    } else {
        const bubble = document.createElement('div');
        bubble.className = 'ai-msg max-w-[92%] bg-gray-100 dark:bg-gray-700 rounded-xl rounded-bl-sm text-sm space-y-1';
        bubble.style.color = 'var(--text-primary)';
        if (isHtml) bubble.innerHTML = html; else bubble.textContent = html;
        wrap.appendChild(bubble);
    }
    list.appendChild(wrap);
    list.scrollTop = list.scrollHeight;
}

function _aiShowTyping() {
    const list = document.getElementById('aiChatMessages');
    if (!list) return null;
    const wrap = document.createElement('div');
    wrap.id = 'aiTypingIndicator';
    wrap.className = 'flex justify-start';
    wrap.innerHTML = `
        <div class="bg-gray-100 dark:bg-gray-700 rounded-xl rounded-bl-sm px-4 py-3.5 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 bg-medical-500 rounded-full animate-bounce"></span>
            <span class="w-1.5 h-1.5 bg-medical-500 rounded-full animate-bounce" style="animation-delay:0.15s"></span>
            <span class="w-1.5 h-1.5 bg-medical-500 rounded-full animate-bounce" style="animation-delay:0.3s"></span>
        </div>`;
    list.appendChild(wrap);
    list.scrollTop = list.scrollHeight;
    return wrap;
}

function aiAskQuestion(question) {
    const q = (question || '').trim();
    if (!q) return;
    _aiAppendMessage('user', q);
    const input = document.getElementById('aiChatInput');
    if (input) input.value = '';
    const typing = _aiShowTyping();
    setTimeout(function() {
        if (typing) typing.remove();
        _aiAppendMessage('ai', _aiPickResponse(q), true);
    }, 900 + Math.random() * 700);
}

function handleAIInputKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        aiAskQuestion(document.getElementById('aiChatInput').value);
    }
}

function renderAIDrawer() {
    if (_aiChatInitialized) return;
    _aiChatInitialized = true;

    const overlay = document.createElement('div');
    overlay.id = 'aiDrawerOverlay';
    overlay.className = 'ai-drawer-overlay';
    overlay.onclick = function() { toggleAIDrawer(); };

    const drawer = document.createElement('aside');
    drawer.id = 'aiDrawer';
    drawer.className = 'ai-drawer';
    drawer.setAttribute('role', 'complementary');
    drawer.setAttribute('aria-label', 'AI 智能助手');
    drawer.style.maxWidth = '100vw';

    const quickPromptsHtml = AI_QUICK_PROMPTS.map(p => `
        <button type="button" onclick="aiAskQuestion('${p.replace(/'/g, "\\'")}')" class="text-xs px-3 py-1.5 bg-medical-50 dark:bg-medical-900/40 text-medical-700 dark:text-medical-300 border border-medical-100 dark:border-medical-800 rounded-full hover:bg-medical-100 dark:hover:bg-medical-900 transition-colors focus-visible:ring-2 focus-visible:ring-medical-400 focus-visible:outline-none">${MediData.escapeHtml(p)}</button>
    `).join('');

    drawer.innerHTML = `
        <div class="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 bg-gradient-to-br from-medical-500 to-medical-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-robot text-white" aria-hidden="true"></i>
                </div>
                <div>
                    <p class="text-sm font-bold" style="color:var(--text-primary)">AI 治理助手</p>
                    <p class="text-xs text-gray-400 flex items-center gap-1"><span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block"></span> 大模型服务在线</p>
                </div>
            </div>
            <button type="button" onclick="toggleAIDrawer()" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-medical-400 focus-visible:outline-none" aria-label="关闭 AI 助手">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        </div>
        <div id="aiChatMessages" class="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 scrollbar-thin" aria-live="polite">
            <div class="flex justify-start">
                <div class="ai-msg max-w-[92%] bg-gradient-to-br from-medical-600 to-medical-700 text-white rounded-xl rounded-bl-sm text-sm space-y-1 shadow-md">
                    <p class="font-medium"><i class="fas fa-hand-sparkles mr-1" aria-hidden="true"></i>您好，张工程师！</p>
                    <p class="text-white/90 text-xs leading-relaxed">我是 MediData AI 治理助手，熟悉您接入的 HIS、LIS、PACS 数据源与平台标准结构。可以点击下方快捷问题，或直接输入您的需求。</p>
                </div>
            </div>
        </div>
        <div class="px-5 pb-2 pt-2 flex flex-wrap gap-1.5 flex-shrink-0 border-t border-gray-100 dark:border-gray-700">${quickPromptsHtml}</div>
        <div class="px-4 pt-1 pb-3 flex-shrink-0">
            <div class="flex items-end gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-2">
                <textarea id="aiChatInput" rows="1" placeholder="输入您的问题，Enter 发送..." onkeydown="handleAIInputKeydown(event)" class="flex-1 bg-transparent text-sm resize-none outline-none max-h-24 px-2 py-1.5 leading-relaxed" style="color:var(--text-primary)" aria-label="AI 对话输入框"></textarea>
                <button type="button" onclick="aiAskQuestion(document.getElementById('aiChatInput').value)" class="w-9 h-9 bg-medical-600 hover:bg-medical-700 text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0 focus-visible:ring-2 focus-visible:ring-medical-400 focus-visible:outline-none" aria-label="发送">
                    <i class="fas fa-paper-plane text-sm" aria-hidden="true"></i>
                </button>
            </div>
            <p class="text-[10px] text-gray-400 text-center mt-2">演示环境：回答为预置示例 · 生产环境将接入医院私有化大模型</p>
        </div>`;
    drawer.querySelector('#aiChatMessages').style.color = 'var(--text-primary)';

    const fab = document.createElement('button');
    fab.id = 'aiToggleBtn';
    fab.type = 'button';
    fab.className = 'ai-toggle-btn w-12 h-12 mr-4 rounded-full bg-gradient-to-br from-medical-500 to-medical-700 text-white shadow-lg shadow-medical-600/30 flex items-center justify-center hover:scale-105 transition-transform focus-visible:ring-2 focus-visible:ring-medical-400 focus-visible:outline-none';
    fab.setAttribute('aria-label', '打开 AI 智能助手');
    fab.setAttribute('title', 'AI 智能助手 (Ctrl+J)');
    fab.innerHTML = '<i class="fas fa-robot text-lg" aria-hidden="true"></i>';
    fab.onclick = function() { toggleAIDrawer(); };

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    document.body.appendChild(fab);
}

// ===== 初始化 =====
function initCommon() {
    MediData.darkMode.init();
    renderSidebar();
    renderHeader();
    renderBreadcrumb();
    renderAIDrawer();
    setupMobileSidebar();
    setupActionDelegation();

    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // 移动端：点击侧栏内任意链接后自动收起抽屉
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.addEventListener('click', function(e) {
            if (e.target.closest('a') && isMobileView()) closeMobileSidebar();
        });
    }

    // 键盘可达性：带 tabindex 的树节点/菜单项/可点击卡片，Enter/Space 触发等效点击
    // 覆盖各页 div 型树节点（.tree-item-std/.std-tree-item/.metadata-tree-item）、
    // 设置菜单（.setting-menu）及显式标注 [data-clickable] 的元素
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const el = e.target.closest('.tree-item-std, .std-tree-item, .metadata-tree-item, .setting-menu, [data-clickable]');
        if (!el || el.tagName === 'BUTTON' || el.tagName === 'A') return;
        // 避免与内部输入框/按钮冲突
        if (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(e.target.tagName)) return;
        e.preventDefault();
        el.click();
    });

    // 视口从移动端切回桌面时，清理离屏抽屉状态
    window.addEventListener('resize', function() {
        if (!isMobileView()) {
            const sb = document.getElementById('sidebar');
            const scrim = document.getElementById('sidebarScrim');
            if (sb) sb.classList.remove('mobile-open');
            if (scrim) {
                scrim.classList.remove('active');
                scrim.setAttribute('aria-hidden', 'true');
            }
        }
    });

    // 入场动效（尊重 prefers-reduced-motion）
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
        document.body.classList.add('page-fade');
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                document.body.classList.add('page-loaded');
            });
        });
        initReveal();
    }
    animateProgressBars(reduceMotion);
}

// ===== 暴露全局 API（供 HTML onclick 使用） =====
Object.assign(window, {
    MediData: MediData,
    showToast: showToast,
    showConfirm: showConfirm,
    openModal: openModal,
    closeModal: closeModal,
    toggleSidebar: toggleSidebar,
    toggleAIDrawer: toggleAIDrawer,
    handleLogout: handleLogout,
    showNotifications: showNotifications,
    showMessages: showMessages,
    handleSearchInput: handleSearchInput,
    handleGlobalSearch: handleGlobalSearch,
    showSearchResults: showSearchResults,
    sortTable: sortTable,
    renderPagination: renderPagination
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommon);
} else {
    initCommon();
}

})();
