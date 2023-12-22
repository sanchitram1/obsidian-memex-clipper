import { Notice, Plugin } from 'obsidian';
import { FrontMatterParser, FileProcessor } from './parser';
import { Clip } from './clipping';
import { MemexClipperSettings } from './settings';

interface MemexSettings {
	dateFormat: string;
	memexFolder: string;
	template: string;
	destination: string;
}

const DEFAULT_SETTINGS: Partial<MemexSettings> = {
	dateFormat: 'YYYY-MM-DD',
	memexFolder: 'Memex-Local-Sync',
	template: "",
	destination: "Clippings"
}

// TODO: delete old

export default class MemexClipper extends Plugin {

	settings: MemexSettings;

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onload() {

		// Settings
		await this.loadSettings()
		this.addSettingTab(new MemexClipperSettings(this.app, this))

		const parser = new FrontMatterParser();
		const processor = new FileProcessor(parser, file => this.app.vault.read(file));
		const files: Clip[] = [];

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('dice', 'Greet', async () => {
			const clippings = await this.findAllFilesWithClippings();

			new Notice("Found " + clippings.length + " clippings")

			for (const file of clippings) {
				new Notice("Processing " + file.basename);
				const fileData = await processor.process(file);
				if (fileData) {
					const clip = new Clip(fileData.properties, fileData.highlights, this.app.vault, this.settings.destination);
					files.push(clip);
				}
			}
			console.log("Populated the files");

			// save the files
			for (const file of files) {
				const result = file.save();
				console.log(result);
			}
		});


	}

	// TODO; instead of searching in the vault, search for this.settings.memexFolder
	async findAllFilesWithClippings() {
		const files = this.app.vault.getFiles();
		const clippingsFiles = [];

		for (const file of files) {
			const content = await this.app.vault.read(file);

			// Define a regular expression to match the "Spaces" category followed by "[[Clippings]]"
			const spacesRegex = /Spaces:.*?\[\[Clippings\]\]/s;

			if (spacesRegex.test(content)) {
				clippingsFiles.push(file);
			}
		}

		return clippingsFiles;
	}

	onunload() {
		console.log("Unloading plugin");
	}
}
