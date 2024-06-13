const appHtml = {
  data() {
    return {
      invoiceId: null,
      accessToken: null,
      invoiceDetail: {},
      attachList: [],
      popupVisible: false,
      copyInfo: ''
    };
  },
  created() {
    this.invoiceId = getQueryString("invoiceId")
    this.accessToken = getQueryString("accessToken")
    this.getInvoiceDetail()
  },
  methods: {
    /**
     * 获取发票详情
     */
    getInvoiceDetail() {
      let that = this
      vant.showLoadingToast({
        message: '加载中...',
        forbidClick: true,
        overlay: true,
        duration: 0,
      })
      axios.get(`https://fapiao-api.easyapi.com/invoice/${that.invoiceId}`, {
        params: {
          accessToken: that.accessToken,
        }
      }).then(res => {
        vant.closeToast()
        if (res.data.code === 1) {
          invoiceStateList.forEach(item => {
            if (res.data.content.statements === item.value) {
              res.data.content.statements = item
            }
          });
          that.invoiceDetail = res.data.content
          that.attachList = res.data.content.invoiceExtends && res.data.content.invoiceExtends.length > 0 ? res.data.content.invoiceExtends.filter(item => item.fieldKey === 'attch' && item.fieldValue)[0].fieldValue.split(',') : []
          that.copyInfo = that.copyText(res.data.content)
        }
      }).catch(error => {
        vant.closeToast()
        vant.showToast(error.response.data.message)
      })
    },
    viewImagePreview(imgs) {
      vant.showImagePreview(imgs)
    },
    /**
     * 查看发票
     */
    viewPicture() {
      if (this.invoiceDetail.state === 1)
        this.popupVisible = true
      else
        vant.showToast(`发票${this.invoiceDetail.statements.text}`)
    },
    copyText(invoice) {
      return `${invoice.purchaserName}
       收到一张发票，${invoice.category} 
       ${invoice.price}元，开票日期：${invoice.printTime ? invoice.printTime.substring(0, 10) : ''}，
       ${invoice.code ? `发票代码：${invoice.code}，` : ''}${invoice.number ? `发票号码：${invoice.number}，` : ''}
       ${invoice.allElectronicInvoiceNumber ? `全电号码：${invoice.allElectronicInvoiceNumber}，` : ''}
       下载地址：${invoice.electronicInvoiceUrl}`
    },
    /**
     * 复制
     */
    copyLink() {
      var clipboard = new ClipboardJS('.copyPdfUrl');
      clipboard.on('success', () => {
        vant.showToast('复制成功')
      });
      clipboard.on('error', () => {
        ant.showToast('复制失败')
      });
    }
  },
};
// 创建
const app = Vue.createApp(appHtml);
// 引入vant组件
app.use(vant);
// 自动注册 Lazyload 组件
app.use(vant.Lazyload);
app.use(vant.Button);
app.use(vant.Grid);
app.use(vant.GridItem);
app.use(vant.Cell);
app.use(vant.CellGroup);
app.use(vant.popup);

// 空状态
app.use(vant.Empty);

app.mount("#app");
