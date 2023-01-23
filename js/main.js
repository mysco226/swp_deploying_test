// 다른 스크립트에서 불러올 수 없게 즉시실행함수 사용
(() => {
  let yOffset = 0; //window.pageYOffset 대신 쓸 변수
  let pervScrollHeight = 0; // 현재 스크롤 위치(yOffset)보다 이전에 위치한 스크롤 섹션들의 스크롤 높이값의 합
  let currentScene = 0; // 현재 활성화된(눈 앞에 보고있는) 씬(scroll-section)
  let enterNewScene = false; // 새로운 씬에 들어갈 경우 사용되는 변수 (새로운 씬이 시작된 순간 true)

  // 부드럽게 스크롤
  let acc = 0.1; //가속도
  let delayedYOffset = 0;
  let rafId;
  let rafState;

  const sceneInfo = [
    {
      // 0번째
      type: 'sticky',
      heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅
      scrollHeight: 0, //각 브라우저 높이
      objs: {
        container: document.querySelector('#scroll-section-0'), //인라인 스타일로 height값 삽입
        //message 스크롤 시 텍스트 show/hide
        messageA: document.querySelector('#scroll-section-0 .main-message.a'),
        messageB: document.querySelector('#scroll-section-0 .main-message.b'),
        messageC: document.querySelector('#scroll-section-0 .main-message.c'),
        messageD: document.querySelector('#scroll-section-0 .main-message.d'),
        //스크롤시 canvas 이미지 재생
        canvas: document.querySelector('#video-canvas-0'),
        context: document.querySelector('#video-canvas-0').getContext('2d'),
        videoImages: [],
      },
      values: {
        //messageA
        messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
        messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }],
        messageA_opacity_out: [1, 0, { start: 0.25, end: 0.3 }],
        messageA_translateY_out: [0, -20, { start: 0.25, end: 0.3 }],
        //messageB
        messageB_opacity_in: [0, 1, { start: 0.3, end: 0.4 }],
        messageB_translateY_in: [20, 0, { start: 0.3, end: 0.4 }],
        messageB_opacity_out: [1, 0, { start: 0.45, end: 0.5 }],
        messageB_translateY_out: [0, -20, { start: 0.45, end: 0.5 }],
        //messageC
        messageC_opacity_in: [0, 1, { start: 0.5, end: 0.6 }],
        messageC_translateY_in: [20, 0, { start: 0.5, end: 0.6 }],
        messageC_opacity_out: [1, 0, { start: 0.65, end: 0.7 }],
        messageC_translateY_out: [0, -20, { start: 0.65, end: 0.7 }],
        //messageD
        messageD_opacity_in: [0, 1, { start: 0.7, end: 0.8 }],
        messageD_translateY_in: [20, 0, { start: 0.7, end: 0.8 }],
        messageD_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
        messageD_translateY_out: [0, -20, { start: 0.85, end: 0.9 }],
        //canvas Image
        videoImageCount: 300,
        imageSequence: [0, 299],
        canvas_opacity: [1, 0, { start: 0.9, end: 1 }],
      },
    },
    {
      // 1번째
      type: 'normal',
      //heightNum: 5, => type normal에서는 필요없음.
      scrollHeight: 0,
      objs: {
        container: document.querySelector('#scroll-section-1'),
      },
    },
    {
      // 2번째
      type: 'sticky',
      heightNum: 5,
      scrollHeight: 0,
      objs: {
        container: document.querySelector('#scroll-section-2'),
        messageA: document.querySelector('#scroll-section-2 .a'),
        messageB: document.querySelector('#scroll-section-2 .b'),
        messageC: document.querySelector('#scroll-section-2 .c'),
        pinB: document.querySelector('#scroll-section-2 .b .pin'),
        pinC: document.querySelector('#scroll-section-2 .c .pin'),
        //스크롤시 canvas 이미지 재생
        canvas: document.querySelector('#video-canvas-1'),
        context: document.querySelector('#video-canvas-1').getContext('2d'),
        videoImages: [],
      },
      values: {
        //messageA
        messageA_opacity_in: [0, 1, { start: 0.15, end: 0.2 }],
        messageA_translateY_in: [20, 0, { start: 0.15, end: 0.2 }],
        messageA_opacity_out: [1, 0, { start: 0.3, end: 0.35 }],
        messageA_translateY_out: [0, -20, { start: 0.3, end: 0.35 }],
        //messageB
        messageB_opacity_in: [0, 1, { start: 0.5, end: 0.55 }],
        messageB_translateY_in: [30, 0, { start: 0.5, end: 0.55 }],
        messageB_opacity_out: [1, 0, { start: 0.58, end: 0.63 }],
        messageB_translateY_out: [0, -30, { start: 0.58, end: 0.63 }],
        pinB_scaleY: [0.5, 1, { start: 0.5, end: 0.55 }],
        pinB_opacity_in: [0, 1, { start: 0.5, end: 0.55 }],
        pinB_opacity_out: [0, 1, { start: 0.58, end: 0.63 }],
        //messageC
        messageC_opacity_in: [0, 1, { start: 0.72, end: 0.77 }],
        messageC_translateY_in: [30, 0, { start: 0.72, end: 0.77 }],
        messageC_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
        messageC_translateY_out: [0, -30, { start: 0.85, end: 0.9 }],
        pinC_scaleY: [0.5, 1, { start: 0.72, end: 0.77 }],
        pinC_opacity_in: [0, 1, { start: 0.72, end: 0.77 }],
        pinC_opacity_out: [0, 1, { start: 0.85, end: 0.9 }],
        //canvas Image
        videoImageCount: 960,
        imageSequence: [0, 956],
        canvas_opacity_in: [0, 1, { start: 0, end: 0.1 }],
        canvas_opacity_out: [1, 0, { start: 0.9, end: 1 }],
      },
    },
    {
      // 3번째
      type: 'sticky',
      heightNum: 5,
      scrollHeight: 0,
      objs: {
        container: document.querySelector('#scroll-section-3'),
        canvasCaption: document.querySelector('.canvas-caption'),
        //canvas
        canvas: document.querySelector('.image-blend-canvas'),
        context: document.querySelector('.image-blend-canvas').getContext('2d'),
        imagesPath: [
          './images/blend-image-1.jpg',
          './images/blend-image-2.jpg',
        ],
        images: [],
      },
      values: {
        rect1X: [0, 0, { start: 0, end: 0 }],
        rect2X: [0, 0, { start: 0, end: 0 }],
        blendHeight: [0, 0, { start: 0, end: 0 }],
        canvas_scale: [0, 0, { start: 0, end: 0 }],
        canvasCaption_opacity: [0, 1, { start: 0, end: 0 }],
        canvasCaption_translateY: [20, 0, { start: 0, end: 0 }],
        rectStartY: 0,
      },
    },
  ];

  //5. 이미지 canvas 셋팅 및 처리
  function setCanvasImage() {
    let imgElem;
    for (let i = 0; i < sceneInfo[0].values.videoImageCount; i++) {
      imgElem = new Image(); //imgElem = document.createElement('img'); 와 동일
      imgElem.src = `./video/001/IMG_${6726 + i}.JPG`; // 이미지 객체의 주소 세팅
      sceneInfo[0].objs.videoImages.push(imgElem);
    }

    let imgElem2;
    for (let i = 0; i < sceneInfo[2].values.videoImageCount; i++) {
      imgElem2 = new Image(); //imgElem = document.createElement('img'); 와 동일
      imgElem2.src = `./video/002/IMG_${7027 + i}.JPG`; // 이미지 객체의 주소 세팅
      sceneInfo[2].objs.videoImages.push(imgElem2);
    }

    let imgElem3;
    for (let i = 0; i < sceneInfo[3].objs.imagesPath.length; i++) {
      imgElem3 = new Image(); //imgElem = document.createElement('img'); 와 동일
      imgElem3.src = sceneInfo[3].objs.imagesPath[i];
      sceneInfo[3].objs.images.push(imgElem3);
    }
  }

  function checkMenu() {
    if (yOffset > 44) {
      document.body.classList.add('local-nav-sticky');
    } else {
      document.body.classList.remove('local-nav-sticky');
    }
  }

  //1. 배열에 있는 각 스크롤 섹션의 높이 세팅
  function setLayout() {
    for (let i = 0; i < sceneInfo.length; i++) {
      if (sceneInfo[i].type === `sticky`) {
        sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
        sceneInfo[
          i
        ].objs.container.style.height = ` ${sceneInfo[i].scrollHeight}px `; // 각 id에 style로 height삽입
      } else if (sceneInfo[i].type === 'normal') {
        sceneInfo[i].scrollHeight = sceneInfo[i].objs.container.offsetHeight;
      }
    }

    yOffset = window.pageYOffset; // 새로고침시 현재 스크롤 값에 따라 text노출
    let totalScrollHeight = 0;

    for (let i = 0; i < sceneInfo.length; i++) {
      totalScrollHeight += sceneInfo[i].scrollHeight;

      // totalScrollHeight값이 yOffset값보다 클 경우 break 후 id에 삽입
      if (totalScrollHeight >= yOffset) {
        currentScene = i;
        break;
      }
    }
    document.body.setAttribute('id', `show-scene-${currentScene}`);

    //캔버스 사이즈 맞추기
    const heightRatio = window.innerHeight / 1080;
    sceneInfo[0].objs.canvas.style.transform = `translate3d(-50%, -50%,0) scale(${heightRatio})`;
    sceneInfo[2].objs.canvas.style.transform = `translate3d(-50%, -50%,0) scale(${heightRatio})`;
  }

  // 4. css style 값
  //valuse : opacity 값 0, 1 currnetYOffset : 현재 씬에서 얼마나 스크롤 됐는지
  function calcValues(valuse, currentYOffset) {
    let rv;
    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / sceneInfo[currentScene].scrollHeight; // 현재 씬(스크롤섹션) 에서 스크롤된 범위를 비율로 구하기

    if (valuse.length === 3) {
      // start ~ end 사이에 애니메이션 실행
      const partScrollStart = valuse[2].start * scrollHeight;
      const partScrollEnd = valuse[2].end * scrollHeight;
      const partScrollHeight = partScrollEnd - partScrollStart;

      if (
        currentYOffset >= partScrollStart &&
        currentYOffset <= partScrollEnd
      ) {
        rv =
          ((currentYOffset - partScrollStart) / partScrollHeight) *
            (valuse[1] - valuse[0]) +
          valuse[0];
      } else if (currentYOffset < partScrollStart) {
        rv = valuse[0];
      } else if (currentYOffset > partScrollEnd) {
        rv = valuse[1];
      }
    } else {
      //1. (valuse[1] - valuse[0]) = 200 - 700 = 500 (0 ~ 500까지의 범위)
      //2. 구한값(0 ~ 500) + 시작값(200) = 200 ~ 700 사이의 값
      rv = scrollRatio * (valuse[1] - valuse[0]) + valuse[0];
    }

    return rv;
  }

  // 3. 애니메이션 처리하는 함수
  function playAnimation() {
    const objs = sceneInfo[currentScene].objs;
    const values = sceneInfo[currentScene].values; //valuse.opacity
    const currentYOffset = yOffset - pervScrollHeight; //떨어진 스크롤값 - 섹션별 높이 값 = 섹션의 떨어진 height값
    const scrollHeight = sceneInfo[currentScene].scrollHeight; // 현재 씬의 scrollHeight
    const scrollRatio = currentYOffset / scrollHeight;

    switch (currentScene) {
      case 0:
        // let sequence = Math.round(
        //   calcValues(values.imageSequence, currentYOffset)
        // );
        // objs.context.drawImage(objs.videoImages[sequence], 0, 0);
        objs.canvas.style.opacity = calcValues(
          values.canvas_opacity,
          currentYOffset
        );

        //messageA
        if (scrollRatio <= 0.22) {
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_in,
            currentYOffset
          );
          objs.messageA.style.transform = `translateY(${calcValues(
            values.messageA_translateY_in,
            currentYOffset
          )}%) `;
        } else {
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_out,
            currentYOffset
          );
          objs.messageA.style.transform = `translateY(${calcValues(
            values.messageA_translateY_out,
            currentYOffset
          )}%) `;
        }

        //messageB
        if (scrollRatio <= 0.42) {
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_in,
            currentYOffset
          );
          objs.messageB.style.transform = `translateY(${calcValues(
            values.messageB_translateY_in,
            currentYOffset
          )}%) `;
        } else {
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_out,
            currentYOffset
          );
          objs.messageB.style.transform = `translateY(${calcValues(
            values.messageB_translateY_out,
            currentYOffset
          )}%) `;
        }

        //messageC
        if (scrollRatio <= 0.62) {
          objs.messageC.style.opacity = calcValues(
            values.messageC_opacity_in,
            currentYOffset
          );
          objs.messageC.style.transform = `translateY(${calcValues(
            values.messageC_translateY_in,
            currentYOffset
          )}%) `;
        } else {
          objs.messageC.style.opacity = calcValues(
            values.messageC_opacity_out,
            currentYOffset
          );
          objs.messageC.style.transform = `translateY(${calcValues(
            values.messageC_translateY_out,
            currentYOffset
          )}%) `;
        }

        //messageD
        if (scrollRatio <= 0.82) {
          objs.messageD.style.opacity = calcValues(
            values.messageD_opacity_in,
            currentYOffset
          );
          objs.messageD.style.transform = `translateY(${calcValues(
            values.messageD_translateY_in,
            currentYOffset
          )}%) `;
        } else {
          objs.messageD.style.opacity = calcValues(
            values.messageD_opacity_out,
            currentYOffset
          );
          objs.messageD.style.transform = `translateY(${calcValues(
            values.messageD_translateY_out,
            currentYOffset
          )}%) `;
        }

        break;

      case 2:
        // let sequence2 = Math.round(
        //   calcValues(values.imageSequence, currentYOffset)
        // );
        // objs.context.drawImage(objs.videoImages[sequence2], 0, 0);

        // canvas in/out
        if (scrollRatio <= 0.5) {
          objs.canvas.style.opacity = calcValues(
            values.canvas_opacity_in,
            currentYOffset
          );
        } else {
          objs.canvas.style.opacity = calcValues(
            values.canvas_opacity_out,
            currentYOffset
          );
        }
        //messageA
        if (scrollRatio <= 0.32) {
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_in,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(0,${calcValues(
            values.messageA_translateY_in,
            currentYOffset
          )}%, 0) `;
        } else {
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_out,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(0,${calcValues(
            values.messageA_translateY_out,
            currentYOffset
          )}%, 0) `;
        }

        //messageB
        if (scrollRatio <= 0.67) {
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_in,
            currentYOffset
          );
          objs.messageB.style.transform = `translate3d(0,${calcValues(
            values.messageB_translateY_in,
            currentYOffset
          )}%,0) `;
          objs.pinB.style.transform = `scaleY(${calcValues(
            values.pinB_scaleY,
            currentYOffset
          )})`;
        } else {
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_out,
            currentYOffset
          );
          objs.messageB.style.transform = `translate3d(0, ${calcValues(
            values.messageB_translateY_out,
            currentYOffset
          )}%,0) `;
          objs.pinB.style.transform = `scaleY(${calcValues(
            values.pinB_scaleY,
            currentYOffset
          )})`;
        }

        //messageC
        if (scrollRatio <= 0.93) {
          objs.messageC.style.opacity = calcValues(
            values.messageC_opacity_in,
            currentYOffset
          );
          objs.messageC.style.transform = `translate3d(0,${calcValues(
            values.messageC_translateY_in,
            currentYOffset
          )}%,0) `;
          objs.pinC.style.transform = `scaleY(${calcValues(
            values.pinC_scaleY,
            currentYOffset
          )})`;
        } else {
          objs.messageC.style.opacity = calcValues(
            values.messageC_opacity_out,
            currentYOffset
          );
          objs.messageC.style.transform = `translate3d(0,${calcValues(
            values.messageC_translateY_out,
            currentYOffset
          )}%,0) `;
          objs.pinC.style.transform = `scaleY(${calcValues(
            values.pinC_scaleY,
            currentYOffset
          )})`;
        }

        //currentScene 3에서 쓰는 캔버스를 미리 그려주기 시작
        if (scrollRatio > 0.9) {
          const objs = sceneInfo[3].objs;
          const values = sceneInfo[3].values;
          // 가로/세로 모두 꽉 차게 하기위해 여기서 세팅(계산 필요)
          const widthRatio = window.innerWidth / objs.canvas.width;
          const heightRatio = window.innerHeight / objs.canvas.height;

          let canvasScaleRatio;

          if (widthRatio <= heightRatio) {
            // 캔버스보다 브라우저 창이 홀쭉한 경우
            canvasScaleRatio = heightRatio;
          } else {
            canvasScaleRatio = widthRatio;
            // 캔버스보다 브라우저 창이 납짝한 경우
          }

          objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
          objs.context.fillStyle = 'white';
          objs.context.drawImage(objs.images[0], 0, 0);

          // 캔버스 사이즈에 맞춰 가정한 innerWidth와 innerHeight
          const recalculatedInnerWidth =
            document.body.offsetWidth / canvasScaleRatio;
          const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

          const whiteRectWidth = recalculatedInnerWidth * 0.15;
          values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
          values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
          values.rect2X[0] =
            values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
          values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

          //좌우 흰색 박스 그리기
          objs.context.fillRect(
            values.rect1X[0],
            0,
            parseInt(whiteRectWidth),
            objs.canvas.height
          );
          objs.context.fillRect(
            values.rect2X[0],
            0,
            parseInt(whiteRectWidth),
            objs.canvas.height
          );
        }

        break;

      case 3:
        let step = 0;

        // 가로/세로 모두 꽉 차게 하기위해 여기서 세팅(계산 필요)
        const widthRatio = window.innerWidth / objs.canvas.width;
        const heightRatio = window.innerHeight / objs.canvas.height;

        let canvasScaleRatio;

        if (widthRatio <= heightRatio) {
          // 캔버스보다 브라우저 창이 홀쭉한 경우
          canvasScaleRatio = heightRatio;
        } else {
          canvasScaleRatio = widthRatio;
          // 캔버스보다 브라우저 창이 납짝한 경우
        }

        objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
        objs.context.fillStyle = 'white';
        objs.context.drawImage(objs.images[0], 0, 0);

        // 캔버스 사이즈에 맞춰 가정한 innerWidth와 innerHeight
        const recalculatedInnerWidth =
          document.body.offsetWidth / canvasScaleRatio;
        const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

        //애니메이션 시작 ~ 끝 시점
        if (!values.rectStartY) {
          // values.rectStartY = objs.canvas.getBoundingClientRect().top;
          values.rectStartY =
            objs.canvas.offsetTop +
            (objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2;
          values.rect1X[2].start = window.innerHeight / 2 / scrollHeight;
          values.rect2X[2].start = window.innerHeight / 2 / scrollHeight;
          values.rect1X[2].end = values.rectStartY / scrollHeight;
          values.rect2X[2].end = values.rectStartY / scrollHeight;
        }

        const whiteRectWidth = recalculatedInnerWidth * 0.15;
        values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
        values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
        values.rect2X[0] =
          values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
        values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

        //움직이는 좌우 박스
        objs.context.fillRect(
          parseInt(calcValues(values.rect1X, currentYOffset)),
          0,
          parseInt(whiteRectWidth),
          objs.canvas.height
        );
        objs.context.fillRect(
          parseInt(calcValues(values.rect2X, currentYOffset)),
          0,
          parseInt(whiteRectWidth),
          objs.canvas.height
        );

        // 사진 fixed on/off
        if (scrollRatio < values.rect1X[2].end) {
          step = 1;
          //캔버스 닿기 전;
          objs.canvas.classList.remove(`sticky`);
        } else {
          step = 2;
          //캔버스 닿기 후;
          // 이미지 블렌드
          values.blendHeight[0] = 0;
          values.blendHeight[1] = objs.canvas.height;
          values.blendHeight[2].start = values.rect1X[2].end;
          values.blendHeight[2].end = values.blendHeight[2].start + 0.2;

          const blendHeight = calcValues(values.blendHeight, currentYOffset);

          objs.context.drawImage(
            objs.images[1],
            //첫번째줄
            0,
            objs.canvas.height - blendHeight,
            objs.canvas.width,
            blendHeight,
            //두번째줄
            0,
            objs.canvas.height - blendHeight,
            objs.canvas.width,
            blendHeight
          );

          objs.canvas.classList.add('sticky');
          objs.canvas.style.top = `${
            -(objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2
          }px`;

          // 바다 이미지 scale 조절
          if (scrollRatio > values.blendHeight[2].end) {
            values.canvas_scale[0] = canvasScaleRatio;
            values.canvas_scale[1] =
              document.body.offsetWidth / (1.5 * objs.canvas.width);
            values.canvas_scale[2].start = values.blendHeight[2].end;
            values.canvas_scale[2].end = values.canvas_scale[2].start + 0.2;

            objs.canvas.style.transform = `scale(${calcValues(
              values.canvas_scale,
              currentYOffset
            )})`;
            objs.canvas.style.marginTop = 0;
          }

          // 바다 이미지 scroll 처리
          if (
            scrollRatio > values.canvas_scale[2].end &&
            values.canvas_scale[2].end > 0
          ) {
            //console.log(`스크롤 시작`);
            objs.canvas.classList.remove('sticky');
            objs.canvas.style.marginTop = `${scrollHeight * 0.4}px`;

            //canvasCaption_opacity
            values.canvasCaption_opacity[2].start = values.canvas_scale[2].end;
            values.canvasCaption_opacity[2].end =
              values.canvasCaption_opacity[2].start + 0.1;

            //canvasCaption_translateY
            values.canvasCaption_translateY[2].start =
              values.canvas_scale[2].end;
            values.canvasCaption_translateY[2].end =
              values.canvasCaption_translateY[2].start + 0.1;

            objs.canvasCaption.style.opacity = calcValues(
              values.canvasCaption_opacity,
              currentYOffset
            );

            objs.canvasCaption.style.transform = `translate3d(0, ${calcValues(
              values.canvasCaption_translateY,
              currentYOffset
            )}%, 0)`;
          }
        }

        break;
    }
  }

  // 2. currentScene 값 구하기
  function scrollLoop() {
    enterNewScene = false;
    pervScrollHeight = 0; //이전 height

    // 2-2. 변동된 currentScene값에 따른 pervScrollHeight 값
    for (let i = 0; i < currentScene; i++) {
      pervScrollHeight += sceneInfo[i].scrollHeight;
    }

    if (
      delayedYOffset <
      pervScrollHeight + sceneInfo[currentScene].scrollHeight
    ) {
      document.body.classList.remove('scroll-effect-end');
    }

    // 2-1. yOffset값에 따른  currentScene값 변동
    if (
      delayedYOffset >
      pervScrollHeight + sceneInfo[currentScene].scrollHeight
    ) {
      enterNewScene = true;
      if (currentScene === sceneInfo.length - 1) {
        document.body.classList.add('scroll-effect-end');
      }

      if (currentScene < sceneInfo.length - 1) {
        currentScene++;
      }

      document.body.setAttribute('id', `show-scene-${currentScene}`);
    }
    if (delayedYOffset < pervScrollHeight) {
      enterNewScene = true;

      if (currentScene === 0) return; // 브라우저 바운스 효과로 인해 마이너스가 되는 것을 방지(모바일)
      currentScene--;
      document.body.setAttribute('id', `show-scene-${currentScene}`);
    }

    if (enterNewScene) return; // 바뀌는 순간 playAnimation을 실행하지 않는다
    playAnimation();
  }

  function loop() {
    delayedYOffset = delayedYOffset + (yOffset - delayedYOffset) * acc;

    if (!enterNewScene) {
      const currentYOffset = delayedYOffset - pervScrollHeight;
      const objs = sceneInfo[currentScene].objs;
      const values = sceneInfo[currentScene].values;

      if (currentScene === 0 || currentScene === 2) {
        console.log(`loop`);
        let sequence = Math.round(
          calcValues(values.imageSequence, currentYOffset)
        );

        if (objs.videoImages[sequence]) {
          objs.context.drawImage(objs.videoImages[sequence], 0, 0);
        }
      }
    }

    rafId = requestAnimationFrame(loop);

    if (Math.abs(yOffset - delayedYOffset) < 1) {
      cancelAnimationFrame(rafId);
      rafState = false;
    }
  }

  window.addEventListener('load', () => {
    document.body.classList.remove('before-load');
    setLayout();
    sceneInfo[0].objs.context.drawImage(sceneInfo[0].objs.videoImages[0], 0, 0);

    let tempYOffset = yOffset;
    let tempScrollCount = 0;

    if (yOffset > 0) {
      let siId = setInterval(() => {
        window.scrollTo(0, tempYOffset);
        tempYOffset += 2;

        if (tempScrollCount > 10) {
          clearInterval(siId);
        }
        tempScrollCount++;
      }, 20);
    }

    window.addEventListener('scroll', () => {
      yOffset = window.pageYOffset;
      scrollLoop();
      checkMenu();

      if (!rafState) {
        rafId = requestAnimationFrame(loop);
        rafState = true;
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        // setLayout();
        // sceneInfo[3].values.rectStartY = 0;
        window.location.reload();
      }
    });

    window.addEventListener('orientationchange', () => {
      scrollTo(0, 0);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });

    document
      .querySelector('.loading')
      .addEventListener('transitionend', (e) => {
        document.body.removeChild(e.currentTarget);
      });
  });

  setCanvasImage();
})();
