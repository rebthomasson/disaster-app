export function toggleCheckedItem(checkedItems, id) {
    if (checkedItems.includes(id)) {
        return checkedItems.filter(item => item !== id);
    }
    return [...checkedItems, id];
}

export function calculateKitProgress(checkedCount, totalItems) {
    return checkedCount / totalItems;
}

export function isKitComplete(checkedCount, totalItems) {
    return checkedCount === totalItems;
}