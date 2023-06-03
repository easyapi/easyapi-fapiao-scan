const appHtml = {

  data() {
    return {
      invoiceForm: {
        outOrderNo: 'MA' + new Date().getTime(),
        type: "企业",
        category: '',
        purchaserName: '',
        purchaserTaxpayerNumber: '',
        purchaserAddress: '',
        purchaserPhone: '',
        purchaserBank: '',
        purchaserBankAccount: '',
        addrMobile: '',
        email: '',
        remark: '',
      },
      willShow: true,
      isHide: true,
      isShow: false,
      dropDownShow: false,
      searchList: [],
      invoiceItems: [],
      invoicePrice: 0,
      code: '',
      companyNameShow: '',
      invoiceCategoryList: [],
      selectInvoiceCategory: ''
    }
  },
  created() {
    // 获取二维码的code
    this.code = getQueryString("code");
    this.getScan();
  },
  methods: {
    invoiceTag(invoiceCategory) {
      if (invoiceCategory === '增值税电子普通发票')
        return {
          name: '电普',
          color: '#00b2c8',
          bgColor: '#f2fbff'
        }
      if (invoiceCategory === '增值税普通发票')
        return {
          name: '普票',
          color: '#1950a5',
          bgColor: '#edf1fa'
        }
      if (invoiceCategory === '增值税电子专用发票')
        return {
          name: '电专',
          color: '#266253',
          bgColor: '#dbf5eb'
        }
      if (invoiceCategory === '增值税专用发票')
        return {
          name: '专票',
          color: '#266253',
          bgColor: '#dbf5eb'
        }
      if (invoiceCategory === '全电电子普通发票')
        return {
          name: '全电普',
          color: '#00b2c8',
          bgColor: '#f2fbff'
        }
      if (invoiceCategory === '全电电子专用发票')
        return {
          name: '全电专',
          color: '#665823',
          bgColor: '#f8f4e5'
        }
    },
    changeInvoiceCategory(row) {
      this.invoiceForm.category = row
    },
    /**
     * 展示更多
     */
    purchaserMore() {
      this.isShow = true;
      this.isHide = false;
    },
    /**
     * 隐藏
     */
    purchaserMoreHide() {
      this.isShow = false;
      this.isHide = true;
    },
    /**
     * 获取accessToken
     */
    getAccessToken() {
      let that = this
      return new Promise(function (resolve) {
        axios.get("https://fapiao-api.easyapi.com/scan/code/" + that.code).then(res => {
          if (res.data.code === 1) {
            resolve(res.data.content.accessToken);
          }
        })
      });
    },
    /**
     * 选择抬头类型
     */
    selectType() {
      localStorage.setItem("type", this.invoiceForm.type);
      if (this.invoiceForm.type === "企业") {
        this.willShow = true
      } else if (this.invoiceForm.type === "个人") {
        this.willShow = false
        this.invoiceForm.purchaserName = "";
        this.invoiceForm.purchaserTaxpayerNumber = "";
        this.invoiceForm.purchaserAddress = "";
        this.invoiceForm.purchaserPhone = "";
        this.invoiceForm.purchaserBank = "";
        this.invoiceForm.purchaserBankAccount = "";
        this.invoiceForm.companyId = "";
      }
    },
    /**
     * 企业抬头查询
     */
    async searchCompanyTitleList() {
      if (this.invoiceForm.purchaserName.length < 4) {
        return;
      }
      let accessToken = await this.getAccessToken().then()
      axios.get("https://fapiao-api.easyapi.com/company/codes", {
        params: {
          accessToken: accessToken,
          name: this.invoiceForm.purchaserName
        }
      }).then(res => {
        if (res.data.code === 0) {
          return;
        }
        this.searchList = res.data.content;
        this.dropDownShow = true;
        this.companyNameShow = ''
      }).catch(error => {
        vant.showToast(error.response.data.message)
        this.companyNameShow = ''
      });
    },
    /**
     * 选择发票抬头
     */
    chooseCompanyTitle(index) {
      this.invoiceForm.purchaserName = this.searchList[index].name;
      this.invoiceForm.purchaserTaxpayerNumber = this.searchList[index].taxNumber;
      this.invoiceForm.purchaserAddress = this.searchList[index].address;
      this.invoiceForm.purchaserPhone = this.searchList[index].phone;
      this.invoiceForm.purchaserBank = this.searchList[index].bank;
      this.invoiceForm.purchaserBankAccount = this.searchList[index].bankAccount;
      this.dropDownShow = false;
      this.companyNameShow = this.invoiceForm.purchaserName
    },
    /**
     * 发票抬头失焦后
     */
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
    /**
     * 获取获取二维码小票信息
     */
    getScan() {
      vant.showLoadingToast({
        message: '加载中...',
        forbidClick: true,
        duration: 0,
      })
      axios.get("https://fapiao-api.easyapi.com/scan/code/" + this.code, {
        params: {}
      }).then(res => {
        let data = res.data.content
        if (data.state === -1 || data.state === -2) {
          window.location.href = "expire.html";
        }
        if (data.state === 1) {
          window.location.href = "invoice.html?pdfUrl=" + data.invoice.pdfUrl + "&imgUrl=" + data.invoice.imgUrl;
        }
        if (data.invoice) this.invoiceForm = data.invoice
        this.invoiceForm.remark = data.remark;
        this.invoiceForm.type = '企业'
        this.invoicePrice = data.price ? data.price : 0
        this.invoiceItems = data.items;
        this.getInvoiceCategoryList(data.accessToken)
      }).catch(error => {
        vant.showToast(error.response.data.message)
      });
    },
    /**
     * 获取发票类型
     */
    getInvoiceCategoryList(accessToken) {
      axios.get("https://fapiao-api.easyapi.com/setting/find", {
        params: {
          accessToken: accessToken,
          fieldKeys: 'h5_pc_invoice_categories'
        }
      }).then(res => {
        vant.closeToast()
        if (res.data.code === 1) {
          this.invoiceCategoryList = JSON.parse(res.data.content[0].fieldValue)
        } else {
          this.invoiceCategoryList = []
        }
      }).catch(error => {
        vant.closeToast()
        vant.showToast(error.response.data.message)
      })
    },
    /**
     * 提交开票
     */
    makeInvoice() {
      if (!this.invoiceForm.category) {
        return vant.showToast('请选择发票类型')
      }
      if (!this.invoiceForm.purchaserName) {
        return vant.showToast('请输入发票抬头')
      }
      if (this.invoiceForm.type === '企业') {
        if (!this.invoiceForm.purchaserTaxpayerNumber) {
          return vant.showToast('请输入税号')
        }
      }
      if (!checkEmailMobile(this.invoiceForm)) return
      vant.showConfirmDialog({
        title: '提示',
        message: '确认抬头和金额正确并申请开票吗？',
      }).then(async () => {
        vant.showLoadingToast({
          message: '开票中...',
          forbidClick: true,
          duration: 0,
        })
        //重新获取accessToken
        let accessToken = await this.getAccessToken().then()
        let data = {
          ...this.invoiceForm,
          accessToken: accessToken
        }
        axios.put("https://fapiao-api.easyapi.com/scan/" + this.code + "/make", data).then(res => {
          vant.closeToast()
          window.location.href = "submit.html";
        }).catch(error => {
          vant.closeToast()
          vant.showToast(error.response.data.message);
        });
      })
    }
  }
}
// 创建
const app = Vue.createApp(appHtml)
// 引入vant组件
app.use(vant);
// 自动注册 Lazyload 组件
app.use(vant.Lazyload);
app.use(vant.Button);
app.use(vant.Grid);
app.use(vant.GridItem);
app.use(vant.NoticeBar);
app.use(vant.Cell);
app.use(vant.CellGroup);

// 空状态
app.use(vant.Empty);

app.mount('#app');
