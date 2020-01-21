(function() {
    //窗体最小化时所处位置区域
    //window.$collectbar = '';
    //param: 初始化时的参数
    var box = function(param) {
        if (param == null || typeof(param) != 'object') param = {};
        //默认参数
        var defaultVal = {
            width: 100,
            height: 200,
            top: null,
            left: null,
            level: null,
            title: '默认标题',
            ico: '&#xe77c', //图标
            url: '',
            id: 0,
            pid: '', //父级窗体名称
            resize: true, //是否允许缩放大小
            move: true, //是否允许移动
            min: true, //是否允许最小化按钮
            max: true, //是否允许最大化按钮
            full: false, //打开后是否全屏，默认是false
            closebtn: true //是否允许关闭按钮
        };
        for (var t in param) defaultVal[t] = param[t];
        //defaultVal的参数，全部实现双向绑定
        for (var t in defaultVal) {
            this['_' + t] = defaultVal[t];
            var str = 'Object.defineProperty(this, t, {\
                        get: function() {return this._' + t + ';},\
                        set: function(newValue) {\
                            for (var wat in this._watch) {\
                                if (\'' + t + '\' == wat) {\
                                    this._watch[wat](this, newValue);\
                                }\
                            }\
                            for (var i=0;i<this._watchlist.length;i++) {\
                                if (\'' + t + '\' == this._watchlist[i].key) {\
                                    this._watchlist[i].func(this, newValue);\
                                }\
                            }\
                            this._' + t + '= newValue;\
                            var ctrl=$ctrls.get(this._id);\
                            if(ctrl)ctrl.obj=this;\
                        }\
                    });';
            eval(str);
        }
        //以下不支持双向绑定
        this.parent = null; //父窗体对象
        this.childs = new Array(); //子级窗体
        this.dom = null; //html对象
        this._eventlist = new Array(); //自定义的事件集合     
        this._watchlist = new Array(); //自定义监听  
        this._isinit = false; //是否初始化
        /* 自定义事件 */
        //shown打开，close关闭，load加载，fail加载失败，
        //click点击，drag拖动,focus得到焦点，blur失去焦点
        //min最小化，full全屏，restore还原，resize缩放
        var customEvents = ['shown', 'close', 'load', 'fail',
            'click', 'drag', 'focus', 'blur',
            'min', 'full', 'restore', 'resize'
        ];
        for (var i = 0; i < customEvents.length; i++) {
            eval('this.on' + customEvents[i] + '=function(f){\
                return arguments.length > 0 ?  \
                this.bind(\'' + customEvents[i] + '\', f) :  \
                this.trigger(\'' + customEvents[i] + '\');};');
        }
        //绑定自定义事件
        this.bind = function(eventName, func) {
            if (typeof(func) == "function")
                this._eventlist.push({
                    'name': eventName,
                    'event': func
                });
            return this;
        };
        //触发自定义事件
        this.trigger = function(eventName, eventArgs) {
            var arrEvent = this.events(eventName);
            if (arrEvent.length < 1) return null;
            //事件参数处理，增加事件名称与形为
            if (!eventArgs) eventArgs = {};
            if (!eventArgs['event']) eventArgs['event'] = eventName;
            if (!eventArgs['action']) eventArgs['action'] = eventName;
            if (!eventArgs['target']) eventArgs['target'] = this.dom[0];
            //执行事件
            var results = [];
            for (var i = 0; i < arrEvent.length; i++) {
                var res = arrEvent[i](this, eventArgs);
                results.push(res);
            }
            return results.length == 1 ? results[0] : results;
        };
        //获取某类自定义事件的列表
        this.events = function(eventName) {
            var arrEvent = new Array();
            for (var i = 0; i < this._eventlist.length; i++) {
                if (this._eventlist[i].name == eventName)
                    arrEvent.push(this._eventlist[i].event);
            }
            return arrEvent;
        };
    };
    var fn = box.prototype;
    //初始化相关参数
    fn._initialization = function() {
        this.id = 'pagebox_' + new Date().getTime();
        //是否有父级窗体
        var parent = $ctrls.get(this.pid);
        if (parent != null) {
            this.parent = parent.obj;
            parent.obj.childs.push(this);
        }
        //如果位置没有设置
        if (!this.top && this.bottom) this.top = document.documentElement.clientHeight - this.height - this.bottom;
        if (!this.top && !this.bottom) {
            if (this.parent == null)
                this.top = (document.documentElement.clientHeight - document.body.scrollTop - this.height) / 2;
            else
                this.top = this.parent.dom.offset().top + 30;
        }
        if (!this.left && this.right) this.left = document.documentElement.clientWidth - this.width - this.right;
        if (!this.left && !this.right) {
            if (this.parent == null)
                this.left = (document.documentElement.clientWidth - document.body.scrollLeft - this.width) / 2;
            else
                this.left = this.parent.dom.offset().left + 30;
        }
        //
        $ctrls.add({
            id: this.id,
            obj: this,
            type: 'pagebox'
        });
        this._isinit = true;
        return this;
    };
    //当属性更改时触发事件
    fn._watch = {
        'title': function(box, val) {
            if (box.dom) box.dom.find('pagebox_title pb-text').html(val);
        },
        'url': function(box, val) {
            if (box.dom) box.dom.find('iframe').attr('src', val);
        },
        'width': function(box, val) {
            if (box.dom) box.dom.width(val);
        },
        'height': function(box, val) {
            if (box.dom) box.dom.height(val);
        },
        'left': function(box, val) {
            if (box.dom) box.dom.left(val);
        },
        'top': function(box, val) {
            if (box.dom) box.dom.top(val);
        },
        'level': function(box, val) {
            if (box.dom) box.dom.level(val);
        },
        'full': function(box, val) {
            if (val) box.toFull();
            if (!val) box.toWindow();
        }
    };
    //添加自定义监听事件
    fn.watch = function(watchObj) {
        if (typeof(watchObj) != 'object') return;
        for (var t in watchObj) {
            this._watchlist.push({
                key: t,
                func: watchObj[t]
            });
        }
    };
    //打开pagebox窗体，并触发shown事件 
    fn.open = function() {
        if (!this._isinit) this._initialization();
        //如果窗体已经存在
        var ctrl = $ctrls.get(this.id);
        if (ctrl != null && ctrl.dom != null) return ctrl.obj.focus();
        //创建窗体
        for (var t in this._builder) this._builder[t](this);
        //添加事件（基础事件，例如移动、拖放等，并不包括自定义事件）
        var boxele = document.querySelector('.pagebox[boxid=\'' + this.id + '\']');
        for (var t in this._baseEvents) this._baseEvents[t](boxele);
        //更新dom
        this.dom = $dom(boxele);
        $ctrls.update({
            id: this.id,
            dom: $dom(boxele)
        });
        //设置层深
        var maxlevel = $dom('.pagebox').level();
        this.level = maxlevel < 1 ? 10000 : maxlevel + 1;
        this.trigger('shown');
        return this.focus();
    };
    //构建pagebox窗体
    fn._builder = {
        //生成外壳
        shell: function(box) {
            var div = $dom(document.body).append('div').childs().last();
            div.attr({
                'boxid': box.id,
                'class': 'pagebox',
                'pid': box.pid
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
            title.append('pb-ico').find('pb-ico').html(box.ico);
            if (box.url != '') {
                title.find('pb-ico').hide();
                title.append('pb-ico').find('pb-ico').last().addClass('pb-loading').html('&#xe621');
            }
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
            var iframe = $dom(document.createElement('iframe'));
            iframe.attr({
                'name': box.id,
                'id': box.id,
                'frameborder': 0,
                'border': 0,
                'marginwidth': 0,
                'marginheight': 0,
                'src': box.url
            });
            pagebox.append(iframe);
        },
        //左上角图标的下拉菜单
        dropmenu: function(box) {
            var pagebox = $dom('.pagebox[boxid=\'' + box.id + '\']');
            var menu = pagebox.append('dropmenu').find('dropmenu');
            menu.append('menu_fresh').find('menu_fresh').html('刷新');
            menu.append('hr');
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
    fn._baseEvents = {
        pagebox_click: function(box) {
            //窗体点击事件，主要是为了设置焦点
            $dom(box).click(function(event) {
                var node = event.target ? event.target : event.srcElement;
                while (!node.getAttribute('boxid')) node = node.parentNode;
                var ctrl = $ctrls.get(node.getAttribute('boxid'));
                ctrl.obj.focus().trigger('click', {});
                $dom('.pagebox dropmenu').hide();
            });
        },
        pagebox_load: function(box) {
            var src = $dom(box).find('iframe').attr('src');
            if (src == '') return;
            $dom(box).find('iframe').bind('load', function(event) {
                var node = event.target ? event.target : event.srcElement;
                while (!node.getAttribute('boxid')) node = node.parentNode;
                var ctrl = $ctrls.get(node.getAttribute('boxid'));
                var eventArgs = {
                    url: ctrl.obj.url,
                    target: ctrl.obj.document()
                };
                if (ctrl.obj.events('fail').length > 0) {
                    try {
                        var ifDoc = ctrl.dom.find('iframe')[0].contentWindow.document;
                        var ifTitle = ifDoc.title;
                        if (ifTitle.indexOf("404") >= 0 || ifTitle.indexOf("错误") >= 0) {
                            //加载失败的事件
                            ctrl.obj.trigger('fail', eventArgs);
                        }
                    } catch (e) {
                        var msg = '当iframe的src与当前页面不同源时，无法触发onfail事件';
                        console.log('pagebox onfail event error : ' + msg + '，' + e.message);
                    }
                }
                //加载完成的事件，不管是否失败
                ctrl.obj.trigger('load', eventArgs);
                //操作图标
                ctrl.dom.find('pb-ico').last().hide();
                ctrl.dom.find('pb-ico').first().show();
            });
        },
        //拖动事件的起始，当鼠标点下时
        pagebox_drag: function(pageboxElement) {
            var boxdom = $dom(pageboxElement);
            var dragbar = boxdom.find('pagebox_dragbar');
            dragbar = dragbar.merge(boxdom.find('margin>*'));
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
                box.focus(ctrl.id);
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
                var ctrl = $ctrls.get(node.getAttribute('boxid'));
                ctrl.obj.full = !ctrl.obj.full;
            });
            //双击标题栏，最大化或还原
            boxdom.find('pagebox_dragbar').dblclick(function(e) {
                var node = event.target ? event.target : event.srcElement;
                while (!node.getAttribute('boxid')) node = node.parentNode;
                var boxid = node.getAttribute('boxid');
                var ctrl = $ctrls.get(node.getAttribute('boxid'));
                ctrl.obj.full = !ctrl.obj.full;
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
                var ctrl = $ctrls.get(node.getAttribute('boxid'));
                if (!ctrl.obj.full) ctrl.obj.full = true;
            });
            //最小化
            boxdom.find('dropmenu menu_win').click(function(e) {
                var node = event.target ? event.target : event.srcElement;
                while (!node.getAttribute('boxid')) node = node.parentNode;
                var ctrl = $ctrls.get(node.getAttribute('boxid'));
                if (ctrl.obj.full) ctrl.obj.full = false;
            });
            //刷新
            boxdom.find('dropmenu menu_fresh').click(function(e) {
                var node = event.target ? event.target : event.srcElement;
                while (!node.getAttribute('boxid')) node = node.parentNode;
                var ctrl = $ctrls.get(node.getAttribute('boxid'));
                ctrl.obj.url = ctrl.obj.url;
            });
        }
    };
    //窗体中的iframe文档对象
    fn.document = function() {
        if (this.dom) {
            var iframe = this.dom.find('iframe');
            return iframe[0].contentWindow;
        }
        return null;
    };
    //获取所有子级窗体
    fn.getChilds = function() {
        var arr = gchild(this);
        //按层深level排序
        for (var j = 0; j < arr.length - 1; j++) {
            for (var i = 0; i < arr.length - 1; i++) {
                if (arr[i].level > arr[i + 1].level) {
                    var temp = arr[i];
                    arr[i] = arr[i + 1];
                    arr[i + 1] = temp;
                }
            }
        }

        function gchild(box) {
            var arr = new Array();
            for (var i = 0; i < box.childs.length; i++) {
                var c = box.childs[i];
                arr.push(c);
                if (c.childs.length > 0) {
                    var tm = gchild(c);
                    for (var j = 0; j < tm.length; j++) arr.push(tm[j]);
                }
            }
            return arr;
        }
        return arr;
    };
    //设置当前窗体为焦点
    fn.focus = function() {
        return box.focus(this.id);
    };
    fn.close = function() {
        box.close(this.id);
        return this;
    };
    fn.toFull = function() {
        return box.toFull(this.id);
    }
    fn.toWindow = function() {
        return box.toWindow(this.id);
    }
    /*** 
    以下是静态方法
    *****/
    //创建一个窗体对象
    box.create = function(param) {
        if (param == null) param = {};
        if (typeof(param.pid) == 'undefined') param.pid = window.name;
        var pbox = new box(param);
        pbox._initialization();
        return pbox;
    };
    //创建窗体对象并打开
    box.open = function(param) {
        var pbox = box.create(param);
        return pbox.open();
    };
    //获取上级窗体对象
    box.parent = function(boxid) {
        var ctrl = $ctrls.get(boxid);
        return ctrl.obj.parent;
    };
    //设置某个窗体为焦点
    box.focus = function(boxid) {
        var ctrl = $ctrls.get(boxid);
        if (ctrl == null) return;
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
            ctrl.obj.level = level < 1 ? 10000 : level + 1;
            //如果是最大化，则子窗体要浮于上面
            if (ctrl.obj.full) {
                var childs = ctrl.obj.getChilds();
                for (var i = 0; i < childs.length; i++) {
                    childs[i].level = childs[i].level - 10000 + ctrl.obj.level;
                }
            }
            //激活当前窗体的焦点事件
            ctrl.obj.trigger('focus');
        }
        return ctrl.obj;
    };
    //关闭窗体
    box.close = function(boxid) {
        var ctrl = $ctrls.get(boxid);
        //关闭窗体
        ctrl.dom.css('transition', 'opacity 0.3s');
        ctrl.dom.css('opacity', 0);
        setTimeout(function() {
            ctrl.remove();
            //如果存在父级窗体
            if (ctrl.obj.parent && $dom('.pagebox[boxid=\'' + ctrl.obj.parent.id + '\']').length > 0) {
                //父级的子级，即兄弟
                var siblings = ctrl.obj.parent.childs;
                for (var i = 0; i < siblings.length; i++) {
                    if (siblings[i].id == ctrl.obj.id) {
                        ctrl.obj.parent.childs.splice(i, 1);
                    }
                }
                ctrl.obj.parent.focus();
            } else {
                var last = $dom('.pagebox').last();
                if (last != null) box.focus(last.attr('boxid'));
            }
            //子级
            var childs = ctrl.obj.getChilds();
            for (var i = 0; i < childs.length; i++) {
                box.close(childs[i].id);
            }
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
            width: ctrl.obj.width,
            height: ctrl.obj.height
        };
        ctrl.win_state = {
            move: ctrl.obj.move,
            resize: ctrl.obj.resize
        };
        ctrl.obj.move = ctrl.obj.resize = false;
        //开始全屏放大        
        ctrl.dom.css('transition', 'width 0.3s,height 0.3s,left 0.3s,top 0.3s').addClass('pagebox_full');
        ctrl.obj.width = window.innerWidth - 3;
        ctrl.obj.height = window.innerHeight - 2;
        ctrl.obj.left = 1;
        ctrl.obj.top = 0;
        //禁用缩放样式（鼠标手势）
        ctrl.dom.find('margin>*').each(function() {
            $dom(this).css('cursor', 'default');
        });
        ctrl.obj._full = true;
        //如果是最大化，则子窗体要浮于上面      
        var childs = ctrl.obj.getChilds();
        for (var i = 0; i < childs.length; i++) {
            childs[i].level = childs[i].level - 10000 + ctrl.obj.level;
        }
        ctrl.obj.trigger('full');
    };
    //最小化
    box.toMinimize = function(boxid) {

    };
    //恢复窗体状态
    box.toWindow = function(boxid) {
        var ctrl = $ctrls.get(boxid);
        ctrl.obj.left = ctrl.win_offset.left;
        ctrl.obj.top = ctrl.win_offset.top;
        ctrl.obj.width = ctrl.win_size.width;
        ctrl.obj.height = ctrl.win_size.height;
        ctrl.obj.move = ctrl.win_state.move;
        ctrl.obj.resize = ctrl.win_state.resize;
        window.setTimeout(function() {
            ctrl.dom.css('transition', '');
        }, 300);
        //从最大化还原
        if (ctrl.dom.hasClass('pagebox_full')) {
            ctrl.dom.removeClass('pagebox_full');
            ctrl.obj.trigger('restore', {
                'action': 'from-full'
            });
        }
        //恢复缩放窗体的鼠标手势
        if (ctrl.obj.resize) {
            ctrl.dom.find('margin>*').each(function() {
                $dom(this).css('cursor', this.tagName + '-resize');
            });
        }
        ctrl.obj._full = false;
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
        //var addevent = document.attachEvent || document.addEventListener;
        document.addEventListener('mousemove', function(e) {
            var node = event.target ? event.target : event.srcElement;
            var boxdom = $dom('div.pagebox_drag');
            if (boxdom.length < 1) return;
            var ctrl = $ctrls.get(boxdom.attr('boxid'));
            var box = ctrl.obj;
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
                target: node
            };
            //移动窗体   
            if (ago.target == 'pagebox_dragbar') {
                if (box.move) {
                    box.left = ago.offset.left + eargs.move.x;
                    box.top = ago.offset.top + eargs.move.y;
                    //触发拖动事件
                    eargs.offset = ctrl.dom.offset();
                    box.trigger('drag', eargs);
                }
            } else {
                //缩放窗体
                if (box.resize) {
                    var minWidth = 200,
                        minHeight = 150;
                    if (ctrl.dom.attr('resize') != 'false') {
                        if (ago.target.indexOf('e') > -1) box.width = ago.width + eargs.move.x < minWidth ? minWidth : ago.width + eargs.move.x;
                        if (ago.target.indexOf('s') > -1) box.height = ago.height + eargs.move.y < minHeight ? minHeight : ago.height + eargs.move.y;
                        if (ago.target.indexOf('w') > -1) {
                            box.width = ago.width - eargs.move.x < minWidth ? minWidth : ago.width - eargs.move.x;
                            if (box.width > minWidth) box.left = ago.offset.left + eargs.move.x;
                        }
                        if (ago.target.indexOf('n') > -1) {
                            box.height = ago.height - eargs.move.y < minHeight ? minHeight : ago.height - eargs.move.y;
                            if (box.height > minHeight) box.top = ago.offset.top + eargs.move.y;
                        }
                        //触发resize事件                     
                        eargs.offset = ctrl.dom.offset();
                        eargs.width = box.width;
                        eargs.height = box.height;
                        eargs.action = eargs.target.tagName;
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
    window.$pagebox = box;
    window.$pagebox.dragRealize();
})();