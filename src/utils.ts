import { Vault } from 'obsidian';

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

export function searchFileName (fileName: string, vault: Vault): boolean {
    const files = vault.getFiles();
    for (const file of files) {
        if (file.name === fileName) {
            return true;
        }
    }
    return false
}