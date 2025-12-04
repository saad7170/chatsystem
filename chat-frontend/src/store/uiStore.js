import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isSidebarOpen: true,
  isNewChatModalOpen: false,
  isGroupChatModalOpen: false,
  isProfileModalOpen: false,
  selectedImage: null,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  openNewChatModal: () => set({ isNewChatModalOpen: true }),
  closeNewChatModal: () => set({ isNewChatModalOpen: false }),

  openGroupChatModal: () => set({ isGroupChatModalOpen: true }),
  closeGroupChatModal: () => set({ isGroupChatModalOpen: false }),

  openProfileModal: () => set({ isProfileModalOpen: true }),
  closeProfileModal: () => set({ isProfileModalOpen: false }),

  setSelectedImage: (image) => set({ selectedImage: image }),
  clearSelectedImage: () => set({ selectedImage: null }),
}));
