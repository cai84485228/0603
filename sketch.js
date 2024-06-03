/* MoveNet Skeleton - Steve's Makerspace (most of this code is from TensorFlow)

MoveNet is developed by TensorFlow:
https://www.tensorflow.org/hub/tutorials/movenet
*/

// 预加载图片
function preload() { 
  bikeImg = loadImage("upload_7dd6374659c38a191c0e3eb86f1d75c5.gif");  
}

// 定义全局变量
let video, bodypose, pose, keypoint, detector;
let poses = [];
let earXOffset = 0; // 初始化左耳偏移量
let wristXOffset = 0; // 初始化手腕偏移量

// 初始化 MoveNet 模型
async function init() {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
  };
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
}

// 视频准备就绪时调用
async function videoReady() {
  console.log("video ready");
  await getPoses();
}

// 获取姿势信息
async function getPoses() {
  if (detector) {
    poses = await detector.estimatePoses(video.elt, {
      maxPoses: 2,
      //flipHorizontal: true,
    });
  }
  requestAnimationFrame(getPoses);
}

// 设置
async function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, videoReady);
  video.size(width, height);
  video.hide();
  await init();

  stroke(255);
  strokeWeight(5);

  // 设置初始左耳和手腕偏移量
  // earXOffset = 初始值;
  // wristXOffset = 初始值;
}

// 绘制
function draw() {
  image(video, 0, 0);
  drawSkeleton();

  // 更新偏移量，使图像从右往左移动
  earXOffset += 2; // 每帧更新左耳偏移量，速度为2
  wristXOffset -= 2; // 每帧更新手腕偏移量，速度为2
  if (earXOffset > width) { // 如果图片完全移出右边界，重置到左边界
    earXOffset = -75; // 重置为图片宽度的负值，让其从左侧开始
  }
  if (wristXOffset < -75) { // 如果图片完全移出左边界，重置到右边界
    wristXOffset = width; // 重置为画布宽度，让其从右侧开始
  }
  
  // 水平翻转图像以达到镜像效果
  cam = get();
  translate(cam.width, 0);
  scale(-1, 1);
  image(cam, 0, 0);
}

// 绘制骨架
function drawSkeleton() {
  
  for (let i = 0; i < poses.length; i++) {
    pose = poses[i];

    // 绘制肩到手腕的连线
    for (j = 5; j < 9; j++) {
      if (pose.keypoints[j].score > 0.1 && pose.keypoints[j + 2].score > 0.1) {
        partA = pose.keypoints[j];
        partB = pose.keypoints[j + 2];
        line(partA.x, partA.y, partB.x, partB.y);
      }
    }

    // 绘制肩到肩的连线
    partA = pose.keypoints[5];
    partB = pose.keypoints[6];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y); 
    }

    // 绘制臀到臀的连线
    partA = pose.keypoints[11];
    partB = pose.keypoints[12];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    
    // 绘制肩到臀的连线
    partA = pose.keypoints[5];
    partB = pose.keypoints[11];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    partA = pose.keypoints[6];
    partB = pose.keypoints[12];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    
    // 绘制臀到脚的连线
    for (j = 11; j < 15; j++) {
      if (pose.keypoints[j].score > 0.1 && pose.keypoints[j + 2].score > 0.1) {
        partA = pose.keypoints[j];
        partB = pose.keypoints[j + 2];
        line(partA.x, partA.y, partB.x, partB.y);
      }
    }

    // 在耳朵位置添加 bike 图片并从左向右移动
    partA = pose.keypoints[3]; // 左耳
    partB = pose.keypoints[4]; // 右耳
    if (partA.score > 0.1) {
      push();
      let imgX = partA.x + earXOffset;
      image(bikeImg, imgX - 37.5, partA.y - 20, 75, 75); 
      pop();
    }
    if (partB.score > 0.1) {
      push();
      let imgX = partB.x + earXOffset;
      image(bikeImg, imgX - 37.5, partB.y - 20, 75, 75); 
      pop();
    }

    // 在手腕位置添加 bike 图片并从右向左移动
    partA = pose.keypoints[9]; // 左手腕
    partB = pose.keypoints[10]; // 右手腕
    if (partB.score > 0.1) {
      push();
      let imgX = partB.x + wristXOffset;
      image(bikeImg, imgX - 37.5, partB.y - 20, 75, 75); 
      pop();
    }
  }
}

/* Points (view on left of screen = left part - when mirrored)
  0 nose
  1 left eye
  2 right eye
  3 left ear
  4 right ear
  5 left shoulder
  6 right shoulder
  7 left elbow
  8 right elbow
  9 left wrist
  10 right wrist
  11 left hip
  12 right hip
  13 left knee
  14 right knee
  15 left foot
  16 right foot
*/

