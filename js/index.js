var vm = new Vue({
  el: '#app',
  data() {
    return {
      current: 0,
      invoiceForm: {
        type: "",
        purchaserName: '',
        purchaserTaxpayerNumber: '',
        purchaserAddress: '',
        purchaserPhone: '',
        purchaserBank: '',
        purchaserBankAccount: '',
        mobile: '',
        email: '',
        remark: '',
      },
      willShow: true,
      isHide: true,
      isShow: false,
      dropDownShow: false,
      accessToken: '',
      ifNeedMobile: true,
      ifNeedEmail: true,
      nameTemp: '',
      upResult: {},
      searchList: [],
      sendType: '企业',
      scanList: '',
      scanContent: {price: 0},
      code: '',
      disabled: false,
      companyNameShow: ''
    }
  },
  created() {
    // 获取二维码的code
    this.code = this.GetQueryString("code");
    localStorage.setItem("accessToken", this.accessToken);
    this.getScan();
  },
  methods: {
    //展示更多
    purchaserMore() {
      this.isShow = true;
      this.isHide = false;
    },
    //隐藏
    purchaserMoreHide() {
      this.isShow = false;
      this.isHide = true;
    },
    submit() {
      console.log(111)
    },
    selectType() {
      localStorage.setItem("type", this.invoiceForm.type);
      if (this.invoiceForm.type === "企业") {
        this.invoiceForm.purchaserName = "";
        this.willShow = true
      } else if (this.invoiceForm.type === "个人") {
        this.willShow = false
        this.invoiceForm.purchaserName = "个人";
        this.invoiceForm.purchaserTaxpayerNumber = "";
        this.invoiceForm.address = "";
        this.invoiceForm.phone = "";
        this.invoiceForm.purchaserBank = "";
        this.invoiceForm.purchaserBankAccount = "";
        this.invoiceForm.companyId = "";
      }
    },
    // 获取地址栏URL参数
    GetQueryString(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return unescape(r[2]);
      return null;
    },
    // 企业抬头查询
    searchCompanyTitleList() {
      axios.get("https://fapiao-api.easyapi.com/company/codes", {
        params: {
          accessToken: this.accessToken,
          name: this.invoiceForm.purchaserName
        }
      }).then(res => {
        this.searchList = res.data.content;
        this.dropDownShow = true;
        this.companyNameShow = ''
      }).catch(error => {
        console.log(error);
        this.companyNameShow = ''
      });
    },
    chooseCompanyTitle(index) {
      this.invoiceForm.purchaserName = this.searchList[index].name;
      this.invoiceForm.purchaserTaxpayerNumber = this.searchList[index].taxNumber;
      this.address = this.searchList[index].address;
      this.phone = this.searchList[index].phone;
      this.bank = this.searchList[index].bank;
      this.bankAccount = this.searchList[index].bankAccount;
      this.dropDownShow = false;
      this.companyNameShow = this.invoiceForm.purchaserName
    },
    //发票抬头失焦后
    inputBlur() {
      this.dropDownShow = false;
      let has;
      has = false;
      for (let i = 0; i < this.searchList.length; i++) {
        if (this.searchList[i].name === this.invoiceForm.purchaserName) {
          has = true;
        }
      }
      if (!has) {
        this.invoiceForm.purchaserTaxpayerNumber = '';
        this.invoiceForm.purchaserAddress = '';
        this.invoiceForm.purchaserPhone = '';
        this.invoiceForm.purchaserBank = '';
        this.invoiceForm.purchaserBankAccount = '';
      }
    },
    // 获取获取二维码小票信息
    getScan() {
      axios.get("https://fapiao-api.easyapi.com/scan/code/" + this.code, {
        params: {}
      }).then(res => {
        if (res.data.content.state == -1 || res.data.content.state == -2) {
          window.location.href = "expire.html";
        }
        if (res.data.content.state == 1) {
          window.location.href = "invoice.html?pdfUrl=" + res.data.content.invoice.pdfUrl + "&imgUrl=" + res.data.content.invoice.imgUrl;
        }
        this.scanContent = res.data.content;
        this.accessToken = this.scanContent.accessToken;
        this.scanList = res.data.content.invoiceScanItems;
        this.invoiceForm.remark = this.scanContent.remark;
      }).catch(error => {
        console.log(error)
      });
    },
    // 提交开票
    makeInvoice() {
      this.disabled = false;
      //手机号验证
      let reg = 11 && /^((13|14|15|17|18)[0-9]{1}\d{8})$/;
      if (this.ifNeedMobile === true) {
        if (this.invoiceForm.mobile === '') {
          return alert("请输入手机号码");
        } else if (!reg.test(this.invoiceForm.mobile)) {
          return alert("手机格式不正确");
        }
      } else {
        if (this.invoiceForm.mobile) {
          if (!reg.test(this.invoiceForm.mobile)) {
            return alert("手机格式不正确");
          }
        }
      }
      //验证邮箱
      let regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
      if (this.ifNeedEmail === true) {
        if (this.invoiceForm.email === '') {
          return alert("请输入邮箱");
        } else if (!regEmail.test(this.invoiceForm.email)) {
          return alert("邮箱格式不正确");
        }
      } else {
        if (this.invoiceForm.email) {
          if (!regEmail.test(this.invoiceForm.email)) {
            return alert("邮箱格式不正确");
          }
        }
      }
      this.upResult.email = this.invoiceForm.email;
      this.upResult.addrMobile = this.invoiceForm.mobile;
      this.upResult.purchaserName = this.invoiceForm.purchaserName;
      this.upResult.purchaserTaxpayerNumber = this.invoiceForm.purchaserTaxpayerNumber;
      this.upResult.purchaserAddress = this.address;
      this.upResult.purchaserPhone = this.phone;
      this.upResult.purchaserBank = this.bank;
      this.upResult.purchaserBankAccount = this.bankAccount;
      this.upResult.accessToken = this.accessToken;
      this.upResult.type = this.sendType;
      axios.put("https://fapiao-api.easyapi.com/scan/" + this.code + "/make",
        this.upResult
      ).then(res => {
        window.location.href = "success.html";
        this.disabled = "true";
      }).catch(error => {
        console.log(error);
        alert("开票失败，请检查和填写信息完整！");
      });
    }
  }
});
