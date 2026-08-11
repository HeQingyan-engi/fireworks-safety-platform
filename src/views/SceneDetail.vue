<template>
  <div class="scene-detail-page">
    <!-- 返回按钮 -->
    <div class="back-nav">
      <el-button @click="$router.push('/about')" :icon="'←'" text>← 返回关于我们</el-button>
    </div>

    <!-- 场景头部 -->
    <div class="scene-header" :class="'header-' + scene.level.toLowerCase()">
      <div class="scene-header-icon">{{ scene.icon }}</div>
      <div class="scene-header-text">
        <h1>{{ scene.title }}</h1>
        <p>{{ scene.desc }}</p>
        <el-tag :type="levelTagType" size="large" effect="dark">{{ scene.levelLabel }}</el-tag>
      </div>
    </div>

    <!-- 详细内容区 -->
    <div class="scene-content">
      <!-- 监测原理 -->
      <el-card class="content-card">
        <template #header>
          <span class="card-title">🔍 监测原理</span>
        </template>
        <div class="principle-section">
          <div v-for="(item, idx) in scene.principles" :key="idx" class="principle-item">
            <div class="principle-num">{{ idx + 1 }}</div>
            <div>
              <h4>{{ item.title }}</h4>
              <p>{{ item.content }}</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 硬件设备 -->
      <el-card class="content-card">
        <template #header>
          <span class="card-title">🖥️ 涉及的硬件设备</span>
        </template>
        <el-row :gutter="12">
          <el-col :span="8" v-for="device in scene.devices" :key="device.name">
            <div class="device-card">
              <div class="device-icon">{{ device.icon }}</div>
              <h4>{{ device.name }}</h4>
              <p>{{ device.spec }}</p>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 预警规则 -->
      <el-card class="content-card">
        <template #header>
          <span class="card-title">⚙️ 预警规则与阈值</span>
        </template>
        <el-table :data="scene.rules" border stripe style="width:100%">
          <el-table-column prop="param" label="监测参数" width="160" />
          <el-table-column prop="threshold" label="触发阈值" width="200">
            <template #default="{ row }">
              <span class="threshold-value">{{ row.threshold }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="action" label="触发动作" />
        </el-table>
      </el-card>

      <!-- 报警流程 -->
      <el-card class="content-card">
        <template #header>
          <span class="card-title">📢 报警与处置流程</span>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="(step, idx) in scene.flow"
            :key="idx"
            :timestamp="step.time"
            placement="top"
            :color="step.color"
          >
            <el-card shadow="hover">
              <h4>{{ step.title }}</h4>
              <p>{{ step.content }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- 上传信息说明 -->
      <el-card class="content-card">
        <template #header>
          <span class="card-title">📤 信息上传机制</span>
        </template>
        <div class="upload-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="上传触发条件">{{ scene.upload.trigger }}</el-descriptions-item>
            <el-descriptions-item label="上传频率">{{ scene.upload.frequency }}</el-descriptions-item>
            <el-descriptions-item label="上传内容" :span="2">{{ scene.upload.content }}</el-descriptions-item>
            <el-descriptions-item label="数据格式">{{ scene.upload.format }}</el-descriptions-item>
            <el-descriptions-item label="接收方">{{ scene.upload.receiver }}</el-descriptions-item>
            <el-descriptions-item label="存储周期" :span="2">{{ scene.upload.retention }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

      <!-- 相关法规 -->
      <el-card class="content-card">
        <template #header>
          <span class="card-title">📜 相关法规标准</span>
        </template>
        <ul class="law-list">
          <li v-for="law in scene.laws" :key="law">{{ law }}</li>
        </ul>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { AlertType } from '@/types/alert'

const route = useRoute()
const sceneType = route.params.type as AlertType

// 8大场景的完整数据
const sceneDataMap: Record<string, any> = {
  OVERSTOCK: {
    icon: '📦',
    title: '超量存放检测',
    desc: '实时监测库存量是否超过核定容量，当库存超出安全阈值时自动触发预警，防止超量存储带来的安全隐患。',
    level: 'RED',
    levelLabel: '红色预警',
    principles: [
      { title: '库存实时盘点', content: '通过RFID标签和电子秤双重手段，实时获取仓库中各类烟花爆竹的存储数量，误差率控制在±2%以内。' },
      { title: '容量智能对比', content: '系统预设各仓库的核定存储容量（依据《烟花爆竹安全管理条例》和AQ 4102标准），将实时库存量与安全容量进行持续比对。' },
      { title: '趋势预测分析', content: '基于历史进销存数据，利用时间序列算法预测库存变化趋势，提前预警潜在的库存超标风险。' },
    ],
    devices: [
      { icon: '🏷️', name: 'RFID标签', spec: 'UHF 860-960MHz' },
      { icon: '⚖️', name: '智能电子秤', spec: '精度±5g / 量程100kg' },
      { icon: '📡', name: 'RFID读写器', spec: '4通道 / 读取距离10m' },
    ],
    rules: [
      { param: '库存量 / 核定容量', threshold: '≥ 95%（黄色预警）', action: '系统推送通知至仓库管理员，要求核查库存' },
      { param: '库存量 / 核定容量', threshold: '≥ 105%（橙色预警）', action: '短信通知企业负责人，暂停进货审批，要求24小时内整改' },
      { param: '库存量 / 核定容量', threshold: '≥ 120%（红色预警）', action: '自动上报至监管平台，封锁进货通道，声光报警器启动，要求立即整改' },
    ],
    flow: [
      { time: 'T + 0秒', title: '📊 数据采集', content: 'RFID读写器扫描仓库内所有产品标签，智能电子秤复核重量，数据汇总至边缘计算网关。', color: '#409eff' },
      { time: 'T + 2秒', title: '🧠 规则引擎比对', content: '边缘网关将数据上传至服务器，规则引擎将库存量与预设阈值进行比对，判断是否触发预警。', color: '#e6a23c' },
      { time: 'T + 5秒', title: '🔔 分级预警推送', content: '根据超标程度触发对应级别预警：通过Socket.IO推送至管理后台、短信/电话通知责任人、启动声光报警。', color: '#e63946' },
      { time: 'T + 30秒', title: '📤 监管上报', content: '红色预警自动生成报告并上传至政府监管平台，附带库存清单、超标比例、历史趋势等数据。', color: '#d62828' },
      { time: '持续', title: '📋 整改跟踪', content: '系统持续监测库存变化，记录整改措施和时间节点，直至库存恢复至安全范围，预警自动解除。', color: '#67c23a' },
    ],
    upload: {
      trigger: '库存量达到核定容量的95%时开始上传；105%时加密上传；120%时实时连续上传',
      frequency: '正常：1次/小时；黄色预警：1次/15分钟；橙色预警：1次/5分钟；红色预警：实时（1次/秒）',
      content: '店铺编号、库存总量、各品类明细、核定容量、超标比例、历史库存趋势图、RFID扫描日志、电子秤读数',
      format: 'JSON结构化数据 + 现场照片(JPG) + 视频片段(MP4, 10秒)',
      receiver: '企业安监部门、政府应急管理局监管平台',
      retention: '原始数据保留90天，预警记录保留3年，整改记录永久保存',
    },
    laws: [
      '《烟花爆竹安全管理条例》（国务院令第455号）',
      'AQ 4102-2026《烟花爆竹流向登记通用规范》',
      '《烟花爆竹生产经营安全规定》（安监总局令第93号）',
      'GB 50161-2022《烟花爆竹工程设计安全标准》',
    ],
  },

  CROWD_GATHERING: {
    icon: '👥',
    title: '人员聚集检测',
    desc: '通过AI视觉识别技术，实时统计店内人员数量，超过10人时自动告警，防范拥挤踩踏风险。',
    level: 'ORANGE',
    levelLabel: '橙色预警',
    principles: [
      { title: 'AI人头检测', content: '采用YOLOv8深度学习模型对摄像头画面中的人体头部进行实时检测和计数，准确率达98%以上。' },
      { title: '区域密度分析', content: '将监控画面划分为多个网格区域，分别统计各区域人数密度，识别局部过度拥挤的情况。' },
      { title: '时间序列趋势', content: '追踪人员数量变化趋势，当人数增长速率超过阈值时，提前发出预警，给予充足应对时间。' },
    ],
    devices: [
      { icon: '📹', name: 'AI智能摄像头', spec: '400万像素 / 2.8mm广角' },
      { icon: '🖥️', name: '边缘计算盒', spec: '算力4TOPS / 支持8路' },
      { icon: '📢', name: '广播音箱', spec: 'IP网络 / 30W功率' },
    ],
    rules: [
      { param: '店内人数', threshold: '≥ 8人（黄色预警）', action: '系统播报温馨提示，建议顾客错峰进店' },
      { param: '店内人数', threshold: '≥ 10人（橙色预警）', action: '自动语音播报限流提示，推送消息至店员引导分流' },
      { param: '店内人数', threshold: '≥ 15人（红色预警）', action: '强制限流广播，关闭自动门，上报监管平台，记录视频证据' },
    ],
    flow: [
      { time: 'T + 0秒', title: '📹 视频流分析', content: 'AI摄像头采集实时视频流，边缘计算盒内置NPU芯片运行人头检测模型，每100ms输出一次人数统计。', color: '#409eff' },
      { time: 'T + 1秒', title: '🧠 规则引擎评估', content: '人数统计结果与预设阈值进行实时比对，结合人数增长速率进行综合风险评级。', color: '#e6a23c' },
      { time: 'T + 3秒', title: '📢 分级响应', content: '根据风险等级：语音广播提示 → 店员手持终端提醒 → 门禁系统限流 → 监管平台上报。', color: '#e63946' },
      { time: 'T + 10秒', title: '📤 证据上传', content: '自动截取预警前后30秒视频片段，附带人数统计曲线图和区域热力图，上传至管理平台。', color: '#d62828' },
      { time: '持续', title: '✅ 自动恢复', content: '当人数降低至阈值以下持续60秒后，系统自动解除预警，恢复正常营业状态。', color: '#67c23a' },
    ],
    upload: {
      trigger: '人数≥8人时开始记录；≥10人时上传数据；≥15人时实时上传视频流',
      frequency: '正常：不传；预警：1次/秒（人数+截图）；红色：实时视频流推送',
      content: '人员计数、区域密度热力图、预警前后视频片段(各30秒)、店铺ID、时间戳、负责人信息',
      format: 'JSON（统计数据）+ PNG（热力图）+ MP4（视频片段）',
      receiver: '企业管理后台、政府应急指挥中心',
      retention: '视频片段保留30天，统计记录保留1年，预警事件永久保存',
    },
    laws: [
      '《中华人民共和国安全生产法》',
      '《人员密集场所消防安全管理》（GB/T 40248-2021）',
      '《烟花爆竹零售店(点)安全技术规范》（GA 801-2019）',
    ],
  },

  SMOKING: {
    icon: '🚭',
    title: '吸烟/点火检测',
    desc: 'AI行为分析识别店内吸烟和点火行为，一旦检测到火焰或烟雾特征立即触发最高级别报警。',
    level: 'RED',
    levelLabel: '红色预警',
    principles: [
      { title: '烟火特征识别', content: '深度学习模型同时检测火焰的颜色、闪烁频率、烟雾的纹理和扩散特征，综合判断是否存在点火行为。' },
      { title: '行为姿态分析', content: '人体骨骼关键点检测模型识别"打火机举起"、"点烟"等特定动作姿态，辅助验证烟火检测结果。' },
      { title: '多模态融合确认', content: '视频AI检测 + 烟雾传感器 + 温度传感器三重验证，降低误报率至0.1%以下。' },
    ],
    devices: [
      { icon: '📹', name: '双光摄像头', spec: '可见光+红外 / 400万像素' },
      { icon: '💨', name: '烟雾传感器', spec: '光电式 / 灵敏度0.1dB/m' },
      { icon: '🌡️', name: '温度传感器', spec: '精度±0.3°C / 响应<1秒' },
    ],
    rules: [
      { param: '烟雾浓度 + AI置信度', threshold: '烟雾≥0.1dB/m 且 AI置信度≥80%', action: '现场声光报警器启动，语音警告"店内禁止吸烟" ' },
      { param: '火焰特征 + 温度突变', threshold: 'AI检测到火焰 且 温度上升速率≥5°C/s', action: '最高级别报警，自动拨打119，切断非必要电源，启动消防喷淋' },
    ],
    flow: [
      { time: 'T + 0秒', title: '🎥 多传感器融合', content: '双光摄像头（可见光+红外）配合烟雾传感器和温度传感器，进行多维度环境数据采集和分析。', color: '#409eff' },
      { time: 'T + 1秒', title: '🔥 智能判定', content: 'AI模型综合分析视觉特征、烟雾浓度、温度变化三个维度，判定是否真实存在吸烟或点火行为。', color: '#e63946' },
      { time: 'T + 2秒', title: '🚨 即时报警', content: '确认火源后立即：① 启动声光报警器；② 自动语音警告；③ 推送报警至所有管理人员手机；④ 自动拨打119。', color: '#d62828' },
      { time: 'T + 5秒', title: '📤 紧急上传', content: '实时视频流推送至消防指挥中心，同步上传店铺信息、危化品存量清单、建筑结构图至应急平台。', color: '#cc0000' },
      { time: '持续', title: '🧯 联动处置', content: '触发消防联动：关闭防火卷帘门、启动喷淋系统（仅仓库区域）、切断非消防电源、开启应急疏散指示灯。', color: '#ff6600' },
    ],
    upload: {
      trigger: '检测到吸烟/点火行为立即触发实时上传',
      frequency: '检测期间：实时连续上传（25fps视频流 + 1次/秒传感器数据）',
      content: '实时可见光视频流、红外热成像视频流、烟雾浓度时序数据、温度时序数据、AI检测结果JSON、店铺定位坐标',
      format: 'RTMP视频流 + MQTT传感器数据 + JSON事件报告',
      receiver: '企业消防控制室、119消防指挥中心、政府应急管理局',
      retention: '监控录像保留90天，报警事件记录永久保存',
    },
    laws: [
      '《中华人民共和国消防法》',
      '《烟花爆竹安全管理条例》第三十条（禁止在烟花爆竹经营场所吸烟）',
      'GB 50116-2013《火灾自动报警系统设计规范》',
    ],
  },

  OUT_OF_SCOPE_SALES: {
    icon: '⚠️',
    title: '超范围经营检测',
    desc: '智能比对经营许可证范围与实际销售产品，发现B级以上或超出许可范围的产品销售时自动预警。',
    level: 'ORANGE',
    levelLabel: '橙色预警',
    principles: [
      { title: '许可证信息数字化', content: '将烟花爆竹经营（零售）许可证的许可范围、有效期、核定级别等信息录入系统，作为合规比对的基准。' },
      { title: '产品信息自动比对', content: '每件产品入库时自动读取其安全等级（C/D/B级），与许可证核定范围进行实时比对，不符则标记。' },
      { title: '销售环节二次校验', content: '收银扫码时再次核验产品等级与许可证范围的匹配性，拦截超范围销售行为。' },
    ],
    devices: [
      { icon: '💻', name: 'POS收银终端', spec: '集成扫码枪 + 双屏显示' },
      { icon: '🖨️', name: '小票打印机', spec: '热敏 / 80mm幅宽' },
      { icon: '🔐', name: '加密认证模块', spec: 'SM2/SM4国密算法' },
    ],
    rules: [
      { param: '产品安全等级 vs 许可等级', threshold: '产品等级 ≠ 许可范围', action: 'POS端弹窗拦截，禁止扫码出库，系统记录违规尝试' },
      { param: '累计超范围交易次数', threshold: '单月≥3次', action: '自动生成合规风险报告，上报至监管部门' },
    ],
    flow: [
      { time: 'T + 0秒', title: '📋 许可证录入', content: '首次使用时将经营许可证信息数字化录入系统，包括许可编号、经营范围、核定级别、有效期等。', color: '#409eff' },
      { time: 'T + 实时', title: '🔍 实时比对', content: '产品入库、销售出库、库存盘点等各环节自动比对产品等级与许可证范围，确保合规经营。', color: '#e6a23c' },
      { time: 'T + 即时', title: '🚫 违规拦截', content: '发现超范围产品时：POS终端弹窗提示 → 禁止交易 → 记录违规尝试 → 上报监管平台。', color: '#e63946' },
      { time: '每月', title: '📊 合规报告', content: '系统每月自动生成合规经营报告，统计超范围经营尝试次数、产品清单、责任人信息。', color: '#67c23a' },
    ],
    upload: {
      trigger: '每次超范围经营尝试立即触发上传',
      frequency: '违规事件触发时即时上传；日常合规日志每日0点批量上传',
      content: '许可证信息、违规产品详情、交易时间、操作员工号、拦截截图、POS交易日志',
      format: 'JSON结构化数据 + 截图PNG',
      receiver: '企业合规部门、应急管理局危化品监管科',
      retention: '合规日志保留1年，违规记录永久保存',
    },
    laws: [
      '《烟花爆竹安全管理条例》第十七条（经营许可制度）',
      '《烟花爆竹经营许可实施办法》（安监总局令第65号）',
      'AQ 4102-2026《烟花爆竹流向登记通用规范》',
    ],
  },

  OUTDOOR_ILLEGAL: {
    icon: '🚫',
    title: '店外违规摆放',
    desc: '监控店外区域是否存在违规堆放的烟花爆竹产品，确保所有产品在合法合规区域内存储和展示。',
    level: 'ORANGE',
    levelLabel: '橙色预警',
    principles: [
      { title: '区域划定与标定', content: '在监控画面中标定合规经营区域边界，任何超出边界的烟花爆竹产品将被系统识别。' },
      { title: '目标检测与分类', content: 'AI模型识别画面中的烟花爆竹包装箱、展示架等目标，并与划定区域进行位置对比。' },
      { title: '持续跟踪与记录', content: '对检出店外摆放的物品进行持续跟踪，记录其出现时间、持续时间、移动轨迹。' },
    ],
    devices: [
      { icon: '📹', name: '室外防水摄像头', spec: 'IP67 / 500万像素 / 红外夜视' },
      { icon: '🔦', name: '红外补光灯', spec: '50米照射距离' },
      { icon: '📡', name: '室外AP基站', spec: 'WiFi 6 / 覆盖半径100m' },
    ],
    rules: [
      { param: '店外区域发现烟花爆竹', threshold: '持续存在≥60秒', action: '语音提醒店员"请将店外物品移入店内"，推送消息至管理员' },
      { param: '店外区域发现烟花爆竹', threshold: '持续存在≥5分钟', action: '升级为橙色预警，拍照取证上传，电话通知店铺负责人' },
      { param: '店外区域发现烟花爆竹', threshold: '持续存在≥15分钟', action: '升级为红色预警，将证据上报监管平台，执法人员上门检查' },
    ],
    flow: [
      { time: 'T + 0秒', title: '📹 区域监控', content: '室外摄像头7×24小时监控店外区域，AI模型实时检测烟花爆竹包装和展示物品。', color: '#409eff' },
      { time: 'T + 60秒', title: '⚠️ 初步预警', content: '发现物品持续存在60秒后，确认为"店外摆放"，自动语音提醒店员，推送消息至管理员手机。', color: '#e6a23c' },
      { time: 'T + 5分钟', title: '📸 拍照取证', content: '自动抓拍高清照片作为证据，附带GPS定位和时间水印，上传至管理平台和监管系统。', color: '#e63946' },
      { time: 'T + 15分钟', title: '🚔 执法联动', content: '未整改则自动上报至执法部门，附带完整证据链（照片+视频+时间线+位置信息）。', color: '#d62828' },
    ],
    upload: {
      trigger: '检测到店外摆放持续60秒后开始上传',
      frequency: '预警初期：1次/分钟（截图）；升级后：实时视频流',
      content: '店外区域照片、GPS坐标、违规持续时间、店铺信息、历史违规次数',
      format: 'PNG截图 + MP4视频片段 + JSON事件数据',
      receiver: '企业安监部门、城市管理执法局、应急管理局',
      retention: '照片保留90天，事件记录保留2年',
    },
    laws: [
      '《烟花爆竹安全管理条例》',
      '《城市市容和环境卫生管理条例》',
      'GA 801-2019《烟花爆竹零售店(点)安全技术规范》',
    ],
  },

  OUTDOOR_TEST_FIRE: {
    icon: '🔥',
    title: '店外点火/试放',
    desc: '检测店外区域是否存在违规试放行为，一旦发现明火或燃放特征，即时报警并记录证据。',
    level: 'RED',
    levelLabel: '红色预警',
    principles: [
      { title: '火光特征检测', content: '红外热成像摄像头检测店外区域的异常热源和明火特征，可穿透烟雾和夜间黑暗环境。' },
      { title: '声音特征分析', content: '麦克风阵列采集环境声音，识别烟花爆竹燃放特征音频（爆裂声、啸叫声），辅助验证视觉检测。' },
      { title: '运动轨迹追踪', content: '追踪明火和烟雾的运动轨迹，分析其扩散方向和速度，评估对周围环境的安全威胁。' },
    ],
    devices: [
      { icon: '📹', name: '热成像摄像头', spec: '分辨率640×512 / 测温范围-20~550°C' },
      { icon: '🎤', name: '麦克风阵列', spec: '4麦克风 / 拾音距离15m' },
      { icon: '📢', name: '高音号角', spec: '120dB / 传输距离200m' },
    ],
    rules: [
      { param: '热成像检测到明火特征', threshold: '温度>200°C 且 区域=店外', action: '立即触发红色预警，高音号角警告，自动拨打110/119' },
      { param: '声音识别到燃放特征', threshold: '声压级>90dB 且 匹配燃放音频指纹', action: '联动热成像确认，双重验证后触发报警和证据上传' },
    ],
    flow: [
      { time: 'T + 0秒', title: '🎥 热成像监控', content: '热成像摄像头实时监控店外区域温度分布，AI模型识别异常热源和明火特征。同时麦克风阵列采集环境声音。', color: '#409eff' },
      { time: 'T + 1秒', title: '🔥 多模态确认', content: '热成像+声音识别双重验证：火焰特征温度≥200°C + 燃放声音音频指纹匹配 → 确认为违规试放。', color: '#e63946' },
      { time: 'T + 2秒', title: '🚨 紧急响应', content: '① 高音号角播放警告语音；② 自动拨打110报警和119火警；③ 推送实时视频至警方指挥中心。', color: '#d62828' },
      { time: 'T + 5秒', title: '📤 证据链上传', content: '自动打包上传：热成像视频片段、可见光视频、燃放声音录音、GPS定位、时间戳，形成完整证据链。', color: '#cc0000' },
      { time: '持续', title: '📋 事后处置', content: '系统生成完整的违规事件报告，包含多媒体证据、时间线、责任人信息，推送至公安和安监部门。', color: '#ff6600' },
    ],
    upload: {
      trigger: '检测到店外点火/试放行为立即触发实时上传',
      frequency: '事件期间：实时热成像视频流(25fps) + 实时音频流 + 1次/秒传感器数据',
      content: '热成像视频、可见光视频、环境音频、GPS坐标、温度时序数据、声音分贝时序数据、店铺信息',
      format: 'RTMP双路视频流 + Opus音频流 + JSON结构化事件报告',
      receiver: '110报警中心、119消防指挥中心、应急管理局、公安治安支队',
      retention: '视频证据保留180天，音频证据保留180天，事件报告永久保存',
    },
    laws: [
      '《烟花爆竹安全管理条例》第三十条',
      '《中华人民共和国治安管理处罚法》',
      '《中华人民共和国消防法》',
    ],
  },

  TEMP_HUMIDITY_ANOMALY: {
    icon: '🌡️',
    title: '温湿度超标检测',
    desc: '物联网传感器实时采集仓库温湿度数据，超出安全范围（温度>35°C或湿度>75%）时自动报警。',
    level: 'YELLOW',
    levelLabel: '黄色预警',
    principles: [
      { title: '多点位传感器部署', content: '在仓库不同位置（门口、中心、角落、货架顶部）部署温湿度传感器，获取全面的环境数据。' },
      { title: '连续时序监测', content: '传感器每30秒采集一次数据，形成连续的温湿度变化曲线，系统实时监控数据变化。' },
      { title: '多阈值分级预警', content: '设定多级预警阈值，根据超标程度触发不同级别的响应措施，实现精细化管理。' },
    ],
    devices: [
      { icon: '🌡️', name: '温湿度传感器', spec: '温度±0.3°C / 湿度±2%RH' },
      { icon: '📡', name: 'LoRa网关', spec: '覆盖半径2km / 支持500节点' },
      { icon: '💨', name: '智能通风扇', spec: '风量2000m³/h / 自动控制' },
    ],
    rules: [
      { param: '仓库温度', threshold: '≥ 33°C（黄色预警）', action: '自动开启通风扇降温，系统推送提醒至管理员' },
      { param: '仓库湿度', threshold: '≥ 70%RH（黄色预警）', action: '自动开启除湿机，系统记录环境异常事件' },
      { param: '仓库温度', threshold: '≥ 35°C 或 湿度≥75%RH（橙色预警）', action: '电话通知负责人，建议暂停出入库操作' },
      { param: '仓库温度', threshold: '≥ 38°C 或 湿度≥85%RH（红色预警）', action: '强制停止仓库作业，启动应急转移程序，上报监管平台' },
    ],
    flow: [
      { time: 'T + 0秒', title: '📡 数据采集', content: 'LoRa无线传感器每30秒采集一次温湿度数据，通过网关上传至服务器。数据分析引擎实时绘制温湿度变化曲线。', color: '#409eff' },
      { time: 'T + 30秒', title: '🧠 趋势分析', content: '规则引擎分析温湿度变化趋势，当检测到温湿度接近阈值或上升速率异常时，提前发出预警。', color: '#e6a23c' },
      { time: 'T + 立即', title: '⚡ 自动联动', content: '根据预警级别自动执行：开启通风扇/除湿机 → 推送消息 → 电话通知 → 强制停工 → 应急转移。', color: '#e63946' },
      { time: 'T + 持续', title: '📊 数据分析', content: '系统持续记录温湿度数据，生成日报/周报/月报，分析季节性规律，优化仓库环境控制策略。', color: '#67c23a' },
    ],
    upload: {
      trigger: '温湿度超出正常范围（温度>30°C或湿度>65%RH）时开始加密上传',
      frequency: '正常：1次/5分钟；预警：1次/30秒',
      content: '各点位温度(°C)、各点位湿度(%RH)、传感器编号、采集时间戳、设备电量、信号强度',
      format: 'MQTT JSON数据包',
      receiver: '企业管理后台、环境监测数据库',
      retention: '原始数据保留30天，异常数据保留1年，统计报表永久保存',
    },
    laws: [
      '《烟花爆竹安全管理条例》',
      'GB 50161-2022《烟花爆竹工程设计安全标准》',
      '《烟花爆竹生产经营安全规定》关于仓库环境的要求',
    ],
  },

  SMOKE_FIRE: {
    icon: '🧯',
    title: '烟雾/火情检测',
    desc: '智能烟感+视频AI双重检测，精确识别烟雾和火焰特征，实现火情早期发现和快速响应。',
    level: 'RED',
    levelLabel: '红色预警',
    principles: [
      { title: '光电烟感检测', content: '高灵敏度光电式烟雾探测器，检测空气中烟雾颗粒引起的光散射变化，灵敏度可达0.05dB/m。' },
      { title: '视频火焰识别', content: 'AI深度学习模型分析视频画面中的火焰颜色分布、闪烁频率（1-15Hz）、形态变化等特征。' },
      { title: '双重验证机制', content: '烟感报警+视频AI确认双重验证，任一触发即派发现场确认，双重触发则直接启动消防联动。' },
    ],
    devices: [
      { icon: '🔍', name: '光电烟感探测器', spec: '灵敏度0.05-0.2dB/m / 电池5年' },
      { icon: '📹', name: '防爆摄像头', spec: 'Ex d IIC T6 / 400万像素' },
      { icon: '💧', name: '消防喷淋头', spec: '68°C启动 / K=80' },
    ],
    rules: [
      { param: '烟雾浓度', threshold: '≥ 0.1dB/m（单传感器）', action: '现场声光报警，推送消息至管理人员，要求30秒内确认' },
      { param: '视频AI检测到火焰', threshold: '置信度≥90%', action: '锁定摄像头画面，启动消防联动：切断电源、关闭防火门、启动喷淋' },
      { param: '烟感+视频AI双重触发', threshold: '两者同时报警', action: '最高火警等级：自动拨打119、全店疏散广播、远程开启所有出口门锁' },
    ],
    flow: [
      { time: 'T + 0秒', title: '🔍 双模检测', content: '光电烟感探测器持续监测空气中的烟雾颗粒浓度，同时AI摄像头分析视频画面中的火焰特征。', color: '#409eff' },
      { time: 'T + 1秒', title: '🧠 智能研判', content: '单传感器触发 → 30秒人工确认窗口；双传感器同时触发 → 跳过人工确认，直接启动消防联动。', color: '#e6a23c' },
      { time: 'T + 3秒', title: '🚨 消防联动', content: '确认火情后：① 全店声光报警+疏散广播；② 切断非消防电源；③ 关闭防火卷帘门；④ 启动喷淋系统。', color: '#e63946' },
      { time: 'T + 5秒', title: '📞 自动报警', content: '系统自动拨打119火警电话，语音播报店铺地址、火情位置、危化品存量信息，同步上传实时视频至消防中心。', color: '#d62828' },
      { time: 'T + 10秒', title: '📤 全面上报', content: '上传店铺建筑结构图、危化品存储位置图、人员位置信息、疏散通道状态至消防救援指挥平台。', color: '#cc0000' },
    ],
    upload: {
      trigger: '烟感或视频AI任一触发即开始实时上传',
      frequency: '火情期间：所有传感器实时上传（烟感1次/秒、视频25fps、温度1次/秒）',
      content: '烟雾浓度、视频实时流、各点位温度、店铺建筑结构图、危化品存量清单、人员定位信息、消防设施状态',
      format: 'RTMP视频流 + MQTT传感器数据 + JSON火警报告 + DXF建筑结构图',
      receiver: '119消防指挥中心、应急管理局、企业安监部门、店铺负责人',
      retention: '火警期间数据永久保存，日常监控数据保留90天',
    },
    laws: [
      '《中华人民共和国消防法》',
      'GB 50116-2013《火灾自动报警系统设计规范》',
      'GB 50161-2022《烟花爆竹工程设计安全标准》',
      '《烟花爆竹安全管理条例》',
    ],
  },
}

const scene = computed(() => {
  return sceneDataMap[sceneType as string] || sceneDataMap.OVERSTOCK
})

const levelTagType = computed(() => {
  const level = scene.value.level
  if (level === 'RED') return 'danger'
  if (level === 'ORANGE') return 'warning'
  return 'info'
})
</script>

<style scoped>
.scene-detail-page {
  max-width: 900px;
  margin: 0 auto;
}

.back-nav {
  margin-bottom: 16px;
}

/* 场景头部 */
.scene-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 24px;
  color: white;
}
.header-red {
  background: linear-gradient(135deg, #d62828, #e63946);
}
.header-orange {
  background: linear-gradient(135deg, #e6a23c, #f0ad4e);
}
.header-yellow {
  background: linear-gradient(135deg, #f5a623, #f7c948);
}
.scene-header-icon {
  font-size: 56px;
  flex-shrink: 0;
}
.scene-header-text h1 {
  margin: 0 0 8px 0;
  font-size: 26px;
}
.scene-header-text p {
  margin: 0 0 12px 0;
  font-size: 14px;
  opacity: 0.9;
}

/* 内容卡片 */
.content-card {
  margin-bottom: 20px;
}
.card-title {
  font-size: 16px;
  font-weight: bold;
}

/* 监测原理 */
.principle-item {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.principle-num {
  width: 36px;
  height: 36px;
  background: #e63946;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}
.principle-item h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
}
.principle-item p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.7;
}

/* 设备卡片 */
.device-card {
  text-align: center;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}
.device-icon {
  font-size: 32px;
  margin-bottom: 8px;
}
.device-card h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
}
.device-card p {
  margin: 0;
  font-size: 12px;
  color: #999;
}

/* 上传信息 */
.upload-info {
  margin-top: 0;
}

/* 法规列表 */
.law-list {
  margin: 0;
  padding-left: 20px;
}
.law-list li {
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.threshold-value {
  font-weight: bold;
  color: #e63946;
}
</style>
