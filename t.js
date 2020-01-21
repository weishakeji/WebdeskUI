(function(window) {
    var web = function(param) {
        //默认参数
        this.defaultVal = {
            width: 100,
            height: 200,
            top: 300,
            left: 400,
            level: 500,
            title: '默认标题',
            url: '',
            id: 0,
            pid: '', //父级窗体名称
            resize: true, //是否允许缩放大小
            move: true, //是否允许移动
            min: true, //是否允许最小化按钮
            max: true, //是否允许最大化按钮
            close: '056' //是否允许关闭按钮
        };
        for (var t in param) {
            this.defaultVal[t] = param[t];
        }
        var th = this;

        for (var t in this.defaultVal) {
            this['_' + t] = this.defaultVal[t];
            var str='Object.defineProperty(this, t, {\
                get: function() {\
                    return this._'+t+';\
                },\
                set: function(newValue) {\
                    for (var wat in this._watch) {\
                        if (\''+t+'\' == wat) {\
                            this._watch[wat](this, newValue);\
                        }\
                    }\
                    this[\'_\' + t] = newValue;\
                }\
            }, {\
                value: "hello",\
                writable: true\
            });';
            eval(str);
            //
        }
        this._watch = {
            'title': function(sender, val) {
                console.log('title:' + val);
            }
        }
    };
    window.web = web;
})(window);

var tm = new web({
    title: '测试'
});