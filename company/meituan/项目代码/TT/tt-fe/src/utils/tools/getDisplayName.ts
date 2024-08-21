export function getDisplayName (inside, i18nDisplayName, displayName, mis) {
    if (inside) {
        if (i18nDisplayName) {
            return `${i18nDisplayName}/${mis}`;
        } else if (displayName) {
            return `${displayName}/${mis}`;
        } else {
            return mis;
        }
    } else {
        return i18nDisplayName || displayName;
    }
}
