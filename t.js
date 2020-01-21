(function(window) {
    var web = function(param) {
        var th=this;
        if (typeof(param) == 'object') {
            for (var t in param) {
                th['_' + t] = param[t];
                Object.defineProperty(th, t, {
                    get: function() {
                        return th['_' + t];
                    },
                    set: function(newValue) {
                        for (var wat in th._watch) {
                            if (t = wat) {
                                th._watch[wat](th, newValue);
                            }
                        }
                        th['_' + t] = newValue;
                    }
                });
                //
            }
        }
        this._watch = {
            'title': function(sender, val) {
                console.log('title:' + val);
            }
        }
    };
    window.web = web;
    
})(window);

var tm = new web({title:'测试'});