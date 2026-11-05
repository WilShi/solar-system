// 完整版银河系主程序 - 包含太阳系和星座
document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.getElementById('loading-text');
    const progressBar = document.getElementById('progress-bar');
    const infoPanel = document.getElementById('info-panel');
    const closePanelBtn = document.getElementById('close-panel-btn');
    const planetTitle = document.getElementById('planet-title');
    const planetStats = document.getElementById('planet-stats');
    const planetDescription = document.getElementById('planet-description');
    const navigationPanel = document.getElementById('navigation-panel');
    const navToggleBtn = document.getElementById('nav-toggle-btn');
    const navContent = document.getElementById('nav-content');

    // 控制按钮
    const toggleArmsBtn = document.getElementById('toggle-arms-btn');
    const cruiseModeBtn = document.getElementById('cruise-mode-btn');
    const researchModeBtn = document.getElementById('research-mode-btn');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const densitySlider = document.getElementById('density-slider');
    const densityValue = document.getElementById('density-value');

    // Three.js 核心变量
    let scene, camera, renderer, controls;
    let galaxyObjects = [];
    let spiralArms = [];
    let timeScale = 1;
    let densityMultiplier = 1;
    let focusedObject = null;
    let cruiseMode = false;
    let researchMode = false;
    let armsVisible = true;
    let cruiseTargets = [];
    let currentCruiseIndex = 0;
    let cruiseInterval = null;

    // LOD系统
    let currentLODLevel = 'galaxy';
    let lodObjects = new Map(); // 存储不同LOD级别的对象
    let lastCameraDistance = 0;

    // 太阳系数据
    const solarSystemData = {
        name: '太阳系',
        type: 'solar_system',
        position: { x: 26000, y: 0, z: 0 }, // 距离银心约26000光年
        radius: 100, // 太阳系半径（光年）
        description: '我们的家园太阳系，位于银河系的猎户臂上，距离银心约26000光年。包含太阳和八大行星。',
        icon: 'fas fa-sun',
        planets: [
            {
                name: '太阳',
                type: 'star',
                radius: 0.00465, // 光年
                color: { r: 1.0, g: 1.0, b: 0.8 },
                description: '太阳是太阳系的中心恒星，占太阳系总质量的99.86%。',
                distance: 0
            },
            {
                name: '水星',
                type: 'planet',
                radius: 0.0000163,
                color: { r: 0.7, g: 0.7, b: 0.7 },
                description: '水星是距离太阳最近的行星，表面温度变化极大。',
                distance: 0.387 // AU转换为光年的近似值
            },
            {
                name: '金星',
                type: 'planet',
                radius: 0.0000405,
                color: { r: 1.0, g: 0.8, b: 0.4 },
                description: '金星是太阳系中最热的行星，拥有浓厚的大气层。',
                distance: 0.723
            },
            {
                name: '地球',
                type: 'planet',
                radius: 0.0000426,
                color: { r: 0.4, g: 0.7, b: 1.0 },
                description: '地球是我们的家园，太阳系中唯一已知存在生命的行星。',
                distance: 1.0
            },
            {
                name: '火星',
                type: 'planet',
                radius: 0.0000227,
                color: { r: 1.0, g: 0.4, b: 0.2 },
                description: '火星被称为红色星球，是人类探索的重点目标。',
                distance: 1.524
            },
            {
                name: '木星',
                type: 'planet',
                radius: 0.000467,
                color: { r: 0.9, g: 0.7, b: 0.5 },
                description: '木星是太阳系最大的行星，一个气态巨行星。',
                distance: 5.203
            },
            {
                name: '土星',
                type: 'planet',
                radius: 0.000389,
                color: { r: 0.9, g: 0.8, b: 0.6 },
                description: '土星以其美丽的环系统而闻名。',
                distance: 9.537
            },
            {
                name: '天王星',
                type: 'planet',
                radius: 0.000169,
                color: { r: 0.4, g: 0.8, b: 0.9 },
                description: '天王星是一颗冰巨星，自转轴极度倾斜。',
                distance: 19.191
            },
            {
                name: '海王星',
                type: 'planet',
                radius: 0.000165,
                color: { r: 0.2, g: 0.4, b: 0.9 },
                description: '海王星是距离太阳最远的行星。',
                distance: 30.069
            }
        ]
    };

    // 星座数据
    const constellationData = [
        {
            name: '猎户座',
            type: 'constellation',
            position: { x: -12000, y: -200, z: 18000 },
            radius: 2000,
            description: '猎户座是最著名的星座之一，包含参宿四、参宿七等亮星，以及著名的猎户座星云。',
            icon: 'fas fa-user',
            stars: [
                { name: '参宿四', color: { r: 1.0, g: 0.4, b: 0.2 }, brightness: 0.8 },
                { name: '参宿七', color: { r: 0.8, g: 0.9, b: 1.0 }, brightness: 0.9 },
                { name: '参宿一', color: { r: 0.9, g: 0.9, b: 1.0 }, brightness: 0.7 },
                { name: '参宿二', color: { r: 0.8, g: 0.8, b: 1.0 }, brightness: 0.6 },
                { name: '参宿三', color: { r: 0.9, g: 0.9, b: 1.0 }, brightness: 0.5 }
            ]
        },
        {
            name: '大熊座',
            type: 'constellation',
            position: { x: 8000, y: 5000, z: -15000 },
            radius: 1800,
            description: '大熊座包含著名的北斗七星，是北半球最容易识别的星座之一。',
            icon: 'fas fa-paw',
            stars: [
                { name: '天枢', color: { r: 1.0, g: 0.8, b: 0.6 }, brightness: 0.8 },
                { name: '天璇', color: { r: 0.9, g: 0.9, b: 1.0 }, brightness: 0.7 },
                { name: '天玑', color: { r: 0.8, g: 0.9, b: 1.0 }, brightness: 0.6 },
                { name: '天权', color: { r: 0.9, g: 0.9, b: 1.0 }, brightness: 0.5 },
                { name: '玉衡', color: { r: 0.8, g: 0.8, b: 1.0 }, brightness: 0.7 },
                { name: '开阳', color: { r: 0.9, g: 0.9, b: 1.0 }, brightness: 0.6 },
                { name: '摇光', color: { r: 0.8, g: 0.9, b: 1.0 }, brightness: 0.8 }
            ]
        },
        {
            name: '天鹅座',
            type: 'constellation',
            position: { x: 8000, y: -300, z: -15000 },
            radius: 1500,
            description: '天鹅座形似一只展翅飞翔的天鹅，包含著名的天鹅座X-1黑洞。',
            icon: 'fas fa-dove',
            stars: [
                { name: '天津四', color: { r: 0.9, g: 0.9, b: 1.0 }, brightness: 0.9 },
                { name: '天津一', color: { r: 0.8, g: 0.8, b: 1.0 }, brightness: 0.6 },
                { name: '天津九', color: { r: 0.9, g: 0.8, b: 0.7 }, brightness: 0.7 }
            ]
        },
        {
            name: '仙女座',
            type: 'constellation',
            position: { x: 60000, y: 10000, z: 30000 },
            radius: 2200,
            description: '仙女座指向仙女座星系的方向，是秋季夜空的重要星座。',
            icon: 'fas fa-female',
            stars: [
                { name: '壁宿二', color: { r: 0.8, g: 0.9, b: 1.0 }, brightness: 0.8 },
                { name: '奎宿九', color: { r: 0.9, g: 0.8, b: 0.7 }, brightness: 0.7 },
                { name: '天大将军一', color: { r: 0.8, g: 0.8, b: 1.0 }, brightness: 0.6 }
            ]
        },
        {
            name: '天蝎座',
            type: 'constellation',
            position: { x: -8000, y: -2000, z: -12000 },
            radius: 1600,
            description: '天蝎座是黄道十二星座之一，心宿二是其最亮的恒星。',
            icon: 'fas fa-bug',
            stars: [
                { name: '心宿二', color: { r: 1.0, g: 0.3, b: 0.2 }, brightness: 0.9 },
                { name: '尾宿八', color: { r: 0.8, g: 0.9, b: 1.0 }, brightness: 0.7 },
                { name: '房宿四', color: { r: 0.9, g: 0.8, b: 0.7 }, brightness: 0.6 }
            ]
        },
        {
            name: '狮子座',
            type: 'constellation',
            position: { x: -15000, y: 3000, z: 8000 },
            radius: 1400,
            description: '狮子座是春季夜空的代表星座，轩辕十四是其主星。',
            icon: 'fas fa-cat',
            stars: [
                { name: '轩辕十四', color: { r: 0.9, g: 0.9, b: 1.0 }, brightness: 0.8 },
                { name: '五帝座一', color: { r: 0.8, g: 0.8, b: 1.0 }, brightness: 0.7 }
            ]
        }
    ];

    // 银河系数据（原有数据保持不变）
    const galaxyData = {
        center: {
            name: '银河系中心',
            description: '银河系的核心区域，包含超大质量黑洞人马座A*，质量约为太阳的400万倍。这里是银河系的引力中心，周围环绕着高密度的恒星和气体云。',
            position: { x: 0, y: 0, z: 0 },
            radius: 2000,
            particleCount: 30000,
            color: { r: 1.0, g: 0.8, b: 0.6 },
            type: 'center',
            icon: 'fas fa-dot-circle'
        },
        clusters: [
            {
                name: '昴宿星团',
                type: 'cluster',
                position: { x: 15000, y: 500, z: 8000 },
                particleCount: 3000,
                radius: 800,
                color: { r: 0.8, g: 0.9, b: 1.0 },
                description: '昴宿星团是一个年轻的疏散星团，距离地球约444光年，包含许多蓝色的热恒星。在中国古代被称为"七星"，是夜空中最容易识别的星团之一。',
                icon: 'fas fa-star'
            },
            {
                name: '猎户座星云',
                type: 'nebula',
                position: { x: -12000, y: -200, z: 18000 },
                particleCount: 5000,
                radius: 1200,
                color: { r: 1.0, g: 0.3, b: 0.4 },
                description: '猎户座星云是一个活跃的恒星形成区域，距离地球约1344光年。以其红色和蓝色的发光气体而闻名，是夜空中最亮的星云之一，肉眼可见。',
                icon: 'fas fa-cloud'
            },
            {
                name: '天鹅座X-1',
                type: 'blackhole',
                position: { x: 8000, y: -300, z: -15000 },
                particleCount: 1500,
                radius: 300,
                color: { r: 1.0, g: 0.1, b: 0.8 },
                description: '天鹅座X-1是第一个被确认的恒星级黑洞，距离地球约6000光年，质量约为太阳的15倍。它通过吸积伴星物质产生强烈的X射线辐射。',
                icon: 'fas fa-circle'
            },
            {
                name: '船底座星云',
                type: 'nebula',
                position: { x: -25000, y: 800, z: -12000 },
                particleCount: 4000,
                radius: 1500,
                color: { r: 1.0, g: 0.6, b: 0.2 },
                description: '船底座星云是南天最壮观的星云之一，距离地球约7500光年。包含海山二等超巨星，是银河系中最活跃的恒星形成区域之一。',
                icon: 'fas fa-cloud'
            },
            {
                name: '球状星团M13',
                type: 'globular',
                position: { x: 20000, y: 15000, z: 5000 },
                particleCount: 3500,
                radius: 600,
                color: { r: 1.0, g: 0.8, b: 0.4 },
                description: '武仙座球状星团M13距离地球约25000光年，包含约30万颗恒星。这些都是古老的恒星，年龄超过100亿年，是银河系形成早期的遗迹。',
                icon: 'fas fa-circle-dot'
            },
            {
                name: '仙女座星系方向',
                type: 'external',
                position: { x: 60000, y: 10000, z: 30000 },
                particleCount: 2000,
                radius: 2000,
                color: { r: 0.7, g: 0.8, b: 0.9 },
                description: '指向仙女座星系的方向，这是距离银河系最近的大型螺旋星系，约254万光年远。仙女座星系正以每秒110公里的速度向银河系靠近。',
                icon: 'fas fa-expand'
            }
        ]
    };

    // LOD距离阈值
    const LOD_THRESHOLDS = {
        GALAXY: 100000,    // 银河系全景
        REGION: 50000,     // 区域视图（星座、星团）
        SYSTEM: 1000,      // 星系视图（太阳系）
        DETAIL: 100        // 详细视图（行星）
    };

    // 初始化
    function init() {
        try {
            // 场景设置
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 500000);
            camera.position.set(0, 15000, 25000);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000011);
            document.body.appendChild(renderer.domElement);

            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 1;
            controls.maxDistance = 200000;
            controls.target.set(0, 0, 0);

            // 创建银河系
            createGalaxy();
            
            // 生成导航栏
            generateNavigation();
            
            // 设置事件监听
            setupEventListeners();
            
            // 开始动画
            animate();

            // 隐藏加载屏幕
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    if (loadingScreen.parentNode) {
                        loadingScreen.remove();
                    }
                }, 500);
            }, 1000);

        } catch (error) {
            console.error('初始化失败:', error);
            loadingText.textContent = '加载失败，请刷新页面重试';
        }
    }   
 // 创建银河系
    function createGalaxy() {
        updateProgress(10, '创建银河系中心');
        createGalacticCenter();

        updateProgress(20, '创建螺旋臂');
        createSpiralArms();

        updateProgress(30, '创建星团');
        createStarClusters();

        updateProgress(40, '创建太阳系标记');
        createSolarSystemMarker();

        updateProgress(50, '创建星座标记');
        createConstellationMarkers();

        updateProgress(70, '创建背景恒星');
        createBackgroundStars();

        updateProgress(100, '完成');
    }

    // 更新进度
    function updateProgress(percent, text) {
        progressBar.style.width = percent + '%';
        loadingText.textContent = text;
    }

    // LOD系统 - 根据相机距离动态加载内容
    function updateLOD() {
        const cameraDistance = camera.position.distanceTo(controls.target);
        
        // 避免频繁更新
        if (Math.abs(cameraDistance - lastCameraDistance) < 1000) return;
        lastCameraDistance = cameraDistance;

        let newLODLevel = 'galaxy';
        if (cameraDistance < LOD_THRESHOLDS.DETAIL) {
            newLODLevel = 'detail';
        } else if (cameraDistance < LOD_THRESHOLDS.SYSTEM) {
            newLODLevel = 'system';
        } else if (cameraDistance < LOD_THRESHOLDS.REGION) {
            newLODLevel = 'region';
        }

        if (newLODLevel !== currentLODLevel) {
            currentLODLevel = newLODLevel;
            updateVisibleObjects();
        }
    }

    // 更新可见对象
    function updateVisibleObjects() {
        // 根据LOD级别显示/隐藏对象
        switch (currentLODLevel) {
            case 'galaxy':
                showGalaxyLevel();
                break;
            case 'region':
                showRegionLevel();
                break;
            case 'system':
                showSystemLevel();
                break;
            case 'detail':
                showDetailLevel();
                break;
        }
    }

    // 银河系级别显示
    function showGalaxyLevel() {
        // 显示银河系主要结构
        spiralArms.forEach(arm => arm.visible = armsVisible);
        
        // 隐藏详细内容
        hideDetailedObjects();
    }

    // 区域级别显示
    function showRegionLevel() {
        showGalaxyLevel();
        
        // 显示星座连线
        if (focusedObject && focusedObject.type === 'constellation') {
            createConstellationLines(focusedObject);
        }
    }

    // 星系级别显示
    function showSystemLevel() {
        showRegionLevel();
        
        // 如果聚焦在太阳系，显示行星
        if (focusedObject && focusedObject.type === 'solar_system') {
            createSolarSystemDetail(focusedObject);
        }
    }

    // 详细级别显示
    function showDetailLevel() {
        showSystemLevel();
        
        // 显示行星详细信息
        if (focusedObject && focusedObject.data && focusedObject.data.planets) {
            createPlanetaryDetails(focusedObject);
        }
    }

    // 隐藏详细对象
    function hideDetailedObjects() {
        // 清理动态创建的详细对象
        const detailObjects = scene.children.filter(child => 
            child.userData && child.userData.isDetailObject
        );
        detailObjects.forEach(obj => scene.remove(obj));
    }

    // 创建银河系中心
    function createGalacticCenter() {
        const data = galaxyData.center;
        const geometry = new THREE.BufferGeometry();
        const particleCount = Math.floor(data.particleCount * densityMultiplier);
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const radius = Math.pow(Math.random(), 0.3) * data.radius;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.3;
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const distanceRatio = radius / data.radius;
            const intensity = 0.8 + Math.random() * 0.2;
            colors[i * 3] = data.color.r * (1 - distanceRatio * 0.4) * intensity;
            colors[i * 3 + 1] = data.color.g * (1 - distanceRatio * 0.2) * intensity;
            colors[i * 3 + 2] = (data.color.b + distanceRatio * 0.4) * intensity;

            sizes[i] = (1 - distanceRatio) * 4 + 0.8;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });

        const centerPoints = new THREE.Points(geometry, material);
        
        // 创建可点击的标记
        const markerGeometry = new THREE.SphereGeometry(data.radius * 0.15, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            wireframe: true
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);

        const centerGroup = new THREE.Group();
        centerGroup.add(centerPoints);
        centerGroup.add(marker);
        scene.add(centerGroup);

        galaxyObjects.push({
            name: data.name,
            mesh: centerGroup,
            marker: marker,
            data: data,
            type: 'center'
        });
    }

    // 创建螺旋臂
    function createSpiralArms() {
        for (let armIndex = 0; armIndex < 4; armIndex++) {
            const geometry = new THREE.BufferGeometry();
            const particleCount = Math.floor(30000 * densityMultiplier);
            
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);
            const sizes = new Float32Array(particleCount);

            const armAngleOffset = (armIndex / 4) * Math.PI * 2;

            for (let i = 0; i < particleCount; i++) {
                const t = Math.random();
                const radius = 2000 + t * 48000;
                const angle = armAngleOffset + t * Math.PI * 4 + Math.random() * 0.5 - 0.25;
                
                const armWidth = 2000 + radius * 0.05;
                const offsetX = (Math.random() - 0.5) * armWidth;
                const offsetY = (Math.random() - 0.5) * 500;
                const offsetZ = (Math.random() - 0.5) * armWidth;

                positions[i * 3] = radius * Math.cos(angle) + offsetX;
                positions[i * 3 + 1] = offsetY;
                positions[i * 3 + 2] = radius * Math.sin(angle) + offsetZ;

                const intensity = 0.7 + Math.random() * 0.3;
                colors[i * 3] = 0.8 * intensity;
                colors[i * 3 + 1] = 0.9 * intensity;
                colors[i * 3 + 2] = 1.0 * intensity;

                sizes[i] = 0.8 + Math.random() * 1.5;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

            const material = new THREE.PointsMaterial({
                vertexColors: true,
                sizeAttenuation: true,
                transparent: true,
                opacity: 0.7,
                blending: THREE.AdditiveBlending
            });

            const spiralArm = new THREE.Points(geometry, material);
            scene.add(spiralArm);
            spiralArms.push(spiralArm);
        }
    }

    // 创建星团
    function createStarClusters() {
        galaxyData.clusters.forEach(clusterData => {
            const geometry = new THREE.BufferGeometry();
            const particleCount = Math.floor(clusterData.particleCount * densityMultiplier);
            
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);
            const sizes = new Float32Array(particleCount);

            for (let i = 0; i < particleCount; i++) {
                let x, y, z;
                
                if (clusterData.type === 'nebula') {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.pow(Math.random(), 0.7) * clusterData.radius;
                    const height = (Math.random() - 0.5) * clusterData.radius * 0.3;
                    
                    x = clusterData.position.x + radius * Math.cos(angle) + (Math.random() - 0.5) * 200;
                    y = clusterData.position.y + height;
                    z = clusterData.position.z + radius * Math.sin(angle) + (Math.random() - 0.5) * 200;
                } else if (clusterData.type === 'blackhole') {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.pow(Math.random(), 2) * clusterData.radius;
                    const height = (Math.random() - 0.5) * clusterData.radius * 0.1;
                    
                    x = clusterData.position.x + radius * Math.cos(angle);
                    y = clusterData.position.y + height;
                    z = clusterData.position.z + radius * Math.sin(angle);
                } else {
                    const radius = Math.pow(Math.random(), 0.8) * clusterData.radius;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    
                    x = clusterData.position.x + radius * Math.sin(phi) * Math.cos(theta);
                    y = clusterData.position.y + radius * Math.sin(phi) * Math.sin(theta);
                    z = clusterData.position.z + radius * Math.cos(phi);
                }

                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = z;

                const intensity = 0.6 + Math.random() * 0.4;
                colors[i * 3] = clusterData.color.r * intensity;
                colors[i * 3 + 1] = clusterData.color.g * intensity;
                colors[i * 3 + 2] = clusterData.color.b * intensity;

                let baseSize = 1;
                if (clusterData.type === 'nebula') baseSize = 1.5;
                else if (clusterData.type === 'blackhole') baseSize = 2.0;
                else if (clusterData.type === 'globular') baseSize = 1.2;
                
                sizes[i] = baseSize + Math.random() * 1.5;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

            const material = new THREE.PointsMaterial({
                vertexColors: true,
                sizeAttenuation: true,
                transparent: true,
                opacity: 0.8,
                blending: clusterData.type === 'nebula' || clusterData.type === 'blackhole' ? 
                    THREE.AdditiveBlending : THREE.NormalBlending
            });

            const cluster = new THREE.Points(geometry, material);
            
            // 创建可点击标记
            const markerGeometry = new THREE.SphereGeometry(clusterData.radius * 0.2, 12, 12);
            const markerMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(clusterData.color.r, clusterData.color.g, clusterData.color.b),
                transparent: true,
                opacity: 0.3,
                wireframe: true
            });
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(clusterData.position.x, clusterData.position.y, clusterData.position.z);
            
            const clusterGroup = new THREE.Group();
            clusterGroup.add(cluster);
            clusterGroup.add(marker);
            scene.add(clusterGroup);
            
            galaxyObjects.push({
                name: clusterData.name,
                mesh: clusterGroup,
                marker: marker,
                data: clusterData,
                type: clusterData.type
            });
        });
    }

    // 创建太阳系标记
    function createSolarSystemMarker() {
        const data = solarSystemData;
        
        // 创建太阳系标记点
        const markerGeometry = new THREE.SphereGeometry(data.radius, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.6,
            wireframe: true
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(data.position.x, data.position.y, data.position.z);
        
        // 创建太阳的发光效果
        const sunGeometry = new THREE.SphereGeometry(data.radius * 0.1, 16, 16);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff88,
            transparent: true,
            opacity: 0.8
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.copy(marker.position);
        
        const solarGroup = new THREE.Group();
        solarGroup.add(marker);
        solarGroup.add(sun);
        scene.add(solarGroup);
        
        galaxyObjects.push({
            name: data.name,
            mesh: solarGroup,
            marker: marker,
            data: data,
            type: 'solar_system'
        });
    }

    // 创建星座标记
    function createConstellationMarkers() {
        constellationData.forEach(constellation => {
            // 创建星座中心标记
            const markerGeometry = new THREE.SphereGeometry(constellation.radius * 0.1, 12, 12);
            const markerMaterial = new THREE.MeshBasicMaterial({
                color: 0x88aaff,
                transparent: true,
                opacity: 0.4,
                wireframe: true
            });
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(constellation.position.x, constellation.position.y, constellation.position.z);
            
            // 创建星座主要恒星
            const starsGroup = new THREE.Group();
            constellation.stars.forEach((star, index) => {
                const starGeometry = new THREE.SphereGeometry(20, 8, 8);
                const starMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(star.color.r, star.color.g, star.color.b),
                    transparent: true,
                    opacity: star.brightness
                });
                const starMesh = new THREE.Mesh(starGeometry, starMaterial);
                
                // 随机分布在星座区域内
                const angle = (index / constellation.stars.length) * Math.PI * 2;
                const radius = constellation.radius * (0.3 + Math.random() * 0.4);
                starMesh.position.set(
                    constellation.position.x + radius * Math.cos(angle),
                    constellation.position.y + (Math.random() - 0.5) * constellation.radius * 0.2,
                    constellation.position.z + radius * Math.sin(angle)
                );
                
                starsGroup.add(starMesh);
            });
            
            const constellationGroup = new THREE.Group();
            constellationGroup.add(marker);
            constellationGroup.add(starsGroup);
            scene.add(constellationGroup);
            
            galaxyObjects.push({
                name: constellation.name,
                mesh: constellationGroup,
                marker: marker,
                data: constellation,
                type: 'constellation'
            });
        });
    }    // 
创建太阳系详细视图
    function createSolarSystemDetail(solarSystemObj) {
        // 清理之前的详细对象
        hideDetailedObjects();
        
        const data = solarSystemObj.data;
        const systemGroup = new THREE.Group();
        systemGroup.userData.isDetailObject = true;
        
        // 创建太阳系中的行星
        data.planets.forEach((planet, index) => {
            const planetRadius = Math.max(planet.radius * 1000000, 5); // 放大显示
            const planetGeometry = new THREE.SphereGeometry(planetRadius, 16, 16);
            const planetMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(planet.color.r, planet.color.g, planet.color.b),
                transparent: true,
                opacity: 0.8
            });
            const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
            
            // 行星轨道位置
            const orbitRadius = planet.distance * 50; // 缩放轨道
            const angle = (index / data.planets.length) * Math.PI * 2;
            planetMesh.position.set(
                data.position.x + orbitRadius * Math.cos(angle),
                data.position.y,
                data.position.z + orbitRadius * Math.sin(angle)
            );
            
            // 添加行星标签
            const labelGeometry = new THREE.PlaneGeometry(planetRadius * 4, planetRadius);
            const labelMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8
            });
            const label = new THREE.Mesh(labelGeometry, labelMaterial);
            label.position.copy(planetMesh.position);
            label.position.y += planetRadius * 2;
            
            systemGroup.add(planetMesh);
            systemGroup.add(label);
            
            // 存储行星数据用于点击
            planetMesh.userData = { planetData: planet, parentSystem: solarSystemObj };
        });
        
        scene.add(systemGroup);
        lodObjects.set('solarSystem', systemGroup);
    }

    // 创建星座连线
    function createConstellationLines(constellationObj) {
        hideDetailedObjects();
        
        const data = constellationObj.data;
        const linesGroup = new THREE.Group();
        linesGroup.userData.isDetailObject = true;
        
        // 获取星座中的恒星位置
        const starPositions = [];
        constellationObj.mesh.children[1].children.forEach(star => {
            starPositions.push(star.position.clone());
        });
        
        // 创建连线
        if (starPositions.length > 1) {
            const lineGeometry = new THREE.BufferGeometry();
            const positions = [];
            
            // 连接相邻的恒星
            for (let i = 0; i < starPositions.length - 1; i++) {
                positions.push(
                    starPositions[i].x, starPositions[i].y, starPositions[i].z,
                    starPositions[i + 1].x, starPositions[i + 1].y, starPositions[i + 1].z
                );
            }
            
            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x88aaff,
                transparent: true,
                opacity: 0.6
            });
            
            const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
            linesGroup.add(lines);
        }
        
        scene.add(linesGroup);
        lodObjects.set('constellationLines', linesGroup);
    }

    // 创建行星详细信息
    function createPlanetaryDetails(systemObj) {
        // 在系统级别基础上添加更多细节
        const detailGroup = lodObjects.get('solarSystem');
        if (!detailGroup) return;
        
        // 添加轨道线
        systemObj.data.planets.forEach((planet, index) => {
            if (planet.distance > 0) {
                const orbitRadius = planet.distance * 50;
                const orbitGeometry = new THREE.RingGeometry(orbitRadius - 1, orbitRadius + 1, 64);
                const orbitMaterial = new THREE.MeshBasicMaterial({
                    color: 0x444444,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.DoubleSide
                });
                const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
                orbit.position.set(systemObj.data.position.x, systemObj.data.position.y, systemObj.data.position.z);
                orbit.rotation.x = Math.PI / 2;
                
                detailGroup.add(orbit);
            }
        });
    }

    // 创建背景恒星
    function createBackgroundStars() {
        const starCount = 10000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = Math.random() * Math.PI * 2;
            const radius = 100000 + Math.random() * 50000;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const starType = Math.random();
            let r, g, b;
            if (starType < 0.6) {
                r = g = b = 0.8 + Math.random() * 0.2;
            } else if (starType < 0.8) {
                r = 0.6 + Math.random() * 0.2;
                g = 0.7 + Math.random() * 0.2;
                b = 1.0;
            } else {
                r = 1.0;
                g = 0.4 + Math.random() * 0.3;
                b = 0.2 + Math.random() * 0.3;
            }

            colors[i * 3] = r;
            colors[i * 3 + 1] = g;
            colors[i * 3 + 2] = b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            vertexColors: true,
            size: 1,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.6
        });

        const backgroundStars = new THREE.Points(geometry, material);
        scene.add(backgroundStars);
    }

    // 生成导航栏
    function generateNavigation() {
        const allObjects = [
            galaxyData.center, 
            ...galaxyData.clusters,
            solarSystemData,
            ...constellationData
        ];
        
        // 按类型分组
        const groups = {
            '银河系核心': [galaxyData.center],
            '太阳系': [solarSystemData],
            '星团': allObjects.filter(obj => obj.type === 'cluster' || obj.type === 'globular'),
            '星云': allObjects.filter(obj => obj.type === 'nebula'),
            '黑洞': allObjects.filter(obj => obj.type === 'blackhole'),
            '星座': constellationData,
            '其他天体': allObjects.filter(obj => obj.type === 'external')
        };

        let navHTML = '';
        
        Object.entries(groups).forEach(([groupName, objects]) => {
            if (objects.length > 0) {
                navHTML += `
                    <div class="nav-section">
                        <div class="nav-section-title">${groupName}</div>
                `;
                
                objects.forEach(obj => {
                    const distance = obj.position ? 
                        Math.sqrt(obj.position.x**2 + obj.position.z**2) / 1000 : 0;
                    
                    navHTML += `
                        <div class="nav-item" data-object="${obj.name}">
                            <div class="nav-item-icon">
                                <i class="${obj.icon}"></i>
                            </div>
                            <div class="nav-item-text">${obj.name}</div>
                            <div class="nav-item-distance">${distance > 0 ? distance.toFixed(0) + 'k ly' : '中心'}</div>
                        </div>
                    `;
                });
                
                navHTML += '</div>';
            }
        });

        navContent.innerHTML = navHTML;
    }

    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        
        // 更新LOD系统
        updateLOD();
        
        const time = Date.now() * 0.0001 * timeScale;

        // 旋转螺旋臂
        if (armsVisible) {
            spiralArms.forEach((arm, index) => {
                if (arm && arm.rotation) {
                    arm.rotation.y = time * 0.1 + (index * Math.PI * 0.5);
                }
            });
        }

        // 旋转银心
        const centerObject = galaxyObjects.find(obj => obj.type === 'center');
        if (centerObject && centerObject.mesh) {
            centerObject.mesh.rotation.y += 0.002 * timeScale;
        }

        // 太阳系行星公转
        const solarSystem = galaxyObjects.find(obj => obj.type === 'solar_system');
        if (solarSystem && solarSystem.mesh) {
            solarSystem.mesh.rotation.y += 0.001 * timeScale;
        }

        // 星云脉动效果
        galaxyObjects.forEach(obj => {
            if (obj.type === 'nebula' && obj.mesh) {
                const scale = 1 + Math.sin(time * 2) * 0.05;
                obj.mesh.scale.setScalar(scale);
            } else if (obj.type === 'blackhole' && obj.mesh) {
                obj.mesh.rotation.y += 0.01 * timeScale;
            }
        });

        // 星座恒星闪烁
        galaxyObjects.forEach(obj => {
            if (obj.type === 'constellation' && obj.mesh.children[1]) {
                obj.mesh.children[1].children.forEach((star, index) => {
                    const flicker = 0.8 + Math.sin(time * 3 + index) * 0.2;
                    star.material.opacity = star.material.opacity * 0.9 + flicker * 0.1;
                });
            }
        });

        // 更新TWEEN动画
        if (typeof TWEEN !== 'undefined') {
            TWEEN.update();
        }

        controls.update();
        renderer.render(scene, camera);
    }

    // 事件监听
    function setupEventListeners() {
        window.addEventListener('resize', onWindowResize);
        renderer.domElement.addEventListener('click', onMouseClick);
        closePanelBtn.addEventListener('click', closeInfoPanel);
        navToggleBtn.addEventListener('click', toggleNavigation);
        navContent.addEventListener('click', onNavigationClick);

        // 控制按钮事件
        toggleArmsBtn.addEventListener('click', toggleSpiralArms);
        cruiseModeBtn.addEventListener('click', toggleCruiseMode);
        researchModeBtn.addEventListener('click', toggleResearchMode);

        // 滑块控制
        speedSlider.addEventListener('input', (e) => {
            timeScale = parseFloat(e.target.value);
            speedValue.textContent = `${timeScale.toFixed(1)}x`;
        });

        densitySlider.addEventListener('input', (e) => {
            const newDensity = parseFloat(e.target.value);
            if (Math.abs(newDensity - densityMultiplier) > 0.1) {
                densityMultiplier = newDensity;
                densityValue.textContent = `${densityMultiplier.toFixed(1)}x`;
                recreateGalaxy();
            }
        });
    }

    // 窗口调整
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    } 
   // 鼠标点击
    function onMouseClick(event) {
        if (event.target.closest('#controls') || 
            event.target.closest('#info-panel') || 
            event.target.closest('#navigation-panel')) {
            return;
        }

        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        raycaster.params.Points.threshold = 1000;
        
        // 收集所有可点击的对象
        const clickableObjects = [];
        galaxyObjects.forEach(obj => {
            if (obj.marker) {
                clickableObjects.push(obj.marker);
            }
            if (obj.mesh) {
                obj.mesh.traverse(child => {
                    if (child.isPoints || child.isMesh) {
                        clickableObjects.push(child);
                    }
                });
            }
        });

        // 检查详细对象（如行星）
        const detailObjects = scene.children.filter(child => 
            child.userData && child.userData.isDetailObject
        );
        detailObjects.forEach(group => {
            group.traverse(child => {
                if (child.isMesh && child.userData && child.userData.planetData) {
                    clickableObjects.push(child);
                }
            });
        });

        const intersects = raycaster.intersectObjects(clickableObjects, true);

        if (intersects.length > 0) {
            let selectedObj = null;
            
            // 检查是否点击了行星
            for (const intersect of intersects) {
                if (intersect.object.userData && intersect.object.userData.planetData) {
                    const planetData = intersect.object.userData.planetData;
                    const systemData = intersect.object.userData.parentSystem.data;
                    
                    // 创建行星信息对象
                    selectedObj = {
                        name: planetData.name,
                        data: {
                            ...planetData,
                            type: planetData.type,
                            description: planetData.description,
                            parentSystem: systemData.name
                        },
                        type: planetData.type
                    };
                    break;
                }
            }
            
            // 如果没有点击行星，检查其他天体
            if (!selectedObj) {
                for (const intersect of intersects) {
                    selectedObj = galaxyObjects.find(obj => {
                        if (obj.marker === intersect.object) return true;
                        if (obj.mesh === intersect.object) return true;
                        
                        let found = false;
                        if (obj.mesh && obj.mesh.traverse) {
                            obj.mesh.traverse(child => {
                                if (child === intersect.object) found = true;
                            });
                        }
                        return found;
                    });
                    
                    if (selectedObj) break;
                }
            }
            
            if (selectedObj) {
                focusOnObject(selectedObj);
            }
        }
    }

    // 导航栏切换
    function toggleNavigation() {
        navigationPanel.classList.toggle('active');
    }

    // 导航项点击
    function onNavigationClick(event) {
        const navItem = event.target.closest('.nav-item');
        if (navItem) {
            const objectName = navItem.dataset.object;
            const targetObject = galaxyObjects.find(obj => obj.name === objectName);
            
            if (targetObject) {
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                navItem.classList.add('active');
                focusOnObject(targetObject);
                
                if (window.innerWidth <= 768) {
                    navigationPanel.classList.remove('active');
                }
            }
        }
    }

    // 聚焦对象
    function focusOnObject(obj) {
        focusedObject = obj;
        
        let targetPosition = new THREE.Vector3();
        if (obj.data.position) {
            targetPosition.set(obj.data.position.x, obj.data.position.y, obj.data.position.z);
        } else {
            obj.mesh.getWorldPosition(targetPosition);
        }
        
        // 根据天体类型计算合适的观察距离
        let distance = 5000;
        if (obj.data.radius) {
            if (obj.type === 'center') {
                distance = obj.data.radius * 2.5;
            } else if (obj.type === 'solar_system') {
                distance = obj.data.radius * 8;
            } else if (obj.type === 'constellation') {
                distance = obj.data.radius * 1.5;
            } else if (obj.type === 'nebula') {
                distance = obj.data.radius * 2;
            } else if (obj.type === 'blackhole') {
                distance = obj.data.radius * 5;
            } else if (obj.type === 'planet' || obj.type === 'star') {
                distance = 200; // 行星近距离观察
            } else {
                distance = obj.data.radius * 3;
            }
        }
        
        distance = Math.max(100, Math.min(distance, 50000));
        
        const cameraPosition = new THREE.Vector3(
            targetPosition.x + distance * 0.8,
            targetPosition.y + distance * 0.6,
            targetPosition.z + distance * 0.8
        );

        highlightObject(obj);

        // 平滑移动相机
        new TWEEN.Tween(camera.position)
            .to(cameraPosition, 2500)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
            
        new TWEEN.Tween(controls.target)
            .to(targetPosition, 2500)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
        
        updateInfoPanel(obj.data);
    }

    // 高亮对象
    function highlightObject(obj) {
        clearHighlights();
        
        if (obj.marker) {
            obj.marker.material.opacity = 0.8;
            obj.marker.material.emissive = new THREE.Color(0x64b5f6);
            obj.highlightActive = true;
        }
    }

    // 清除高亮
    function clearHighlights() {
        galaxyObjects.forEach(obj => {
            if (obj.highlightActive && obj.marker) {
                obj.marker.material.opacity = 0.3;
                obj.marker.material.emissive = new THREE.Color(0x000000);
                obj.highlightActive = false;
            }
        });
    }

    // 更新信息面板
    function updateInfoPanel(data) {
        planetTitle.textContent = data.name;
        
        const typeNames = {
            'center': '银河系核心',
            'solar_system': '恒星系统',
            'constellation': '星座',
            'cluster': '疏散星团',
            'nebula': '星云',
            'blackhole': '黑洞',
            'globular': '球状星团',
            'external': '外部星系',
            'star': '恒星',
            'planet': '行星'
        };
        
        let statsHTML = `
            <div class="stat">
                <div class="stat-label">类型</div>
                <div class="stat-value">${typeNames[data.type] || '天体'}</div>
            </div>
        `;
        
        if (data.radius) {
            const radiusUnit = data.type === 'planet' || data.type === 'star' ? 
                (data.radius < 0.001 ? '千米' : '光年') : '千光年';
            const radiusValue = data.type === 'planet' || data.type === 'star' ?
                (data.radius < 0.001 ? (data.radius * 149597870.7 * 1000).toFixed(0) : data.radius.toFixed(6)) :
                (data.radius / 1000).toFixed(1);
            
            statsHTML += `
                <div class="stat">
                    <div class="stat-label">半径</div>
                    <div class="stat-value">${radiusValue} ${radiusUnit}</div>
                </div>
            `;
        }
        
        if (data.particleCount) {
            statsHTML += `
                <div class="stat">
                    <div class="stat-label">粒子数量</div>
                    <div class="stat-value">${data.particleCount.toLocaleString()}</div>
                </div>
            `;
        }
        
        if (data.position && (data.position.x !== 0 || data.position.z !== 0)) {
            const distance = Math.sqrt(data.position.x**2 + data.position.z**2) / 1000;
            statsHTML += `
                <div class="stat">
                    <div class="stat-label">距银心距离</div>
                    <div class="stat-value">${distance.toFixed(0)} 千光年</div>
                </div>
            `;
        }
        
        if (data.parentSystem) {
            statsHTML += `
                <div class="stat">
                    <div class="stat-label">所属星系</div>
                    <div class="stat-value">${data.parentSystem}</div>
                </div>
            `;
        }
        
        if (data.distance && data.type === 'planet') {
            statsHTML += `
                <div class="stat">
                    <div class="stat-label">轨道距离</div>
                    <div class="stat-value">${data.distance.toFixed(3)} AU</div>
                </div>
            `;
        }
        
        planetStats.innerHTML = statsHTML;
        planetDescription.textContent = data.description;
        infoPanel.classList.add('active');
    }

    // 关闭信息面板
    function closeInfoPanel() {
        infoPanel.classList.remove('active');
        focusedObject = null;
        clearHighlights();
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 返回到银河系全景视角
        new TWEEN.Tween(camera.position)
            .to({ x: 0, y: 15000, z: 25000 }, 2000)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
            
        new TWEEN.Tween(controls.target)
            .to({ x: 0, y: 0, z: 0 }, 2000)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
    }

    // 切换螺旋臂显示
    function toggleSpiralArms() {
        armsVisible = !armsVisible;
        spiralArms.forEach(arm => {
            arm.visible = armsVisible;
        });
        toggleArmsBtn.classList.toggle('active', armsVisible);
    }

    // 切换漫游模式
    function toggleCruiseMode() {
        cruiseMode = !cruiseMode;
        cruiseModeBtn.classList.toggle('active', cruiseMode);
        
        if (cruiseMode) {
            initCruiseMode();
        } else {
            stopCruiseMode();
        }
    }

    // 初始化漫游模式
    function initCruiseMode() {
        cruiseTargets = galaxyObjects.filter(obj => 
            obj.type === 'center' || obj.type === 'cluster' || 
            obj.type === 'nebula' || obj.type === 'blackhole' || 
            obj.type === 'globular' || obj.type === 'solar_system' ||
            obj.type === 'constellation'
        );
        currentCruiseIndex = 0;
        cruiseToNextTarget();
    }

    // 漫游到下一个目标
    function cruiseToNextTarget() {
        if (cruiseTargets.length === 0 || !cruiseMode) return;
        
        const target = cruiseTargets[currentCruiseIndex];
        focusOnObject(target);
        
        currentCruiseIndex = (currentCruiseIndex + 1) % cruiseTargets.length;
        
        cruiseInterval = setTimeout(() => {
            if (cruiseMode) cruiseToNextTarget();
        }, 6000);
    }

    // 停止漫游模式
    function stopCruiseMode() {
        if (cruiseInterval) {
            clearTimeout(cruiseInterval);
            cruiseInterval = null;
        }
        closeInfoPanel();
    }

    // 切换科研模式
    function toggleResearchMode() {
        researchMode = !researchMode;
        researchModeBtn.classList.toggle('active', researchMode);
        
        const grid = scene.getObjectByName('researchGrid');
        const axes = scene.getObjectByName('researchAxes');
        const galacticPlane = scene.getObjectByName('galacticPlane');

        if (researchMode) {
            if (!galacticPlane) {
                const planeGeometry = new THREE.PlaneGeometry(100000, 100000, 50, 50);
                const planeMaterial = new THREE.MeshBasicMaterial({
                    color: 0x444444,
                    transparent: true,
                    opacity: 0.1,
                    wireframe: true
                });
                const plane = new THREE.Mesh(planeGeometry, planeMaterial);
                plane.rotation.x = -Math.PI / 2;
                plane.name = 'galacticPlane';
                scene.add(plane);
            }
            
            if (!axes) {
                const axesHelper = new THREE.AxesHelper(30000);
                axesHelper.name = 'researchAxes';
                scene.add(axesHelper);
            }
            
            if (!grid) {
                const gridHelper = new THREE.GridHelper(100000, 100, 0x444444, 0x222222);
                gridHelper.name = 'researchGrid';
                scene.add(gridHelper);
            }

            galaxyObjects.forEach(obj => {
                if (obj.marker) {
                    obj.marker.visible = true;
                }
            });
        } else {
            if (galacticPlane) scene.remove(galacticPlane);
            if (grid) scene.remove(grid);
            if (axes) scene.remove(axes);

            galaxyObjects.forEach(obj => {
                if (obj.marker && !obj.highlightActive) {
                    obj.marker.visible = false;
                }
            });
        }
    }

    // 重新创建银河系（用于密度调整）
    function recreateGalaxy() {
        galaxyObjects.forEach(obj => {
            if (obj.mesh && obj.mesh.parent) {
                obj.mesh.parent.remove(obj.mesh);
            }
        });
        galaxyObjects = [];
        spiralArms = [];
        
        createGalacticCenter();
        createSpiralArms();
        createStarClusters();
        createSolarSystemMarker();
        createConstellationMarkers();
        
        generateNavigation();
    }

    // 启动
    init();
});