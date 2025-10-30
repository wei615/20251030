let table; // 儲存 CSV 資料的變數
let questions = []; // 結構化後的題目陣列
let currentQuestionIndex = 0;
let score = 0;
let quizState = 'start'; // 狀態: 'start', 'question', 'result'

// --- 特效相關變數 ---
let cursorTrail = []; // 游標拖尾特效
let selectedOption = null; // 當前選取的選項

// --- 成績動畫相關變數 ---
let balls = []; // 用於 GoodAnimation 的小球陣列
let fireworks = []; // 用於 ExcellentAnimation 的煙火陣列

// --- 載入 CSV 檔案 ---
function preload() {
  // 'csv' 表示它是 CSV 格式，'header' 表示第一行是標題
  // 'quotations' 確保帶有雙引號的欄位內容被正確解析
  table = loadTable('questions.csv', 'csv', 'header', 'quotations');
}

function setup() {
  createCanvas(800, 600); 
  textAlign(CENTER, CENTER);
  textSize(20);
  
  // 將 table 轉換為更容易處理的陣列結構
  for (let r = 0; r < table.getRowCount(); r++) {
    questions.push({
      q: table.getString(r, 'Question'),
      options: [
        table.getString(r, 'OptionA'),
        table.getString(r, 'OptionB'),
        table.getString(r, 'OptionC'),
        table.getString(r, 'OptionD'),
      ],
      correct: table.getString(r, 'CorrectAnswer')
    });
  }
}

function draw() {
  background(240); // 淺灰色背景
  
  // 顯示不同的畫面狀態
  if (quizState === 'start') {
    drawStartScreen();
  } else if (quizState === 'question') {
    drawQuestionScreen();
    drawCursorEffect(); // 繪製游標特效
  } else if (quizState === 'result') {
    drawResultScreen();
    drawCursorEffect(); 
  }
}

// --- 畫面繪製函式 ---

function drawStartScreen() {
  fill(50);
  textSize(36);
  text('健康飲食測驗系統 🥗', width / 2, height / 3);
  textSize(24);
  text('點擊任意處開始測驗', width / 2, height / 2);
}

function drawQuestionScreen() {
  let q = questions[currentQuestionIndex];
  
  // 顯示問題
  fill(50);
  textSize(24);
  text(`第 ${currentQuestionIndex + 1} 題 / 共 ${questions.length} 題`, width / 2, 50);
  textSize(30);
  push();
  textSize(28);
  // 問題顯示區域
  text(q.q, width / 12, 120, width - 100, 100); 
  pop();
  
  // 顯示選項
  let optionY = 250;
  let optionHeight = 60;
  for (let i = 0; i < q.options.length; i++) {
    let optionText = q.options[i];
    let rectY = optionY + i * (optionHeight + 10) - optionHeight / 2;
    let isHover = checkOptionHover(rectY, optionHeight);
    
    // 選項區塊設定
    let rectX = width / 2 - 200;
    let rectW = 400;
    
    // 選取/懸停特效
    if (selectedOption === optionText) {
      // 選取特效：放大並變綠
      fill(100, 255, 100); 
      rect(rectX - 5, rectY - 5, rectW + 10, optionHeight + 10, 15);
    } else if (isHover) {
      // 懸停特效：輕微閃爍邊框
      fill(200, 200, 255, 200); 
      stroke(50, 50, 200, sin(frameCount * 0.2) * 80 + 170);
      strokeWeight(3);
      rect(rectX, rectY, rectW, optionHeight, 10);
    } else {
      fill(255);
      noStroke();
      rect(rectX, rectY, rectW, optionHeight, 10);
    }
    
    // 顯示選項文字
    fill(50);
    noStroke();
    textSize(20);
    text(optionText, width / 2, optionY + i * (optionHeight + 10));
  }
  
  // 顯示分數
  textSize(18);
  fill(100);
  text(`當前分數: ${score}`, 60, height - 30);
}

function drawResultScreen() {
  let finalScore = score;
  let totalQuestions = questions.length;
  let percentage = (finalScore / totalQuestions) * 100;
  
  // 顯示標題分數
  fill(50);
  textSize(40);
  text('測驗結束！🎉', width / 2, 100);
  
  // --- 根據成績產生不同動畫畫面 ---
  if (percentage === 100) {
    // 滿分慶祝動畫 (煙火)
    drawPerfectScoreAnimation(); 
    textSize(48);
    fill(255, 69, 0); // 橘紅色
    text('恭喜！滿分達成！💯', width / 2, height / 2);
  } else if (percentage >= 80) {
    // 稱讚的動態畫面 (星星閃爍)
    drawExcellentAnimation(percentage); 
    textSize(48);
    fill(0, 150, 0);
    text('太棒了！您是健康飲食大師！🏆', width / 2, height / 2);
  } else if (percentage >= 50) {
    // 鼓勵的動態畫面 (小球跳動)
    drawGoodAnimation(percentage);
    textSize(36);
    fill(200, 100, 0);
    text('表現不錯！繼續努力學習喔！👍', width / 2, height / 2);
  } else {
    // 加油的動態畫面 (文字動畫)
    drawNeedImprovementAnimation(percentage);
    textSize(36);
    fill(150, 0, 0);
    text('別灰心，健康知識還有進步空間！💪', width / 2, height / 2);
  }
  
  // --- 畫面下方顯示作答得分率 ---
  textSize(32);
  fill(0, 0, 150);
  text(`作答得分率: ${percentage.toFixed(1)}%`, width / 2, height * 0.75);

  // 重新開始按鈕
  textSize(24);
  let restartBtnY = height - 50;
  let restartW = 200;
  let restartH = 50;
  
  // 按鈕懸停特效
  if (mouseX > width/2 - restartW/2 && mouseX < width/2 + restartW/2 && 
      mouseY > restartBtnY - restartH/2 && mouseY < restartBtnY + restartH/2) {
      fill(100, 100, 255);
  } else {
      fill(150);
  }
  rect(width / 2 - restartW / 2, restartBtnY - restartH / 2, restartW, restartH, 10);
  fill(255);
  text('重新開始', width / 2, restartBtnY);
}


// --- 滿分慶祝動畫 (煙火) ---
function drawPerfectScoreAnimation() {
    // 每 30 幀發射一顆煙火
    if (frameCount % 30 === 0) {
        let r = random(255);
        let g = random(255);
        let b = random(255);
        fireworks.push(new Firework(random(width / 4, width * 3 / 4), height, color(r, g, b)));
    }
    
    // 更新並繪製所有煙火
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].display();
        
        // 移除已消失的煙火
        if (fireworks[i].isFinished()) {
            fireworks.splice(i, 1);
        }
    }
}

// 煙火 class
class Firework {
    constructor(startX, startY, baseColor) {
        this.baseColor = baseColor;
        this.exploded = false;
        this.lifespan = 255;
        this.firecracker = new Particle(startX, startY, baseColor, true); // 升空的炮竹
        this.particles = []; // 爆炸後的碎片
    }

    update() {
        if (!this.exploded) {
            this.firecracker.applyForce(createVector(0, -0.1)); // 模擬上升的力
            this.firecracker.update();
            
            // 隨機在畫布上半部分爆炸
            if (this.firecracker.vel.y >= 0 || this.firecracker.pos.y < height * 0.4) {
                this.exploded = true;
                this.explode();
            }
        } else {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].applyForce(createVector(0, 0.05)); // 模擬重力
                this.particles[i].update();
            }
        }
    }

    explode() {
        // 產生 100 個向四周噴射的碎片
        for (let i = 0; i < 100; i++) {
            let pColor = color(hue(this.baseColor), saturation(this.baseColor), brightness(this.baseColor), 255);
            this.particles.push(new Particle(this.firecracker.pos.x, this.firecracker.pos.y, pColor, false));
        }
    }

    display() {
        if (!this.exploded) {
            this.firecracker.display();
        } else {
            for (let p of this.particles) {
                p.display();
            }
        }
    }

    isFinished() {
        // 如果爆炸了且所有碎片都消失了
        if (this.exploded && this.particles.length > 0) {
            let alive = this.particles.some(p => p.lifespan > 0);
            return !alive;
        }
        return false;
    }
}

// 粒子 class (用於炮竹和碎片)
class Particle {
    constructor(x, y, pColor, isFirecracker) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.lifespan = 255;
        this.isFirecracker = isFirecracker;

        if (this.isFirecracker) {
            // 炮竹向上發射
            this.vel = createVector(0, random(-10, -5));
        } else {
            // 碎片向各方向發射
            this.vel = p5.Vector.random2D();
            this.vel.mult(random(2, 10));
        }
        this.pColor = pColor;
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        if (!this.isFirecracker) {
            // 碎片逐漸消失
            this.vel.mult(0.95); // 空氣阻力
            this.lifespan -= 4;
            this.pColor.setAlpha(this.lifespan);
        }
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    display() {
        stroke(this.pColor);
        strokeWeight(this.isFirecracker ? 4 : 2);
        point(this.pos.x, this.pos.y);
    }
}


// --- 其他動畫函式 (與之前保持一致) ---

// 成績 >= 80% 且非 100% (星星閃爍)
function drawExcellentAnimation(p) {
  fireworks = []; // 清除煙火，以免干擾
  randomSeed(1); 
  for (let i = 0; i < 20; i++) {
    let starX = random(width);
    let starY = random(height);
    let alpha = map(sin(frameCount * 0.1 + i), -1, 1, 100, 255);
    let starSize = map(sin(frameCount * 0.05 + i), -1, 1, 10, 25);
    fill(255, 200, 0, alpha); 
    noStroke();
    star(starX, starY, starSize / 2, starSize, 5); 
  }
}

// 成績 >= 50% (小球跳動)
function drawGoodAnimation(p) {
  fireworks = []; 
  if (balls.length === 0) {
    for(let i = 0; i < 5; i++) {
        balls.push(new BouncingBall(random(width), random(height), random(1, 3)));
    }
  }

  for (let ball of balls) {
    ball.update();
    ball.display();
  }
}

// 成績 < 50% (簡單加油文字動畫)
function drawNeedImprovementAnimation(p) {
  fireworks = []; 
  let scaleFactor = map(sin(frameCount * 0.1), -1, 1, 1.0, 1.05);
  push();
  translate(width / 2, height * 0.7);
  rotate(sin(frameCount * 0.05) * 0.05); 
  scale(scaleFactor);
  fill(0, 0, 150);
  textSize(40);
  text('繼續加油！', 0, 0);
  pop();
}

// 繪製五角星的輔助函式
function star(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// 小球 Class (保持不變)
class BouncingBall {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.vx = speed * (random() > 0.5 ? 1 : -1);
    this.vy = speed * (random() > 0.5 ? 1 : -1);
    this.radius = 20;
    colorMode(HSB, 255);
    this.color = color(random(255), 200, 200, 200);
    colorMode(RGB, 255); // 切回 RGB
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    if (this.x + this.radius > width || this.x - this.radius < 0) {
      this.vx *= -1;
    }
    if (this.y + this.radius > height || this.y - this.radius < 0) {
      this.vy *= -1;
    }
  }
  
  display() {
    fill(this.color);
    ellipse(this.x, this.y, this.radius * 2);
  }
}

// 游標拖尾特效 (保持不變)
function drawCursorEffect() {
  cursorTrail.push({ x: mouseX, y: mouseY, life: 255 });
  for (let i = cursorTrail.length - 1; i >= 0; i--) {
    let p = cursorTrail[i];
    noStroke();
    let trailColor = color(255, map(p.life, 0, 255, 100, 200), 150, p.life);
    fill(trailColor); 
    ellipse(p.x, p.y, p.life / 25); 
    p.life -= 8; 
    if (p.life < 0) {
      cursorTrail.splice(i, 1); 
    }
  }
}

// 檢查游標是否在選項範圍內 (保持不變)
function checkOptionHover(rectY, height) {
  let rectX = width / 2 - 200;
  let rectW = 400;
  return mouseX > rectX && mouseX < rectX + rectW &&
         mouseY > rectY && mouseY < rectY + height;
}


// --- 滑鼠事件處理 (保持不變) ---

function mousePressed() {
  if (quizState === 'start') {
    quizState = 'question'; 
    return;
  }
  
  if (quizState === 'question') {
    let q = questions[currentQuestionIndex];
    let optionHeight = 60;
    let optionY = 250;
    
    for (let i = 0; i < q.options.length; i++) {
      let rectY = optionY + i * (optionHeight + 10) - optionHeight / 2;
      if (checkOptionHover(rectY, optionHeight)) {
        selectedOption = q.options[i]; 
        setTimeout(checkAnswerAndNext, 500); 
        break;
      }
    }
  } else if (quizState === 'result') {
    let restartBtnY = height - 50;
    let restartW = 200;
    let restartH = 50;
    if (mouseX > width/2 - restartW/2 && mouseX < width/2 + restartW/2 && 
        mouseY > restartBtnY - restartH/2 && mouseY < restartBtnY + restartH/2) {
      // 重設所有狀態
      currentQuestionIndex = 0;
      score = 0;
      quizState = 'start';
      balls = []; 
      fireworks = []; // 清除煙火
    }
  }
}

function checkAnswerAndNext() {
  let q = questions[currentQuestionIndex];
  
  if (selectedOption === q.correct) {
    score++; 
  }
  
  currentQuestionIndex++;
  selectedOption = null; 
  
  if (currentQuestionIndex >= questions.length) {
    quizState = 'result'; 
    // 為滿分動畫準備顏色模式
    if ((score / questions.length) * 100 === 100) {
        colorMode(HSB, 255);
    } else {
        colorMode(RGB, 255);
    }
  }
}