/* MoveNet Skeleton - Steve's Makerspace (most of this code is from TensorFlow)

MoveNet is developed by TensorFlow:
https://www.tensorflow.org/hub/tutorials/movenet
*/

function preload() { 
  bikeImg = loadImage("upload_7dd6374659c38a191c0e3eb86f1d75c5.gif");  
}

let video, bodypose, pose, keypoint, detector;
let poses = [];
let xOffset;

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
  
  // 初始化 xOffset，從畫布左邊開始
  xOffset = 0;
}

function draw() {
  image(video, 0, 0);
  drawSkeleton();
  // 水平翻轉圖像以達到鏡像效果
  cam = get();
  translate(cam.width, 0);
  scale(-1, 1);
  image(cam, 0, 0);

  // 更新 xOffset，使圖片從左往右移動
  xOffset += 2; // 每幀更新偏移量，速度為2
  if (xOffset > width) { // 如果圖片完全移出右邊界，重置到左邊界
    xOffset = -50;
  }
}

function drawSkeleton() {
  // 繪製所有被追蹤的關鍵點
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
    // 恢復肩膀之間的線條繪製
    partA = pose.keypoints[5];
    partB = pose.keypoints[6];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y); // 恢復肩膀之間的線條繪製
    }

    // Hip to hip
    partA = pose.keypoints[11];
    partB = pose.keypoints[12];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    // Shoulders to hips
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
    // Hip to foot
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
      // 計算圖片的 x 位置，使其從左往右移動
      let imgX = xOffset + partA.x;
      if (imgX > width) { // 如果圖片超出右邊界，重置到左邊界
        imgX = xOffset + partA.x - width;
      }
      image(bikeImg, imgX - 37.5, partA.y - 37.5, 75, 75); // 左耳朵，圖片尺寸調整為75x75
      pop();
    }
    if (partB.score > 0.1) {
      push();
      // 計算圖片的 x 位置，使其從左往右移動
      let imgX = xOffset + partB.x;
      if (imgX > width) { // 如果圖片超出右邊界，重置到左邊界
        imgX = xOffset + partB.x - width;
      }
      image(bikeImg, imgX - 37.5, partB.y - 37.5, 75, 75); // 右耳朵，圖片尺寸調整為75x75
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
