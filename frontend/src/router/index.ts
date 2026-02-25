import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth.store"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/dashboard" },
    {
      path: "/login",
      name: "login",
      component: () => import("@/pages/LoginPage.vue"),
      meta: { public: true }
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/pages/RegisterPage.vue"),
      meta: { public: true }
    },
    {
      path: "/",
      component: () => import("@/layouts/AppLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "dashboard",
          name: "dashboard",
          component: () => import("@/pages/Dashboardpage.vue")
        },
        {
          path: "users",
          name: "users",
          component: () => import("@/pages/UsersPage.vue"),
          meta: { requiresRole: ["ADMIN", "USER"] }
        },
        {
          path: "platform",
          name: "platform",
          component: () => import("@/pages/PlatformPage.vue"),
          meta: { requiresRole: ["SUPER_ADMIN"] }
        }
      ]
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/pages/NotFoundPage.vue")
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    if (auth.isAuthenticated) return next(auth.isSuperAdmin ? "/platform" : "/dashboard")
    return next()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) return next("/login")

  if (to.meta.requiresRole) {
    const roles = to.meta.requiresRole as string[]
    if (!auth.user || !roles.includes(auth.user.role)) return next("/dashboard")
  }

  next()
})

export default router
