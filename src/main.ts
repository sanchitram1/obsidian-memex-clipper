import { Plugin } from 'obsidian';
import { FrontMatterParser, FileProcessor } from './parser';
import { Clip } from './clipping';

export default class MemexClipper extends Plugin {
	async onload() {
		const parser = new FrontMatterParser();
		const processor = new FileProcessor(parser, file => this.app.vault.read(file));

		const files: Clip[] = [];

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Greet', async () => {
			const clippings = await this.findAllFilesWithClippings();
			for (const file of clippings) {
				const fileData = await processor.process(file);
				if (fileData) {
					const clip = new Clip(fileData.properties, fileData.highlights, this.app.vault);
					files.push(clip);
				}
			}
			console.log("Populated the files");

			// save the files
			for (const file of files) {
				file.save();
				console.log("Saved ", file.name);
			}
		});


	}

	// Function to find all files with "Clippings"
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
