import './lib/jszip.min.js';

const fs = require('fs');
const path = require('path');

export class ModDB {
	async getMods() {
		await this._downloadDatabase();

		const result = [];
		for (const [name, data] of Object.entries(this.modList)) {
			result.push({
				id: name,
				name: data.metadata.ccmodHumanName || name,
				description: data.metadata.description,
				version: data.metadata.version,
				versionString: data.metadata.version,
			});
		}
		return result;
	}

	async downloadMod(id) {
		const meta = await this._getMod(id);

		const installation = meta.installation.find(i => i.type === 'ccmod') || meta.installation.find(i => i.type === 'modZip');
		if (!installation) {
			throw new Error(`I don' know how to download this mod`);
		}

		const resp = await fetch(installation.url);
		const data = await resp.arrayBuffer();

		switch (installation.type) {
		case 'ccmod':
			return await this._installCCMod(data, id);
		case 'modZip':
			return await this._installModZip(data, id, installation.source);
		}

	}

	async _installCCMod(data, id) {
		await fs.promises.writeFile(`assets/mods/${id}.ccmod`, data);
	}
	async _installModZip(data, id, source) {
		const zip = await window.JSZip.loadAsync(data);

		await Promise.all(Object.values(zip.files)
			.filter(file => !file.dir)
			.map(async file => {
				const data = await file.async('arraybuffer');
				const relative = path.relative(source, file.name);
				if (relative.startsWith('..' + path.sep)) {
					return;
				}

				const filepath = path.join('assets/mods/', id, relative);
				try {
					await fs.promises.mkdir(path.dirname(filepath), {recursive: true});
				} catch {/* Directory already exists */}
				await fs.promises.writeFile(filepath, data);
			}));
	}

	/**
     * @private
     */
	async _getMod(id) {
		const data = this.modList[id];
		if (data) {
			return data;
		}

		await this._downloadDatabase();
		const newData = this.modList[id];
		if (newData) {
			return newData;
		}
        
		throw new Error('Could not find name');
	}

	/**
     * @private
     */
	async _downloadDatabase() {
		const resp = await fetch('https://raw.githubusercontent.com/CCDirectLink/CCModDB/master/npDatabase.json');
		this.modList = await resp.json();
	}
}