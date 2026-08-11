import { defineStore } from 'pinia'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

const CART_STORAGE_KEY = 'anwj_cart_items'

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // storage full or unavailable
  }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: loadFromStorage() as CartItem[],
  }),
  actions: {
    // 添加商品
    addItem(product: { id: number; name: string; price: number }) {
      const exist = this.items.find((item) => item.id === product.id)
      if (exist) {
        exist.quantity++
      } else {
        this.items.push({ ...product, quantity: 1 })
      }
      saveToStorage(this.items)
    },
    // 增加数量
    increase(id: number) {
      const item = this.items.find((i) => i.id === id)
      if (item) {
        item.quantity++
        saveToStorage(this.items)
      }
    },
    // 减少数量
    decrease(id: number) {
      const item = this.items.find((i) => i.id === id)
      if (item) {
        if (item.quantity > 1) {
          item.quantity--
        } else {
          this.removeItem(id)
          return
        }
        saveToStorage(this.items)
      }
    },
    // 删除商品
    removeItem(id: number) {
      this.items = this.items.filter((i) => i.id !== id)
      saveToStorage(this.items)
    },
    // 清空购物车
    clearCart() {
      this.items = []
      saveToStorage(this.items)
    },
  },
  getters: {
    // 总数量
    totalCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    // 总价格
    totalPrice: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  },
})
