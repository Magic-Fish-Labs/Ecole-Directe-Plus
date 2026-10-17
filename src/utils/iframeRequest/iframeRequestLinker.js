export default class IframeRequestLinker {
    constructor() {
        this.iframeWindow = null;
        this.fetchQueue = [];
        this.solverList = {};
        window.addEventListener("message", this.#handleMessage.bind(this), false);
    }

    #handleMessage(event) {
        if (this.iframeWindow === null || event.source !== this.iframeWindow) {
            return;
        }
        const data = event.data;
        if (!data || typeof data !== "object") {
            return;
        }
        const { action, values } = data;
        if ((action !== "RESPONSE" && action !== "ERROR") || !values || typeof values !== "object") {
            return;
        }
        const solver = this.solverList[values.fetchId];
        if (!solver) {
            return;
        }
        delete this.solverList[values.fetchId];
        if (action === "RESPONSE") {
            solver.resolve(values.result);
        } else {
            solver.reject(values.result);
        }
    }

    #sendIframeAbort(fetchId) {
        this.iframeWindow.postMessage({ action: "ABORT", values: { fetchId } }, "*");
    }

    #sendIframeFetch(url, fetchParams, dataType, solver) {
        const fetchId = crypto.randomUUID();
        this.solverList[fetchId] = solver;
        const fetchSignal = fetchParams.signal;
        if (fetchSignal) {
            fetchSignal.onabort = () => {
                this.#sendIframeAbort(fetchId);
            }
        }
        delete fetchParams.signal;
        this.iframeWindow.postMessage({ action: "FETCH", values: { url, fetchParams, dataType, fetchId } }, "*");
    }

    async fetch(url, fetchParams, dataType = "json") {
        return new Promise((resolve, reject) => {
            if (this.iframeWindow === null) {
                this.fetchQueue.push({ url, fetchParams, dataType, solver: { resolve, reject } });
            } else {
                this.#sendIframeFetch(url, fetchParams, dataType, { resolve, reject });
            }
        })
    }

    setIframe(iframe) {
        this.iframeWindow = iframe.contentWindow;
        if (this.iframeWindow !== null) {
            this.fetchQueue.forEach(element => {
                if (!element.fetchParams.signal.aborted) {
                    this.#sendIframeFetch(...element);
                }
            });
            this.fetchQueue = [];
        }
    }
}