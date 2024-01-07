import MemexClipper from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class MemexClipperSettings extends PluginSettingTab {
    plugin: MemexClipper

    constructor(app: App, plugin: MemexClipper) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Date format")
            .setDesc("Default date format")
            .addText((dateFormat) =>
                dateFormat
                    .setPlaceholder("MMMM dd, yyyy")
                    .setValue(this.plugin.settings.dateFormat)
                    .onChange(async (value) => {
                        this.plugin.settings.dateFormat = value;
                        await this.plugin.saveSettings();
                    }))

        new Setting(containerEl)
            .setName("Memex folder")
            .setDesc("Location of your Memex synced files")
            .addText((memexSetting) =>
                memexSetting
                    .setPlaceholder("Memex-Local-Sync")
                    .setValue(this.plugin.settings.memexFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.memexFolder = value;
                        await this.plugin.saveSettings();
                    }))

        new Setting(containerEl)
            .setName("Template")
            .setDesc("Defalt template to create the structure of ur clipping")
            .addText((memexSetting) =>
                memexSetting
                    .setPlaceholder("")
                    .setValue(this.plugin.settings.template)
                    .onChange(async (value) => {
                        this.plugin.settings.template = value;
                        await this.plugin.saveSettings();
                        await this.plugin.onload();
                    }))

        new Setting(containerEl)
            .setName("Destination")
            .setDesc("Default folder to save your clipping")
            .addText((memexSetting) =>
                memexSetting
                    .setPlaceholder("Clippings")
                    .setValue(this.plugin.settings.destination)
                    .onChange(async (value) => {
                        this.plugin.settings.destination = value;
                        await this.plugin.saveSettings();
                    }))

        new Setting(containerEl)
            .setName("Overwrite")
            .setDesc("Overwrite existing files?")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.overwrite)
                    .onChange(async (value) => {
                        this.plugin.settings.overwrite = value;
                        await this.plugin.saveSettings();
                    }))

        new Setting(containerEl)
            .setName("Ignore")
            .setDesc("Comma separated list (`, `) of Memex tags to ignore")
            .addTextArea((text) =>
                text
                    .setValue(this.plugin.settings.ignore.join(", "))
                    .onChange(async (value) => {
                        this.plugin.settings.ignore = value.split(", ");
                        await this.plugin.saveSettings();
                    }))
    }


}

