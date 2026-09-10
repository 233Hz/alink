<template>
  <div class="h-screen h-[100dvh] flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors overflow-hidden">
    <!-- Navbar -->
    <Navbar
      @toggle-mobile-sidebar="isMobileDrawerOpen = true"
      @open-add-website="openAddWebsiteModal(null)"
      @open-reorder="handleOpenReorder"
      @open-auth="isAuthModalOpen = true"
      @open-change-password="isChangePasswordModalOpen = true"
    />

    <!-- Mobile Top Category Pills -->
    <MobileCategoryNav />

    <!-- Main Container: Sidebar + Content -->
    <div class="flex-1 flex w-full min-h-0 overflow-hidden">
      <!-- Desktop Sidebar (Fixed height to viewport, scrolls internally) -->
      <div class="hidden md:block flex-shrink-0 h-full overflow-hidden">
        <Sidebar
          @add-category="openAddCategoryModal"
          @edit-category="openEditCategoryModal"
          @delete-category="openDeleteCategoryDialog"
        />
      </div>

      <!-- Main Content Area (Independent scroll) -->
      <main class="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-10">
        <!-- Global Loading Indicator -->
        <div v-if="navStore.loading && navStore.websites.length === 0" class="flex flex-col items-center justify-center py-32">
          <Loader2 class="w-8 h-8 animate-spin mb-3 text-black dark:text-white" />
          <p class="text-xs font-mono text-gray-500 uppercase tracking-widest">正在同步导航数据...</p>
        </div>

        <!-- Global Error Banner -->
        <div
          v-else-if="navStore.error"
          class="mb-8 p-4 border-2 border-[#ff3366] text-[#ff3366] rounded-none flex items-center justify-between text-xs font-mono"
        >
          <span>{{ navStore.error }}</span>
          <button
            @click="navStore.fetchData"
            class="px-4 py-1.5 border-2 border-[#ff3366] bg-[#ff3366] text-white hover:bg-black hover:border-black font-bold uppercase rounded-none transition-colors"
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
      @open-reorder="handleOpenReorder"
      @open-auth="isAuthModalOpen = true"
      @open-change-password="isChangePasswordModalOpen = true"
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

    <ChangePasswordModal
      :is-open="isChangePasswordModalOpen"
      @close="isChangePasswordModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Loader2 } from '@lucide/vue';
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
import ChangePasswordModal from './components/auth/ChangePasswordModal.vue';

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
const isChangePasswordModalOpen = ref(false);

const websiteToEdit = ref<Website | null>(null);
const defaultWebsiteCategoryId = ref<string | null>(null);
const categoryToEdit = ref<Category | null>(null);
const categoryToDelete = ref<Category | null>(null);

function checkAuth(): boolean {
  if (!authStore.isAuthenticated) {
    isAuthModalOpen.value = true;
    return false;
  }
  return true;
}

function handleOpenReorder() {
  if (!checkAuth()) return;
  isReorderModalOpen.value = true;
}

function openAddWebsiteModal(categoryId?: string | null) {
  if (!checkAuth()) return;
  websiteToEdit.value = null;
  defaultWebsiteCategoryId.value = categoryId ?? null;
  isWebsiteModalOpen.value = true;
}

function openEditWebsiteModal(site: Website) {
  if (!checkAuth()) return;
  websiteToEdit.value = site;
  defaultWebsiteCategoryId.value = site.category_id;
  isWebsiteModalOpen.value = true;
}

async function openDeleteWebsiteModal(site: Website) {
  if (!checkAuth()) return;
  if (confirm(`确认要删除网址 “${site.title}” 吗？`)) {
    await navStore.deleteWebsite(site.id);
  }
}

async function handleMoveWebsiteUp(site: Website) {
  if (!checkAuth()) return;
  await navStore.moveWebsiteUp(site.id);
}

async function handleMoveWebsiteDown(site: Website) {
  if (!checkAuth()) return;
  await navStore.moveWebsiteDown(site.id);
}

function handleWebsiteSaved() {}

function openAddCategoryModal() {
  if (!checkAuth()) return;
  categoryToEdit.value = null;
  isCategoryModalOpen.value = true;
}

function openEditCategoryModal(cat: Category) {
  if (!checkAuth()) return;
  categoryToEdit.value = cat;
  isCategoryModalOpen.value = true;
}

function openDeleteCategoryDialog(cat: Category) {
  if (!checkAuth()) return;
  categoryToDelete.value = cat;
  isDeleteCategoryOpen.value = true;
}

function handleCategorySaved() {}
function handleCategoryDeleted() {}

onMounted(async () => {
  themeStore.initTheme();
  await authStore.initAuth();
  await navStore.fetchData();
  if (!authStore.isAuthenticated) {
    isAuthModalOpen.value = true;
  }
});
</script>
