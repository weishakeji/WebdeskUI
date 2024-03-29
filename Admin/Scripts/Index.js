﻿/*!
 * 主 题：管理后台
 * 说 明：
 * 1、web端管理后台，集成树形菜单等控件；
 * 2、各控件数据源基本相同，可以相互转换；
 * 3、当tabs.js（选项卡）切换时，关联pagebox窗体同步切换；
 *
 * 作 者：微厦科技_宋雷鸣_10522779@qq.com
 * 开发时间: 2020年2月1日
 * 最后修订：2020年11月23日
 * github开源地址:https://github.com/weishakeji/WebdeskUI
 */

//数据源
var datasource = {
    drop: 'datas/dropmenu.json',  //左上角，下拉菜单
    user: 'datas/userinfo.json',  //右上角，个人信息管理    
    tree: 'datas/treemenu.json',  //左侧，树形导航菜单
    vbar: 'datas/vbar.json'       //右侧，竖形工具条
};
//加载组件所需javascript文件完成后
$dom.ctrljs(function () {
    window.$skins.loadCss();
    //登录框的构建
    $login.create({
        target: '#login-area',
        //width: '320px',
        title: '微厦在线学习系统',
        company: '微厦科技',
        success: true,   //默认登录验证的状态，如果为true,则直接跳过登录
        website: 'http://www.weishakeji.net',
        tel: '400 6015615'
    }).onlayout(function (s, e) {  //加载后，判断是否为登录状态
        /* 此处可编写：判断是否为已经登录的状态 */
        if (s.success) {
            s.loading = true;
            ready(s);
        }
    }).ondragfinish(function (s, e) {
        /* 此处可编写：当拖动滑块后，加载验证码图片 */
    }).onsubmit(function (s, e) {   //提交事件
        s.loading = true;
        /* 此处可编写：登录校验相关代码 */
        if (s.success) ready(s);
    }).verify([{            //自定义验证
        ctrl: 'user', regex: /^[a-zA-Z0-9_-]{4,16}$/,
        tips: '长度不得小于4位大于16位'
    }, {
        ctrl: 'vcode', regex: /^\d{4}$/,
        tips: '请输入4位数字'
    }]);

    //右上角菜单,用户信息
    window.usermenu = $dropmenu.create({
        target: '#user-area',
        width: 100,
        plwidth: 120,
        level: 2000
    }).onclick(nodeClick);
    $dom.get(datasource.user, function (req) {
        usermenu.add(eval('(' + req + ')'));
    });

    //左上角下拉菜单
    var dropmenu = $dropmenu.create({
        target: '#dropmenu-area',
        //width: 280,
        id: 'main_menu'
    }).onclick(nodeClick);
    $dom.get(datasource.drop, function (req) {
        dropmenu.add(eval('(' + req + ')'));
    });


});

function ready(loginbox) {
    window.setTimeout(function () {
        $dom('panel#login').hide();
        $dom('panel#admin').show().css('opacity', 0);
        window.$skins.onchange();
        loginbox.loading = false;
    }, 1000);
    //树形菜单
    window.tree = $treemenu.create({
        target: '#treemenu-area',
        width: 200
    }).onresize(function (s, e) { //当宽高变更时
        $dom('#tabs-area').width('calc(100% - ' + (e.width + vbar.width + 10) + 'px )');
    }).onfold(function (s, e) { //当右侧树形折叠时
        var width = e.action == 'fold' ? vbar.width + 50 : s.width + vbar.width + 10;
        $dom('#tabs-area').width('calc(100% - ' + width + 'px )');
    }).onclick(nodeClick);

    $dom.get(datasource.tree, function (req) {
        window.tree.add(eval(req));
    });


    //竖形工具条
    window.vbar = $vbar.create({
        target: '#vbar-area',
        id: 'rbar-156',
        width: 30,
        height: 'calc(100% - 35px)'
    }).onclick(nodeClick);
    $dom.get(datasource.vbar, function (req) {
        vbar.add(eval('(' + req + ')'));
    });


    //选项卡
    window.tabsContent = $tabs.create({
        target: '#tabs-area',
        //nowheel: true,
        default: {
            title: '启始页',
            path: '树形菜单,启始页',
            url: 'Help/startpage.html',
            ico: 'a020'
        }
    }).onshut(tabsShut).onchange(tabsChange).onhelp(function (s, e) {
        $pagebox.create({
            pid: e.data.id, //父id,此处必须设置，用于判断该弹窗属于哪个选项卡
            width: 600,
            height: 400,
            url: e.data.help,
            title: e.data.title + '- 帮助'
        }).open();
    });

    //风格切换事件
    window.$skins.onchange(function (s, e) {
        $dom('body>*:not(#loading)').css('opacity', 0);
        $dom('#loading').show();
    });
    window.$skins.onloadcss(function (s, e) {
        window.setTimeout(function () {
            var left = $dom('#dropmenu-area').width() + 10;
            $dom('#headbar').css('opacity', 1).left(left);
            $dom('#headbar').width('calc(100% - ' + left + 'px - ' + (100) + 'px)');
            $dom('body>*:not(#loading)').css('opacity', 1);
            $dom('#loading').hide();
        }, 500);

    });
};
/*
    事件
*/
//节点点击事件，tree,drop,vbar统一用这一个
function nodeClick(sender, eventArgs) {
    var data = eventArgs.data;
    if (data.childs) return; //如果有下级节点，则不响应事件
    //节点类型
    //open：弹窗，item菜单项（在tabs中打开)，event脚本事件,
    //link外链接（直接响应）,node节点下的子项将一次性打开（此处不触发）
    //console.log(eventArgs.data.title);
    switch (data.type) {
        case 'open':
            $pagebox.create(data).open();
            break;
        case 'event':
            if (!data.url) return;
            try {
                eval(data.url);
            } catch (err) {
                alert('脚本执行错误，请仔细检查：\n' + data.url);
            }
            break;
        default:
            if (!!data.url)
                window.tabsContent.add(data);
            break;
    }
}
//选项卡关闭事件
function tabsShut(sender, eventArgs) {
    var data = eventArgs.data;
    //获取当前标签生成的窗体
    var boxs = $ctrls.all('pagebox');
    var arr = new Array();
    for (var i = 0; i < boxs.length; i++) {
        if (boxs[i].obj.pid == data.id) {
            arr.push(boxs[i].obj);
            var childs = boxs[i].obj.getChilds();
            for (var j = 0; j < childs.length; j++) {
                arr.push(childs[j]);
            }
        }
    }
    //关闭当前标签生成的窗体
    if (arr.length > 0) {
        if (confirm('当前选项卡“' + data.title + '”有 ' + arr.length + '个 窗体未关闭，\n是否全部关闭？')) {
            for (var i = 0; i < arr.length; i++) arr[i].shut();
            return true;
        }
        return false;
    }
    return true;
}
//选项卡切换事件
function tabsChange(sender, eventArgs) {
    //获取当前标签生成的窗体，全部还原
    var selfbox = getSelfbox(eventArgs.data.id);
    for (var i = 0; i < selfbox.length; i++) {
        selfbox[i].toWindow().focus(false);
    }
    //非当前标签的窗体，全部最小化
    var elsebox = getElsebox(sender, eventArgs.data.id);
    for (var i = 0; i < elsebox.length; i++) elsebox[i].toMinimize(false);

    //当前标签生成的窗体
    function getSelfbox(tabid) {
        var boxs = $ctrls.all('pagebox');
        //获取当前标签生成的窗体，全部还原
        var arr = new Array();
        for (var i = 0; i < boxs.length; i++) {
            if (boxs[i].obj.pid == tabid) {
                arr.push(boxs[i].obj);
                var childs = boxs[i].obj.getChilds();
                for (var j = 0; j < childs.length; j++)
                    arr.push(childs[j]);
            }
        }
        //按层深排序，以保证在还原时保持窗体原有层叠效果
        for (var i = 0; i < arr.length - 1; i++) {
            for (var j = 0; j < arr.length - 1 - i; j++) {
                if (arr[j].level > arr[j + 1].level) {
                    var temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }
    //非当前标签的窗体(不包括其它控件生成的窗体)
    function getElsebox(sender, tabid) {
        var boxs = $ctrls.all('pagebox');
        var tabs = sender.childs;
        var arr = [];
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].id == tabid) continue;
            for (var j = 0; j < boxs.length; j++) {
                if (boxs[j].obj.pid == tabs[i].id) {
                    arr.push(boxs[j].obj);
                    var childs = boxs[j].obj.getChilds();
                    for (var n = 0; n < childs.length; n++)
                        arr.push(childs[n]);
                }
            }
        }
        return arr;
    }

}
//禁用iframe中的右键菜单
window.addEventListener('load', function () {
    $dom('iframe').each(function () {
        var doc = this.contentDocument.body;
        doc.setAttribute('oncontextmenu', "javascript:return false;");
    });
});