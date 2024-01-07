import { Annotation, MemexSyncProperties } from 'src/types';
import * as yaml from 'js-yaml';

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