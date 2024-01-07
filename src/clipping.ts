import { TProperties, Annotation, MemexSyncProperties } from "src/types";
import { searchFileName } from "src/utils";
import { TFile, Vault } from "obsidian";

export class Clip {
    name: string;
    template: TProperties;
    properties: TProperties;
    content: Annotation[];
    vault: Vault;
    overwrite = false;
    destination: string;

    constructor(
        template: TProperties,
        properties: MemexSyncProperties,
        annotations: Annotation[],
        vault: Vault,
        destination: string,
        overwrite: boolean
    ) {
        this.template = template;
        this.mapProperties(properties);
        this.content = annotations;
        this.vault = vault;
        this.destination = destination;
        this.overwrite = overwrite;
    }

    private mapProperties(originalProperties: MemexSyncProperties): void {
        for (const key in originalProperties) {
            if (originalProperties.hasOwnProperty(key)) {
                const value = originalProperties[key as keyof MemexSyncProperties]; // Type assertion

                switch (key) {
                    case "Spaces": {
                        this.template.tags = Array.isArray(value) ? value.map(
                            (tag: string) => tag.toLowerCase().replace(/\[|\]/g, '').trim()
                        ) : [];
                        break;
                    }
                    case "Title": {
                        this.template.title = typeof value === 'string' ? value : '';
                        this.setName(
                            String(this.template.title)
                            .replace(/\//g, ' ')
                            .replace(/[^a-zA-Z0-9.,'']/g, ' ')
                        );
                        break;
                    }
                    case "Created at": {
                        let created = typeof value === 'string' ? value : '';
                        created = created
                            .replace(/\[|\]/g, '')
                            .trim();
                        const year = created.slice(0, 4);
                        const day = created.slice(5, 7);
                        const month = created.slice(8, 10);
                        this.template.clipped = year + "/" + month + "/" + day;
                        break;
                    }
                    case "Url": {
                        this.template.source = typeof value === 'string' ? value : '';
                        break;
                    }
                    default:
                        console.warn("Unknown key: " + key)
                }
            }
        }
    }

    public save(): number {
        if (this.name === "") {
            throw new Error("Clip name is empty");
        } else if (this.template.title === "") {
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
            const existing_file = this.vault.getAbstractFileByPath(
                this.destination + "/" + this.name + ".md"
            );
            console.log("Updating " + this.destination + "/" + this.name + ".md");
            console.log("Data: " + JSON.stringify(this.template))
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
        let content = ""
        
        for (const key in this.template) {
            content += key + ": " + this.purgeBrackets(String(this.template[key])) + "\n";
        }

        return yaml + content + yaml;
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
        return searchFileName(this.name + ".md", this.vault, this.destination);
    }

    private setName = (name: string) => {
        this.name = name;
    }

    private purgeBrackets = (text: string) => {
        return text.replace(/\[|\]/g, '');
    }
}