// 初始化默认书签
const defaultBookmarks = [
    {
        name: "GitHub",
        url: "https://github.com",
        icon: "fab fa-github"
    },
    {
        name: "知乎",
        url: "https://zhihu.com",
        icon: "fab fa-zhihu"
    },
    {
        name: "微博",
        url: "https://weibo.com",
        icon: "fab fa-weibo"
    },
    {
        name: "泽攸科技",
        url: "https://www.zeptools.cn",
    }
];

// 当前搜索引擎 - 默认改为百度
let currentEngine = localStorage.getItem("lastUsedEngine") || "baidu";

// 搜索引擎URL
const searchEngines = {
    google: "https://www.google.com/search?q=",
    baidu: "https://www.baidu.com/s?wd=",
    bing: "https://www.bing.com/search?q="
};

// DOM元素
const timeElement = document.getElementById("time");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const engineIcons = document.querySelectorAll(".engine-icon");
const bookmarksContainer = document.getElementById("bookmarks");
const modal = document.getElementById("bookmark-modal");
const modalClose = document.querySelector(".close");
const bookmarkForm = document.getElementById("bookmark-form");
const modalTitle = document.getElementById("modal-title");
const bookmarkIndex = document.getElementById("bookmark-index");
const bookmarkName = document.getElementById("bookmark-name");
const bookmarkUrl = document.getElementById("bookmark-url");
const bookmarkIcon = document.getElementById("bookmark-icon");
const deleteButton = document.getElementById("btn-delete");
const poemElement = document.getElementById("poem-text");

// 新增DOM元素
const themeToggle = document.getElementById("theme-toggle");
const donateButton = document.getElementById("donate-button");
const donateModal = document.getElementById("donate-modal");
const donateModalClose = donateModal.querySelector(".close");

// 初始化
document.addEventListener("DOMContentLoaded", () => {
    updateTime();
    setInterval(updateTime, 1000);
    loadBookmarks();
    setupEventListeners();
    
    // 设置默认搜索引擎
    engineIcons.forEach(icon => {
        if (icon.getAttribute("data-engine") === currentEngine) {
            icon.classList.add("active");
        } else {
            icon.classList.remove("active");
        }
    });
    
    // 显示随机古诗词
    displayRandomPoem();
    
    // 直接设置必应壁纸
    setBingBackground();
    
    // 初始化深色模式
    initTheme();
});

// 更新时间 - 添加秒钟显示
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

// 加载书签
function loadBookmarks() {
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || defaultBookmarks;
    
    // 清空书签容器
    bookmarksContainer.innerHTML = "";
    
    // 添加书签
    bookmarks.forEach((bookmark, index) => {
        const bookmarkElement = createBookmarkElement(bookmark, index);
        bookmarksContainer.appendChild(bookmarkElement);
    });
    
    // 添加"添加书签"按钮
    const addBookmark = document.createElement("div");
    addBookmark.className = "add-bookmark";
    addBookmark.innerHTML = `
        <div class="add-icon">
            <i class="fas fa-plus"></i>
        </div>
        <div class="bookmark-name">添加</div>
    `;
    addBookmark.addEventListener("click", () => openModal());
    bookmarksContainer.appendChild(addBookmark);
}

// 创建书签元素
function createBookmarkElement(bookmark, index) {
    const element = document.createElement("div");
    element.className = "bookmark";
    element.setAttribute("data-index", index);
    
    // 判断图标是Font Awesome还是URL
    let iconContent;
    if (bookmark.icon && bookmark.icon.startsWith("fa")) {
        iconContent = `<i class="${bookmark.icon}"></i>`;
    } else if (bookmark.icon) {
        iconContent = `<img src="${bookmark.icon}" alt="${bookmark.name}">`;
    } else {
        // 如果没有图标，使用首字母
        iconContent = `<span>${bookmark.name.charAt(0).toUpperCase()}</span>`;
    }
    
    element.innerHTML = `
        <div class="bookmark-icon">
            ${iconContent}
        </div>
        <div class="bookmark-name">${bookmark.name}</div>
    `;
    
    // 添加点击事件
    element.addEventListener("click", () => {
        window.open(bookmark.url, "_blank");
    });
    
    // 添加右键菜单
    element.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        openModal(index);
    });
    
    return element;
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索引擎切换 - 添加记忆功能
    engineIcons.forEach(icon => {
        icon.addEventListener("click", () => {
            engineIcons.forEach(i => i.classList.remove("active"));
            icon.classList.add("active");
            currentEngine = icon.getAttribute("data-engine");
            // 保存用户选择的搜索引擎
            localStorage.setItem("lastUsedEngine", currentEngine);
            searchInput.focus();
        });
    });
    
    // 搜索功能
    searchButton.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            performSearch();
        }
    });
    
    // 模态框关闭
    modalClose.addEventListener("click", closeModal);
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // 书签表单提交
    bookmarkForm.addEventListener("submit", (e) => {
        e.preventDefault();
        saveBookmark();
    });
    
    // 删除按钮
    deleteButton.addEventListener("click", deleteBookmark);
    
    // 深色模式切换
    themeToggle.addEventListener("click", toggleTheme);
    
    // 捐赠按钮
    donateButton.addEventListener("click", () => {
        donateModal.style.display = "block";
    });
    
    // 捐赠模态框关闭
    donateModalClose.addEventListener("click", () => {
        donateModal.style.display = "none";
    });
    
    // 点击其他地方关闭捐赠模态框
    window.addEventListener("click", (e) => {
        if (e.target === donateModal) {
            donateModal.style.display = "none";
        }
    });
}

// 执行搜索
function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
        window.open(searchEngines[currentEngine] + encodeURIComponent(query), "_blank");
        searchInput.value = "";
    }
}

// 打开模态框
function openModal(index = null) {
    modalTitle.textContent = index !== null ? "编辑书签" : "添加书签";
    bookmarkIndex.value = index;
    
    if (index !== null) {
        const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || defaultBookmarks;
        const bookmark = bookmarks[index];
        bookmarkName.value = bookmark.name;
        bookmarkUrl.value = bookmark.url;
        bookmarkIcon.value = bookmark.icon || "";
        deleteButton.style.display = "block";
    } else {
        bookmarkForm.reset();
        deleteButton.style.display = "none";
    }
    
    modal.style.display = "block";
    bookmarkName.focus();
}

// 关闭模态框
function closeModal() {
    modal.style.display = "none";
}

// 保存书签
function saveBookmark() {
    const name = bookmarkName.value.trim();
    let url = bookmarkUrl.value.trim();
    const icon = bookmarkIcon.value.trim();
    const index = bookmarkIndex.value;
    
    // 确保URL有协议前缀
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }
    
    // 获取当前书签
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || defaultBookmarks;
    
    const newBookmark = {
        name,
        url,
        icon
    };
    
    if (index !== null && index !== "") {
        // 更新现有书签
        bookmarks[index] = newBookmark;
    } else {
        // 添加新书签
        bookmarks.push(newBookmark);
    }
    
    // 保存到本地存储
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    
    // 重新加载书签
    loadBookmarks();
    
    // 关闭模态框
    closeModal();
}

// 删除书签
function deleteBookmark() {
    const index = bookmarkIndex.value;
    
    if (index !== null && index !== "") {
        let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || defaultBookmarks;
        bookmarks.splice(index, 1);
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        loadBookmarks();
    }
    
    closeModal();
}

// 设置必应壁纸
function setBingBackground() {
    const timestamp = new Date().getTime(); // 防止缓存
    document.body.style.backgroundImage = `url('https://bing.img.run/rand_uhd.php?t=${timestamp}')`;
}

// 初始化主题
function initTheme() {
    const darkMode = localStorage.getItem("darkMode") === "true";
    if (darkMode) {
        document.body.classList.add("dark-mode");
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// 切换深色模式
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", isDarkMode);
    
    // 切换图标
    if (isDarkMode) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// 添加随机古诗词函数
function displayRandomPoem() {
    const poems = [
        "人生若只如初见，何事秋风悲画扇。 —— 纳兰性德《木兰词·拟古决绝词柬友》",
        "曾经沧海难为水，除却巫山不是云。 —— 元稹《离思五首·其四》",
        "落红不是无情物，化作春泥更护花。 —— 龚自珍《己亥杂诗·其五》",
        "春风得意马蹄疾，一日看尽长安花。 —— 孟郊《登科后》",
        "会当凌绝顶，一览众山小。 —— 杜甫《望岳》",
        "海内存知己，天涯若比邻。 —— 王勃《送杜少府之任蜀州》",
        "桃花潭水深千尺，不及汪伦送我情。 —— 李白《赠汪伦》",
        "黄河远上白云间，一片孤城万仞山。 —— 王之涣《凉州词》",
        "君问归期未有期，巴山夜雨涨秋池。 —— 李商隐《夜雨寄北》",
        "不识庐山真面目，只缘身在此山中。 —— 苏轼《题西林壁》",
        "千里莺啼绿映红，水村山郭酒旗风。 —— 杜牧《江南春》",
        "夜来风雨声，花落知多少。 —— 孟浩然《春晓》",
        "人有悲欢离合，月有阴晴圆缺，此事古难全。 —— 苏轼《水调歌头·明月几时有》",
        "问君能有几多愁，恰似一江春水向东流。 —— 李煜《虞美人·春花秋月何时了》",
        "莫愁前路无知己，天下谁人不识君。 —— 高适《别董大》",
        "大江东去，浪淘尽，千古风流人物。 —— 苏轼《念奴娇·赤壁怀古》",
        "欲把西湖比西子，淡妆浓抹总相宜。 —— 苏轼《饮湖上初晴后雨》",
        "小时不识月，呼作白玉盘。 —— 李白《古朗月行》",
        "少壮不努力，老大徒伤悲。 —— 汉乐府《长歌行》",
        "明月几时有，把酒问青天。 —— 苏轼《水调歌头·明月几时有》"
    ];
    
    const randomIndex = Math.floor(Math.random() * poems.length);
    if (poemElement) {
        poemElement.textContent = poems[randomIndex];
    }
}