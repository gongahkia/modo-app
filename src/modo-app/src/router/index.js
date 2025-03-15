import { createRouter, createWebHistory } from "vue-router";
import AuthPage from "@/components/AuthPage.vue";
import DashboardPage from "@/components/DashboardPage.vue";
import SettingsPage from "@/components/SettingsPage.vue";

const routes = [
  { path: "/", name: "Auth", component: AuthPage },
  { path: "/dashboard", name: "Dashboard", component: DashboardPage },
  { path: "/settings", name: "Settings", component: SettingsPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;