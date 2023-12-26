import { Property, Annotation, MemexSyncProperties } from "src/models";
import { searchFileName } from "src/utils";
import { TFile, Vault } from "obsidian";

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
        destination: string,
        overwrite: boolean
    ) {
        this.properties = { category: ["\"[[Clippings]]\""] };
        this.mapProperties(properties);
        this.content = annotations;
        this.vault = vault;
        this.destination = destination;
        this.overwrite = overwrite;
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
                        this.setName(this.properties.title.replace(/\//g, '-'));
                        break;
                    case "Created at":
                        this.properties.clipped = typeof value === 'string' ? value : '';
                        break;
                    case "Url":
                        this.properties.url = typeof value === 'string' ? value : '';
                        break;
                    default:
                        console.warn("Unknown key: " + key)
                }

                this.properties.published = '';
                this.properties.author = '';
                this.properties.topics = [];
            }
        }
    }

    public save(): number {
        if (this.name === "") {
            throw new Error("Clip name is empty");
        } else if (this.properties.title === "") {
            throw new Error("Clip title is empty");
        }

        // checkIfExists.  if yes, update.  if no, create.
        if (!this.exists()) {
            return this.create();
        } else {
            return this.update();
        }
    }

    private update(): number {
        if (this.overwrite) {
            console.log("Overwriting existing " + this.name);
            const existing_file = this.vault.getAbstractFileByPath(
                this.destination + "/" + this.name + ".md"
            );
            // Update if it's a TFile (being safe)
            if (existing_file instanceof TFile) {
                this.vault.modify(
                    existing_file,
                    this.format()
                )
            }
            return 1
        } 
        return 0
    }

    private create(): number {
        console.log("Creating " + this.destination + "/" + this.name + ".md")
        this.vault.create(
            this.destination + "/" + this.name + ".md",
            this.format()
        );
        return 1;
    }

    private format() {
        const properties = this.formatProperties();
        const content = this.formatContent();

        return properties + content;
    }

    private formatProperties() {
        const yaml = "---\n";
        const category = "category: " + this.properties.category + "\n"
        const title = "title: " + this.properties.title + "\n"
        const author = "author: " + this.properties.author + "\n"
        const created = "clipped: " + this.properties.clipped + "\n"
        const published = "published: " + this.properties.published + "\n"
        const topics = "topics: " + this.properties.topics + "\n"
        const url = "url: " + this.properties.url + "\n"
        const tags = "tags: " + this.properties.tags + "\n"

        return yaml + category + title + author + created + published + url + topics + tags + yaml;
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
        return searchFileName(this.name + ".md", this.vault);
    }

    private setName = (name: string) => {
        this.name = name;
    }
}