<template>
  <div class="about-page">
    <h2>关于安万嘉</h2>

    <!-- 公司介绍 -->
    <el-card style="margin-bottom:20px">
      <p><strong>重庆安万嘉城市公共安全技术研究院有限公司</strong> 是一家专注于城市公共安全领域的高新技术企业。</p>
      <p>公司致力于将人工智能、物联网、大数据等先进技术应用于烟花爆竹安全监管领域，为政府监管部门、零售企业提供一体化智慧解决方案。</p>
      <p style="color:#e63946;font-weight:bold">本系统整合了 8 大智能风险识别场景，实现对烟花爆竹经营场所的全方位安全监控。</p>
    </el-card>

    <!-- 8大场景按钮 -->
    <h3 style="margin-bottom:16px">🔔 八大智能风险识别场景</h3>
    <p style="color:#666;margin-bottom:20px">点击下方任意场景卡片，查看详细的监测原理、预警规则和处理流程：</p>

    <div class="scene-grid">
      <div
        v-for="scene in scenes"
        :key="scene.type"
        class="scene-card"
        @click="$router.push(`/about/scene/${scene.type}`)"
      >
        <div class="scene-icon">{{ scene.icon }}</div>
        <div class="scene-info">
          <h4>{{ scene.title }}</h4>
          <p class="scene-desc">{{ scene.desc }}</p>
          <span class="scene-level" :class="'level-' + scene.level.toLowerCase()">
            {{ scene.levelLabel }}
          </span>
        </div>
        <div class="scene-arrow">→</div>
      </div>
    </div>

    <!-- 系统功能概览 -->
    <el-card style="margin-top:20px">
      <template #header><strong>📋 系统功能一览</strong></template>
      <el-row :gutter="16">
        <el-col :span="8" v-for="item in features" :key="item.title" style="margin-bottom:12px">
          <el-card shadow="hover" style="text-align:center;cursor:default">
            <div style="font-size:36px;margin-bottom:8px">{{ item.icon }}</div>
            <h4 style="margin:4px 0">{{ item.title }}</h4>
            <p style="color:#666;font-size:12px">{{ item.desc }}</p>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
const scenes = [
  {
    type: 'OVERSTOCK',
    icon: '📦',
    title: '超量存放检测',
    desc: '实时监测库存量是否超过核定容量，当库存超出安全阈值时自动触发预警，防止超量存储带来的安全隐患。',
    level: 'RED',
    levelLabel: '红色预警',
  },
  {
    type: 'CROWD_GATHERING',
    icon: '👥',
    title: '人员聚集检测',
    desc: '通过AI视觉识别技术，实时统计店内人员数量，超过10人时自动告警，防范拥挤踩踏风险。',
    level: 'ORANGE',
    levelLabel: '橙色预警',
  },
  {
    type: 'SMOKING',
    icon: '🚭',
    title: '吸烟/点火检测',
    desc: 'AI行为分析识别店内吸烟和点火行为，一旦检测到火焰或烟雾特征立即触发最高级别报警。',
    level: 'RED',
    levelLabel: '红色预警',
  },
  {
    type: 'OUT_OF_SCOPE_SALES',
    icon: '⚠️',
    title: '超范围经营检测',
    desc: '智能比对经营许可证范围与实际销售产品，发现B级以上或超出许可范围的产品销售时自动预警。',
    level: 'ORANGE',
    levelLabel: '橙色预警',
  },
  {
    type: 'OUTDOOR_ILLEGAL',
    icon: '🚫',
    title: '店外违规摆放',
    desc: '监控店外区域是否存在违规堆放的烟花爆竹产品，确保所有产品在合法合规区域内存储和展示。',
    level: 'ORANGE',
    levelLabel: '橙色预警',
  },
  {
    type: 'OUTDOOR_TEST_FIRE',
    icon: '🔥',
    title: '店外点火/试放',
    desc: '检测店外区域是否存在违规试放行为，一旦发现明火或燃放特征，即时报警并记录证据。',
    level: 'RED',
    levelLabel: '红色预警',
  },
  {
    type: 'TEMP_HUMIDITY_ANOMALY',
    icon: '🌡️',
    title: '温湿度超标检测',
    desc: '物联网传感器实时采集仓库温湿度数据，超出安全范围（温度>35°C或湿度>75%）时自动报警。',
    level: 'YELLOW',
    levelLabel: '黄色预警',
  },
  {
    type: 'SMOKE_FIRE',
    icon: '🧯',
    title: '烟雾/火情检测',
    desc: '智能烟感+视频AI双重检测，精确识别烟雾和火焰特征，实现火情早期发现和快速响应。',
    level: 'RED',
    levelLabel: '红色预警',
  },
]

const features = [
  { icon: '📱', title: '扫码看产品', desc: '扫描货架二维码，自动播放燃放效果视频与实物展示' },
  { icon: '🛒', title: '在线下单', desc: '选择产品、在线支付、生成核销码、到店自提' },
  { icon: '📋', title: '流向登记', desc: '符合AQ 4102-2026标准的全流程流向管理' },
  { icon: '🔔', title: '风险预警', desc: '8大场景智能识别，分级预警实时推送' },
  { icon: '📹', title: '视频监控', desc: '多路摄像头实时监控，AI智能行为分析' },
  { icon: '🗺️', title: '监管地图', desc: '辖区门店安全状态一目了然，绿黄红三色预警' },
]
</script>

<style scoped>
.about-page {
  max-width: 900px;
  margin: 0 auto;
}
.about-page h2 {
  margin-bottom: 20px;
}
.about-page p {
  line-height: 1.8;
}

/* 8大场景网格 */
.scene-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.scene-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
}
.scene-card:hover {
  border-color: #e63946;
  box-shadow: 0 4px 16px rgba(230, 57, 70, 0.12);
  transform: translateX(4px);
}
.scene-icon {
  font-size: 40px;
  flex-shrink: 0;
  width: 60px;
  text-align: center;
}
.scene-info {
  flex: 1;
  min-width: 0;
}
.scene-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}
.scene-desc {
  margin: 0;
  font-size: 13px;
  color: #888;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.scene-level {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
  margin-top: 6px;
}
.level-red {
  background: #fde2e2;
  color: #e63946;
}
.level-orange {
  background: #fff3e0;
  color: #e6a23c;
}
.level-yellow {
  background: #fffde7;
  color: #f5a623;
}
.scene-arrow {
  font-size: 24px;
  color: #ccc;
  flex-shrink: 0;
  transition: color 0.2s;
}
.scene-card:hover .scene-arrow {
  color: #e63946;
}
</style>
