<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
    <!-- Navbar -->
    <Navbar
      @toggle-mobile-sidebar="isMobileDrawerOpen = true"
      @open-add-website="openAddWebsiteModal(null)"
      @open-reorder="isReorderModalOpen = true"
      @open-auth="isAuthModalOpen = true"
    />

    <!-- Mobile Top Category Pills -->
    <MobileCategoryNav />

    <!-- Main Container: Sidebar + Content -->
    <div class="flex-1 flex max-w-7xl w-full mx-auto overflow-hidden">
      <!-- Desktop Sidebar -->
      <div class="hidden md:block flex-shrink-0">
        <Sidebar
          @add-category="openAddCategoryModal"
          @edit-category="openEditCategoryModal"
          @delete-category="openDeleteCategoryDialog"
        />
      </div>

      <!-- Main Content Area -->
      <main class="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <!-- Global Loading Indicator -->
        <div v-if="navStore.loading && navStore.websites.length === 0" class="flex flex-col items-center justify-center py-24">
          <Loader2 class="w-8 h-8 text-brand-600 animate-spin mb-3" />
          <p class="text-xs text-slate-400">正在同步导航数据...</p>
        </div>

        <!-- Global Error Banner -->
        <div
          v-else-if="navStore.error"
          class="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs text-rose-600 dark:text-rose-400"
        >
          <span>{{ navStore.error }}</span>
          <button
            @click="navStore.fetchData"
            class="px-3 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-500 font-medium"
          >
            重试
          </button>
        </div>

        <!-- Website Grid -->
        <WebsiteGrid
          v-else
          @add-website="openAddWebsiteModal"
          @add-category="openAddCategoryModal"
          @edit-website="openEditWebsiteModal"
          @delete-website="openDeleteWebsiteModal"
          @move-up-website="handleMoveWebsiteUp"
          @move-down-website="handleMoveWebsiteDown"
        />
      </main>
    </div>

    <!-- Mobile Drawer -->
    <MobileDrawer
      :is-open="isMobileDrawerOpen"
      @close="isMobileDrawerOpen = false"
      @add-category="openAddCategoryModal"
      @add-website="openAddWebsiteModal(null)"
      @edit-category="openEditCategoryModal"
      @delete-category="openDeleteCategoryDialog"
    />

    <!-- Modals -->
    <WebsiteModal
      :is-open="isWebsiteModalOpen"
      :website-to-edit="websiteToEdit"
      :default-category-id="defaultWebsiteCategoryId"
      @close="isWebsiteModalOpen = false"
      @saved="handleWebsiteSaved"
    />

    <CategoryModal
      :is-open="isCategoryModalOpen"
      :category-to-edit="categoryToEdit"
      @close="isCategoryModalOpen = false"
      @saved="handleCategorySaved"
    />

    <DeleteCategoryDialog
      :is-open="isDeleteCategoryOpen"
      :category="categoryToDelete"
      @close="isDeleteCategoryOpen = false"
      @deleted="handleCategoryDeleted"
    />

    <ReorderModal
      :is-open="isReorderModalOpen"
      @close="isReorderModalOpen = false"
    />

    <AuthModal
      :is-open="isAuthModalOpen"
      @close="isAuthModalOpen = false"
    />

    <!-- Mobile Floating Add Button (FAB) -->
    <button
      @click="openAddWebsiteModal(null)"
      class="sm:hidden fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 flex items-center justify-center transition-transform active:scale-95"
      title="添加网址"
    >
      <Plus class="w-6 h-6" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Loader2, Plus } from '@lucide/vue';
import { useNavStore } from './stores/nav';
import { useThemeStore } from './stores/theme';
import { useAuthStore } from './stores/auth';
import type { Category, Website } from './types';

import Navbar from './components/layout/Navbar.vue';
import Sidebar from './components/layout/Sidebar.vue';
import MobileDrawer from './components/layout/MobileDrawer.vue';
import MobileCategoryNav from './components/layout/MobileCategoryNav.vue';
import WebsiteGrid from './components/websites/WebsiteGrid.vue';
import WebsiteModal from './components/websites/WebsiteModal.vue';
import CategoryModal from './components/categories/CategoryModal.vue';
import DeleteCategoryDialog from './components/categories/DeleteCategoryDialog.vue';
import ReorderModal from './components/categories/ReorderModal.vue';
import AuthModal from './components/auth/AuthModal.vue';

const navStore = useNavStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();

// UI Modals State
const isMobileDrawerOpen = ref(false);
const isWebsiteModalOpen = ref(false);
const isCategoryModalOpen = ref(false);
const isDeleteCategoryOpen = ref(false);
const isReorderModalOpen = ref(false);
const isAuthModalOpen = ref(false);

const websiteToEdit = ref<Website | null>(null);
const defaultWebsiteCategoryId = ref<string | null>(null);
const categoryToEdit = ref<Category | null>(null);
const categoryToDelete = ref<Category | null>(null);

function openAddWebsiteModal(categoryId?: string | null) {
  websiteToEdit.value = null;
  defaultWebsiteCategoryId.value = categoryId ?? null;
  isWebsiteModalOpen.value = true;
}

function openEditWebsiteModal(site: Website) {
  websiteToEdit.value = site;
  defaultWebsiteCategoryId.value = site.category_id;
  isWebsiteModalOpen.value = true;
}

async function openDeleteWebsiteModal(site: Website) {
  if (confirm(`确认要删除网址 “${site.title}” 吗？`)) {
    await navStore.deleteWebsite(site.id);
  }
}

async function handleMoveWebsiteUp(site: Website) {
  await navStore.moveWebsiteUp(site.id);
}

async function handleMoveWebsiteDown(site: Website) {
  await navStore.moveWebsiteDown(site.id);
}

function handleWebsiteSaved() {
  // refresh or notify if needed
}

function openAddCategoryModal() {
  categoryToEdit.value = null;
  isCategoryModalOpen.value = true;
}

function openEditCategoryModal(cat: Category) {
  categoryToEdit.value = cat;
  isCategoryModalOpen.value = true;
}

function openDeleteCategoryDialog(cat: Category) {
  categoryToDelete.value = cat;
  isDeleteCategoryOpen.value = true;
}

function handleCategorySaved() {}
function handleCategoryDeleted() {}

onMounted(async () => {
  themeStore.initTheme();
  await authStore.initAuth();
  await navStore.fetchData();
});
</script>
