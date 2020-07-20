// 页面顶部的按钮条
//参数：
//show:显示哪些按钮，中文加逗号
//selects: 选中的数据，用于编辑或删除时
//idkey:数据对象中的ID的键名，用于取selects中的id值
//path:要打开的窗体的页面路路，width和height即窗口宽高
Vue.component('btngroup', {
    props: ['show', 'selects', 'idkey', 'width', 'height', 'path'],
    data: function () {
        // data 选项是一个函数，组件不相互影响
        return {
            buttons: [{
                text: '新增',
                id: 'add',
                type: 'success',
                class: 'el-icon-plus'
            }, {
                text: '修改',
                id: 'modify',
                type: 'primary',
                class: 'el-icon-edit'
            }, {
                text: '删除',
                id: 'delete',
                type: 'danger',
                class: 'el-icon-delete'
            }, {
                text: '导入',
                id: 'input',
                type: 'info',
                class: 'el-icon-folder-add'
            }]
        }
    },
    watch: {
        'selects': function (val, old) {
            //console.log(val);
        }
    },
    methods: {
        //显示哪些按钮 btnname为按钮名称
        visible: function (btnname) {
            if (this.show == null) return true;
            if (btnname == this.show) return true;
            var arr = this.show.split(',');
            for (var t in arr) {
                if (btnname == arr[t]) return true;
            }
            return false;
        },
        eventClick: function (btnid) {
            //当前点击的按钮
            var curr = this.getCurrbtn(btnid);
            if (btnid == 'add' || btnid == 'modify') {
                if (!top.$pagebox) {
                    this.$message({
                        message: '未找到pagebox.js对象',
                        type: 'error'
                    });
                    return;
                }
            }
            if (btnid == 'add') this.add();     //添加            
            if (btnid == 'modify') this.modify(this.getid());       //修改            
            if (btnid == 'delete') return this.delete(this.getids(), curr);    //删除
            this.$emit(btnid, {}, curr);
        },
        //添加按钮事件
        add: function () {
            if (!(top.$pagebox && this.path)) return;
            var pbox = top.$pagebox.create({
                width: this.width ? this.width : 400,
                height: this.height ? this.height : 300,
                url: this.getfullpath(),
                pid: window.name,
                id: window.name + '[add]',
                title: $dom('title').text() + ' - 新增'
            });
            pbox.open();
        },
        //修改事件
        modify: function (id) {
            if (id == '') {
                this.$message({
                    message: '请选中要编辑的数据行',
                    type: 'error'
                });
                return;
            }
            if (!this.path) {
                this.$message({
                    message: '未设置编辑页的路径',
                    type: 'error'
                });
                return;
            }
            var pbox = top.$pagebox.create({
                width: this.width ? this.width : 400,
                height: this.height ? this.height : 300,
                url: this.getfullpath(id),
                pid: window.name,
                id: window.name + '_' + id + '[modify]',
                title: $dom('title').text() + ' - 修改'
            });
            pbox.open();
        },
        //删除事件
        delete: function (ids, btn) {
            var arr = ids.split(',');
            if (ids == '' || arr.length < 1) {
                this.$message({
                    message: '请选中要操作的数据行',
                    type: 'error'
                });
                return false;
            }
            this.$confirm('是否确认删除这 ' + arr.length + ' 项数据? 请谨慎操作！', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$emit('delete', ids, btn);
            });
        },
        //当前点击的按钮
        getCurrbtn: function (btnid) {
            var curr = {};
            for (var t in this.buttons) {
                if (this.buttons[t].id == btnid) {
                    curr = this.buttons[t];
                    break;
                }
            }
            return curr;
        },
        //获取id
        getid: function () {
            if (!this.idkey || !this.selects || this.selects.length < 1) return '';
            var id = !!this.selects[0][this.idkey] ? this.selects[0][this.idkey] : '';
            return id;
        },
        //获取多个id，用逗号分隔
        getids: function () {
            if (!this.idkey || !this.selects || this.selects.length < 1) return '';
            var str = '';
            for (var i = 0; i < this.selects.length; i++) {
                var id = !!this.selects[i][this.idkey] ? this.selects[i][this.idkey] : '';
                if (id == '') continue;
                str += i < this.selects.length - 1 ? id + ',' : id;
            }
            return str;
        },
        //获取完整的页面路径
        getfullpath: function (id) {
            var file = this.path;
            var url = String(window.document.location.href);
            url = url.substring(0, url.lastIndexOf("/") + 1);
            var path = file;
            if (path.substring(0, 1) != "/") path = url + file;
            //添加参数
            if (!id) return path;
            path += path.indexOf("?") < 0 ? '?' : '&';
            return path + 'id=' + id;
        },
        test: function (t) {
            console.log('来自btngruop组件：' + t);
        }
    },
    template: '<div class="btngroup"><el-button-group>\
    <el-button v-for="(btn,index) in buttons" :key="index" :type="btn.type"  size="medium" plain v-on:click="eventClick(btn.id)"\
    :class="btn.class" v-if="visible(btn.text)"> &nbsp; {{btn.text}}</el-button>\
    </el-button-group></div>'
});
