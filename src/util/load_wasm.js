import RtViewer from './wasm/RtViewerWasm.js';

let wasm = null;

const RtViewerPromise = RtViewer({
    noInitialRun: true,
    noExitRuntime: true
}).then(mod => mod);

const loadWasm = async () => {
    try {
        wasm = await RtViewerPromise;
    } catch (error) {
        console.error('Failed to load wasm:', error);
        throw error;
    }
};

loadWasm();

export { wasm };