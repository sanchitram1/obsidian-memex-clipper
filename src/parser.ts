import { Annotation, MemexSyncProperties } from 'src/models';
import { parseDate } from 'src/utils'
import { TFile } from 'obsidian';
import * as yaml from 'js-yaml';

export class FrontMatterParser {

	constructor(private ignore: string[]) {
		this.ignore = ignore.map((tag: string) => tag.toLowerCase().replace(/\[|\]/g, '').trim());
	}

	public parseProperties(content: string): MemexSyncProperties {
		const frontMatterRegex = /---\n([\s\S]*?)\n---/;
		const match = frontMatterRegex.exec(content);

		if (match && match[1]) {
			return this.parseYamlContent(match[1]);
		} else {
			throw new Error("No front-matter found");
		}
	}

	public parseContent(content: string): Annotation[] | [] {
		// Search for anything after "### Annotations"

		const contentRegex = /### Annotations/;
		const match = contentRegex.exec(content);

		if (match) {
			return this.extractHighlightsAndNotes(content);
		} else {
			console.log("No annotations found");
			return [];
		}
	}

	private extractHighlightsAndNotes(content: string): Annotation[] {
		const annotationRegex = /<\/span>\n>\s(.*?)\n\n(<!-- Note -->\n(.*?)\n<div id="end"\/>)?/g;
		const annotations: Annotation[] = [];
		let match;

		while ((match = annotationRegex.exec(content)) !== null) {
			const highlight = match[1].trim();
			const note = match[3] ? match[3].trim() : '';

			annotations.push({ highlight, note });
		}

		return annotations
	}

	private parseYamlContent(yamlContent: string): MemexSyncProperties {
		try {
			const result = yaml.load(yamlContent);
			return this.convertToMemexSyncProperties(result);
		} catch (e) {
			console.error('Error parsing YAML content:', e);
			throw e;
		}
	}

	private convertToMemexSyncProperties(parsedData: any): MemexSyncProperties {
		const properties: MemexSyncProperties = {};

		if (parsedData.Title) {
			properties.Title = parsedData.Title;
		}
		if (parsedData.Url) {
			properties.Url = parsedData.Url;
		}
		if (parsedData['Created at']) {
			properties['Created at'] = parseDate(parsedData['Created at']);
			console.log(properties['Created at']);
		}
		if (parsedData.Spaces) {
			properties.Spaces = parsedData.Spaces.filter(
				(space: string) => !this.ignore.includes(
					space.toLowerCase().replace(/\[|\]/g, '').trim()
				)
			);
		}

		return properties;
	}

}

export class FileProcessor {
	parser: FrontMatterParser
	readContent: (file: TFile) => Promise<string>;

	constructor(parser: FrontMatterParser, readContent: (file: TFile) => Promise<string>) {
		this.parser = parser;
		this.readContent = readContent;
	}

	async process(file: TFile) {
		const content = await this.readContent(file);
		const categories = await this.parser.parseProperties(content);
		const highlights = await this.parser.parseContent(content);
		return { "properties": categories, "highlights": highlights };
	}
}

export class StructureParser<TProperties> {
	properties: TProperties;

	constructor(content: string | TProperties) {
        if (typeof content === 'string') {
            this.parseProperties(content);
        } else {
            this.properties = content;
        }
    }

	public parseProperties(content: string): void {
		// properties in Obsidian always start with "---" and end with "---"
		const frontMatterRegex = /---\n([\s\S]*?)\n---/;
		const match = frontMatterRegex.exec(content);

		if (match && match[1]) {
			this.properties = this.parseFrontMatter(match[1]);
		} else {
			throw new Error("No front-matter found");
		}
	}

	private parseFrontMatter(frontMatter: string): TProperties {
		try {
			const result = yaml.load(frontMatter) as TProperties;
			return result;
		} catch (e) {
			console.error('Error parsing YAML content:', e);
			throw e;
		}
	}
}

export class MemexFile extends StructureParser<MemexSyncProperties> {
	properties: MemexSyncProperties;
	annotations: Annotation[];
	ignore: string[];

	constructor(content: string, ignore: string[]) {
		super(content);

		this.ignore = ignore.map((tag: string) => tag.toLowerCase().replace(/\[|\]/g, '').trim());

		// properties
		this.properties = this.properties as MemexSyncProperties;
		this.removeIgnoredProperties();

		// annotations (which is a higlight and a note)
		this.annotations = [];
		this.setAnnotations(content);
	}

	// properties needs to exclude the ignore list
	private removeIgnoredProperties(): void {
		if (this.properties.Spaces) {
			this.properties.Spaces = this.properties.Spaces.filter(
				(space: string) => !this.ignore.includes(
					space.toLowerCase().replace(/\[|\]/g, '').trim()
				)
			);
		}
	}

	private setAnnotations(content: string): void {
		// Search for anything after "### Annotations"

		const contentRegex = /### Annotations/;
		const match = contentRegex.exec(content);

		if (match) {
			this.annotations = this.extractHighlightsAndNotes(content);
		} else {
			console.log("No annotations found");
		}
	}

	private extractHighlightsAndNotes(content: string): Annotation[] {
		const annotationRegex = /<\/span>\n>\s(.*?)\n\n(<!-- Note -->\n(.*?)\n<div id="end"\/>)?/g;
		const annotations: Annotation[] = [];
		let match;

		while ((match = annotationRegex.exec(content)) !== null) {
			const highlight = match[1].trim();
			const note = match[3] ? match[3].trim() : '';

			annotations.push({ highlight, note });
		}

		return annotations
	}
 
}