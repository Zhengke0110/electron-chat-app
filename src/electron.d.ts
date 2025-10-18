export interface ElectronAPI {
    versions: {
        node: string;
        chrome: string;
        electron: string;
    };
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
