(function () {
    var box = function () {
        this.width = 100;
        this.height = 200;
        this.name = '名字';
        this.id = 0;
    }

    box.prototype.open = function () {
        for (var t in this.builder) {
            this.builder[t](this);
        }
    }
    box.prototype.builder = {
        //生成随机id
        randomid: function (box) {
            //var id = new Date().getTime() + '_' + Math.random();
            box.id = new Date().getTime();
        },
        //生成外壳
        shell: function (box) {
            var div = document.createElement('div');
            div.setAttribute('boxid', box.id);
            div.setAttribute('class', 'pagebox');
            //alert(box.width)
            div.style.width = box.width + 'px';
            div.style.height = box.height + 'px';
            document.body.appendChild(div)
        },
        //边缘部分，主要是用于控制缩放
        margin: function () {
            //alert('2')
        },
        //标题栏，包括图标、标题文字、关闭按钮，有拖放功能
        title: function () {
            //alert('3')
        },
        //主体内容区
        body: function () {
            //alert('4')
        }
    };
    window.pagebox = box;
})();