import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 顾客端路由
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        { path: '', name: 'Home', component: () => import('@/views/HomeView.vue') },
        { path: 'product/:id', name: 'ProductDetail', component: () => import('@/views/ProductDetail.vue') },
        { path: 'cart', name: 'Cart', component: () => import('@/views/CartView.vue') },
        { path: 'checkout', name: 'Checkout', component: () => import('@/views/CheckoutView.vue') },
        { path: 'order/:id', name: 'OrderDetail', component: () => import('@/views/OrderDetail.vue') },
        { path: 'about', name: 'About', component: () => import('@/views/AboutView.vue') },
        { path: 'about/scene/:type', name: 'SceneDetail', component: () => import('@/views/SceneDetail.vue') },
      ],
    },
    // 企业管理后台
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, roles: ['ENTERPRISE_ADMIN', 'STORE_MANAGER', 'CLERK', 'SUPER_ADMIN'] },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/admin/DashboardView.vue') },
        { path: 'products', name: 'ProductManage', component: () => import('@/views/admin/ProductManage.vue') },
        { path: 'inventory', name: 'Inventory', component: () => import('@/views/admin/InventoryView.vue') },
        { path: 'orders', name: 'OrderManage', component: () => import('@/views/admin/OrderManage.vue') },
        { path: 'flow', name: 'FlowRegister', component: () => import('@/views/admin/FlowRegister.vue') },
        { path: 'monitor', name: 'Monitor', component: () => import('@/views/admin/MonitorView.vue') },
        { path: 'alerts', name: 'AlertManage', component: () => import('@/views/admin/AlertManage.vue') },
        { path: 'reports', name: 'Reports', component: () => import('@/views/admin/ReportView.vue') },
      ],
    },
    // 政府监管端
    {
      path: '/gov',
      component: () => import('@/layouts/GovLayout.vue'),
      meta: { requiresAuth: true, roles: ['GOV_INSPECTOR', 'SUPER_ADMIN'] },
      children: [
        { path: '', redirect: '/gov/map' },
        { path: 'map', name: 'GovMap', component: () => import('@/views/gov/GovMapView.vue') },
        { path: 'stores', name: 'StoreList', component: () => import('@/views/gov/StoreList.vue') },
        { path: 'store/:id', name: 'StoreLedger', component: () => import('@/views/gov/StoreLedger.vue') },
        { path: 'alerts', name: 'GovAlerts', component: () => import('@/views/gov/GovAlertList.vue') },
        { path: 'dashboard', name: 'GovDashboard', component: () => import('@/views/gov/GovDashboard.vue') },
        { path: 'inspect/:storeId', name: 'MobileInspect', component: () => import('@/views/gov/MobileInspect.vue') },
      ],
    },
    // 认证
    { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue') },
    { path: '/register', name: 'Register', component: () => import('@/views/RegisterView.vue') },
  ],
})

// Navigation guard - check auth
router.beforeEach((to, _from, next) => {
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const allowedRoles = to.meta.roles as string[] | undefined

  if (requiresAuth) {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    // Role check is done in the layout component
    if (allowedRoles) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (!allowedRoles.includes(payload.role)) {
          next({ name: 'Home' })
          return
        }
      } catch {
        next({ name: 'Login' })
        return
      }
    }
  }

  next()
})

export default router
