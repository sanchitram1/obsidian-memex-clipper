import { Notice, Plugin } from 'obsidian';
import { StructureParser, MemexFile } from './parser';
import { Clip } from './clipping';
import { MemexClipperSettings } from './settings';
import { MemexSettings, TProperties } from './types';
import { returnTFile, createDefaultTemplateObject } from './utils';

const DEFAULT_SETTINGS: Partial<MemexSettings> = {
	dateFormat: 'YYYY-MM-DD',
	memexFolder: 'Memex-Local-Sync',
	template: "Clippings Template",
	destination: "Clippings",
	overwrite: false,
	ignore: ["Saved from Mobile", "Inbox"] // default from Memex
}

export default class MemexClipper extends Plugin {

	// Settings
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

		// Read the template
		let template : StructureParser<TProperties | string>;
		try {
			const templateFile = returnTFile(this.settings.template, this.app.vault);
			const templateContent = await this.app.vault.read(templateFile);
			template = new StructureParser(templateContent);
			console.log("Template file found")
		} catch (error) {
			console.warn("Template file not found, defaulting")
			const defaultTemplate = createDefaultTemplateObject() as unknown as TProperties;
			template = new StructureParser(defaultTemplate);
		}


		// This creates an icon in the left ribbon.
		this.addRibbonIcon('dice', 'Greet', async () => {
			const clippings = await this.findAllFilesWithClippings();
			console.log(clippings.length)

			const files: Clip[] = [];
			console.log(files.length)

			for (const file of clippings) {
				const content = await this.app.vault.read(file);
				const memexFile = new MemexFile(content, this.settings.ignore);

				console.log(JSON.stringify(memexFile.properties))

				if (memexFile) {
					const clip = new Clip(
						template.properties as TProperties,
						memexFile.properties,
						memexFile.annotations,
						this.app.vault,
						this.settings.destination,
						this.settings.overwrite
					);
					files.push(clip);
				}
			}

			let saved_count = 0;
			for (const file of files) {
				try {
					saved_count += file.save();
				} catch (error) {
					new Notice("Error saving " + file.name)
					console.error(error)
				}

			}

			if (saved_count == 0 && this.settings.overwrite == false) {
				new Notice("No new and not overwriting")
			} else {
				new Notice(saved_count + " updates made")
			}
		});


	}

	async findAllFilesWithClippings() {
		const files = this.app.vault.getFiles();
		const clippingsFiles = [];

		for (const file of files) {
			const parent = file.parent ? file.parent.name : "";
			if (parent == this.settings.memexFolder) {
				clippingsFiles.push(file);
			}
		}

		return clippingsFiles;
	}

	onunload() {
		console.log("Unloading plugin");
	}
}
