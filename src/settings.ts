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
                }))
        
        new Setting(containerEl)
            .setName("Destination")
            .setDesc("Where should I output files? (Default is root)")
            .addText((memexSetting) =>
                memexSetting
                .setPlaceholder("")
                .setValue(this.plugin.settings.template)
                .onChange(async (value) => {
                    this.plugin.settings.template = value;
                    await this.plugin.saveSettings();
                }))
    }
}

