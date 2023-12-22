import { Property, Annotation, MemexSyncProperties } from "src/models";
import { searchFileName } from "src/utils";
import { Vault } from "obsidian";

export class Clip {
	name: string;
	properties: Property;
	content: Annotation[];
    vault: Vault;
    overwrite = false;
    destination: string;

	constructor(
        properties: MemexSyncProperties, 
        annotations: Annotation[], 
        vault: Vault, 
        destination: string
    ) {
		this.properties = {category: ["\"[[Clippings]]\""]};
		this.mapProperties(properties);
		this.content = annotations;
        this.vault = vault;
        this.destination = destination;
	}

	private mapProperties(originalProperties: MemexSyncProperties) {
		for (const key in originalProperties) {
			if (originalProperties.hasOwnProperty(key)) {
				const value = originalProperties[key as keyof MemexSyncProperties]; // Type assertion

				switch (key) {
					case "Spaces":
						this.properties.tags = Array.isArray(value) ? value.map(
							(tag: string) => tag.toLowerCase().replace(/\[|\]/g, '').trim()
						) : [];
						break;
					case "Title":
						this.properties.title = typeof value === 'string' ? value : '';
						this.setName(this.properties.title);
						break;
					case "Author":
						this.properties.author = (typeof value === 'string' || value === null) ? value : '';
						break;
					case "Created at":
						this.properties.clipped = typeof value === 'string' ? value : '';
						break;
					case "Url":
						this.properties.url = typeof value === 'string' ? value : '';
						break;
					default:
						console.log("Unknown key: " + key)
				}

                this.properties.published = '';
                this.properties.topics = [];
			}
		}
	}

    public save(): string {
        console.log("Saving the clip");

        if (this.name === "") {
            throw new Error("Clip name is empty");
        } else if (this.properties.title === "") {
            throw new Error("Clip title is empty");
        }

        // checkIfExists.  if yes, update.  if no, create.
        if (!this.exists()) {
            this.create();
        } else {
            this.update();
        }

        return this.name;
    }

    private update() {
        if (this.overwrite) {
            // TODO: Implement overwrite
            console.debug("Overwriting existing " + this.name);
        } else {
            // TODO: display notice
            console.debug("Not overwriting existing " + this.name)
        }
        return true;
    }

    private create() {
        console.log("Creating " + this.destination + "/" + this.name + ".md")
        this.vault.create(
            this.destination + "/" + this.name + ".md",
            this.format()
        );
    }

    private format() {
        const properties = this.formatProperties();
        const content = this.formatContent();

        return properties + content;
    }

    private formatProperties() {
        const header = "---\n";
        const category = "category: " + this.properties.category + "\n"
        const title = "title: " + this.properties.title + "\n"
        const author = "author: " + this.properties.author + "\n"
        const created = "clipped: " + this.properties.clipped + "\n" 
        const tags = "tags: " + this.properties.tags + "\n"
        const published = "published: " + this.properties.published + "\n"
        const topics = "topics: " + this.properties.topics + "\n"
        const tail = "---\n";

        return header + category + title + author + created + tags + published + topics + tail;
    }

    private formatContent() {
        const content = this.content.map((annotation) => {
            const highlight = annotation.highlight;
            const note = annotation.note;
            return "> " + highlight + "\n\n" + note;
        }).join("\n\n");

        return content;
    }

    private exists(): boolean {
        return searchFileName(this.name, this.vault);
    }

	private setName = (name: string) => {
		this.name = name;
	}
}