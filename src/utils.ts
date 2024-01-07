import { TFile, Vault } from 'obsidian';
import { DefaultClip, MemexSyncProperties } from './models';

export function parseDate (dateString: string): string {
    // receives a string in the format YYYY-DD-MM and returns a date object
    const parts = dateString.replace(/\[|\]/g, '').trim().split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);
        const formattedDate = new Date(year, month-1, day).toISOString().split('T')[0];
        return formattedDate;
    }
    throw new Error('Invalid date format');
}

export function searchFileName (fileName: string, vault: Vault, folder: string | null): boolean {
    const files = vault.getFiles();
    const parent = folder ? folder : '';
    for (const file of files) {
        if (file.name === fileName && file.parent?.name === parent) {
            return true;
        }
    }
    return false
}

export function returnTFile (fileName: string, vault: Vault): TFile {

    if (!fileName.endsWith('.md')) {
        fileName += '.md';  
    }

    const files = vault.getFiles();
    for (const file of files) {
        if (file.name === fileName) {
            return file;
        }
    }
    throw new Error('File not found');
}

export function createDefaultTemplateObject(): DefaultClip {
    const defaultObject: DefaultClip = {
        "category": ["[[Clippings]]"],
        "title": "",
        "author": "",
        "published": "",
        "clipped": "",
        "topics": [],
        "tags": [],
        "source": ""

    }
    return defaultObject
}

export function createDefaultMemexObject(): MemexSyncProperties {
    const defaultObject: MemexSyncProperties = {
        "Spaces": [],
        "Title": "",
        "Author": "",
        "Created at": "",
        "Url": ""
    }
    return defaultObject
}