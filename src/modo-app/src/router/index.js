import { createRouter, createWebHistory } from "vue-router";
import AuthPage from "@/components/AuthPage.vue";
import DashboardPage from "@/components/DashboardPage.vue";
import SettingsPage from "@/components/SettingsPage.vue";
import AddArtPage from "@/components/AddArtPage.vue";
import UserProfilePage from "@/components/UserProfilePage.vue";

const routes = [
  { path: "/", name: "AuthPage", component: AuthPage },
  { path: "/dashboard", name: "DashboardPage", component: DashboardPage },
  { path: "/settings", name: "SettingsPage", component: SettingsPage },
  { path: '/add-art', name: 'AddArt', component: AddArtPage },
  { 
    path: '/dashboard/user/:userid', 
    name: 'UserProfile', 
    component: UserProfilePage,
    props: true 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;