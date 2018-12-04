function imgPreview(fileDom){
    //判断是否支持FileReader
    if (window.FileReader) {
        var reader = new FileReader();
    } else {
        alert("您的设备不支持图片预览功能，如需该功能请升级您的设备！");
    }

    //获取文件
    var file = fileDom.files[0];
    var imageType = /^image\//;
    //是否是图片
    if (!imageType.test(file.type)) {
        alert("请选择图片！");
        return;
    }
    //读取完成
    reader.onload = function(e) {
        //获取图片dom
        var img = document.getElementById("image");
        //图片路径设置为读取的图片
        console.log("target",e.target);
        img.src = e.target.result;
        // widthLonger(img);

    };
    reader.readAsDataURL(file);
    document.getElementById("edit").style.display="inline-block";
    console.log(document.getElementById("edit").style);
    document.getElementById("img-container").style.display="none";
    document.getElementById("picShow").style.display="inline-flex";

    // document.getElementById("edit").click();

}

var showPic=document.getElementsByClassName("showPic")[0];
var border=document.getElementById("border");
var small=document.getElementsByClassName("small")[0];

var addBtn = document.querySelector('.img-up-add');//图形化的添加本地图片

var btnBar=document.getElementById("btnBar");
var edit=document.getElementById("edit");
var rotateRight=document.getElementById("rotateRight");
var rotateLeft=document.getElementById("rotateLeft");
var oneToOne=document.getElementById("oneToOne");
var twoToThree=document.getElementById("twoToThree");
var threeToFour=document.getElementById("threeToFour");
var nineToSixteen=document.getElementById("nineToSixteen");
var free=document.getElementById("free");
var saveBtn=document.getElementById("saveBtn");

var image=document.getElementById("image");

// 为添加按钮绑定点击事件，设置选择图片的功能
addBtn.addEventListener('click',function () {
    document.querySelector('#img-file-input').value = null;
    document.querySelector('#img-file-input').click();//外层的点击 隐藏的是选择文件！
    return false;
},false)//事件句柄在冒泡阶段执行（不重要 默认就是false)

edit.addEventListener("click",function(){
    border.style.marginLeft="45px";//图片往左撤

    showPic.style.width="90%";//为了响应窗口大小变化
    image.style.width="70%";
    small.style.width="30%";
    edit.style.display="none";

    btnBar.style.display="inline-block";
    rotateRight.style.backgroundImage="url(\"/images/util/arrow-rotate-right.png\")"//不知道为什么重显以后加载不出背景图 再手动加一次
    rotateLeft.style.backgroundImage="url(\"/images/util/arrow-rotate-left.png\")";
    saveBtn.style.backgroundImage="url(\"/images/util/ok-purple.png\")";


    var cropper = new Cropper(image, {
        // aspectRatio: 1 / 1,
        viewMode:2,
        preview:".small",
        guides:false,
        crop: function (e) {
        }
    });

    // console.log("cropper",cropper);

    rotateRight.addEventListener("click",function (ev) {
        // cropper.rotate(90);
        cropper.rotate(90);
    })

    rotateLeft.addEventListener("click",function(ev){
        cropper.rotate(-90);
    })

    oneToOne.addEventListener("click",function(ev){
        cropper.setAspectRatio(1/1);
    })

    twoToThree.addEventListener("click",function(ev){
        cropper.setAspectRatio(2/3);
    })

    threeToFour.addEventListener("click",function(ev){
        cropper.setAspectRatio(3/4);
    })

    nineToSixteen.addEventListener("click",function(ev){
        cropper.setAspectRatio(9/16);
    })

    free.addEventListener("click",function (ev) {
        cropper.setAspectRatio(NaN);

    })


    saveBtn.addEventListener("click",function(ev){
        var crop=cropper.getCroppedCanvas();

        cropper.getCroppedCanvas({
            width: 160,
            height: 90,
            minWidth: 256,
            minHeight: 256,
            maxWidth: 4096,
            maxHeight: 4096,
            fillColor: '#fff',
            imageSmoothingEnabled: false,
            imageSmoothingQuality: 'high',
        });

        var img = crop.toDataURL("image/png");

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

})

