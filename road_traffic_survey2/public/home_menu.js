// type MButtonOptions =
//   | {
//       type: string // 按钮类型
//       title?: string // 按钮标题
//       path?: string // 路径
//       msg?: string // 消息文字
//       record?: boolean // 是否记录热门
//       activeClass?: string // 激活样式
//       to?: {} // 路由跳转参数
//     }
//   | {
//       type: 'a' // 直接跳转 path 地址
//       title: string
//       path: string
//       record: boolean
//       activeClass: string
//     }
//   | {
//       type: 'iframe' // 弹窗显示 path 
//       title: string
//       msg: string
//       path: string
//       record: boolean
//       activeClass: string
//     }
//   | {
//       type: 'router' // 跳转项目内部定义的页面
//       title: string
//       record: boolean
//       activeClass: string
//       to: {}
//     }
//   | {
//       type: 'message' // 弹窗显示消息
//       title: string
//       msg: string
//       record: boolean
//       activeClass: string
//     }
//   | {
//       type: 'pdf' // 弹窗 pdf 添加水印
//       title: string
//       record: boolean
//       activeClass: string
//     }
//   | {
//       type: 'btn' // 纯按钮，要配合前端代码添加点击逻辑
//       title: string
//       record: boolean
//       activeClass: string
//     }

/************************ 数据库 ************************/
var win_sjk_list = [
  {
    title: '城市底座',
    children: [
      {
        title: '区划边界',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `城市底座,区划边界,行政边界_广州_区级` },
        },
      },
      {
        title: '城市用地',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `城市底座,城市用地,现状用地` },
        },
      },
      {
        title: '建筑白膜',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `城市底座,建筑白膜` },
        },
      },
    ],
  },
  {
    title: '交通调查',
    children: [
      {
        title: '拍照图片',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `交通调查,拍照图片` },
        },
      },
      {
        title: '路段流量',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `交通调查,路段流量` },
        },
      },
      {
        title: '交叉口流量',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `交通调查,交叉口流量` },
        },
      },
    ],
  },
  {
    title: '职住通勤',
    children: [
      {
        title: '高德通勤',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `职住通勤,高德通勤` },
        },
      },
      {
        title: '普查人口',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `职住通勤,普查人口` },
        },
      },
    ],
  },
  {
    title: '道路交通',
    children: [
      {
        title: 'OSM路网',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `道路交通,城市路网,OSM路网,2025年` },
        },
      },
      {
        title: '四维图新导航级路网',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `道路交通,城市路网,四维图新导航级路网` },
        },
      },
      {
        title: '路况态势',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `道路交通,路况态势` },
        },
      },
    ],
  },
  {
    title: '公共交通',
    children: [
      {
        title: 'PTAL',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `公共交通,PTAL,越秀` },
        },
      },
      {
        title: '地铁线网',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `公共交通,地铁线网` },
        },
      },
      {
        title: '常规公交线网',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `公共交通,常规公交线网` },
        },
      },
      {
        title: '铁路线网',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `公共交通` },
        },
      },
    ],
  },
  {
    title: '货运物流',
    children: [
      {
        title: '货车轨迹',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `货运物流,货车轨迹` },
        },
      },
      {
        title: '末端物流网点',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `货运物流,末端物流网点` },
        },
      },
    ],
  },
  {
    title: '设施场所',
    children: [
      {
        title: '企业地址',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `设施场所,企业地址` },
        },
      },
      {
        title: 'A级景区',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `设施场所,A级景区` },
        },
      },
      {
        title: '医疗卫生机构',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `设施场所,医疗卫生机构` },
        },
      },
      {
        title: '星级酒店',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `设施场所,星级酒店` },
        },
      },
      {
        title: '高速服务区',
        type: 'router',
        to: {
          name: 'download',
          query: { open: `设施场所,高速服务区` },
        },
      },
    ],
  },
]
/************************ 模型库 ************************/
var win_mxk_list = [
  {
    title: '视频识别',
    path: 'http://192.168.60.231:8085/模型库/视频识别',
    msg: '文件夹下为原始代码供学习使用，具体功能使用请联系肖健和',
    type: 'iframe',
  },
  {
    title: '地址名转坐标',
    path: 'http://192.168.60.231:8085/模型库/地址名转坐标',
    msg: '文件夹下为原始代码供学习使用，具体功能使用请联系肖健和',
    type: 'iframe',
  },
  {
    title: '道路路况下载',
    path: 'http://192.168.60.231:8085/模型库/道路路况下载',
    msg: '请下载exe文件进行使用，若有疑问请联系肖健和',
    type: 'iframe',
  },
  {
    title: '高德地图下载',
    path: 'http://192.168.60.231:8085/模型库/高德地图下载',
    msg: '请下载exe文件进行使用，若有疑问请联系肖健和',
    type: 'iframe',
  },
  {
    title: 'PDF加水印',
    path: '',
    msg: '',
    type: 'pdf',
  },
  {
    title: '网站二维码生成器',
    path: 'http://192.168.60.231:8085/模型库/网站二维码生成器',
    msg: '请下载exe文件进行使用，若有疑问请联系肖健和',
    type: 'iframe',
  },
  {
    title: '视频转GIF动图',
    path: 'http://192.168.60.231:8085/模型库/视频转GIF动图',
    msg: '请下载exe文件进行使用，若有疑问请联系肖健和',
    type: 'iframe',
  },
  {
    title: '道路可达性',
    path: '',
    msg: '请到该网站使用https://classic-maps.openrouteservice.org/directions?n1=49.414321&n2=8.692245&n3=13&b=0&c=0&k1=en-US&k2=km',
    type: 'iframe',
  },
  {
    title: '交评现状图绘制',
    path: 'http://192.168.60.231:23104/#/index2',
    type: 'a',
  },
  {
    title: '公交自动发车排班',
    path: 'http://192.168.60.231:8085/模型库/公交自动发车排班',
    msg: '请下载exe文件进行使用，若有疑问请联系肖健和',
    type: 'iframe',
  },
  {
    title: '人工数车助手',
    path: 'http://192.168.60.231:23104/keyPressed.html',
    type: 'a',
  },
]
/************************ 知识库 ************************/
var win_zsk_list = [
  {
    title: '国家标准规范',
    path: 'http://192.168.60.231:8085/知识库/国家标准规范/',
    type: 'a',
  },
  {
    title: '广州交通年鉴',
    path: 'http://192.168.60.231:8085/知识库/广州交通年鉴/',
    type: 'a',
  },
  {
    title: '总院流程文件',
    path: 'http://192.168.60.231:8085/知识库/总院流程文件/',
    type: 'a',
  },
  {
    title: '物流相关政策',
    path: 'http://192.168.60.231:8085/知识库/物流相关政策/',
    type: 'a',
  },
  {
    title: '低空相关政策',
    path: 'http://192.168.60.231:8085/知识库/低空相关政策/',
    type: 'a',
  },
  {
    title: '公交相关政策',
    path: 'http://192.168.60.231:8085/知识库/公交相关政策/',
    type: 'a',
  },
  {
    title: '网约车相关政策',
    path: 'http://192.168.60.231:8085/知识库/网约车相关政策/',
    type: 'a',
  },
  {
    title: '非机动车相关政策',
    path: 'http://192.168.60.231:8085/知识库/非机动车相关政策/',
    type: 'a',
  },
]
/************************ 资源库 ************************/
var win_zyk_list = [
  {
    title: '密码狗租借台',
    path: 'https://doc.weixin.qq.com/smartsheet/s3_AH8AwwajAB82Xowv0CiRpSNLSzdOs?scode=APwA6gfEAA0WkqjoUeAbUANgb6AHE&tab=lvruym&viewId=vXJ7Dv',
    type: 'a',
  },
  {
    title: '效率工具推荐',
    path: 'https://doc.weixin.qq.com/smartsheet/s3_AH8AwwajAB81VRWMidLTjynEfcoh3?scode=APwA6gfEAA01FipaXnAbUANgb6AHE&tab=q979lj&viewId=vukaF8',
    type: 'a',
  },
  {
    title: '网络资源账号',
    path: 'https://doc.weixin.qq.com/sheet/e3_ACIAFAaBAAsM7pwuaBRSyS5gO0dH5?scode=APwA6gfEAA0ZP18PaFAbUANgb6AHE&tab=000001',
    type: 'a',
  },
  {
    title: '部门专家库',
    path: 'https://doc.weixin.qq.com/sheet/e3_ACIAFAaBAAsjSNSuMCYQjy1MF50wd?scode=APwA6gfEAA0hBfJy6hAbUANgb6AHE&tab=000001',
    type: 'a',
  },
  {
    title: '行业期刊',
    path: 'https://doc.weixin.qq.com/sheet/e3_ACIAFAaBAAsc1vaY1hhTbSBSeG7AC?scode=APwA6gfEAA01rv8LfWAbUANgb6AHE&tab=000001',
    type: 'a',
  },
]
/************************ 宣传库 ************************/
var win_xck_list = [
  {
    title: '宣传手册',
    path: 'http://192.168.60.231:8085/宣传库/宣传手册/',
    type: 'a',
  },
  {
    title: '宣传视频',
    path: 'http://192.168.60.231:8085/宣传库/宣传视频/',
    type: 'a',
  },
  {
    title: '活动风采',
    path: 'http://192.168.60.231:8085/宣传库/活动风采/',
    type: 'a',
  },
]
/************************ 案例库 ************************/
var win_alk_list = [
  {
    title: '优秀项目',
    path: 'http://192.168.60.231:8085/案例库/优秀项目/',
    type: 'a',
  },
  {
    title: '优秀汇报',
    path: 'http://192.168.60.231:8085/案例库/优秀汇报/',
    type: 'a',
  },
  {
    title: '技术沙龙',
    path: 'http://192.168.60.231:8085/案例库/技术沙龙/',
    type: 'a',
  },
]
/************************ 总院文件 ************************/
var win_zywj_list = [
  {
    title: '规章制度',
    path: 'https://oa.gzpi.com.cn:999/km/doc/index.jsp?j_module=true#j_path=%2FdocCategory&docCategory=163a49828b46c70875de4e9419eb77ed',
    type: 'a',
  },
  {
    title: '工作文件',
    path: 'https://oa.gzpi.com.cn:999/km/doc/index.jsp?j_module=true#j_path=%2FdocCategory&docCategory=163a49cec675e94fd618ed845f3bc862',
    type: 'a',
  },
  {
    title: '资质证书',
    path: 'https://oa.gzpi.com.cn:999/km/doc/index.jsp?j_module=true#j_path=%2FdocCategory&docCategory=163a4a1a6532d42ab1024e54c7a9ccaf',
    type: 'a',
  },
]
/************************ 平台库 ************************/
var win_ptk_list = [
  {
    title: '本地大模型',
    path: 'http://192.168.60.234:8080/',
    icon: './assets/images/icon_chip.svg?url',
    type: 'a',
  },
  {
    title: 'Matsim可视化',
    path: 'http://192.168.60.231:23105/vue/pt_index.html#/',
    icon: './assets/images/icon_visualization.svg?url',
    type: 'a',
  },
  {
    title: '公交优化',
    path: 'http://192.168.60.231:23105/vue/pt.html#/',
    icon: './assets/images/icon_bus.svg?url',
    type: 'a',
  },
  {
    title: '总院时空数据云',
    path: 'http://192.168.10.124/gzpi/user/login',
    icon: './assets/images/icon_cloud.svg?url',
    type: 'a',
  },
  {
    title: '黄埔交通数字化',
    path: 'http://192.168.60.231:8080/index.html',
    icon: './assets/images/icon_number.svg?url',
    type: 'a',
  },
]
/************************ 地区库 ************************/
var win_dqk_list = [
  {
    title: '越秀',
    path: 'http://192.168.60.231:8085/地区库/越秀/',
    type: 'a',
    // path: '',
    // msg: '数据收集中，暂无数据',
    // type: 'message',
  },
  {
    title: '天河',
    path: 'http://192.168.60.231:8085/地区库/天河/',
    type: 'a',
    // path: '',
    // msg: '数据收集中，暂无数据',
    // type: 'message',
  },
  {
    title: '黄埔',
    path: 'http://192.168.60.231:8085/地区库/黄埔/',
    type: 'a',
    // path: '',
    // msg: '数据收集中，暂无数据',
    // type: 'message',
  },
  {
    title: '南沙',
    path: 'http://192.168.60.231:8085/地区库/南沙/',
    type: 'a',
    // path: '',
    // msg: '数据收集中，暂无数据',
    // type: 'message',
  },
  {
    title: '白云',
    path: 'http://192.168.60.231:8085/地区库/白云/',
    type: 'a',
    // path: '',
    // msg: '数据收集中，暂无数据',
    // type: 'message',
  },
  {
    title: '海珠',
    path: 'http://192.168.60.231:8085/地区库/海珠/',
    type: 'a',
    // path: '',
    // msg: '数据收集中，暂无数据',
    // type: 'message',
  },
  {
    title: '荔湾',
    path: 'http://192.168.60.231:8085/地区库/荔湾/',
    type: 'a',
    // path: '',
    // msg: '数据收集中，暂无数据',
    // type: 'message',
  },
  {
    title: '番禺',
    path: 'http://192.168.60.231:8085/地区库/番禺/',
    type: 'a',
    // path: '',
    // msg: '数据收集中，暂无数据',
    // type: 'message',
  },
  {
    title: '增城',
    path: 'http://192.168.60.231:8085/地区库/增城/',
    type: 'a',
    // path: '',
    // msg: '数据收集中，暂无数据',
    // type: 'message',
  },
  {
    title: '花都',
    path: 'http://192.168.60.231:8085/地区库/花都/',
    type: 'a',
    // path: '',
    // msg: '数据收集中，暂无数据',
    // type: 'message',
  },
  {
    title: '从化',
    path: 'http://192.168.60.231:8085/地区库/从化/',
    type: 'a',
    // path: '',
    // msg: '数据收集中，暂无数据',
    // type: 'message',
  },
]
