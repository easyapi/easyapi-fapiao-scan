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
        mobile: '',
        email: '',
        remark: '',
      },
      willShow: true,
      isHide: true,
      isShow: false,
      dropDownShow: false,
      searchList: [],
      scanItems: [],
      invoicePrice: 0,
      code: '',
      shopName: '', //商户名称
      invoiceCategoryList: [],
      ifNeedMobile: false,
      ifNeedEmail: false,
      isComposing: false,
    }
  },
  computed: {
    ifShowModel() {
      return !this.scanItems.every(item => !item.model)
    },
    ifShowUnit() {
      return !this.scanItems.every(item => !item.unit)
    }
  },
  created() {
    document.title = '扫码开票';
    // 获取二维码的code
    this.code = getQueryString("code");
    this.getScan();
    // 创建防抖函数
    this.debouncedSearchCompanyTitleList = _.debounce(this.searchCompanyTitleList, 500);
  },
  methods: {
    /**
     * 选择微信抬头
     */
    selectWeiXinCompany() {
      axios.get(`https://account-api.easyapi.com/jssdk/wxe89b7b79aa61a423/config?url=${window.location.href}`).then(res => {
        if (res.data) {
          wx.config({
            beta: true,
            timestamp: res.data.timestamp,
            nonceStr: res.data.nonceStr,
            signature: res.data.signature,
            appId: res.data.appId,
            jsApiList: ['chooseInvoiceTitle'],
          })
          wx.ready(() => {
            wx.invoke(
              'chooseInvoiceTitle', {
                scene: '1', // 不是必填  使用场景 1开具发票 2其他
              },
              (res) => {
                const invoiceTitleInfo = res.choose_invoice_title_info
                // 0单位 1个人
                // { "type":"0", "title":"企业名称", "taxNumber":"企业税号", "companyAddress":"地址", "telephone":"手机号", "bankName":"银行", "bankAccount":"银行账号" }
                if (invoiceTitleInfo) {
                  const target = JSON.parse(invoiceTitleInfo)
                  if (target.type === '1') {
                    this.invoiceForm.type = "个人"
                    this.invoiceForm.purchaserName = target.title;
                    this.invoiceForm.purchaserTaxpayerNumber = '';
                    this.invoiceForm.purchaserAddress = '';
                    this.invoiceForm.purchaserPhone = '';
                    this.invoiceForm.purchaserBank = '';
                    this.invoiceForm.purchaserBankAccount = '';
                  } else {
                    this.invoiceForm.type = "企业"
                    this.invoiceForm.purchaserName = target.title;
                    this.invoiceForm.purchaserTaxpayerNumber = target.taxNumber;
                    this.invoiceForm.purchaserAddress = target.companyAddress;
                    this.invoiceForm.purchaserPhone = target.telephone;
                    this.invoiceForm.purchaserBank = target.bankName;
                    this.invoiceForm.purchaserBankAccount = target.bankAccount;
                  }
                }
              },
            )
          })
          wx.error((error) => {
            vant.showToast(JSON.stringify(error))
          })
        }
      })
    },
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
          name: '数电普',
          color: '#00b2c8',
          bgColor: '#f2fbff'
        }
      if (invoiceCategory === '全电电子专用发票')
        return {
          name: '数电专',
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
        this.invoiceForm.purchaserTaxpayerNumber = "";
        this.invoiceForm.purchaserAddress = "";
        this.invoiceForm.purchaserPhone = "";
        this.invoiceForm.purchaserBank = "";
        this.invoiceForm.purchaserBankAccount = "";
        this.invoiceForm.companyId = "";
      }
    },
    handleInput() {
      if (!this.isComposing) {
        this.debouncedSearchCompanyTitleList();
      }
    },
    handleCompositionStart() {
      this.isComposing = true;
    },
    handleCompositionEnd() {
      this.isComposing = false;
      this.debouncedSearchCompanyTitleList();
    },
    /**
     * 企业抬头查询
     */
    async searchCompanyTitleList() {
      if (this.invoiceForm.purchaserName.length < 4) {
        this.searchList = []
        this.dropDownShow = false;
        return;
      }
      let accessToken = await this.getAccessToken().then()
      axios.get("https://fapiao-api.easyapi.com/company/codes", {
        params: {
          accessToken: accessToken,
          name: this.invoiceForm.purchaserName
        }
      }).then(res => {
        if (res.data.code === 1) {
          this.searchList = res.data.content;
          this.dropDownShow = true;
        } else {
          this.dropDownShow = false;
        }
      }).catch(error => {
        this.dropDownShow = false;
      });
    },
    /**
     * 选择发票抬头
     */
    chooseCompany(index) {
      this.invoiceForm.purchaserName = this.searchList[index].name;
      this.invoiceForm.purchaserTaxpayerNumber = this.searchList[index].taxNumber;
      this.invoiceForm.purchaserAddress = this.searchList[index].address;
      this.invoiceForm.purchaserPhone = this.searchList[index].phone;
      this.invoiceForm.purchaserBank = this.searchList[index].bank;
      this.invoiceForm.purchaserBankAccount = this.searchList[index].bankAccount;
      this.dropDownShow = false;
    },
    /**
     * 发票抬头失焦后
     */
    inputBlur() {
      this.dropDownShow = false;
    },
    /**
     * 获取获取二维码小票信息
     */
    getScan() {
      vant.showLoadingToast({
        message: '加载中...',
        forbidClick: true,
        overlay: true,
        duration: 0,
      })
      axios.get("https://fapiao-api.easyapi.com/scan/code/" + this.code, {
        params: {}
      }).then(res => {
        let data = res.data.content
        if (data.invoice && data.invoice.invoiceId) {
          window.location.href = "invoice.html?invoiceId=" + data.invoice.invoiceId + '&accessToken=' + data.accessToken
        }
        this.shopName = data.shopName
        if (data.invoice) this.invoiceForm = data.invoice
        this.invoiceForm.outOrderNo = data.shopNo;
        this.invoiceForm.remark = data.remark;
        this.invoiceForm.type = '企业'
        this.invoicePrice = data.price ? data.price : 0
        this.scanItems = data.items;
        this.settingFind(data.accessToken)
        if (data.category) {
          vant.closeToast()
          this.invoiceCategoryList = [data.category]
          this.changeInvoiceCategory(data.category)
        } else {
          this.getInvoiceCategoryList(data.accessToken)
        }
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
          res.data.content.forEach(item => {
            if (item.fieldKey === 'h5_pc_invoice_categories') {
              this.invoiceCategoryList = JSON.parse(item.fieldValue)
              this.changeInvoiceCategory(this.invoiceCategoryList[0])
            }
          })
        } else {
          this.invoiceCategoryList = []
        }
      }).catch(error => {
        vant.closeToast()
        vant.showToast(error.response.data.message)
      })
    },
    /**
     * 获取是否需要填写手机号码邮箱
     */
    settingFind(accessToken) {
      axios.get("https://fapiao-api.easyapi.com/setting/find", {
        params: {
          accessToken: accessToken,
          fieldKeys: 'if_need_mobile,if_need_email'
        }
      }).then(res => {
        vant.closeToast()
        if (res.data.code === 1) {
          res.data.content.forEach(item => {
            if (item.fieldKey === 'if_need_mobile') {
              this.ifNeedMobile = item.fieldValue === 'true'
            }
            if (item.fieldKey === 'if_need_email') {
              this.ifNeedEmail = item.fieldValue === 'true'
            }
          })
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

      if (!checkEmailMobile(this.invoiceForm, this.ifNeedMobile, this.ifNeedEmail)) return

      if (!this.invoiceForm.email && !this.invoiceForm.mobile) {
        return vant.showToast('邮箱账号或手机号码必填一个')
      }

      vant.showConfirmDialog({
        title: '提示',
        message: '确认抬头和金额正确并申请开票吗？',
      }).then(async () => {
        vant.showLoadingToast({
          message: '开票中...',
          forbidClick: true,
          overlay: true,
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
