/* MoveNet Skeleton - Steve's Makerspace (most of this code is from TensorFlow)

MoveNet is developed by TensorFlow:
https://www.tensorflow.org/hub/tutorials/movenet
*/

function preload() { 
  bikeImg = loadImage("upload_7dd6374659c38a191c0e3eb86f1d75c5.gif");  
}

let video, bodypose, pose, keypoint, detector;
let poses = [];
let earXOffset = 0; // 初始化左耳偏移量
let wristXOffset = 0; // 初始化手腕偏移量

async function init() {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
  };
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
}

async function videoReady() {
  console.log("video ready");
  await getPoses();
}

async function getPoses() {
  if (detector) {
    poses = await detector.estimatePoses(video.elt, {
      maxPoses: 2,
      //flipHorizontal: true,
    });
  }
  requestAnimationFrame(getPoses);
}

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

function draw() {
  image(video, 0, 0);
  drawSkeleton();

  // 更新偏移量，使圖片從右往左移動
  earXOffset += 2; // 每幀更新左耳偏移量，速度為2
  wristXOffset -= 2; // 每幀更新手腕偏移量，速度為2
  if (earXOffset > width) { // 如果圖片完全移出右邊界，重置到左邊界
    earXOffset = -75; // 重置為圖片寬度的負值，讓其從左側開始
  }
  if (wristXOffset < -75) { // 如果圖片完全移出左邊界，重置到右邊界
    wristXOffset = width; // 重置為畫布寬度，讓其從右側開始
  }
  
  // 水平翻轉圖像以達到鏡像效果
  cam = get();
  translate(cam.width, 0);
  scale(-1, 1);
  image(cam, 0, 0);
}

function drawSkeleton() {
  
  for (let i = 0; i < poses.length; i++) {
    pose = poses[i];
    // shoulder to wrist

    partA = pose.keypoints[0];

    if(partA.score > 0.1){
      push()
        textSize(40)
        scale(-1,1)
        text("412731043,蔡涵霈",partA.x-width,partA.y-150)
      pop()
    }
    
    for (j = 5; j < 9; j++) {
      if (pose.keypoints[j].score > 0.1 && pose.keypoints[j + 2].score > 0.1) {
        partA = pose.keypoints[j];
        partB = pose.keypoints[j + 2];
        line(partA.x, partA.y, partB.x, partB.y);
      }
    }

    // shoulder to shoulder
    partA = pose.keypoints[5];
    partB = pose.keypoints[6];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y); 
    }

    // hip to hip
    partA = pose.keypoints[11];
    partB = pose.keypoints[12];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    // shoulders to hips
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
    // hip to foot
    for (j = 11; j < 15; j++) {
      if (pose.keypoints[j].score > 0.1 && pose.keypoints[j + 2].score > 0.1) {
        partA = pose.keypoints[j];
        partB = pose.keypoints[j + 2];
        line(partA.x, partA.y, partB.x, partB.y);
      }
    }

    // 在耳朵位置添加 bike 圖片並從左向右移動
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

    // 在手腕位置添加 bike 圖片並從右向左移動
    for (let i = 0; i < poses.length; i++) {
    pose = poses[i];
    
    // 在手腕位置添加 bike 图片并从右向左移动
    partA = pose.keypoints[9]; // 左手腕
    partB = pose.keypoints[10]; // 右手腕
    if (partA.score > 0.1) {
      push();
      let imgX = partA.x + wristXOffset;
      image(bikeImg, imgX - 37.5, partA.y - 20, 75, 75); 
      pop();
    }
    if (partB.score > 0.1) {
      push();
      let imgX = partB.x + wristXOffset;
      image(bikeImg, imgX - 37.5, partB.y - 20, 75, 75); 
      pop();
    }
  }
