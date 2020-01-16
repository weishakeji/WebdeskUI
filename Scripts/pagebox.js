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
        this.min = true; //是否允许最小化按钮
        this.max = true; //是否允许最大化按钮
        this.close = true; //是否允许关闭按钮
        this.events = new Array(); //自定义事件
        //将传入的参数赋给相应的属性
        if (typeof(param) == 'object') {
            for (var t in param)
                this[t] = param[t];
        }
        /* 自定义事件 */
        var customEvents = ['init', 'shown', 'load', 'reload',
            'click', 'close', 'min', 'full', 'restore',
            'resize', 'drag',
            'focus', 'blur', 'hover'
        ];
        for (var i = 0; i < customEvents.length; i++) {
            eval('this.on' + customEvents[i] + '=function(f){\
                return arguments.length > 0 ?  \
                this.bind(\'' + customEvents[i] + '\', f) :  \
                this.trigger(\'' + customEvents[i] + '\');};');
        }
        this.bind = function(eventName, func) {
            if (typeof(func) == "function")
                this.events.push({
                    'name': eventName,
                    'event': func
                });
            return this;
        };
        this.trigger = function(eventName, eventArgs) {
            if (this.events.length < 1) return null;
            var arrEvent = new Array();
            for (var i = 0; i < this.events.length; i++) {
                if (this.events[i].name == eventName)
                    arrEvent.push(this.events[i].event);
            }
            if (arrEvent.length < 1) return null;
            //事件参数处理，增加事件名称与形为
            if (!eventArgs) eventArgs = {};
            if (!eventArgs['eventName']) eventArgs['eventName'] = eventName;
            if (!eventArgs['action']) eventArgs['action'] = eventName;
            //执行事件
            var results = [];
            for (var i = 0; i < arrEvent.length; i++) {
                var res = arrEvent[i](this, eventArgs);
                results.push(res);
            }
            return results.length == 1 ? results[0] : results;
        };
        //初始化相关参数
        this._initialization = function() {
            this.id = 'pagebox_' + new Date().getTime();
            //如果位置没有设置
            if (!this.top) {
                this.top = (document.documentElement.clientHeight - document.body.scrollTop - this.height) / 2;
            }
            if (!this.left) {
                this.left = (document.documentElement.clientWidth - document.body.scrollLeft - this.width) / 2;
            }
            //设置层深
            var maxlevel = this.methods.maxlevel();
            this.level = maxlevel < 1 ? 10000 : maxlevel + 1;
            //默认图标
            if (this.ico == null) this.ico = '&#174;';
            $ctrls.add({
                id: this.id,
                obj: this,
                type: 'pagebox'
            });
            this.trigger('init');
            return this;
        };

        //方法
        this.methods = {
            //获取所有pagebox窗体元素
            getboxs: function() {
                return $dom('.pagebox');
            },
            //最大层深值
            maxlevel: function() {
                return $dom('.pagebox').level();
            }
        };
        //打开pagebox窗体，并触发shown事件 
        this.open = function() {
            this._initialization();
            //如果窗体已经存在
            var boxele = document.querySelector('.pagebox[boxid=\'' + this.id + '\']');
            if (boxele != null) {
                pagebox.focus(this.id);
                return;
            }
            //创建窗体
            for (var t in this._builder) {
                this._builder[t](this);
            }
            //添加事件（基础事件，例如移动、拖放等，并不包括自定义事件）
            boxele = document.querySelector('.pagebox[boxid=\'' + this.id + '\']');
            for (var t in this._baseEvents) {
                this._baseEvents[t](boxele);
            }
            $ctrls.update({
                id: this.id,
                dom: $dom(boxele)
            });
            this.trigger('shown');
            this.focus();
            return this;
        };

        //构建pagebox窗体
        this._builder = {
            //生成外壳
            shell: function(box) {
                var div = $dom(document.body).append('div').childs().last();
                div.attr({
                    'boxid': box.id,
                    'class': 'pagebox'
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
                    if (box.resize)
                        node.css('cursor', arr[i] + '-resize');
                }
            },
            //标题栏，包括图标、标题文字、关闭按钮，有拖放功能
            title: function(box) {
                var pagebox = $dom('.pagebox[boxid=\'' + box.id + '\']');
                //图标和标题文字
                var title = pagebox.append('pagebox_title').find('pagebox_title');
                title.append('pb-ico').find('pb-ico').html('&#xe77c');
                title.append('pb-text').find('pb-text').html(box.title);
                //移动窗体的响应条
                pagebox.append('pagebox_dragbar');
                //添加最小化，最大化，关闭按钮
                var btnbox = pagebox.append('btnbox').find('btnbox');
                if (box.min || box.max) {
                    btnbox.append('btn_min').append('btn_max');
                    if (!box.min) btnbox.find('btn_min').addClass('btndisable');
                    if (!box.max) btnbox.find('btn_max').addClass('btndisable');
                }
                if (box.close) btnbox.append('btn_close');
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
            //左上角图标的下拉菜单
            dropmenu: function(box) {
                var pagebox = $dom('.pagebox[boxid=\'' + box.id + '\']');
                var menu = pagebox.append('dropmenu').find('dropmenu');
                menu.append('menu_min').find('menu_min').html('最小化').addClass(box.min ? 'enable' : 'disable');
                menu.append('menu_max').find('menu_max').html('最大化').addClass(box.max ? 'enable' : 'disable');
                menu.append('menu_win').find('menu_win').html('还原').addClass(box.max ? 'enable' : 'disable');
                menu.append('hr');
                menu.append('menu_close').find('menu_close').html('关闭').addClass(box.close ? 'enable' : 'disable');
            },
            //遮罩
            mask: function(box) {
                $dom('.pagebox[boxid=\'' + box.id + '\']').append('pagebox_mask');
            }
        };
        //添加pagebox自身事件，例如拖放、缩放、关闭等
        this._baseEvents = {
            pagebox_click: function(box) {
                //窗体点击事件，主要是为了设置焦点
                $dom(box).click(function(event) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    //var boxid = $dom(node).attr('boxid');
                    var ctrl = $ctrls.get(node.getAttribute('boxid'));
                    var pbox = ctrl.obj;
                    pbox.trigger('click', {});
                    pbox.focus();
                    $dom('.pagebox dropmenu').hide();
                });
            },
            //拖动事件的起始，当鼠标点下时
            pagebox_drag: function(pageboxElement) {
                var box = $dom(pageboxElement);
                var dragbar = box.find('pagebox_dragbar');
                dragbar = dragbar.merge(box.find('margin>*'));
                dragbar.mousedown(function(e) {
                    //鼠标点中的对象
                    var node = event.target ? event.target : event.srcElement;
                    var tagname = node.tagName.toLowerCase(); //点中的节点名称                   
                    //获取窗体对象
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    var ctrl = $ctrls.get(node.getAttribute('boxid'));
                    //记录当鼠标点下时的数据
                    ctrl.mousedown = {
                        target: tagname, //鼠标点下时的Html元素
                        mouse: $dom.mouse(e), //鼠标坐标：x，y值
                        offset: ctrl.dom.offset(), //窗体位置：left,top
                        width: ctrl.dom.width(), //窗体宽高
                        height: ctrl.dom.height()
                    }
                    ctrl.dom.addClass('pagebox_drag');
                    //设置当前窗体为焦点窗
                    pagebox.focus(ctrl.id);
                });
                //dragbar.addEventListener('mousedown', );
            },
            //关闭，最大化，最小化
            pagebox_button: function(pageboxElement) {
                var boxdom = $dom(pageboxElement);
                //关闭窗体，点击右上角关闭按钮，或下拉菜单的关闭项
                boxdom.find('btnbox btn_close, dropmenu menu_close').click(function(e) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    box.close(node.getAttribute('boxid'));
                });
                //双击左侧图标关闭
                boxdom.find('pagebox_title pb-ico').dblclick(function(e) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    box.close(node.getAttribute('boxid'));
                });
                //最大化或还原
                boxdom.find('btnbox btn_max').click(function(e) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    var boxid = node.getAttribute('boxid');
                    if ($dom(node).hasClass('pagebox_full')) box.toWindow(boxid);
                    else
                        box.toFull(boxid);
                });
                //双击标题栏，最大化或还原
                boxdom.find('pagebox_dragbar').dblclick(function(e) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    var boxid = node.getAttribute('boxid');
                    if ($dom(node).hasClass('pagebox_full')) box.toWindow(boxid);
                    else
                        box.toFull(boxid);
                });

            },
            //左上角下拉菜单
            pagebox_dropmenu: function(pageboxElement) {
                var boxdom = $dom(pageboxElement);
                boxdom.find('pagebox_title pb-ico').click(function(e) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    var boxdom = $dom(node);
                    boxdom.find('dropmenu').show();
                    //var boxid = node.getAttribute('boxid');                   
                });
                //最大化
                boxdom.find('dropmenu menu_max').click(function(e) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    var boxid = node.getAttribute('boxid');
                    if (!$dom(node).hasClass('pagebox_full')) box.toFull(boxid);
                });
                boxdom.find('dropmenu menu_win').click(function(e) {
                    var node = event.target ? event.target : event.srcElement;
                    while (!node.getAttribute('boxid')) node = node.parentNode;
                    var boxid = node.getAttribute('boxid');
                    if ($dom(node).hasClass('pagebox_full')) box.toWindow(boxid);
                });
            }
        };
        //设置当前窗体为焦点
        this.focus = function() {
            box.focus(this.id);            
        };
        this.close = function() {
            box.close(this.id);
        };
        //this._initialization();
    };
    //*** 以下是静态方法 */
    //创建一个窗体对象
    box.create = function(param) {
        return new box(param);
    };
    //创建窗体对象并打开
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
        var ctrl = $ctrls.get(boxid);
        if (!ctrl.dom.hasClass('pagebox_focus')) {
            //之前的焦点窗体，触发失去焦点事件
            var focusbox = $dom('.pagebox_focus');
            if (focusbox.length > 0 && focusbox.attr('boxid') != boxid) {
                var ctr = $ctrls.get(focusbox.attr('boxid'));
                ctr.obj.trigger('blur');
            }
            var boxs = $dom('.pagebox');
            boxs.removeClass('pagebox_focus');
            ctrl.dom.addClass('pagebox_focus');
            var level = boxs.level();
            ctrl.dom.level(level < 1 ? 10000 : level + 1);
            //激活当前窗体的焦点事件
            ctrl.obj.trigger('focus');
        }
    };
    //关闭窗体
    box.close = function(boxid) {
        var ctrl = $ctrls.get(boxid);
        var page = box.dom(boxid);
        //关闭窗体
        ctrl.dom.css('transition', 'opacity 0.3s');
        ctrl.dom.css('opacity', 0);
        setTimeout(function() {
            ctrl.remove();
            var last = $dom('.pagebox').last();
            if (last != null) pagebox.focus(last.attr('boxid'));
        }, 300);
        ctrl.obj.trigger('close');
    };
    //最大化
    box.toFull = function(boxid) {
        var ctrl = $ctrls.get(boxid);
        if (!ctrl.obj.max) return;
        //记录放大前的数据，用于还原
        ctrl.win_offset = ctrl.dom.offset();
        ctrl.win_size = {
            width: ctrl.dom.width(),
            height: ctrl.dom.height()
        };
        ctrl.win_state = {
            move: ctrl.obj.move,
            resize: ctrl.obj.resize
        };
        ctrl.obj.move = ctrl.obj.resize = false;
        //开始全屏放大        
        ctrl.dom.css('transition', 'width 0.3s,height 0.3s,left 0.3s,top 0.3s').addClass('pagebox_full');
        ctrl.dom.width(window.innerWidth - 3).height(innerHeight - 2).left(1).top(0);
        //禁用缩放样式（鼠标手势）
        ctrl.dom.find('margin>*').each(function() {
            $dom(this).css('cursor', 'default');
        });
    };
    //最小化
    box.toMinimize = function(boxid) {

    };
    //恢复窗体状态
    box.toWindow = function(boxid) {
        var ctrl = $ctrls.get(boxid);
        ctrl.dom.width(ctrl.win_size.width).height(ctrl.win_size.height)
            .left(ctrl.win_offset.left).top(ctrl.win_offset.top);
        ctrl.obj.move = ctrl.win_state.move;
        ctrl.obj.resize = ctrl.win_state.resize;
        window.setTimeout(function() {
            ctrl.dom.css('transition', '');
        }, 300);
        ctrl.dom.removeClass('pagebox_full');
        //恢复缩放窗体的鼠标手势
        if (ctrl.obj.resize) {
            ctrl.dom.find('margin>*').each(function() {
                $dom(this).css('cursor', this.tagName + '-resize');
            });
        }
    };
    //禁用缩放
    box.disableResize = function(boxid) {
        var ctrl = $ctrls.get(boxid);
        ctrl.dom.find('margin>*').each(function() {
            $dom(this).css('cursor', 'default');
        });
    };
    //启用缩放
    box.enableResize = function(boxid) {
        var ctrl = $ctrls.get(boxid);
        ctrl.dom.find('margin>*').each(function() {
            $dom(this).css('cursor', this.tagName + '-resize');
        });
    };
    //拖动窗体所需的事件
    box.dragRealize = function() {
        document.addEventListener('mousemove', function(e) {
            var box = $dom('div.pagebox_drag');
            if (box.length < 1) return;
            var ctrl = $ctrls.get(box.attr('boxid'));
            //当鼠标点下时的历史信息，例如位置、宽高    
            var ago = ctrl.mousedown;
            //获取移动距离
            var mouse = $dom.mouse(e);
            mouse.x = mouse.x < 0 ? 0 : (mouse.x > window.innerWidth ? window.innerWidth : mouse.x);
            mouse.y = mouse.y < 0 ? 0 : (mouse.y > window.innerHeight ? window.innerHeight : mouse.y);
            //事件参数
            var eargs = {
                'mouse': mouse,
                'move': {
                    x: mouse.x - ago.mouse.x,
                    y: mouse.y - ago.mouse.y
                },
                target: ago.target
            };
            //移动窗体   
            if (ago.target == 'pagebox_dragbar') {
                if (ctrl.obj.move) {
                    box.left(ago.offset.left + eargs.move.x)
                        .top(ago.offset.top + eargs.move.y);
                    //触发拖动事件
                    eargs.left = ctrl.dom.offset().left;
                    eargs.top = ctrl.dom.offset().top;
                    ctrl.obj.trigger('drag', eargs);
                }
            } else {
                //缩放窗体
                if (ctrl.obj.resize) {
                    var minWidth = 200,
                        minHeight = 150;
                    if (box.attr('resize') != 'false') {
                        if (ago.target.indexOf('e') > -1) box.width(ago.width + eargs.move.x < minWidth ? minWidth : ago.width + eargs.move.x);
                        if (ago.target.indexOf('s') > -1) box.height(ago.height + eargs.move.y < minHeight ? minHeight : ago.height + eargs.move.y);
                        if (ago.target.indexOf('w') > -1) {
                            box.width(ago.width - eargs.move.x < minWidth ? minWidth : ago.width - eargs.move.x);
                            if (box.width() > minWidth) box.left(dl + eargs.move.x);
                        }
                        if (ago.target.indexOf('n') > -1) {
                            box.height(ago.height - eargs.move.y < minHeight ? minHeight : ago.height - eargs.move.y);
                            if (box.height() > minHeight) box.top(dt + eargs.move.y);
                        }
                        //触发resize事件
                        eargs.left = ctrl.dom.offset().left;
                        eargs.top = ctrl.dom.offset().top;
                        eargs.width = ctrl.dom.width();
                        eargs.height = ctrl.dom.height();
                        ctrl.obj.trigger('resize', eargs);
                    }
                }
            }
            //
        });
        document.addEventListener('mouseup', function(e) {
            var mouse = $dom.mouse(e);
            $ctrls.removeAttr('mousedown');
            var page = $dom('.pagebox_focus');
            page.removeClass('pagebox_drag');
        });
        window.addEventListener('blur', function(e) {
            //document.onmouseup();
        });
        window.addEventListener('resize', function(e) {
            $dom('div.pagebox_full')
                .width(window.innerWidth - 3).height(innerHeight - 2)
                .left(1).top(0);
        });
        document.addEventListener('mousedown', function(e) {
            //$dom('.pagebox dropmenu').hide();
        });
    };
    window.pagebox = box;
    window.pagebox.dragRealize();
})();