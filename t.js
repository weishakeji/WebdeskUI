(function() {
    var JsModel = function() {
        var obj = {};
        Object.defineProperty(obj, "txt", {
            get: function() {
                return this.txt;
            },
            set: function(newValue) {
                document.querySelector("#text").value = newValue;
                document.querySelector("#content").textContent = newValue
            }
        })
        this.init = function() {
            document.querySelector("#text").addEventListener("keyup", function(e) {
                obj.txt = e.target.value;
                console.log(obj.txt);

            });
        }
    }
    var model = new JsModel();
    model.init();

})();

(function(){
    var web=function(){

    };
    Object.defineProperty(web,'x',{
        get:function(){

        },
        set:function(val){

        }
    })
})();


var obj=function(){
    this.x='this.x';
    this.func=function(){
        console.log('this.func:'+this.y);
    }
}
 Object.defineProperty(obj,'y',{
        get:function(){
return this.y;
        },
        set:function(val){
this.y=val;
        }
    });
obj.prototype.pfunc=function(){
  console.log('prototype.function:'+this.y);  
};
var t=new obj();
t.func();
t.pfunc();