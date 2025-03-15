<template>
  <nav class="bg-white shadow p-4 flex justify-between items-center">
    <div class="flex space-x-4">
      <button @click="$router.push('/dashboard')" class="btn">Dashboard</button>
      <button @click="$router.push('/settings')" class="btn">Settings</button>
    </div>
  </nav>
</template>

<script>
export default {
  name: "NavBar",
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