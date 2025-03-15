<template>
  <div id="app" class="min-h-screen bg-pastel">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
/* TailwindCSS will handle most of the styling. Add custom styles here if needed. */
body {
  font-family: 'Inter', sans-serif;
}
.bg-pastel {
  background-color: #f8f4f9; /* A calm pastel color */
}
.input {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}
.btn {
  background-color: #a3d2ca; /* Pastel green */
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
}
.btn:hover {
  background-color: #71c0b2; /* Slightly darker green */
}
.carousel-item img {
  width: 100%;
  border-radius: 0.5rem;
}
</style>