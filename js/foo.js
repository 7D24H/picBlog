function foo(){
    var a = 10;//父域
    console.log("inner");
    var x=1000/0;
    var arr=[1,2,3];

    return function(){
        a *= 2; //子域有 就不用父域的
        console.log(a);
        // console.log("return");
        return a;
    };
}
var f = foo();
  //f() 相当于foo()()就是调用的回调函数!
f(); //return 20.
f(); //return 40.
// f;