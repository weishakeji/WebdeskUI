(function() {
    //param: 初始化时的参数
    var box = function(param) {
        //默认参数
        this.width = 100;
        this.height = 200;
        this.top = null;
        this.left = null;
        this.level = null;
        this.name = '名字';
        this.id = 0;
        //将传入的参数赋给相应的属性
        if (typeof(param) == 'object') {
            for (var t in param) {
                eval('this.' + t + '=' + param[t]);
            }
        }
        //初始化
        this.init = function() {
            //如果位置没有设置
            if (!this.top) {
                this.top = (document.documentElement.clientHeight - document.body.scrollTop - this.height) / 2;
            }
            if (!this.left) {
                this.left = (document.documentElement.clientWidth - document.body.scrollLeft - this.width) / 2;
            }
            //设置层深
            var maxlevel = this.method.maxlevel();
            this.level = maxlevel < 1 ? 10000 : maxlevel + 1;
            //console.log(this.level);

        }
        this.method = {
            //获取所有pagebox窗体元素
            getboxs: function() {
                var nodeList = document.querySelectorAll('.pagebox');
                var arr = new Array();
                for (var i = 0; i < nodeList.length; i++) {
                    arr.push(nodeList[i]);
                }
                return arr;
            },
            //最大层深值
            maxlevel: function() {
                var boxs = this.getboxs();
                var level = 0;
                for (var i = 0; i < boxs.length; i++) {
                    var lv = Number(boxs[i].getAttribute('level'));
                    if (lv > level) level = lv;
                }
                return level;
            }
        }
        this.open = function() {
            this.init();
            for (var t in this.builder) {
                this.builder[t](this);
            }
        }
        this.builder = {
            //生成随机id
            randomid: function(box) {
                box.id = new Date().getTime();
            },
            //生成外壳
            shell: function(box) {
                var div = document.createElement('div');
                div.setAttribute('boxid', box.id);
                div.setAttribute('class', 'pagebox');
                div.setAttribute('level', box.level);
                div.style.width = box.width + 'px';
                div.style.height = box.height + 'px';
                div.style.position = "absolute";
                div.style.top = box.top + 'px';
                div.style.left = box.left + 'px';
                div.style.zIndex = box.level;
                document.body.appendChild(div);
            },
            //边缘部分，主要是用于控制缩放
            margin: function(box) {
                var boxele = document.querySelector('.pagebox[boxid=\'' + box.id + '\']');
                var marginbox = boxele.appendChild(document.createElement('margin'));
                var arr = ['lefttop', 'left', 'leftbottom', 'top', 'bottom', 'righttop', 'right', 'rightbottom'];
                for (var i = 0; i < arr.length; i++) {
                    marginbox.appendChild(document.createElement(arr[i]));
                }
            },
            //标题栏，包括图标、标题文字、关闭按钮，有拖放功能
            title: function(box) {
                //alert('3')
            },
            //主体内容区
            body: function(box) {
                //alert('4')
            }
        }
    };
    window.pagebox = box;
})();