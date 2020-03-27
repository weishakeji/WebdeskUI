/*!
 * 主 题：登录框
 * 说 明：
 * 1、支持支持滑块；
 * 2、可加载验证码
 * 3、异步加载验证
 *
 * 作 者：微厦科技_宋雷鸣_10522779@qq.com
 * 开发时间: 2020年3月25日
 * 最后修订：2020年3月31日
 * github开源地址:https://github.com/weishakeji/WebdeskUI
 */
(function(win) {
    var login = function(param) {
        if (param == null || typeof(param) != 'object') param = {};
        this.attrs = {
            target: '', //所在Html区域          
            width: '',
            height: '',
            title: '', //标题
            ico: 'e77d', //图标的字体符号
            icoimg: '', //图标的图片样式
            company: '', //公司名称
            website: '', //公司的网址
            tel: '', //联系电话
            user: '', //账号
            pw: '', //密码
            vcode: '', //验证码
            vcodelen: 4, //验证码长度
            id: '',
            drag: false, //是否处于拖动状态
            dragfinish: false, //拖动完成
            success: false, //是否登录成功
            loading: false //加载中
        };
        for (var t in param) this.attrs[t] = param[t];
        eval($ctrl.attr_generate(this.attrs));
        /* 自定义事件 */
        //loyout:布局完成; drag:拖动滑块；dragfinish:拖动完成; full:标签项全屏
        eval($ctrl.event_generate(['loyout', 'drag', 'dragfinish', 'change', 'vefiry', 'submit', 'success', 'error']));
        //以下不支持双向绑定
        this.dom = null; //控件的html对象
        this.domtit = null; //控件标签栏部分的html对象
        this.dombody = null;
        this.domfoot = null;
        //
        if (!this._id) this._id = 'login_' + new Date().getTime();
        $ctrls.add({
            id: this.id,
            obj: this,
            dom: this.dom,
            type: 'login'
        });
    };
    var fn = login.prototype;
    fn._initialization = function() {
        if (!this._id) this._id = 'login_' + new Date().getTime();
    };
    //当属性更改时触发相应动作
    fn._watch = {
        'width': function(obj, val, old) {
            if (obj.dom) obj.dom.width(val);
            obj.trigger('resize', {
                width: val,
                height: obj._height
            });
        },
        'height': function(obj, val, old) {
            if (obj.dom) obj.dom.height(val);
            obj.trigger('resize', {
                width: obj._width,
                height: val
            });
        },
        'title': function(obj, val, old) {
            if (obj.domtit) obj.domtit.find('login_tit').html(val);
        },
        'company': function(obj, val, old) {
            if (obj.domfoot) obj.domfoot.find('login_company a').html(val);
        },
        'website': function(obj, val, old) {
            if (obj.domfoot) obj.domfoot.find('login_company a').attr('href', val);
        },
        'tel': function(obj, val, old) {
            if (obj.domfoot) obj.domfoot.find('login_tel').html(val);
        },
        //滑块拖动
        'drag': function(obj, val, old) {
            if (!obj.dom) return;
            var box = obj.dom.find('login_dragbox');
            if (!val) {
                box.css('transition', 'left 0.3s').removeClass('drag');
                var p = box.parent();
                if (parseInt(box.css('left') + box.width() / 2) > p.width() / 3 * 2) {
                    box.left(p.width() - box.width() - 5);
                    if (!obj.dragfinish) obj.dragfinish = true;
                } else {
                    box.left(5);
                }
            }
            if (val) {
                box.addClass('drag');
                box.css('transition', '');
            }

        },
        //滑块拖动完成
        'dragfinish': function(obj, val, old) {
            //滑块拖动区域
            var box = obj.dom.find('login_drag');
            if (val) {
                box.addClass('complete');
                box.css('transition', 'opacity 1s')
                box.css('opacity', 0);
                window.setTimeout(function() {
                    if (obj.dragfinish) box.hide();
                }, 1000);
                obj.trigger('dragfinish');
            } else {
                box.removeClass('complete');
                box.css('transition', '')
                box.css('opacity', 1);
                box.show();
                obj.dom.find('login_dragbox').left(5);
            }
        }
    };
    fn.open = function() {
        this._initialization();
        //创建登录框，以及基础事件
        for (var t in this._builder) this._builder[t](this);
        for (var t in this._baseEvents) this._baseEvents[t](this);
        //
        if (this._width != '') this.width = this._width;
        if (this._height != '') this.height = this._height
        return this;
    };
    fn._builder = {
        //生成外壳
        shell: function(obj) {
            var area = $dom(obj.target);
            if (area.length < 1) {
                console.log('Login所在区域不存在');
                return;
            }
            area.addClass('loginbox').attr('ctrid', obj.id);
            obj.dom = area;
        },
        title: function(obj) {
            obj.domtit = obj.dom.add('login_titlebar');
            var ico = obj.domtit.add('login_ico');
            if (obj.icoimg != '') ico.add('img').attr('src', obj.icoimg);
            if (obj.icoimg == '') ico.add('i').html('&#x' + obj.ico);
            obj.domtit.add('login_tit').html(obj.title);
        },
        body: function(obj) {
            obj.dombody = obj.dom.add('form').addClass('login_body');
            //账号
            var user = obj.dombody.add('login_row');
            user.addClass('login_user').add('input').attr({
                'type': 'text',
                'name': 'user',
                'placeholder': '账号'
            });
            //密码
            var pw = obj.dombody.add('login_row');
            pw.addClass('login_pw').add('input').attr({
                'type': 'password',
                'name': 'pw',
                'placeholder': '密码'
            });
            //验证码
            var code = obj.dombody.add('login_row');
            code.add('img').addClass('vcode_img');
            code.addClass('login_code').add('input').attr({
                'type': 'text',
                'name': 'vcode',
                'maxlength': obj.vcodelen,
                'placeholder': '验证码'
            });
            //拖动滑块
            var drag = code.add('login_drag');
            drag.add('div').html('<span>向右拖动滑块</span>').add('login_dragbox');
            //登录按钮
            var btnarea = obj.dombody.add('login_row');
            btnarea.add('button').attr('type', 'submit').html('登录');
            //各项提示框
            obj.dombody.find('login_row').add('login_tips');
            //.html('不得为空！');
        },
        footer: function(obj) {
            obj.domfoot = obj.dom.add('login_footbar');
            var company = obj.domfoot.add('login_company');
            company.add('a').html(obj.company).attr({
                'target': '_blank',
                'href': obj.website
            });
            obj.domfoot.add('login_tel').html(obj.tel);
        }
    };
    //基础事件
    fn._baseEvents = {
        submit: function(obj) {
            var form = obj.dom.find('form');
            form.bind('submit', function(e) {
                console.log(e);
                e.preventDefault();
                return false;
            });
        },
        //登录按钮事件
        login: function(obj) {
            obj.dom.find('button').click(function(e) {
                var obj = login._getObj(e);
                obj.trigger('submit');
                //非空验证

                e.preventDefault();
                return false;
            });
        },
        //滑块拖动
        drag: function(obj) {
            obj.dom.find('login_dragbox').mousedown(function(e) {
                var obj = login._getObj(e);
                if (obj.dragfinish) return;
                obj.drag = true;
                obj._drag_init_x = $dom.mouse(e).x; //拖动时的初始鼠标值
            }).bind('mouseup', function(e) {
                var obj = login._getObj(e);
                obj.drag = false;
            });
            obj.dom.find('login_drag>div').bind('mouseleave', function(e) {
                var obj = login._getObj(e);
                obj.drag = false;
            });
            obj.dom.find('login_drag>div').bind('mousemove', function(e) {
                var obj = login._getObj(e);
                if (obj.dragfinish) return; //如果拖动完成，则不能拖动
                //计算移动最大宽度范围
                var node = event.target ? event.target : event.srcElement;
                var parent = $dom(node).parent();
                var min = 5;
                var max = parent.width() - obj.dom.find('login_dragbox').width() - 5;
                //
                var mouse = $dom.mouse(e);
                var left = mouse.x - obj._drag_init_x;
                left = left <= min ? min : (left >= max ? max : left);
                if (obj.drag) obj.dom.find('login_dragbox').left(left);
            });
        },
        //输入更改时
        change: function(obj) {
            obj.dom.find('form input').bind('input', function(e) {
                var input = event.target ? event.target : event.srcElement;
                var word = e.data ? e.data : ''; //新输入的字符
                var val = input.value; //当前输入框中的字符串
                //触发事件
                var obj = login._getObj(e);
                obj.trigger('change', {
                    'action': input.name,
                    'word': word,
                    'value': val
                });
            });
        }
    };
    //登录验证
    fn.vefiry = {
        //滑块验证
        drag: function(obj) {

        },
        //非空验证
        notempty: function(obj) {
            var input = obj.dom.find('login_row input');

        },
        //格式验证
        format: function(obj) {

        }
    };
    /*** 
    以下是静态方法
    *****/
    login.create = function(param) {
        if (param == null) param = {};
        var obj = new login(param);
        //当输入更改时
        obj.onchange(function(s, e) {
            if (e.action == 'user') s.user = e.value;
            if (e.action == 'pw') s.pw = e.value;
            if (e.action == 'vcode') s.vcode = e.value;
        });
        return obj.open();
    };
    login._getObj = function(e) {
        var node = event.target ? event.target : event.srcElement;
        while (!node.getAttribute('ctrid')) node = node.parentNode;
        var ctrl = $ctrls.get(node.getAttribute('ctrid'));
        return ctrl.obj;
    }
    win.$login = login;
})(window);