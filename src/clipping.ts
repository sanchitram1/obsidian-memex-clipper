import { Property, Annotation, MemexSyncProperties } from "src/models";
import { searchFileName } from "src/utils";
import { Vault } from "obsidian";

export class Clip {
	name: string;
	properties: Property;
	content: Annotation[];
    vault: Vault;

	constructor(properties: MemexSyncProperties, annotations: Annotation[], vault: Vault) {
		this.properties = {category: ["\"[[Clippings]]\""]};
		this.mapProperties(properties);
		this.content = annotations;
        this.vault = vault;
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

    public save() {
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
    }

    private update() {
        // pass for now
        console.log("Updating the clip")
        return true;
    }

    private create() {
        this.vault.create(
            "Test-Clipper/" + this.name + ".md",
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
        // check if the clip exists
        // if yes, update
        // if no, create
        return searchFileName(this.name, this.vault);
    }

	private setName = (name: string) => {
		this.name = name;
	}
}