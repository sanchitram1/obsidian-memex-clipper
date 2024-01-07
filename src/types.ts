export interface MyPluginSettings {
	mySetting: string;
}

export interface TProperties {
    [key: string]: unknown;
}

export interface DefaultClip {
	category: string[];
	title?: string;
	author?: string | null;
	published?: string;
	clipped?: string;
	topics?: string[];
	tags?: string[];
	source?: string;
}

export interface Annotation {
	highlight: string;
	note: string;
}

export interface MemexSyncProperties {
	Spaces?: string[];
	Title?: string;
	Author?: string | null;
	"Created at"?: string;
	Url?: string;
}

export interface MemexSettings {
	dateFormat: string;
	memexFolder: string;
	template: string;
	destination: string;
	overwrite: boolean;
	ignore: string[];
}