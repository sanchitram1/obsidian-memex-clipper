export interface MyPluginSettings {
	mySetting: string;
}

export interface Property {
	// TODO: derived from a template
	category: string[];
	title?: string;
	author?: string | null;
	published?: string;
	clipped?: string;
	topics?: string[];
	tags?: string[];
	url?: string;
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
}