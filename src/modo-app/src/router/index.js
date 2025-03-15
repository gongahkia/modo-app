import { createRouter, createWebHistory } from "vue-router";
import AuthPage from "@/components/AuthPage.vue";
import DashboardPage from "@/components/DashboardPage.vue";
import SettingsPage from "@/components/SettingsPage.vue";

const routes = [
  { path: "/", name: "AuthPage", component: AuthPage },
  { path: "/dashboard", name: "DashboardPage", component: DashboardPage },
  { path: "/settings", name: "SettingsPage", component: SettingsPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;