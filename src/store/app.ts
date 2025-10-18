import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
    // State
    const activeTab = ref('counter');
    const title = ref('Chat App');
    const versions = ref({
        node: '',
        chrome: '',
        electron: ''
    });

    // Actions
    function setActiveTab(tab: string) {
        activeTab.value = tab;
    }

    function setVersions(versionData: { node: string; chrome: string; electron: string }) {
        versions.value = versionData;
    }

    function setTitle(newTitle: string) {
        title.value = newTitle;
    }

    return {
        activeTab,
        title,
        versions,
        setActiveTab,
        setVersions,
        setTitle
    };
});
