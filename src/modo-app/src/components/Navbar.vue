<template>
  <nav class="bg-white shadow p-4 flex justify-between items-center">
    <div class="flex items-center">
      <img src="@/assets/modo.png" alt="Modo Logo" class="w-10 h-10 mr-4" />
      <h1 class="text-xl font-bold">Modo</h1>
    </div>
    <div class="flex space-x-4">
      <button @click="$router.push('/dashboard')" class="btn">Dashboard</button>
      <button @click="$router.push('/settings')" class="btn">Settings</button>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Navbar",
};
</script>

<style scoped>
.btn {
  background-color: #a3d2ca; /* Pastel green */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
.btn:hover {
  background-color: #71c0b2; /* Slightly darker green */
}
</style>