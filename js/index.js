// import { webOrderDefaultUrl } from '../api/api-list';
var vm = new Vue({
    el: '#app',
    data() {
        return {
            current: 0,
            willShow: true,
            dropDownShow: false,
            accessToken: '',
            taxNumber: '',
            mobile: '',
            NeedMobile: true,
            type: '',
            email: '',
            NeedEmail: true,
            purchaserName: '',
            address: '',
            phone: '',
            purchaserBank: '',
            purchaserTaxpayerNumber: '',
            companyID: '',
            kpName: '',
            upResult: {},
            searchList: [],
            sendType: '企业',
            scanList: '',
            scanContent: "",
            remark: '',
            code: '',
            disabled: false,
            disabledBtn: 0
        }
    },
    created() {
        // 获取二维码的code
        this.code = this.GetQueryString("code");
        localStorage.setItem("accessToken", this.accessToken);
        // this.taxNumber = '91320211MA1WML8X6T';
        localStorage.setItem("taxNumber", this.taxNumber);
        this.getScan();
        // this.searchDefaultImfor();

    },
    methods: {
        // 获取地址栏URL参数
        GetQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        },
        // 切换个人与单位
        tabChange(index) {
            this.current = index;
            index == 0 ? this.sendType = "企业" : this.sendType = "个人";
            if (this.willShow == true && this.sendType == "个人") {
                this.willShow = false;
            } else if (this.willShow == false && this.sendType == "企业") {
                this.willShow = true;
            }
            console.log(this.sendType);
        },
        // 企业抬头查询
        searchRiseList() {
            axios.get("https://fapiao-api.easyapi.com/company/codes", {
                params: {
                    accessToken: this.accessToken,
                    taxNumber: this.taxNumber,
                    kpName: this.purchaserName
                }
            }).then(res => {
                console.log(res)
                this.searchList = res.data.content;

                console.log(this.searchList)
                this.dropDownShow = true;
            }).catch(error => {
                console.log(error)
                //   MessageBox('提示', error.response.data.message);
            });
        },
        chooseRise(index) {
            console.log(index)
            this.purchaserName = this.searchList[index].kpName;
            this.address = this.searchList[index].kpAddr;
            this.phone = this.searchList[index].kpTel;
            this.purchaserBank = this.searchList[index].accountBank;
            this.purchaserTaxpayerNumber = this.searchList[index].kpCode;
            console.log(this.searchList[index])
            // this.searchList = [];
            this.dropDownShow = false;
        },
        // 获取获取二维码小票信息
        getScan() {
            axios.get("https://fapiao-api.easyapi.com/scan/" + this.code, {
                params: {}
            }).then(res => {
                console.log(res);
                this.scanContent = res.data.content;
                this.accessToken = this.scanContent.accessToken;
                this.taxNumber = this.scanContent.taxNumber;
                this.scanList = res.data.content.invoiceScanItems;
                this.remark = this.scanContent.remark;
            }).catch(error => {
                console.log(error)
            });
        },
        // 提交开票
        saveAndUpload() {
            this.disabled = false;
            //手机号验证
            let reg = 11 && /^((13|14|15|17|18)[0-9]{1}\d{8})$/;
            if (this.NeedMobile === true) {
                if (this.mobile === '') {
                    // this.disabled = true;
                    return alert("请输入手机号码");
                } else if (!reg.test(this.mobile)) {
                    // this.disabled = true;
                    return alert("手机格式不正确");
                }
            } else {
                if (this.mobile) {
                    if (!reg.test(this.mobile)) {
                        // this.disabled = true;
                        return alert("手机格式不正确");
                    }
                }
            }
            //验证邮箱
            let regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            if (this.NeedEmail === true) {
                if (this.email === '') {
                    // this.disabled = true;
                    return alert("请输入邮箱");
                } else if (!regEmail.test(this.email)) {
                    // this.disabled = true;
                    return alert("邮箱格式不正确");
                }
            } else {
                if (this.email) {
                    if (!regEmail.test(this.email)) {
                        // this.disabled = true;
                        return alert("邮箱格式不正确");
                    }
                }
            }
            this.upResult.email = this.email;
            this.upResult.addrMobile = this.mobile;
            this.upResult.purchaserName = this.purchaserName;
            this.upResult.purchaserTaxpayerNumber = this.purchaserTaxpayerNumber;
            this.upResult.buyerAddress = this.address;
            this.upResult.buyerPhone = this.phone;
            this.upResult.purchaserBank = this.purchaserBank;
            this.upResult.accessToken = this.accessToken;
            this.upResult.taxNumber = this.taxNumber;
            this.upResult.type = this.sendType;
            axios.put("https://fapiao-api.easyapi.com/scan/" + this.code,
                this.upResult
            ).then(res => {
                window.location.href = "success.html";
                console.log(res);
                this.disabledBtn = -1;
                this.disabled = "true";
            }).catch(error => {
                console.log(error);
                alert("开票失败，请检查和填写信息完整！");
            });
        }
    }
});