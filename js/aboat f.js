import * as THREE from 'three'; //用一個THREE別名代表three
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

let mtlLoader;
let group;
let orbitControls;

let stats;
let scene, camera, renderer;
let shipObj1_position_x, shipObj1_position_z, shipObj1_position_y;
let shipObj1_rotation_x, shipObj1_rotation_z, shipObj1_rotation_y;
let shipObj1_scale_x, shipObj1_scale_z, shipObj1_scale_y;
let shipObj1;
let objectArr = [] // 存放場景中中所有 mesh(網格)
let RightRequestID;
let LeftRequestID;
let container;

//是否產生陰影燈光否
let shadow = true;

container = document.getElementById('container');

// ===========  開啟測試顯示影格數的檢測 ===============

function initStats() {
    stats = new Stats();
    //點擊檢視框會切換不同的顯示單位
    //狀態框顯示
    stats.showPanel(0); // 0: fps(預設，每秒顯示的禎數), 1: ms, 2: mb, 3+: custom
    // 狀態框虛擬 DOM 元素樣式位置設定為絕對定位
    stats.dom.style.position = 'absolute';
    // 狀態框虛擬 DOM 元素樣式位置設定為左側留 80px offset
    stats.dom.style.left = '55px';
    // 狀態框虛擬 DOM 元素樣式位置設定為右側不設定值
    stats.dom.style.right = 'unset';
    // 狀態框虛擬 DOM 元素樣式位置設定為緊靠上端
    stats.dom.style.top = '0px';
    // 將狀態框 DOM 元素填加到網頁上
    container.appendChild(stats.dom);

    //執行動畫
    function animate() {
        // 狀態框開始測試
        stats.begin();
        // 狀態框結束測試
        stats.end();
        // 重複呼叫 animate() 方法
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

// ===========  初始化場景  ========================
function initScene() {
    // 場景建構
    scene = new THREE.Scene();
}

// ===========  渲染器構建 ========================
function initRenderer(){
    //渲染器構建
    renderer = new THREE.WebGLRenderer(); 
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    //改變渲染器背景顏色
    renderer.setClearColor(0xffffff, 1.0);
    container.appendChild(renderer.domElement);
}

// ===============  初始化攝像頭 ================
function initCamera() {
    camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 1, 20000); //相機構建
    camera.position.set(400,0,0);
    // 不應該直接修改 camera.lookAt()，應當由 OrbitControl 處理。
    // OrbitControl 為了讓鏡頭面向 target，它會修改 camera.lookAt()
    camera.lookAt(scene.position);
}

// ==================== 添加軌道控制器 =========================
function initControl() {
    // OrbitControl 控制「目標」跟「鏡頭」
    // 可以控制鏡頭旋轉，但無論怎麼旋轉，鏡頭都看向目標(target) 本身。target是一個位置，描述著鏡頭所看向的中心點。
    orbitControls = new OrbitControls(camera, renderer.domElement);
    // 座標 (x, y, z)
    // 網路上說，設成 (0,0,0) 會導致間隙
    // target 屬性會改變相機的 lookAt 視點
    // 讓場景的聚焦點向上移動 10 距離
    orbitControls.target = new THREE.Vector3(0, 0, 0); // 控制焦點

    orbitControls.update();
    
    // 滑鼠靈敏度
    orbitControls.enableDamping = true; // 啟用阻尼效果，阻尼:讓滑鼠不那麼靈敏
    orbitControls.dampingFactor = 0.25; // 阻尼系數，
    orbitControls.autoRotate = true;    // 啟用自動旋轉
    // 要有效果需要在 render() 處做 update 才會有效果

    renderScene();

    function renderScene() {
        //重新渲染畫面，它就是採用與瀏覽器同步的 FPS 來達到流暢且高效的動畫。
        requestAnimationFrame(renderScene);
        // OrbitControl不會在每幀渲染時自動控制，得用 OrbitControl.update() 更新。
        orbitControls.update(delta); // 更新時間
        var clock = new THREE.Clock(); // 用於更新軌道控制器
        var delta = clock.getDelta(); // 獲取時間差
        renderer.render(scene, camera);
    }
}

// ================== 燈光 =============================
function initLights() {
    // 環境光(全域光)
    scene.add(new THREE.AmbientLight(0x0c0c0c));
    // scene.add(new THREE.AmbientLight(0x000));

    // 半球光(船材質破碎)
    const skyColor = 0xb1e1ff // 藍色
    const groundColor = 0xffffff // 白色
    const intensity = 1
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
    scene.add(light)

    //方向光
    const color = 0xffffff;
    const intensity1 = 1;
    const light1 = new THREE.DirectionalLight(color, intensity1);
    light1.position.set(0, 10, 0);
    light1.target.position.set(-5, 0, 0);
    scene.add(light1);
    scene.add(light1.target);

    if( shadow){
      //添加材質燈光陰影 Shadow
      let directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(200, 450, -500);

      directionalLight.castShadow = true; // default false
      scene.add(directionalLight);

      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 512;

      directionalLight.shadow.camera.near = 100;
      directionalLight.shadow.camera.far = 2500;

      directionalLight.shadow.camera.left = -1000;
      directionalLight.shadow.camera.right = 1000;
      directionalLight.shadow.camera.top = 1000;
      directionalLight.shadow.camera.bottom = -1000;
      // 把方向燈光源加入場景
      scene.add(directionalLight);
    }

}

// =================== model 加載 ================================
// 遞迴出所有 mesh(網格)
function getMesh(s, arr, name = '') {
  s.forEach(v => {
    if (v.children && v.children.length > 0) {
      getMesh(v.children, arr, v.name)
    } else {
      if (v instanceof THREE.Mesh) {
        if (name) {
          v.name = name
        }
        arr.push(v)
      }
    }
  })
}

function initObjModel(){
    // 建立一個群組對象
    group = new THREE.Group();
    // 場景加入群組
    scene.add(group);

    //若載入OBJ模型成功時，會來處理這行函式
    let onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = (xhr.loaded / xhr.total) * 100; //載入%數
            // 檔案載入成功後，每次加載完畢將 mesh 放進陣列
            if (percentComplete === 100) {
                objectArr = [];
                // 找到場景之後去判斷
                scene.traverse(function (s) {
                    if (s && s.type === 'Scene') {
                        getMesh(s.children, objectArr);
                    }
                });
            }
        }
    };
    //若載入OBJ模型失敗後，會來處理這行函式
    let onError = function (xhr) {
        console.log('import error' + xhr);
    };

    mtlLoader = new MTLLoader();
    mtlLoader.setPath('../model/boat f/');

    // boat f 1
    mtlLoader.load('boat f.mtl', function (materials) {
        materials.preload(); //材質預先載入
        var objLoader = new OBJLoader();
        objLoader.setCrossOrigin('Anonymous'); // 如果檔案來自IE，會有跨域問題 ，用來解決跨域問題
        objLoader.setMaterials(materials);
        objLoader.setPath('../model/boat f/');
        objLoader.load(
            'boat f.obj',
            function (obj) {
                //是否設置陰影
                if (shadow) {
                    //遍歷子節點，開啟每個子節點的陰影模式。
                    obj.traverse(function (child) {
                        if (child.isMesh) {
                            child.castShadow = true;
                        }
                    });
                }

                obj.children[0].geometry.center();

                obj.position.x = shipObj1_position_x;
                obj.position.y = shipObj1_position_y;
                obj.position.z = shipObj1_position_z;
                obj.rotation.x = shipObj1_rotation_x;
                obj.rotation.y = shipObj1_rotation_y;
                obj.rotation.z = shipObj1_rotation_z;
                obj.scale.set(shipObj1_scale_x, shipObj1_scale_y, shipObj1_scale_z);
                obj.name = 'shipObj1';
                shipObj1 = obj;
                scene.add(shipObj1);

                //添加 shipObj1 模型
                group.add(shipObj1);

            },
            onProgress,
            onError
        );
    });
}

function initAnimate(){
    //使用場景、相機開始做渲染
    renderer.render(scene, camera);
    orbitControls.update();
    requestAnimationFrame(initAnimate);
}

// ===================== 等比縮放 ==========================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    //投影機的矩陣資料更新
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
// ========================================================
function initAll() {

    initStats(); //開啟測試顯示影格數的檢測
    initScene();
    initRenderer();
    initCamera();
    initControl();
    initLights();
    initObjModel();
    initAnimate();

    // ===================== 方向鍵控制攝像頭 =======================
    initArrowKeydown();

    // ===================== 等比縮放 ==============================
    window.addEventListener('resize', onWindowResize, false); //視窗如果有改變大小，就會呼叫onWindowResize這個方法

    // ===================== 雙擊全螢幕=============================
    window.addEventListener('dblclick', () => {
        const fullScreenElement = document.fullscreenElement;
        if (!fullScreenElement) {
            // 按兩下控制螢幕進入全屏，退出全屏
            // 讓畫布物件全屏
            renderer.domElement.requestFullscreen();
        } else {
            // 退出全屏，使用 document物件
            document.exitFullscreen();
        }
    });
}

// ===================== 方向鍵控制攝像頭 =======================
function initArrowKeydown() {
  document.addEventListener('keydown', handleKeyDown, false);

  //方向鍵控制攝像頭使得場景方向往相反方向滑動
  function handleKeyDown(e) {
    var e = e || window.event;
    var keyCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode; //event這個是過時的寫法
    if ('37, 38, 39, 40, 65, 87, 68, 83'.indexOf(keyCode) === -1) {
      return;
    } else {
      switch (e.keyCode) {
        case 37:
        case 65:
          CameraMove('x', -0.1);
          break;
        case 38:
        case 87:
          CameraMove('y', 0.1);
          break;
        case 39:
        case 68:
          CameraMove('x', 0.1);
          break;
        case 83:
        case 40:
          CameraMove('y', -0.1);
          break;
      }
    }
  }

  function CameraMove(direction, distance) {
    camera.position[direction] += distance;
  }
}

window.onload = function () {
    //初始化模型位置
    // 上側
    shipObj1_position_x = 0; // 預設 0;
    shipObj1_position_y = 0;
    shipObj1_position_z = 0;

    shipObj1_rotation_x = 0;
    shipObj1_rotation_y = 0;
    shipObj1_rotation_z = 0; 
    shipObj1_scale_x = 50;    
    shipObj1_scale_y = 50; 
    shipObj1_scale_z = 50; 

    initAll();
}
