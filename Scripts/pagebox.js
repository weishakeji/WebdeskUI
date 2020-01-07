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
            this.focus();
        };
        //设置当前窗体为焦点
        this.focus = function() {
            box.focus(this.id);
        };
        //构建pagebox窗体
        this.builder = {
                //生成随机id
                randomid: function(box) {
                    box.id = new Date().getTime();
                },
                //生成外壳
                shell: function(box) {
                    var div = $dom(document.body).append('div').childs().last();
                    div.attr({
                        'boxid': box.id,
                        'class': 'pagebox'
                    });
                    //div.css({ 'top': box.top + 'px', 'left': box.left + 'px', 'z-Index': box.level });
                    div.css({
                        'top': box.top + 'px',
                        'left': box.left + 'px'
                    });
                    div.width((box.width - 2)).height((box.height - 2));
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
                    var title = pagebox.append('pagebox_title').find('pagebox_title');
                    //添加图标,标题文字
                    title.append('ico').find('ico').html(box.ico);
                    title.append('text').find('text').html(box.title);
                    //移动窗体的响应条
                    pagebox.append('pagebox_dragbar');
                    //添加最小化，最大化，关闭按钮
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
                //窗体点击事件，主要是为了设置焦点
                $dom(box).click(function(event) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    var boxid = $dom(node).attr('boxid');
                    pagebox.focus(boxid);
                });
            },
            title_click: function(box) {
                $dom(box).find('pagebox_title').click(function(event) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    console.log('点击标题：' + node.innerText);
                    event.stopPropagation();
                });
            },
            title_dbClick: function(box) {
                $dom(box).find('pagebox_title').dblclick(function(event) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;

                    //event.stopPropagation();
                });
            },
            //拖动事件
            pagebox_drag: function(box) {
                var dragbar = $dom(box).find('pagebox_dragbar');
                dragbar.mousedown(function(e) {
                    var mouse = window.$mouse(e);
                    var page = $dom(box);
                    var offset = page.offset();
                    page.attr('drag', 'start').attr({
                        'down_x': mouse.x,
                        'down_y': mouse.y,
                        'down_left': offset.left,
                        'down_top': offset.top
                    }).addClass('pagebox_drag');

                    var boxid = page.attr('boxid');
                    pagebox.focus(boxid);

                });
                //dragbar.addEventListener('mousedown', );
            }
        }
    };
    //*** 以下是静态方法 */
    //设置某个窗体为焦点
    box.focus = function(boxid) {
        if (!boxid) return;
        var curr = $dom('.pagebox[boxid=\'' + boxid + '\']');
        if (!curr.hasClass('.pagebox_focus')) {
            var boxs = $dom('.pagebox');
            boxs.removeClass('pagebox_focus');
            curr.addClass('pagebox_focus');
            var level = boxs.level();
            curr.level(level < 1 ? 10000 : level + 1);
        }
    };
    box.dragRealize = function() {
        document.addEventListener('mousemove', function(e) {

            var pagebox = $dom('div[drag=start].pagebox_focus');
            if (pagebox.length > 0) {
                //当鼠标点下时的鼠标坐标
                var downx = parseFloat(pagebox.attr('down_x'));
                var downy = parseFloat(pagebox.attr('down_y'));
                //当鼠标点下时的pagebox坐标
                var left = parseFloat(pagebox.attr('down_left'));
                var top = parseFloat(pagebox.attr('down_top'));
                //获取移动距离
                var mouse = window.$mouse(e);
                mouse.x = mouse.x < 0 ? 0 : (mouse.x > window.innerWidth ? window.innerWidth : mouse.x);
                mouse.y = mouse.y < 0 ? 0 : (mouse.y > window.innerHeight ? window.innerHeight : mouse.y);
                var movex = mouse.x - downx;
                var movey = mouse.y - downy;
                //当前位置
                //var offset = pagebox.offset();
                pagebox.css({ 'left': (left + movex) + 'px', 'top': (top + movey) + 'px' });
                window.msg = '移动：x_' + movex + ",y_" + movey;
            }

        });
        document.addEventListener('mouseup', function(e) {
            //删除拖动时生成的一些临时属性
            var rmattr = ['drag', 'down_x', 'down_y', 'down_left', 'down_top'];
            $dom('.pagebox').each(function() {
                for (var i = 0; i < rmattr.length; i++) {
                    this.removeAttribute(rmattr[i]);
                }
            });
            $dom('.pagebox_focus').removeClass('pagebox_drag');
        });
        window.addEventListener('blur', function(e) {
            //document.onmouseup();
        });
    };
    window.pagebox = box;
    window.pagebox.dragRealize();
})();