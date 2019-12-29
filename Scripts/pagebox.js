(function() {
    //param: 初始化时的参数
    var box = function(param) {
        //默认参数
        this.width = 100;
        this.height = 200;
        this.top = null;
        this.left = null;
        this.level = null;
        this.title = '名字';
        this.url = '';
        this.id = 0;
        //将传入的参数赋给相应的属性
        if (typeof(param) == 'object') {
            for (var t in param)
                this[t] = param[t];
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
            //默认图标
            if (this.ico == null) this.ico = '&#174;';

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
                div.style.width = (box.width - 2) + 'px';
                div.style.height = (box.height - 2) + 'px';
                //div.style.position = "absolute";
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
            //主体内容区
            body: function(box) {
                var boxele = document.querySelector('.pagebox[boxid=\'' + box.id + '\']');
                var iframe = document.createElement('iframe');
                iframe.setAttribute('src', box.url);
                iframe.setAttribute('frameborder', 'no');
                iframe.setAttribute('border', 0);
                iframe.setAttribute('marginwidth', 0);
                iframe.setAttribute('marginheight', 0);
                //iframe.setAttribute('allowTransparency', true);   //背景透明
                boxele.appendChild(iframe);
            },
            //标题栏，包括图标、标题文字、关闭按钮，有拖放功能
            title: function(box) {
                var boxele = document.querySelector('.pagebox[boxid=\'' + box.id + '\']');
                var title = document.createElement('pagebox_title');
                boxele.appendChild(title);
                //添加图标
                var ico = document.createElement('ico');
                ico.innerHTML = box.ico;
                title.appendChild(ico);
                //添加标题文字
                var text = document.createElement('text');
                text.innerHTML = box.title;
                title.appendChild(text);
                //添加最小化，最大化，关闭按钮
                var btnbox = document.createElement('btnbox');
                btnbox.appendChild(document.createElement('btn_min'));
                btnbox.appendChild(document.createElement('btn_max'));
                btnbox.appendChild(document.createElement('btn_close'));
                title.appendChild(btnbox);
            },
            //遮罩
            mask: function(box) {
                var boxele = document.querySelector('.pagebox[boxid=\'' + box.id + '\']');
                boxele.appendChild(document.createElement('pagebox_mask'));
            }
        }
        this.event={
            
        }
    };
    window.pagebox = box;
})();