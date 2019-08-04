var vm = new Vue({
  el: '#app',
  data() {
    return {
      current: 0,
      willShow: true,
      dropDownShow: false,
      accessToken: '',
      mobile: '',
      NeedMobile: true,
      type: '',
      email: '',
      NeedEmail: true,
      name: '',
      taxNumber: '',
      address: '',
      phone: '',
      bank: '',
      bankAccount: '',
      companyID: '',
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
    this.getScan();
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
    },
    // 企业抬头查询
    searchCompanyTitleList() {
      axios.get("https://fapiao-api.easyapi.com/company/codes", {
        params: {
          accessToken: this.accessToken,
          name: this.name
        }
      }).then(res => {
        this.searchList = res.data.content;
        this.dropDownShow = true;
      }).catch(error => {
        console.log(error)
      });
    },
    chooseCompanyTitle(index) {
      this.name = this.searchList[index].name;
      this.taxNumber = this.searchList[index].taxNumber;
      this.address = this.searchList[index].address;
      this.phone = this.searchList[index].phone;
      this.bank = this.searchList[index].bank;
      this.bankAccount = this.searchList[index].bankAccount;
      this.dropDownShow = false;
    },
    // 获取获取二维码小票信息
    getScan() {
      axios.get("https://fapiao-api.easyapi.com/scan/code/" + this.code, {
        params: {}
      }).then(res => {
        this.scanContent = res.data.content;
        this.accessToken = this.scanContent.accessToken;
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
      this.upResult.purchaserName = this.name;
      this.upResult.purchaserTaxpayerNumber = this.taxNumber;
      this.upResult.purchaserAddress = this.address;
      this.upResult.purchaserPhone = this.phone;
      this.upResult.purchaserBank = this.bank;
      this.upResult.purchaserBankAccount = this.bankAccount;
      this.upResult.accessToken = this.accessToken;
      this.upResult.taxNumber = this.taxNumber;
      this.upResult.type = this.sendType;
      axios.put("https://fapiao-api.easyapi.com/scan/" + this.code + "/make",
        this.upResult
      ).then(res => {
        window.location.href = "success.html";
        this.disabledBtn = -1;
        this.disabled = "true";
      }).catch(error => {
        console.log(error);
        alert("开票失败，请检查和填写信息完整！");
      });
    }
  }
});