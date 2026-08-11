<template>
  <div class="signature-pad">
    <canvas
      ref="canvasRef"
      width="400"
      height="150"
      style="border: 1px solid #ddd; border-radius: 4px; background: #fff; touch-action: none"
      @mousedown="startDraw"
      @mousemove="draw"
      @mouseup="endDraw"
      @mouseleave="endDraw"
      @touchstart.prevent="startTouch"
      @touchmove.prevent="drawTouch"
      @touchend="endDraw"
    />
    <div class="sig-actions">
      <span class="sig-hint">请在框内签名</span>
      <el-button size="small" @click="clear">清除</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let drawing = false

function initCtx() {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
    }
  }
}

onMounted(initCtx)

function getPos(e: MouseEvent | Touch) {
  if (!canvasRef.value) return { x: 0, y: 0 }
  const rect = canvasRef.value.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function startDraw(e: MouseEvent) {
  drawing = true
  const { x, y } = getPos(e)
  ctx?.beginPath()
  ctx?.moveTo(x, y)
}

function draw(e: MouseEvent) {
  if (!drawing) return
  const { x, y } = getPos(e)
  ctx?.lineTo(x, y)
  ctx?.stroke()
}

function startTouch(e: TouchEvent) {
  drawing = true
  const { x, y } = getPos(e.touches[0])
  ctx?.beginPath()
  ctx?.moveTo(x, y)
}

function drawTouch(e: TouchEvent) {
  if (!drawing) return
  const { x, y } = getPos(e.touches[0])
  ctx?.lineTo(x, y)
  ctx?.stroke()
}

function endDraw() { drawing = false }

function clear() {
  ctx?.clearRect(0, 0, canvasRef.value?.width || 400, canvasRef.value?.height || 150)
}

function getSignature(): string | null {
  if (!canvasRef.value) return null
  // Check if canvas has content (not empty)
  const imageData = ctx?.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height)
  if (!imageData) return null
  const hasContent = imageData.data.some((v, i) => i % 4 === 3 && v > 0)
  return hasContent ? canvasRef.value.toDataURL('image/png') : null
}

defineExpose({ getSignature, clear })
</script>

<style scoped>
.signature-pad { display: flex; flex-direction: column; align-items: center; }
.sig-actions { display: flex; justify-content: space-between; width: 400px; margin-top: 8px; align-items: center; }
.sig-hint { font-size: 13px; color: #999; }
</style>
