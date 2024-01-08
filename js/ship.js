import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const width = window.innerWidth;
const height = window.innerHeight;

let groupTop;
let groupBottom;
let groupLeft;
let groupRight;

let mtlLoader;
let stats;
let scene, camera, renderer;
var shipObj1, shipObj2, shipObj3, shipObj4;
let objectArr = [] // 存放場景中中所有 mesh(網格)
let RightRequestID;
let LeftRequestID;
let container;
let leftButton = true;
let leftStop = true;
let rightButton = true;
let rightStop = true;

container = document.getElementById('container'); //找尋index1.html裡的container元素

// ===========  開啟測試顯示影格數的檢測 ===============

function initStats() {
    stats = new Stats();
    stats.showPanel(0);
    stats.dom.style.position = 'absolute';
    stats.dom.style.left = '55px';
    stats.dom.style.right = 'unset';
    stats.dom.style.top = '0px';
    container.appendChild(stats.dom);

    function animate() {
        stats.begin();
        stats.end();
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
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    renderer.setClearColor(0x000000, 1.0);
    container.appendChild(renderer.domElement);
}

// ===============  初始化攝像頭 ================
function initCamera() {
  camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 20000);
  camera.position.set(400, 0, 0);
  camera.lookAt(scene.position)
}

// ==================== 添加軌道控制器 =========================
function initControl() {
  let orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.target = new THREE.Vector3(0, 10, 0)
  orbitControls.autoRotate = false
  renderScene();

  function renderScene() {
    var clock = new THREE.Clock()
    var delta = clock.getDelta()
    orbitControls.update(delta)
    requestAnimationFrame(renderScene);
  }
}
// ================== 燈光 =============================
function initLights() {
    scene.add(new THREE.AmbientLight(0x0c0c0c));
    const skyColor = 0xb1e1ff
    const groundColor = 0xffffff
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

    //添加材質燈光陰影
    var spotLight1 = new THREE.SpotLight(0xffffff);
    spotLight1.position.set(-50, 100, 0);
    scene.add(spotLight1);

    var spotLight2 = new THREE.SpotLight(0xffffff);
    spotLight2.position.set(550, 500, 0);
    scene.add(spotLight2);

    var spotLight3 = new THREE.SpotLight(0xffffff);
    spotLight3.position.set(150, 50, -200);
    scene.add(spotLight3);

    var spotLight4 = new THREE.SpotLight(0xffffff);
    spotLight4.position.set(150, 50, 200);
    scene.add(spotLight4);

    var spotLight5 = new THREE.SpotLight(0xffffff);
    spotLight5.position.set(-500, 10, 0);
    scene.add(spotLight5);
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
    // 創建 Group，繼承自 Object3D
    groupTop = new THREE.Object3D();
    groupBottom = new THREE.Object3D();
    groupLeft = new THREE.Object3D();
    groupRight = new THREE.Object3D();

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
    mtlLoader.setPath('../model/ship/');
     // ship 1
    mtlLoader.load('ship.mtl', function (materials) {
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setCrossOrigin('Anonymous');
        objLoader.setMaterials(materials);
        objLoader.setPath('../model/ship/');
        objLoader.load(
            'ship.obj',
            function (obj) {
                //遍歷子節點，開啟每個子節點的陰影模式。
                obj.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                    }
                });


                shipObj1 = obj;

                groupTop.position.set(0, 135, 0);

                groupTop.scale.set(4, 4, 4);

                groupTop.rotation.set(0, 0, 0);
                groupTop.add(shipObj1);

                scene.add(groupTop);
            },
            onProgress,
            onError
        );
    });

    // ship 2
    mtlLoader.load('ship.mtl', function (materials) {
        materials.preload(); //材質預先載入
        var objLoader = new OBJLoader();
        objLoader.setCrossOrigin('Anonymous'); // 如果檔案來自IE，會有跨域問題 ，用來解決跨域問題
        objLoader.setMaterials(materials);
        objLoader.setPath('../model/ship/');
        objLoader.load(
            'ship.obj',
            function (obj) {
                //遍歷子節點，開啟每個子節點的陰影模式。
                obj.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                    }
                });

                //模型縮放
                shipObj2 = obj;

                //groupRight 添加 shipObj2 模型
                groupBottom.position.set(0, -135, 0);
                groupBottom.scale.set(4, 4, 4);
                groupBottom.rotation.set(3, 0, 0);
                groupBottom.add(shipObj2);

                scene.add(groupBottom);
            },
            onProgress,
            onError
        );
    });

    // ship 3
    mtlLoader.load('ship.mtl', function (materials) {
        materials.preload(); //材質預先載入
        var objLoader = new OBJLoader();
        objLoader.setCrossOrigin('Anonymous'); // 如果檔案來自IE，會有跨域問題 ，用來解決跨域問題
        objLoader.setMaterials(materials);
        objLoader.setPath('../model/ship/');
        objLoader.load(
            'ship.obj',
            function (obj) {
                //遍歷子節點，開啟每個子節點的陰影模式。
                obj.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                    }
                });

                //模型縮放
                shipObj3 = obj;

                //groupLeft 添加 shipObj3 模型
                groupLeft.position.set(0, 0, 135);
                groupLeft.scale.set(4, 4, 4);
                groupLeft.rotation.set(1.5, 0, 0);
                groupLeft.add(shipObj3);

                scene.add(groupLeft);
            },
            onProgress,
            onError
        );
    });

    // ship 4
    mtlLoader.load('ship.mtl', function (materials) {
        materials.preload(); //材質預先載入
        var objLoader = new OBJLoader();
        objLoader.setCrossOrigin('Anonymous'); // 如果檔案來自IE，會有跨域問題 ，用來解決跨域問題
        objLoader.setMaterials(materials);
        objLoader.setPath('../model/ship/');
        objLoader.load(
            'ship.obj',
            function (obj) {
                //遍歷子節點，開啟每個子節點的陰影模式。
                obj.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                    }
                });

                //模型縮放
                shipObj4 = obj;

                //groupRight 添加 shipObj4 模型
                groupRight.position.set(0, 0, -135);
                groupRight.scale.set(4, 4, 4);
                groupRight.rotation.set(4.5, 0, 0);
                groupRight.add(shipObj4);

                scene.add(groupRight);
            },
            onProgress,
            onError
        );
    });

}

function initAnimate(){
    //動畫重複呼叫 initAnimate
    requestAnimationFrame(initAnimate);
    render();
}

// ===================== 等比縮放 ==========================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    //投影機的矩陣資料更新
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
// ========================================================

// ========================================================
function render() {
    //使用場景、相機開始做渲染
    renderer.render(scene, camera);
}

function initAll() {
    initStats(); //開啟測試顯示影格數的檢測
    initScene();
    initRenderer();
    initCamera();
    initControl();
    initLights();
    initObjModel();
    //.querySelector 找到元素( class="leftstart")
    document.querySelector('.leftStart').addEventListener('click', handleleftStartClick);
    document.querySelector('.leftStop').addEventListener('click', handleleftStopClick);
    document.querySelector('.rightStart').addEventListener('click', handlerightStartClick);
    document.querySelector('.rightStop').addEventListener('click', handlerightStopClick);
    initAnimate();

    // ===================== 方向鍵控制攝像頭 =======================
    initArrowKeydown();

    // ===================== 等比縮放 ==============================
    //表示這事件('resize')是否是在「冒泡」階段觸發 (true / false)，冒泡=觸及影響上面層級的元素、物件
    window.addEventListener('resize', onWindowResize, false); //視窗如果有改變大小，就會呼叫onWindowResize這個方法

    // ===================== 雙擊全螢幕=============================
    window.addEventListener('dblclick', () => {
        const fullScreenElement = document.fullscreenElement;
        if (!fullScreenElement) {
            renderer.domElement.requestFullscreen();
        } else {
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

// 控制左右轉按鈕
function handleleftStartClick() {
    if (!leftButton) return;
    groupTop.rotation.y    -= 0.05;
    groupBottom.rotation.y -= 0.05;
    groupLeft.rotation.y   -= 0.05;
    groupRight.rotation.y  -= 0.05;

    renderer.render(scene, camera);
    LeftRequestID = requestAnimationFrame(handleleftStartClick);
}

// 控制左右轉停止按鈕
function handleleftStopClick() {
  if (!leftButton) return;
  cancelAnimationFrame(LeftRequestID);
}

// 控制上下轉按鈕
function handlerightStartClick() {
    if (!rightButton) return;
    // 然後讓組圍繞 z 軸旋轉;
    groupTop.rotation.z    -= 0.05; //使模型圍繞 z 軸旋轉
    groupBottom.rotation.z -= 0.05; //使模型圍繞 z 軸旋轉
    groupLeft.rotation.z   -= 0.05; //使模型圍繞 z 軸旋轉
    groupRight.rotation.z  -= 0.05; //使模型圍繞 z 軸旋轉

    renderer.render(scene, camera);
    RightRequestID = requestAnimationFrame(handlerightStartClick);
}

// 控制上下轉停止按鈕
function handlerightStopClick() {
  if (!rightButton) return;
  cancelAnimationFrame(RightRequestID);
}

window.onload = function () {
    //初始化所有內容
    initAll();
}
