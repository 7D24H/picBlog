//十字框的大小 一开始就执行
document.documentElement.style.fontSize = document.documentElement.clientWidth*0.04+'px';
tinyImgUpload('#upload');

var canvasCurrentHeight = 0;
var showPlace = document.getElementById("showPlace");
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var saveBtn=document.getElementById("saveBtn");
function tinyImgUpload(element) {
    // 判断容器元素合理性并且添加基础元素//确保就一个id就不用判断了
    var eleList = document.querySelector(element);

    //添加图片的框是动态生成的
    //这层装图片
    eleList.innerHTML ='<div id="img-container" >'+
        //这层当按钮
        '<div class="img-up-add  img-item"> <span class="img-add-icon">+</span> </div>'+
        //这层是真正加载本地图片的
        '<input type="file" name="files" id="img-file-input" multiple>'+
        '</div>';
    var ele = eleList.querySelector('#img-container');
    ele.files = [];   // 当前上传的文件数组

    // 为添加按钮绑定点击事件，设置选择图片的功能
    var addBtn = document.querySelector('.img-up-add');
    addBtn.addEventListener('click',function () {
        document.querySelector('#img-file-input').value = null;
        document.querySelector('#img-file-input').click();//外层的点击 隐藏的是选择文件！
        return false;
    },false)//事件句柄在冒泡阶段执行（不重要 默认就是false)

    // 预览图片
    //处理input选择的图片
    function handleFileSelect(evt) {
        var files = evt.target.files;

        for(var i=0, f; f=files[i];i++){
            // 过滤掉非图片类型文件//不会提示 直接忽略 可以大量选择  好！
            if(!f.type.match('image.*')){
                continue;
            }

                // 图片文件绑定到容器元素上
            ele.files.push(f);

            var reader = new FileReader();
            reader.onload = (function (theFile) {
                return function (e) {
                    var oDiv = document.createElement('div');
                    oDiv.className = 'img-thumb img-item';

                        // 向图片容器里添加元素
                    oDiv.innerHTML = '<img class="thumb-icon" src="'+e.target.result+'" />'+
                        //触发这个按钮就执行一段js
                        '<a href="javscript:;" class="img-remove">x</a>'






                    ele.insertBefore(oDiv, addBtn);
                };
            })(f);//这里的f就是theFile???

            reader.readAsDataURL(f);

            //可以读出长宽了！！！
            reader.onloadend = function(e){
                var img=new Image();
                img.src=e.target.result;
                var width=img.width;
                var height=img.height;
                // console.log("wh",width,height);

                // var canvas = document.getElementById("myCanvas");
                // var ctx = canvas.getContext("2d");
                var showWidth = 400;
                var showHeight = showWidth*height/width;
                //第一个数字是x轴的坐标 后一个是y 主要改后一个
                ctx.drawImage(img,0,canvasCurrentHeight,showWidth,showHeight);
                canvasCurrentHeight = canvasCurrentHeight + showHeight;


                var strH=canvasCurrentHeight+"px";
                showPlace.style.height=strH;
                // console.log("showPlace Height",showPlace.height);
                // c.height=canvasCurrentHeight;

            };

        }


        // repaintCanvas();
        // canvas.height=canvasCurrentHeight;

        console.log("height",canvas.height);
        console.log("files",ele.files.length);
    }
    document.querySelector('#img-file-input').addEventListener('change', handleFileSelect, false);


    function repaintCanvas(){
        canvas.height=canvasCurrentHeight;
        for(var i = 0,f;f=ele.files[i];i++){
            var reader = new FileReader();
            //可以读出长宽了！！！
            reader.onloadend = function(e){
                var img=new Image();
                img.src=e.target.result;
                var width=img.width;
                var height=img.height;
                console.log("wh",width,height);

                // var canvas = document.getElementById("myCanvas");
                // var ctx = canvas.getContext("2d");
                var showWidth = 400;
                var showHeight = showWidth*height/width;
                //第一个数字是x轴的坐标 后一个是y 主要改后一个
                ctx.drawImage(img,0,canvasCurrentHeight,showWidth,showHeight);
                canvasCurrentHeight = canvasCurrentHeight + showHeight;


                var strH=canvasCurrentHeight+"px";
                showPlace.style.height=strH;
                // console.log("showPlace Height",showPlace.height);
                // c.height=canvasCurrentHeight;

            };

            reader.readAsDataURL(f);




        }
    }


    // 删除图片
    function removeImg(evt) {
        if(evt.target.className.match(/img-remove/)){
            console.log('3',ele.files);
            // 获取删除的节点的索引
            function getIndex(ele){

                if(ele && ele.nodeType && ele.nodeType == 1) {
                    var oParent = ele.parentNode;
                    var oChilds = oParent.children;
                    for(var i = 0; i < oChilds.length; i++){
                        if(oChilds[i] == ele)
                            return i;
                    }
                }else {
                    return -1;
                }
            }
            // 根据索引删除指定的文件对象
            var index = getIndex(evt.target.parentNode);
            ele.removeChild(evt.target.parentNode);
            if(index < 0){
                return;
            }else {
                ele.files.splice(index, 1);
            }
            console.log('4',ele.files);
        }

        console.log("files",ele.files.length);

    }
    ele.addEventListener('click', removeImg, false);

}


//保存----------------

saveBtn.addEventListener("click",function(ev){


    var img = canvas.toDataURL("image/png");
    console.log("CANVAS "+img);

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState==4){
            if(xhr.status>=200&&xhr.status<=300||xhr.status==304){
                // var c=document.cookie;
                // var picC=c.split(';')[1];//picture的cookie在第二个 第一个是user
                // var pictureName=picC.substring(picC.indexOf('=')+1,picC.length);
                //
                // console.log("xhr.res",xhr.response);
                // console.log("cookie",pictureName);
                location.href=xhr.response; // 有ajax拦截 ajax以后再重定向要再前端手动写
            }
        }else{
            console.log(xhr.status)
        }
    }
    xhr.open('POST','http://localhost:3000/edit',true);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");  //formdata数据请求头需设置为application/x-www-form-urlencoded
    xhr.send("imgData="+img);//要在前面加上键值 才能直接在req里取到
    xhr.send("hello="+'hello');

})

