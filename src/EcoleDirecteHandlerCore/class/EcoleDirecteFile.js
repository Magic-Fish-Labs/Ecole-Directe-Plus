export default class EcoleDirecteFile {
	static currentToken = null;
	static currentUserId = null;
	#state;
	constructor(id, type, file, name = file.slice(0, file.lastIndexOf(".")), specialParams = {}) {
		/**id : 5018 / "654123546545612654984.pdf" it depends of ED's response
		 * type : NODEVOIR / FICHIER_CDT / ...     it depends of where you get the file in ED (homeworks, messsages or somewhere else)
		 * file : "file.pdf" / "TEST.txt"
		 * name : "the_name_of_the_file_downloaded_without_extension"
		 * specialParams : params needed in the URL in certain cases
		 */
		this.id = id;
		this.type = type;
		this.name = name;
		this.extension = file.slice(file.lastIndexOf(".") + 1);
		this.specialParams = specialParams;
		this.#state = "inactive";
	}

	fetch() {
		if (!this.blob) {
			if (this.#state !== "requestForInstall") {
				this.#state = "fetching"
			}
			fetchFile(this.id, this.type, this.specialParams)
				.then(blob => {
					this.blob = blob;
					if (this.#state === "requestForInstall") {
						this.install()
					}
				})
		}
	}

	download() {
		if (this.blob) {
			this.install();
		} else if (this.#state === "fetching") {
			this.#state = "requestForInstall"
		} else {
			this.#state = "requestForInstall"
			this.fetch()
		}
	}

	async install() {
		const url = URL.createObjectURL(this.blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = `${this.name}.${this.extension}`;

		document.body.appendChild(a);
		a.click();

		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
}