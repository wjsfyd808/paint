import Paint from './paint.class.js';
import Tool from './tool.class.js';

let paint  = new Paint("canvas");

// Set defaults
paint.activeTool = Tool.TOOL_LINE;
paint.lineWidth = '1';
paint.brushSize = '4';
paint.fontSize = '16';
paint.stamp = 'stamp0';
paint.selectedColor = '#000000';

// initialize paint
paint.init();

// html에서 data-command인것들을 찾아서 foreach로 하나씩 돌려서 이벤트리스너 달아주기
document.querySelectorAll("[data-command]").forEach(
    (el) => { // html에서 data-command인것 클릭시
        el.addEventListener("click", (e) => {
            // command에 data-command속성 담아줌
            // data-command의 속성? --> data-command = "undo"에서 undo
            let command = el.getAttribute('data-command'); 
            
            if(command == 'undo'){ // undo 버튼 클릭시
                paint.redoPush();
                paint.undoPaint(); // paint클래스의 undoPaint 메소드 실행
            }else if(command == 'redo'){ // redo 버튼 클릭시
                paint.undoPush(); 
                paint.redoPaint(); // paint클래스의 redoPaint 메소드 실행
            }
            else if(command == 'download'){ // download 버튼 클릭시
                var canvas = document.getElementById("canvas"); // html에서 id='canvas'인것 담아오기
                var ctx = canvas.getContext('2d');
                ctx.save();

                var image = canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
                var link = document.createElement('a');
                link.download = "my-image.png";
                link.href = image;
                link.click();
            }
            else if(command == 'history'){
                // 일단 히스토리 버튼 누르면 히스토리 다른거 나오게
                if(isFirst){
                    isFirst = false;
                    $('#right2').fadeIn(300, function() { });
                }else if(!isFirst){
                    // 그리고 두번째 클릭이면 다시 들어가기
                    isFirst = true;
                    $('#right2').fadeOut(300, function() { });
                }
            }
        });
    }
);


document.querySelectorAll("[data-tool]").forEach(
    (el) => {
        el.addEventListener("click", (e) => {
            document.querySelector("[data-tool].active").classList.toggle("active");
            el.classList.toggle("active");
            let selectedTool = el.getAttribute("data-tool");
            paint.activeTool = selectedTool;

            switch(selectedTool){
                case Tool.TOOL_CROP:
                    paint.LoadImage();
                    break;
                case Tool.TOOL_ROTATECLOCKWISE:
                    paint.rotateClockWise();
                    break;   
                case Tool.TOOL_VERTICALFLIP:
                    paint.verticalFlip();
                    break; 
                case Tool.TOOL_HORIZONTALFLIP:
                    paint.horizontalFlip();
                    break; 
                default:

            }

        });
    }
);

document.querySelectorAll("[data-tool-pencil]").forEach(
    (el) => {
        el.addEventListener("click",(e)=>{
            document.querySelector("[data-tool-pencil].active").classList.toggle("active");
            el.classList.toggle("active");
    
                paint.activeTool = el.getAttribute("data-tool-pencil");
            });
        }
    );

document.querySelectorAll("[data-tool-stamp]").forEach(
    (el) => {
        el.addEventListener("click",(e)=>{
            document.querySelector("[data-tool-stamp].active").classList.toggle("active");
            el.classList.toggle("active");
    
                paint.stamp = el.getAttribute("data-tool-stamp");
            });
        }
    );

document.querySelectorAll("[data-font-size]").forEach(
(el) => {
    el.addEventListener("click",(e)=>{
        document.querySelector("[data-font-size].active").classList.toggle("active");
        el.classList.toggle("active");

            paint.fontSize = el.getAttribute("data-font-size");
        });
    }
);

document.querySelectorAll("[data-line-width]").forEach(
    (el) => {
        el.addEventListener("click", (e) =>{
            document.querySelector("[data-line-width].active").classList.toggle("active");
            el.classList.toggle("active");

            paint.lineWidth = el.getAttribute("data-line-width");
        });
    }
);

document.querySelectorAll("[data-brush-size]").forEach(
    (el) => {
        el.addEventListener("click", (e) =>{
            document.querySelector("[data-brush-size].active").classList.toggle("active");
            el.classList.toggle("active");

            paint.brushSize = el.getAttribute("data-brush-size");
        });
    }
);

document.querySelectorAll("[data-color]").forEach(
    (el) => {
        el.addEventListener("click", (e) =>{
            document.querySelector("[data-color].active").classList.toggle("active");
            el.classList.toggle("active");

            paint.selectedColor = el.getAttribute("data-color");
        });
    }
);

