/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DEFAULT_USERNAME: string
    readonly VITE_DEFAULT_PASSWORD: string
	readonly [key: string]: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
