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
            id: '',
            success: false, //是否登录成功
            loading: false //加载中
        };
        for (var t in param) this.attrs[t] = param[t];
        eval($ctrl.attr_generate(this.attrs));
        /* 自定义事件 */
        //shut:关闭标签; add:添加标签；change:切换标签; full:标签项全屏
        eval($ctrl.event_generate(['loyout', 'drag', 'vefiry', 'submit', 'success', 'error']));
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
                //'autofocus': 'autofocus',
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
            code.addClass('login_code').add('input').attr({
                'type': 'text',
                'name': 'code',
                'placeholder': '验证码'
            });
            code.add('img').addClass('vcode_img');
            //拖动滑块
            var drag = code.add('login_drag');
            drag.add('div').html('向右拖动滑块').add('login_dragbox').html('&#xa049');
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
        drag:function(obj){

        }
    }
    /*** 
    以下是静态方法
    *****/
    login.create = function(param) {
        if (param == null) param = {};
        var tobj = new login(param);
        return tobj.open();
    };
    login._getObj = function(e) {
        var node = event.target ? event.target : event.srcElement;
        while (!node.getAttribute('ctrid')) node = node.parentNode;
        var ctrl = $ctrls.get(node.getAttribute('ctrid'));
        return ctrl.obj;
    }
    win.$login = login;
})(window);