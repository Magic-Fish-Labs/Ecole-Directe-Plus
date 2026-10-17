import fs from 'fs';
import path from 'path';

const iframeFilePath = path.resolve(__dirname, 'src/utils/iframeRequest/iframe.js');
const iframeRequestLinkerFilePath = path.resolve(__dirname, 'src/utils/iframeRequest/iframeRequestLinker.js');

// Plugin to watch for modifications in specified files
export const watchModification = (filePaths) => ({
    name: 'watch-iframe-modification',
    configureServer(server) {
        filePaths.forEach(filePath => server.watcher.add(filePath));
        server.watcher.on('change', (changedFile) => {
            if (filePaths.includes(changedFile)) {
                console.log(`${changedFile} has changed. Refreshing...`);
                server.ws.send({ type: 'full-reload', path: '*' });
            }
        });
    }
});

// Plugin to replace a placeholder with iframe script content
export const replaceIframeScript = (filePath) => ({
    name: 'replace-iframe-script',
    enforce: "pre",
    transform(file, id) {
        if (id.endsWith("/index.jsx")) {
            const iframeCode = fs.readFileSync(filePath, 'utf-8');
            const scriptContent = iframeCode.slice(iframeCode.indexOf("*/") + 2);
            return file.replace("IFRAME_JS_PLACEHOLDER", scriptContent);
        }
    }
});

export function iframePlugins() {
    return [
        replaceIframeScript(iframeFilePath),
        watchModification([iframeFilePath, iframeRequestLinkerFilePath]),
    ];
}
