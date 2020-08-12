import Utility from './utility.class.js';
import Tool from './tool.class.js';
import Fill from './fill.class.js';
import Obj from './obj.class.js';
import Type from './type.class.js';
    
export default class Paint {
    // app.js 에서 let paint  = new Paint("canvas"); 으로 객체 생성
    // canvas가 canvasId임 
    constructor(canvasId) {// 생성자
        this.canvas = document.getElementById(canvasId);
        this.context = canvas.getContext('2d');
       
        
        this.story = document.getElementById('story');
        this.cnt = 0;
        this.cnt2 = 0;
        
        this.undoStack = [];
        this.undoLimit = 10;
        this.redoStack = [];
        this.redoLimit = 10;

        this.isDrawing;
        this.points = [];
        this.radius = 15;
        this.snow_max = 150;
        this.snow=Array();
        this.init2=false;
        this.iCropLeft=0;
        this.iCropWidth=0;
        this.clickCrop = document.getElementsByClassName('cropC');
        this.cropBtn = document.getElementById('crop');
        this.cropBtn.onmousedown = (e) => this.CropClick();
        
        this.imgArr = new Array();
        this.zIdx = 0;
        this.selectedObj;
        this.startX;
        this.startY;
        this.objDiv = document.getElementsByClassName('onCanvas');
        this.bResize;
    }

    // Setter functions
    // To current active tool
    set activeTool(tool) {
        this.tool = tool;
    }

    // To set current selected color
    set selectedColor(color) {
        this.color = color;
        this.context.fillStyle = this.color;
        this.context.strokeStyle = this.color;
        document.getElementById("color").style.backgroundColor = this.color;
        //기존 12가지 컬러 중 지정한 컬러가 colorpicker에 출력
    }

    // To set shapes and pencel stroke size
    set lineWidth(lineWidth) {
        this._lineWidth = lineWidth;

    }

    // To set brush stroke size
    set brushSize(brushSize) {
        this._brushSize = brushSize;
    }
    
    set fontSize(fontSize){
        this._fontSize = fontSize;
        // this.font = fontSize+"px";
    }
    
    set stamp(stamp){
        this._stamp = stamp;
    }

    init() {
        
        this.canvas.onmousedown = (e) => this.onMouseDown(e);
        this.canvas.onclick = (e) => this.onClick(e);
        this.bDrag = false;
        this.iOldX;
        this.iOldY;
        this.iCropLeftOld;
        this.iCropTopOld;
        this.iCropTop;
        this.iCropHeight;
        this.max;
        this.min;
        this.directionMove=0;
        this.clickCrop[0].onmousedown = (e) =>this.CropImage(this.iCropLeft, this.iCropTop, this.iCropWidth, this.iCropHeight);
        this.Init();
    }

    drawStar(options) {
        var length = 15;
        this.context.lineCap = 'butt';
        this.context.lineJoin = 'miter';
        this.context.save();
        this.context.translate(options.x, options.y);
        this.context.beginPath();
        this.context.globalAlpha = options.opacity;
        this.context.rotate(Math.PI / 180 * options.angle);
        this.context.scale(options.scale, options.scale);
        this.context.strokeStyle = options.color;
        this.context.lineWidth = options.width;
        for (var i = 5; i--;) {
            this.context.lineTo(0, length);
            this.context.translate(0, length);
            this.context.rotate((Math.PI * 2 / 10));
            this.context.lineTo(0, -length);
            this.context.translate(0, -length);
            this.context.rotate(-(Math.PI * 6 / 10));
        }
        this.context.lineTo(0, length);
        this.context.closePath();
        this.context.stroke();
        this.context.restore();
    }

    onClick(e){
        switch(this.tool){
            
            case Tool.TOOL_TEXT: // 텍스트 툴일때
            this.story.innerHTML += '<div class=1><input type=button value="&nbsp;&nbsp; 텍스트 &nbsp;&nbsp;" name='+(this.cnt++)+'></div>';
            this.story.onmousedown = (e) => this.storyClick(e);
            this.addInput(e.clientX,e.clientY,this.startPos.x,this.startPos.y); // 클릭한 위치에 input 창 추가
            break;
            case Tool.TOOL_STAMP:
            this.story.innerHTML += '<div class=1><input type=button value="&nbsp;&nbsp; 스탬프 &nbsp;&nbsp;" name='+(this.cnt++)+'></div>';
            this.story.onmousedown = (e) => this.storyClick(e);
            this.addStamp(this.startPos.x, this.startPos.y);
            break;
           //onClick(e)로 colorpicker 함수 활성화, startPos.x, this.startPos.y값 대입
           case Tool.TOOL_COLORPICKER: 
           this.colorPicker(this.startPos.x, this.startPos.y); 
           break; 
        }
    }

    colorPicker(x,y){

        // var canvas = document.getElementById("canvas");
        // var context = canvas.getContext('2d');
         var pixelData = this.context.getImageData(x, y, 1, 1).data;

         var hex = "#" + ("000000" + 
         ((pixelData[0] << 16) | (pixelData[1] << 8) | pixelData[2]).toString(16)).slice(-6);

         document.getElementById("color").style.backgroundColor = hex;
         this.selectedColor = hex;
     } 

        
    
    addStamp(x,y){
        // this.canvas = document.getElementById('canvas');
        // this.count = document.querySelectorAll("[data-tool-stamp]");
        this.img = new Array(20);
        for(var i=1;i<20;i++){
        this.context = canvas.getContext('2d');
        this.imgSel = "Stamp"+i;
        this.img[i]= document.getElementById(this.imgSel);
    }       
    this.img[this._stamp].style.left = x+'px';
    this.img[this._stamp].style.top = y+'px';
 
    this.context.drawImage(this.img[this._stamp],
        parseInt(this.img[this._stamp].style.left)-(this.img[this._stamp].width)*2,
        parseInt(this.img[this._stamp].style.top)-(this.img[this._stamp].height)*2);
    }
   

    addInput(_x,_y,x,y) {
        this.input = document.createElement('input'); // input 새로 생성
        this.input.type = 'text';       
        this.input.style.id = x;
        this.input.style.name = y;
        this.input.style.left = _x -3+ 'px';
        this.input.style.top =  _y -3+ 'px';
        this.input.style.width = this._fontSize*5+ 'px';           // text 타입
        this.input.style.height = this._fontSize+ 'px';           // text 타입
        this.input.style.fontSize = this._fontSize+ 'px';
        this.context.font = this._fontSize+'px malgun gothic'; 
        document.body.appendChild(this.input); // 캔버스에 iuput창 생성
        this.input.style.position = 'fixed'; // input창은 한번 생성되면 그 자리에 고정된다 (스크롤이나 캔버스 크기조절해도)
        this.input.focus(); // 입력창에 자동으로 포커스(입력포커스)
        this.input.onkeydown = function(){
            switch(event.keyCode) { // 스위치문으로 키 코드 값에 따라 결과 내기
                case 13: // keyCode 13은 엔터
                this.context = canvas.getContext('2d');
                this.context.textBaseline = 'top'; 
                this.context.textAlign = 'left';
                this.context.fillText(this.value, parseInt(this.style.id, 10), parseInt(this.style.name, 10)); // this.value 는 text에 입력된 값, paseeInt는 위의 addInput에서  
                document.body.removeChild(this); // 캔버스에서 input창 제거                                               // 가져온 좌표값에서 px를 빼고 number로 형변환을 위해 사용한다.  
                // this.hasInput = true; 다중창 생성 방지위한 값인데 그림판이라 생략                                        // -는 좌표값을 맞추기 위해 조정함.. 
                break;
                case 27: // keyCode 27은 ESC
                document.body.removeChild(this); // ESC를 누르면 입력창이 꺼진다.
                break;
                }
        }
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    addRandomPoint(e) {
        this.points.push({ 
            x:this.currentPos.x,
            y:this.currentPos.y,
          angle: this.getRandomInt(0, 180),
          width: this.getRandomInt(1,10),
          opacity: Math.random(),
          scale: this.getRandomInt(1, 20) / 10,
          color: ('rgb('+this.getRandomInt(0,255)+','+this.getRandomInt(0,255)+','+this.getRandomInt(0,255)+')')
        });
    }

    onMouseDown(e) {        
        this.savedImage = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);

        if(this.undoStack.length >= this.undoLimit) this.undoStack.shift();
        this.undoStack.push(this.savedImage);

        this.canvas.onmousemove = (e) => this.onMouseMove(e);
        document.onmouseup = (e) => this.onMouseUp(e);
        this.startPos = Utility.getMouseCoordsOnCanvas(this.canvas, e);
        // console.log(this.tool);
        // console.log(Tool.TOOL_SELECT);
        if (this.tool == Tool.TOOL_PENCIL || this.tool == Tool.TOOL_BRUSH||this.tool==Tool.TOOL_DASHED
            ||this.tool==Tool.TOOL_DOTTED||this.tool==Tool.TOOL_SPRAY) {

            this.story.innerHTML += '<div class=1><input type=button value="&nbsp;&nbsp;&nbsp;그리기&nbsp;&nbsp;&nbsp;" name='+(this.cnt++)+'></div>';
            this.story.onmousedown = (e) => this.storyClick(e);
            this.context.beginPath(); //그리기 시작
            this.context.moveTo(this.startPos.x, this.startPos.y); //시작점
        }else if(this.tool==Tool.TOOL_PATTERN){
            this.story.innerHTML += '<div class=1><input type=button value="&nbsp;&nbsp;&nbsp;그리기&nbsp;&nbsp;&nbsp;" name='+(this.cnt++)+'></div>';
            this.story.onmousedown = (e) => this.storyClick(e);
            this.isDrawing = true; 
            this.addRandomPoint(e); //랜덤별그리는 함수 실행
        }else if(this.tool == Tool.TOOL_PAINT_BUCKET){
            this.story.innerHTML += '<div class=1><input type=button value="&nbsp;색 채우기&nbsp;" name='+(this.cnt++)+'></div>';
            this.story.onmousedown = (e) => this.storyClick(e);
            new Fill(this.canvas, Math.round(this.startPos.x), Math.round(this.startPos.y), this.color);
        }else if(this.tool == Tool.TOOL_ERASER){
            this.story.innerHTML += '<div class=1><input type=button value="&nbsp;&nbsp;지우기&nbsp;&nbsp;&nbsp;" name='+(this.cnt++)+'></div>';
            this.story.onmousedown = (e) => this.storyClick(e);
            this.context.fillStyle = 'white'; 
            this.context.strokeStyle = 'white'; 
            this.context.beginPath(); //그리기 시작
            this.context.moveTo(this.startPos.x, this.startPos.y); //시작점
        }
        else if(this.tool==Tool.TOOL_SNOW){
            this.Init();
        }
        else if(this.tool==Tool.TOOL_CROP)
        {
            this.story.innerHTML += '<div class=1><input type=button value="&nbsp;&nbsp; CROP &nbsp;&nbsp;" name='+(this.cnt++)+'></div>';
            this.story.onmousedown = (e) => this.storyClick(e);
            this.iOldX = this.startPos.x;
            this.iOldY = this.startPos.y;
            console.log(this.startPos.x, this.iCropLeft);
            //사각형 안에 커서가 들어와서 크롭박스를 움직일 수 있음.
            if(this.startPos.x>=this.iCropLeft&&this.startPos.x<this.iCropWidth+this.iCropLeft&&this.startPos.y>=this.iCropTop&&this.startPos.y<this.iCropHeight+this.iCropTop)
            {   
                console.log("움직이자");
               
                this.bDrag = true;
            }
            //사각형 밖에 커서가 클릭되어서 크롭박스를 re-size시키기.
            else
            {
                this.bDrag = false;
                //4가지 방향으로 리사이즈 시키기.
                // if(e.clientX>this.iCropWidth+this.iCropLeft)
                if(this.startPos.x>this.iCropWidth)
                {
                    console.log("오른쪽 변을 줄이고 늘이기");
                    this.bDrag = true;
                    this.directionMove = 1;
                    this.max = this.startPos.x;
                    // min = e.clientX;
                }else if(this.startPos.x<this.iCropLeft)
                {
                    console.log("왼쪽 변을 줄이고 늘이기");
                    this.bDrag = true;
                    this.directionMove = 2;
                    this.max = this.startPos.x;
                    // min = e.clientX;
                }
                else if(this.startPos.y<this.iCropTop)
                {
                    console.log("윗쪽 변을 줄이고 늘이기");
                    this.bDrag = true;
                    this.directionMove = 3;
                    this.max = this.startPos.y;
                    // min = e.clientY;
                } else if(this.startPos.y>this.iCropHeight+this.iCropTop)
                {
                    console.log("아랫쪽 변을 줄이고 늘이기");
                    this.bDrag = true;
                    this.directionMove = 4;
                    this.max = this.startPos.y;
                    // max, min = e.clientY;
                }
            }
            this.iCropLeftOld = this.iCropLeft;
            this.iCropTopOld = this.iCropTop;
        }

        else if(this.tool == Tool.TOOL_RECTANGLE ||
            this.tool == Tool.TOOL_CIRCLE ||
            this.tool == Tool.TOOL_TRIANGLE){
                console.log("오잉");
                this.story.innerHTML += '<div class=1><input type=button value="&nbsp;&nbsp;&nbsp;&nbsp;도형&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" name='+(this.cnt++)+'></div>';
                this.story.onmousedown = (e) => this.storyClick(e);
        }
        else if(this.tool== Tool.TOOL_LINE){
            this.story.innerHTML += '<div class=1><input type=button value="&nbsp;&nbsp;&nbsp;&nbsp;직선&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" name='+(this.cnt++)+'></div>';
            this.story.onmousedown = (e) => this.storyClick(e);

        }else if(this.tool==Tool.TOOL_SELECT)
        {
            console.log("?");
            this.startX = this.startPos.x;
            this.startY = this.startPos.y;
            var checkPick = false;
            for(var i=0; i<this.imgArr.length; i++)
            {
                
                var tmpObj = this.imgArr[i];
                // console.log(tmpObj.kind);
                // console.log("kind : "+this.imgArr[i].kind);
                // this.selectedObj.kind = this.imgArr[i].kind;
                // if(this.imgArr[i].kind==3)
                // {
                //     console.log(this.imgArr[i].x-this.distance);
                //     if(this.startPos.x>this.imgArr[i].x-this.distance
                //         &&this.startPos.x<this.imgArr[i].x+this.distance
                //         &&this.startPos.y>this.imgArr[i].y-this.distance
                //         &&this.startPos.y<this.imgArr[i].y+this.distance)
                //         {
                //             this.selectedObj.kind = this.imgArr[i].kind;
                //             console.log("안에 들어옴");
                //         }
                // }
                // else{
                    if(this.startPos.x>this.imgArr[i].x-20 &&
                        this.startPos.x<this.imgArr[i].currentX+20 &&
                        this.startPos.y>this.imgArr[i].y-20 &&
                        this.startPos.y<this.imgArr[i].currentY+20)
                    {
                        this.selectedObj = this.imgArr[i];
                        this.selectedObj.kind = tmpObj.kind;
                        // this.placeDiv(this.imgArr[i].x,this.imgArr[i].y, this.imgArr[i].currentX, this.imgArr[i].currentY);
                        // this.placeDiv(e.clientX, e.clientY  , this.imgArr[i].currentY);
                        // console.log(this.startPos.x, e.clientX);
                        checkPick = true;
                        if(this.startPos.x>this.imgArr[i].x-20&&this.startPos.x<this.imgArr[i].x)
                        {
                            this.leftTop = true;
                            console.log("왼쪽변 줄이고");
                            this.canvas.style.cursor = "w-resize";
                            this.bResize = true;
                        }
                        else if(this.startPos.x<this.imgArr[i].currentX+20&&this.startPos.x>this.imgArr[i].currentX)
                        {
                            this.leftTop = false;
                            console.log("오른쪽변 줄이고");
                            this.canvas.style.cursor = "e-resize";
                            this.bResize = true;
                        }
                        else if(this.startPos.y>this.imgArr[i].y-20&&this.startPos.y<this.imgArr[i].y)
                        {   
                            this.leftTop = true;
                            this.canvas.style.cursor = "n-resize";
                            console.log("윗쪽변 줄이고");
                            this.bResize = true;
                        }
                        else if(this.startPos.y<this.imgArr[i].currentY+20&&this.startPos.y>this.imgArr[i].currentY)
                        {
                            this.leftTop = false;
                            this.canvas.style.cursor = "s-resize";
                            console.log("아랫쪽변 줄이고");
                            this.bResize = true;
                        }
                    }

                if(!checkPick)
                {
                    this.selectedObj = null;
                }
                else
                {
                    // this.context.rect(this.selectedObj.x-50, this.selectedObj.y-50, this.selectedObj.currentX-this.selectedObj.x+50, this.selectedObj.currentY-this.selectedObj.y+50);
                }
        } 
    }   
    }
 
    onMouseMove(e) {
        this.currentPos = Utility.getMouseCoordsOnCanvas(this.canvas, e); 

        switch (this.tool) {
            case Tool.TOOL_LINE:
            case Tool.TOOL_RECTANGLE:
            case Tool.TOOL_CIRCLE:
            case Tool.TOOL_TRIANGLE:
                this.drawShape();
                break;
            case Tool.TOOL_PENCIL:
                this.drawFreeLine(this._lineWidth);
                break;
            case Tool.TOOL_DASHED:
                this.drawDashLine(this._lineWidth);
                break;
            case Tool.TOOL_DOTTED:
                this.drawDotLine(this._lineWidth);
                break;
            case Tool.TOOL_SPRAY:
                this.drawSpray(this._lineWidth);
                break;
                
            case Tool.TOOL_BRUSH:
                this.drawFreeLine(this._brushSize);
                break;
            case Tool.TOOL_PATTERN:
                if (!this.isDrawing) return;
                this.addRandomPoint(e);
                // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                for (var i = 0; i < this.points.length; i++) {
                    this.drawStar(this.points[i]);
                }
                break;
            case Tool.TOOL_ERASER:
                this.drawFreeLine(this._lineWidth);
                break;
            case Tool.TOOL_SNOW:
                this.Run();
                break;
                case Tool.TOOL_SELECT:
                // console.log(this.selectedObj);
                if(this.selectedObj!=null){
                    if(this.bResize==false){
                        if(this.selectedObj.kind==2||this.selectedObj.kind==4){
                            this.selectedObj.x += this.currentPos.x - this.startX;
                            this.selectedObj.y += this.currentPos.y - this.startY;
                            this.selectedObj.currentX += this.currentPos.x - this.startX;
                            this.selectedObj.currentY += this.currentPos.y - this.startY;
                            this.drawImgArr();
                            this.startX = this.currentPos.x;
                            this.startY = this.currentPos.y;
                            this.canvas.style.cursor ="move";

                        }
                        // else if(this.selectedObj.kind==3)
                        // {
                        //     console.log("여기작동");
                        // }
                    }
                    else
                    {
                        if(this.leftTop==true){
                            this.selectedObj.x += this.currentPos.x - this.startX;
                            this.selectedObj.y += this.currentPos.y - this.startY;
                            // this.selectedObj.currentX += this.currentPos.x - this.startX;
                            // this.selectedObj.currentY += this.currentPos.y - this.startY;
                            this.drawImgArr();
                            this.startX = this.currentPos.x;
                            this.startY = this.currentPos.y;
                            this.canvas.style.cursor ="";
                        }
                        else
                        {
                            // this.selectedObj.x += this.currentPos.x - this.startX;
                            // this.selectedObj.y += this.currentPos.y - this.startY;
                            this.selectedObj.currentX += this.currentPos.x - this.startX;
                            this.selectedObj.currentY += this.currentPos.y - this.startY;
                            this.drawImgArr();
                            this.startX = this.currentPos.x;
                            this.startY = this.currentPos.y;
                            this.canvas.style.cursor ="move";
                       
                        }
                        console.log("리사이즈하자");
                    }
                
                }
                break;
            case Tool.TOOL_CROP:
                if(this.bDrag){

				
                    var iX = this.currentPos.x- this.iOldX;
                    var iY = this.currentPos.y - this.iOldY;
                    // console.log(this.currentPos.x);
                    console.log(this.startPos.x);
                    console.log(iX, iY);
                    switch(this.directionMove)
                    {
                        case 1: //오른쪽변 움직이기.
                            
                            if(this.max>this.currentPos.x) 
                            {   
                                this.iCropWidth -= 2.5;
                            }
                            if(this.max<this.currentPos.x)
                            {   
                        
                                this.iCropWidth += 2.5;
                            }
                            
                            this.max=this.currentPos.x;
                            
                            break;
                        case 2: //왼쪽변 움직이기.
                            if(this.max>this.currentPos.x) {
                                
                                this.iCropLeft -= 2.5;
                                this.iCropWidth += 2.5;
                            }
    
                            if(this.max<this.currentPos.x)
                            {
                                
                                this.iCropLeft += 2.5;
                                this.iCropWidth -= 2.5;
                            }
                            this.max=this.currentPos.x;
                            break;
    
                        case 3:
                            console.log("위아래");
                            if(this.max>this.currentPos.y)
                            {
                                this.iCropTop -= 2.5;
                                this.iCropHeight += 2.5;
                            }
                            if(this.max<this.currentPos.y)
                            {
                                this.iCropTop += 2.5;
                                this.iCropHeight -= 2.5;
                            }
                            this.max = this.currentPos.y;
                            break;
    
                        case 4:
                            if(this.max>this.currentPos.y)
                            {
                                this.iCropHeight -= 2.5;
                            }
                            if(this.max<this.currentPos.y)
                            {
                                this.iCropHeight += 2.5;
                            }
                            this.max = this.currentPos.y;
                            break;
    
    
                        default:
                            this.iCropLeft = this.iCropLeftOld + iX;
                            if( this.iCropLeft < 0 )
                            {
                                this.iCropLeft = 0;
                            }
                            else if( this.iCropLeft + this.iCropWidth > this.clsImage.width )
                            {
                                this.iCropLeft = this.clsImage.width - this.iCropWidth;
                            }
    
                            this.iCropTop = this.iCropTopOld + iY;
                            if( this.iCropTop < 0 )
                            {
                                this.iCropTop = 0;
                            }
                            else if( this.iCropTop + this.iCropHeight > this.clsImage.height )
                            {
                                this.iCropTop = this.clsImage.height - this.iCropHeight;
                            }
                        break;

                        
                    }
                    this.DrawCropRect();
                }
            default:
                break;
        }
    }

    onMouseUp(e) {
        this.canvas.onmousemove = null;

        if(this.type == 2)
        {
            var type = new Type(this.color, this.context.fillStyle, this.context.strokeStyle,this._lineWidth, this._brushSize);
            var obj = new Obj(this.startPos.x, this.startPos.y, this.currentPos.x, this.currentPos.y , type,this.img,this.zIdx++,2,0);
            this.imgArr.push(obj);
        }
        // else if(this.type ==3)
        // {
        //     var type = new Type(this.color, this.context.fillStyle, this.context.strokeStyle,this._lineWidth, this._brushSize);
        //     var obj = new Obj(this.startPos.x, this.startPos.y, this.currentPos.x, this.currentPos.y , type,this.img,this.zIdx++,3,this.distance);
        //     this.imgArr.push(obj);   
        // }        
        else if(this.type==4)
        {
            var type = new Type(this.color, this.context.fillStyle, this.context.strokeStyle,this._lineWidth, this._brushSize);
           var obj = new Obj(this.startPos.x, this.startPos.y, this.currentPos.x, this.currentPos.y , type,this.img,this.zIdx++,4,0);
            this.imgArr.push(obj);
        }
        this.type = 0;


        this.isDrawing = false;
        this.points.length = 0;
        this.context.closePath();
        document.onmouseup = null;
        this.bDrag = false;
        this.directionMove = 0;
        this.canvas.style.cursor = "default";
        if(this.type==2||this.type==4)
        {
            this.drawImgArr();
        }
        // if(this.selectedObj==null)
        // {
        //    this.drawImgArr(); 
        // }
        this.type = 0;
        this.bResize = false;
    }

    drawImgArr()
    {   
        
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height); 
        this.imgArr.sort(function(a,b){return a.zIdx - b.zIdx;});
        if(this.selectedObj!=null)
        {
            this.context.strokeStyle = "#ff0000";
            this.context.beginPath();
            // this.context.setLineDash([6]);
            this.context.strokeRect(this.selectedObj.x-20, this.selectedObj.y-20, (this.selectedObj.currentX-this.selectedObj.x)+40, (this.selectedObj.currentY-this.selectedObj.y)+40);
            this.context.stroke();
        }
        for(var i=0; i<this.imgArr.length; i++)
        {

            this.context.beginPath();
            var tmp = this.imgArr[i];
            this.color = tmp.type.color;
            this.context.fillStyle = tmp.type.fillStyle;
            this.context.strokeStyle = tmp.type.strokeStyle;
            this.lineWidth = tmp.type.lineWidth;
            this.brushSize = tmp.type.brushSize;
            // console.log(tmp.kind);
            if(tmp.kind==2)
            {
                this.context.rect(tmp.x, tmp.y, tmp.currentX-tmp.x, tmp.currentY-tmp.y); 
                // this.context.stroke();
            } 
            else if(tmp.kind==3)
            {
                this.context.arc(tmp.x, tmp.y, tmp.distance, 0, 2 * Math.PI, false);
            }    
            else if(tmp.kind==4)
            {
                this.context.moveTo(tmp.x + (tmp.currentX - tmp.x) / 2, tmp.y);
                this.context.lineTo(tmp.x, tmp.currentY);
                this.context.lineTo(tmp.currentX, tmp.currentY);
                this.context.closePath();
            } 
            
            this.context.stroke();
            //console.log(tmp.x, tmp.y, tmp.width, tmp.height);
        }
        
        // this.context.
        // console.log(this.selectedObj);


    }

    selectObj()
    {
        console.log("여긴오잖아;;");
    }


        Init()
    {
    	if(this.init2==false)
    	{
    		for(var i=0;i<this.snow_max;++i)
    		{
    			var obj=new Object();
    			obj.x=Math.random()*this.canvas.width;
    			obj.y=Math.random()*this.canvas.height;
    			obj.size=Math.sqrt(Math.random()*100)+1;
    			obj.alpha=Math.random();
    			this.snow.push(obj);
    		}
    		this.init2=true;
    	}
    }

    // draw 이벤트
    onDraw()
    {
        if(this.init2==false)return;
        this.context.putImageData(this.savedImage, 0, 0);
        for(var i=0;i<this.snow_max;++i)
        {
            this.context.beginPath();	// 
            this.context.moveTo(this.snow[i].x, this.snow[i].y);
            this.context.fillStyle = //this.color;// 채울색상, 투명도
                'rgba(255,255,255,' + this.snow[i].alpha + ')';
                this.context.arc(
                this.snow[i].x,		// 가로좌표
                this.snow[i].y,		// 세로좌표
                this.snow[i].size,	// 원 크기
                0,				// 원호의 시작
                Math.PI * 2		// 원호의 끝
            );
            this.context.closePath();
            this.context.fill();
        }
        this.context.filter = "none";
    }
    
    Run()
    {
        for(var i=0;i<this.snow_max;++i)
        {
            this.snow[i].y+=this.snow[i].size*0.2;
            if(this.snow[i].y>=this.canvas.height)this.snow[i].y=-10;
        }
        this.onDraw();
    }

    drawShape(e) {
        
        this.context.putImageData(this.savedImage, 0, 0);
        this.context.beginPath();
        this.context.lineWidth = this._lineWidth;

        if (Tool.TOOL_LINE == this.tool) {
            this.context.moveTo(this.startPos.x, this.startPos.y);
            this.context.lineTo(this.currentPos.x, this.currentPos.y);
        } else if (Tool.TOOL_RECTANGLE == this.tool) {
            this.type = 2;
            this.context.rect(this.startPos.x, this.startPos.y, this.currentPos.x - this.startPos.x, this.currentPos.y - this.startPos.y);
        } else if (Tool.TOOL_CIRCLE == this.tool) {
            this.type = 3;
            let distance = Utility.calcHypotenuse(this.startPos, this.currentPos);
            this.distance = distance;
            this.context.arc(this.startPos.x, this.startPos.y, distance, 0, 2 * Math.PI, false);

        } else if (Tool.TOOL_TRIANGLE == this.tool) {
            this.type = 4;
            this.context.moveTo(this.startPos.x + (this.currentPos.x - this.startPos.x) / 2, this.startPos.y);
            this.context.lineTo(this.startPos.x, this.currentPos.y);
            this.context.lineTo(this.currentPos.x, this.currentPos.y);
            this.context.closePath();

        }
        this.context.stroke();
        
    }
   
    
    drawSpray(lineWidth){
        this.context.lineWidth = lineWidth; //선굵기
        this.context.lineJoin = this.context.lineCap = 'round'; //라인 끝부분 둥글게
        this.context.shadowBlur = 10; //블러처리
        this.context.shadowColor = this.color; //블러색깔
        this.context.lineTo(this.currentPos.x, this.currentPos.y); // 현재 지점까지 선잇기
        this.context.stroke(); //그리기
        this.context.shadowBlur = 0; //블러 0으로 초기화
    }

    drawDashLine(lineWidth) {
        this.context.lineWidth = lineWidth; 
        this.context.lineTo(this.currentPos.x, this.currentPos.y);
        this.context.lineCap = 'round';
        this.context.lineJoin = 'round';
        this.context.setLineDash([10,10]); // [a,b] a는 점의 길이, b는 점과 점 사이의 거리
        this.context.stroke();
        this.context.setLineDash([0]); //초기화
    }

    drawDotLine(lineWidth){
        this.context.lineWidth = lineWidth;
        this.context.lineTo(this.currentPos.x, this.currentPos.y);
        this.context.lineCap = 'round';
        this.context.lineJoin = 'round';
        this.context.setLineDash([1,10]);
        this.context.stroke();
        this.context.setLineDash([0]);
    }
    drawFreeLine(lineWidth) {
        this.context.lineWidth = lineWidth;
        this.context.lineTo(this.currentPos.x, this.currentPos.y);
        this.context.lineCap = 'round';
        this.context.lineJoin = 'round';
        this.context.stroke();
    }

    undoPush(){
        this.savedImage = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);

        if(this.undoStack.length >= this.undoLimit) this.undoStack.shift();
        this.undoStack.push(this.savedImage);
    }
    redoPush(){
        this.savedImage = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);

        if(this.redoStack.length >= this.redoLimit) this.redoStack.shift();
        this.redoStack.push(this.savedImage);
    }
    

    undoPaint(){
        if(this.undoStack.length > 0){
            this.context.putImageData(this.undoStack[this.undoStack.length - 1], 0, 0);
            this.undoStack.pop();
        }else{
            alert("No undo available");
        }
    }

    redoPaint(){
        if(this.redoStack.length > 0){
            this.context.putImageData(this.redoStack[this.redoStack.length - 1], 0, 0);
            this.redoStack.pop();
        }else{
            alert("No redo available");
        }
    }

    storyClick(e){
        // console.log(e.target.value); // 일단 버튼의 값 가죠옴
        var value = e.target.name;
        console.log(e.target.name);
        var jiho = document.getElementsByClassName('1');

        if(this.undoStack.length > 0){

            this.context.putImageData(this.undoStack[value], 0, 0);
            this.undoStack.pop();
            
            for(var i = this.undoStack.length; i>=value; i--){
                jiho[i].remove();
            }
            this.cnt = value;
        }else{
            alert("No undo available");
            }
    }

    LoadImage(){
        this.clsImage = new Image();
        this.dataURL = this.canvas.toDataURL();

        this.clsImage.src = this.dataURL;
        this.iCropLeft = 100;
        this.iCropTop = 100;
        this.iCropWidth = this.canvas.width - 150;
        this.iCropHeight = this.canvas.height - 150;
        this.iImageWidth = this.clsImage.width;
        this.iImageHeight = this.clsImage.height;

        
        // ctx.fillStyle = "#ffffff";
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.DrawCropRect();
      }

      cropMouseOn(){
        var canvas = document.getElementById("canvas");
        canvas.onmousemove = function(e)
        {
            if(e.clientX>=this.iCropLeft+100&&e.clientX<this.iCropWidth+this.iCropLeft+100&&e.clientY>=this.iCropTop&&e.clientY<this.iCropHeight+this.iCropTop)
            {
                canvas.style.cursor = "move";
            }
            else{
                // console.log(e.clientX, this.iCropLeft, this.iCropWidth);
                canvas.style.cursor = "default";
                if(e.clientX>this.iCropWidth+this.iCropLeft+100)
                {
                    canvas.style.cursor = "e-resize";
                   
                }else if(e.clientX<this.iCropLeft+100)
                {
                    canvas.style.cursor = "w-resize";
                }
                else if(e.clientY<this.iCropTop+40)
                {
                    canvas.style.cursor = "n-resize";
                    
                } else if(e.clientY>this.iCropHeight+this.iCropTop)
                {
                    canvas.style.cursor = "s-resize";
                }
            }
        }
    }

      DrawCropRect()
		{
            // console.log(x);
			var canvas = document.getElementById("canvas");
			var ctx = canvas.getContext("2d");
       

                ctx.drawImage( this.clsImage, 0, 0 , this.canvas.width, this.canvas.height);
                ctx.stroke();
                
                ctx.strokeStyle = "#ff0000";
                ctx.beginPath();
                ctx.setLineDash([6]);
                ctx.lineWidth = 2;
                ctx.strokeRect( this.iCropLeft, this.iCropTop, this.iCropWidth, this.iCropHeight );
                ctx.stroke();

                this.lastCropLeft = this.iCropLeft;
            
        }

        CropImage(x,y,width,height)
        {
            if(this.tool==Tool.TOOL_CROP)
            {
            var img = new Image();
            img.onload = function(){
                var canvas = document.getElementById("canvas");
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, x+4, y+4, width, height, 0,0 ,width+5, height+5);
                // this.ctx.stroke();
            };
            img.src = this.canvas.toDataURL();
            this.bDrag = false;
            this.directionMove = 0;
            this.activeTool = Tool.TOOL_PENCIL;
            this.lineWidth = '1';
            this.brushSize = '4';
            this.selectedColor = '#000000';
            this.init();
            var tmp = document.getElementById('left3');
            var tmpPen = document.getElementById("pencil");
            this.left3 = document.getElementById('left3');
            // console.log(tmp);
            document.querySelector("[data-tool].active").classList.toggle("active");
            tmp.classList.toggle("active");
            tmpPen.classList.toggle("active");
            this.CropClick();

        }

      }

      CropClick()
      {
        console.log("?");
        this.left3 = document.getElementById('left3');
         var state = this.left3.style.display;

         if(state=='none')
         {
            this.left3.style.display = "block";
         }else
         {
            this.left3.style.display = "none";
         }
      }

       //캔버스 회전함수
       rotateClockWise(){
        //가상의 캔버스 이미지 요소를 var mCanvas로 선언
        var mCanvas = document.createElement('canvas');
        //HTML5 canvas는 흰 화면만 제공함. 흰 화면만 제공하고, 
        //getContext("2d"): 도형을 그리고 펜으로 표현할 수 있는, 그래픽표현 기능 수행함수
      var mctx=mCanvas.getContext("2d");
          
        //회전 이미지의 세로길이는 기존 이미지의 가로길이이며
        //회전 이미지의 가로길이는 기존 이미지의 세로길이이다. 
       mCanvas.height = this.canvas.width;
        mCanvas.width = this.canvas.height;
        //canvas에 정의된 translate함수. 이미지의 위치를 매개변수x,y만큼 이동한다. 
        mctx.translate(this.canvas.height/2,this.canvas.width/2);
        //canvas에 정의된 rotate 함수. 매개변수 안의 값만큼 회전.(default: 시계방향)
         mctx.rotate(Math.PI/2);

        //canvas에 정의된 drawImage함수
        // void ctx.drawImage(image, dx, dy);
        // void ctx.drawImage(image, dx, dy, dWidth, dHeight);
        // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);.
        //와같이 각각 sourceImage, destinationImage의 속성에 따른 매개변수 지정 가능함
        mctx.drawImage(this.canvas,-this.canvas.width/2,-this.canvas.height/2);
         
        //위의 캔버스의 가로세로길이를 따로 지정해주지 않으면 
        //펜으로 12시방향으로 그리면 오른쪽으로 갈것이다
        //뭐라고 설명해야되지
        this.canvas.width  = mCanvas.width;
        this.canvas.height = mCanvas.height;

        this.context.drawImage(mCanvas, 0, 0);
      }

      verticalFlip(){
        var mCanvas = document.createElement('canvas');
        var mctx=mCanvas.getContext("2d");
        
        //반전은 가로세로값 변화 없으므로 반전 이후의 이미지도 기존 가로세로값을 그대로 갖다씀
        mCanvas.height = this.canvas.height;
        mCanvas.width = this.canvas.width;

        //매개변수 x,y값 좌표로 이미지를 이동시키는 translate함수 사용
        mctx.translate(this.canvas.width,0);

        //캔버스 이미지의 확대/축소에 사용하는 scale함수 매개변수에
        //음수값을 줌으로써 축을 대칭으로 반전시킬 수 있음
         mctx.scale(-1, 1);


        mctx.drawImage(this.canvas,0,0);
         

        this.canvas.width  = mCanvas.width;
        this.canvas.height = mCanvas.height;

        this.context.drawImage(mCanvas, 0, 0);
      }

        horizontalFlip(){
        var mCanvas = document.createElement('canvas');
        var mctx=mCanvas.getContext("2d");
        
        mCanvas.height = this.canvas.height;
        mCanvas.width = this.canvas.width;

        mctx.translate(0,this.canvas.height);

        mctx.scale(1, -1);

        mctx.drawImage(this.canvas,0,0);
         
        this.canvas.width  = mCanvas.width;
        this.canvas.height = mCanvas.height;

        this.context.drawImage(mCanvas, 0, 0);
      }

}