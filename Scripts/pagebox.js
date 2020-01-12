(function() {
    //窗体最小化时所处位置区域
    window.$collectbar = '';
    //param: 初始化时的参数
    var box = function(param) {
        //默认参数
        this.width = 100;
        this.height = 200;
        this.top = null;
        this.left = null;
        this.level = null;
        this.title = '默认标题';
        this.url = '';
        this.id = 0;
        this.resize = true; //是否允许缩放大小
        this.move = true; //是否允许移动
        this.btnmin = true; //是否允许最小化按钮
        this.btnmax = true; //是否允许最大化按钮
        this.btnclose = true; //是否允许关闭按钮
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
            //如果窗体已经存在
            var boxele = document.querySelector('.pagebox[boxid=\'' + this.id + '\']');
            if (boxele != null) {
                pagebox.focus(this.id);
                return;
            }
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
            return this;
        };
        //设置当前窗体为焦点
        this.focus = function() {
            box.focus(this.id);
        };
        this.close = function() {
            box.close(this.id);
        };
        //构建pagebox窗体
        this.builder = {
                //生成随机id
                randomid: function(box) {
                    box.id = 'pagebox_' + new Date().getTime();
                },
                //生成外壳
                shell: function(box) {
                    var div = $dom(document.body).append('div').childs().last();
                    div.attr({
                        'boxid': box.id,
                        'class': 'pagebox',
                        'ismove': box.move,
                        'isresize': box.resize
                    });
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
                        if (box.isresize)
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
            //拖动事件的起始，当鼠标点下时
            pagebox_drag: function(pageboxElement) {
                var box = $dom(pageboxElement);
                var dragbar = box.find('pagebox_dragbar');
                dragbar = dragbar.merge(box.find('margin>*'));
                dragbar.mousedown(function(e) {
                    var mouse = $dom.mouse(e); //鼠标的当前坐标
                    //鼠标点中的对象
                    var node = event.target ? event.target : event.srcElement;
                    var tagname = node.tagName.toLowerCase(); //点中的节点名称
                    //console.log(tagname);
                    //获取窗体对象
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    var page = $dom(node);
                    var offset = page.offset();
                    page.attr('dragtrigger', tagname).attr({
                        'down_x': mouse.x,
                        'down_y': mouse.y,
                        'down_left': offset.left,
                        'down_top': offset.top,
                        'down_width': page.width(),
                        'down_height': page.height()
                    }).addClass('pagebox_drag');
                    //设置当前窗体为焦点窗
                    var boxid = page.attr('boxid');
                    pagebox.focus(boxid);
                });
                //dragbar.addEventListener('mousedown', );
            },
            //关闭，最大化，最小化
            pagebox_button: function(pageboxElement) {
                var boxdom = $dom(pageboxElement);
                //关闭窗体
                boxdom.find('btnbox btn_close').click(function(e) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    box.close(node);
                });
                //最大化
                boxdom.find('btnbox btn_max').click(function(e) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    if ($dom(node).hasClass('pagebox_full')) box.toWindow(node);
                    else
                        box.toFull(node);
                });
                boxdom.find('pagebox_dragbar').dblclick(function(e) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    if ($dom(node).hasClass('pagebox_full')) box.toWindow(node);
                    else
                        box.toFull(node);
                });

            }
        }
    };
    //*** 以下是静态方法 */
    //创建并打开一个窗体
    box.open = function(param) {
        return new box(param).open();
    };
    //创建pagebox的dom对象
    box.dom = function(boxid) {
        var page = null;
        if (typeof(boxid) == 'string')
            page = $dom('.pagebox[boxid=\'' + boxid + '\']');
        else
        if ($dom.isdom(boxid)) page = boxid;
        else
        if (boxid instanceof Node) page = $dom(boxid);
        return page;
    };
    //设置某个窗体为焦点
    box.focus = function(boxid) {
        var curr = box.dom(boxid);
        if (!curr.hasClass('.pagebox_focus')) {
            var boxs = $dom('.pagebox');
            boxs.removeClass('pagebox_focus');
            curr.addClass('pagebox_focus');
            var level = boxs.level();
            curr.level(level < 1 ? 10000 : level + 1);
        }
    };
    //关闭窗体
    box.close = function(boxid) {
        var page = box.dom(boxid);
        //关闭窗体
        page.css('transition', 'opacity 0.3s');
        page.css('opacity', 0);
        setTimeout(function() {
            page.remove();
            var last = $dom('.pagebox').last();
            if (last != null) pagebox.focus(last.attr('boxid'));
        }, 300);
    };
    //最大化
    box.toFull = function(boxid) {
        var page = box.dom(boxid);
        //禁止移动和调整大小
        page.attr('move', 'false').attr('resize', 'false');
        var offset = page.offset();
        page.attr({
            'win_left': offset.left,
            'win_top': offset.top,
            'win_width': page.width(),
            'win_height': page.height()
        }).addClass('pagebox_full');
        page.css('transition', 'width 0.3s,height 0.3s,left 0.3s,top 0.3s');
        page.width(window.innerWidth - 3).height(innerHeight - 2).left(1).top(0);
        box.disableResize(page);
    };
    //最小化
    box.toMinimize = function(boxid) {

    };
    //恢复窗体状态
    box.toWindow = function(boxid) {
        var page = box.dom(boxid);
        //原始坐标与宽高
        var dl = parseFloat(page.attr('win_left'));
        var dt = parseFloat(page.attr('win_top'));
        var dw = parseFloat(page.attr('win_width'));
        var dh = parseFloat(page.attr('win_height'));
        //
        page.width(dw).height(dh).left(dl).top(dt);
        window.setTimeout(function() {
            page.css('transition', '');
        }, 300);
        page.removeAttr('resize').removeAttr('move').removeClass('pagebox_full');
        box.enableResize(page);
    };
    //禁用缩放
    box.disableResize = function(boxid) {
        var page = box.dom(boxid);
        page.attr('isresize', false).find('margin>*').each(function() {
            $dom(this).css('cursor', 'default');
        });
    };
    //启用缩放
    box.enableResize = function(boxid) {
        var page = box.dom(boxid);
        page.attr('isresize', true).find('margin>*').each(function() {
            $dom(this).css('cursor', this.tagName + '-resize');
        });
    };
    //拖动窗体所需的事件
    box.dragRealize = function() {
        document.addEventListener('mousemove', function(e) {
            var box = $dom('div[dragtrigger].pagebox_focus');
            if (box.length < 1) return;
            //当鼠标的历史坐标
            var dx = parseFloat(box.attr('down_x'));
            var dy = parseFloat(box.attr('down_y'));
            //当鼠标点下时的pagebox坐标
            var dl = parseFloat(box.attr('down_left'));
            var dt = parseFloat(box.attr('down_top'));
            var dw = parseFloat(box.attr('down_width'));
            var dh = parseFloat(box.attr('down_height'));
            //获取移动距离
            var mouse = $dom.mouse(e);
            mouse.x = mouse.x < 0 ? 0 : (mouse.x > window.innerWidth ? window.innerWidth : mouse.x);
            mouse.y = mouse.y < 0 ? 0 : (mouse.y > window.innerHeight ? window.innerHeight : mouse.y);
            var movex = mouse.x - dx;
            var movey = mouse.y - dy;
            //触发拖动的对象，即当鼠标点下时，点中的对象
            var target = box.attr('dragtrigger');
            //移动窗体   
            if (target == 'pagebox_dragbar' && box.attr('move') != 'false') {
                if (box.attr('ismove') == 'true')
                    box.left(dl + movex).top(dt + movey);
            } else {
                //缩放窗体
                if (box.attr('isresize') == 'true') {
                    var minWidth = 200,
                        minHeight = 150;
                    if (box.attr('resize') != 'false') {
                        if (target.indexOf('e') > -1) box.width(dw + movex < minWidth ? minWidth : dw + movex);
                        if (target.indexOf('s') > -1) box.height(dh + movey < minHeight ? minHeight : dh + movey);
                        if (target.indexOf('w') > -1) {
                            box.width(dw - movex < minWidth ? minWidth : dw - movex);
                            if (box.width() > minWidth) box.left(dl + movex);
                        }
                        if (target.indexOf('n') > -1) {
                            box.height(dh - movey < minHeight ? minHeight : dh - movey);
                            if (box.height() > minHeight) box.top(dt + movey);
                        }
                    }
                }
            }
            window.msg = '移动：x_' + movex + ",y_" + movey + ',pagebox宽度：' + box.width();
        });
        document.addEventListener('mouseup', function(e) {
            //删除拖动时生成的一些临时属性
            var rmattr = ['drag', 'down_x', 'down_y', 'down_left', 'down_top', 'down_width', 'down_height'];
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