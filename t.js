(function () {
    var JsModel = function () {
        var obj = {};
        Object.defineProperty(obj, "txt", {
            get: function () {
                return this.txt;
            },
            set: function (newValue) {
                document.querySelector("#text").value = newValue;
                document.querySelector("#content").textContent = newValue
            }
        })
        this.init = function () {
            document.querySelector("#text").addEventListener("keyup", function (e) {
                obj.txt = e.target.value;
                console.log(obj.txt);
                
            });
        }
    }
    var model = new JsModel();
    model.init();

})();