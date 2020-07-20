
$ready(function () {

    var vue = new Vue({
        el: '#app',
        data: {
            //当前登录账号对象
            account: {
                Acc_Name: '管理员',
                Acc_AccName: 'testAccount',
                Acc_NamePinyin: 'GLY',
                Acc_Sex: '1',
                Acc_EmpCode: '10522779',
                Acc_MobileTel: '400 - 6015 615',
                Acc_Tel: '18037155753',
                Acc_Email: '10522779@qq.com',
                Acc_QQ: '10522779',
                Acc_Birthday: new Date()
            },
            accPingyin: [],  //账号名称的拼音
            rules: {
                Acc_Name: [
                    { required: true, message: '姓名不得为空', trigger: 'blur' }
                ],
                newpw: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
                newpw2: [
                    { required: true, message: '请输入新密码', trigger: 'blur' },
                    {
                        validator: function (rule, value, callback) {
                            if (value !== vue.form.newpw) {
                                callback(new Error('两次输入密码不一致!'));
                            } else {
                                callback();
                            }
                        }, trigger: 'blur'
                    }
                ]
            }
        },
        created: function () {
            /*$api.post('Admin/User').then(function (req) {
                if (req.data.success) {
                    var result = req.data.result;
                    vue.account = result;
                } else {
                    throw '未登录，或登录状态已失效';
                }
            }).catch(function (err) {
                alert(err);
            });
*/
        },
        methods: {
            btnEnter: function (formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        vue.$message({
                            type: 'success',
                            message: '修改成功!',
                            center: true
                        });
                    }
                });

            },
            //名称转拼音
            pingyin: function () {
                this.accPingyin = makePy(this.account.Acc_Name);
                if (this.accPingyin.length > 0)
                    this.account.Acc_NamePinyin = this.accPingyin[0];
                //console.log(this.accPingyin);

            },
            handleAvatarSuccess: function (res, file) {
                if (file.status == "success") {
                    this.account.Acc_Photo = res.url;
                    this.btnEnter();
                    //管理后台的右上角图片更换
                    if (top.usermenu)
                        top.usermenu.datas[0].img = res.url;
                }
            },
            beforeAvatarUpload: function (file) {
                //console.log(file);
                const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
                const isLt2M = file.size / 1024 / 1024 < 2;

                if (!isJPG) {
                    this.$message.error('上传头像图片只能是 JPG 格式!');
                }
                if (!isLt2M) {
                    this.$message.error('上传头像图片大小不能超过 2MB!');
                }
                return isJPG && isLt2M;
            }
        },
    });

});
