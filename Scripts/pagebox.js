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
            //方法
        this.method = {
                //获取所有pagebox窗体元素
                getboxs: function() {
                    return $dom('.pagebox');
                },
                //最大层深值
                maxlevel: function() {
                    return $dom('.pagebox').level();
                }
            }
            //打开pagebox窗体，并触发shown事件 
        this.open = function() {
                this.init();
                //创建窗体
                for (var t in this.builder) {
                    this.builder[t](this);
                }
                //添加事件
                var boxele = document.querySelector('.pagebox[boxid=\'' + this.id + '\']');
                for (var t in this.event) {
                    this.event[t](boxele);
                }
            }
            //构建pagebox窗体
        this.builder = {
                //生成随机id
                randomid: function(box) {
                    box.id = new Date().getTime();
                },
                //生成外壳
                shell: function(box) {
                    var div = $dom.create('div');
                    div.attr({ 'boxid': box.id, 'class': 'pagebox' });
                    div.css({ 'top': box.top + 'px', 'left': box.left + 'px', 'z-Index': box.level });
                    div.width((box.width - 2)).height((box.height - 2));
                    document.body.appendChild(div[0]);
                },
                //边缘部分，主要是用于控制缩放
                margin: function(box) {
                    var pagebox = $dom('.pagebox[boxid=\'' + box.id + '\']');
                    var margin = pagebox.append('margin').find('margin');
                    var arr = ['nw', 'w', 'sw', 'n', 's', 'ne', 'e', 'se'];
                    for (var i = 0; i < arr.length; i++) {
                        var node = margin.append(arr[i]).find(arr[i]);
                        node.css('cursor', arr[i] + '-resize');
                    }
                },
                //标题栏，包括图标、标题文字、关闭按钮，有拖放功能
                title: function(box) {
                    var pagebox = $dom('.pagebox[boxid=\'' + box.id + '\']');
                    //图标和标题文字，放到margin元素中，防止遮盖上方的鼠标拖放
                    var margin = pagebox.find('margin');
                    //添加图标
                    margin.append('ico').find('ico').html(box.ico);
                    //添加标题文字
                    margin.append('text').find('text').html(box.title);
                    //添加最小化，最大化，关闭按钮
                    var title = pagebox.append('pagebox_title').find('pagebox_title');
                    var btnbox = pagebox.append('btnbox').find('btnbox');
                    btnbox.append('btn_min').append('btn_max').append('btn_close');
                },
                //主体内容区
                body: function(box) {
                    var pagebox = $dom('.pagebox[boxid=\'' + box.id + '\']');
                    var iframe = pagebox.append('iframe').find('iframe');
                    iframe.attr({
                        'name': box.id,
                        'id': box.id,
                        'frameborder': 0,
                        'border': 0,
                        'marginwidth': 0,
                        'marginheight': 0,
                        'src': box.url
                    });
                },
                //遮罩
                mask: function(box) {
                    $dom('.pagebox[boxid=\'' + box.id + '\']').append('pagebox_mask');
                }
            }
            //添加pagebox自身事件，例如拖放、缩放、关闭等
        this.event = {
            pagebox_click: function(box) {
                box.addEventListener('click', function(event) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;

                    console.log('点击窗体：' + node.innerText);
                });
                IframeOnClick.track(box.querySelector('iframe'), function(sender, boxid) {
                    sender.click();
                });
            },
            title_click: function(box) {
                var title = box.querySelector('pagebox_title');
                title.addEventListener('click', function(event) {
                    var node = event.target ? event.target : event.srcElement;
                    //while (!node.getAttribute('boxid')) node = node.parentNode;

                    console.log('点击标题：' + node.innerText);
                    event.stopPropagation();
                }, false);
            }
        }
    };
    window.pagebox = box;
})();

//iframe中的点击事件
var IframeOnClick = {
    resolution: 200,
    iframes: [],
    interval: null,
    Iframe: function() {
        this.element = arguments[0];
        this.cb = arguments[1];
        this.hasTracked = false;
    },
    track: function(element, cb) {
        this.iframes.push(new this.Iframe(element, cb));
        if (!this.interval) {
            var _this = this;
            this.interval = setInterval(function() {
                _this.checkClick();
            }, this.resolution);
        }
    },
    checkClick: function() {
        if (document.activeElement) {
            var activeElement = document.activeElement;
            for (var i in this.iframes) {
                var iframe = this.iframes[i];
                var name = iframe.element.getAttribute('name');
                var pagebox = document.querySelector('.pagebox[boxid=\'' + name + '\']');
                if (activeElement === this.iframes[i].element) { // user is in this Iframe  
                    if (this.iframes[i].hasTracked == false) {
                        this.iframes[i].cb.apply(window, [pagebox, name]);
                        this.iframes[i].hasTracked = true;
                    }
                } else {
                    this.iframes[i].hasTracked = false;
                }
            }
        }
    }
};