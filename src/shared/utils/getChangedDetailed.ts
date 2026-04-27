export type ParsedOffer = {
    id: string;
    price: number;
    stock: number;
};

export type ChangedOfferType = "price" | "stock" | "new" | "deleted";

export type ChangedParsedOffers = {
    id: string;
    type: ChangedOfferType;
    newValue?: number;
};

export function getChangedDetailed(
    prev: ParsedOffer[],
    next: ParsedOffer[]
): ChangedParsedOffers[] {
    const prevMap = new Map<string, ParsedOffer>();
    const nextMap = new Map<string, ParsedOffer>();

    for (const item of prev) {
        prevMap.set(String(item.id), item);
    }

    for (const item of next) {
        nextMap.set(String(item.id), item);
    }

    const changes: ChangedParsedOffers[] = [];

    // 1. Новые + изменённые
    for (const [id, nextItem] of nextMap) {
        const prevItem = prevMap.get(id);

        // новый товар
        if (!prevItem) {
            changes.push({ id, type: "new" });
            continue;
        }

        const priceChanged = prevItem.price !== nextItem.price;
        const stockChanged = prevItem.stock !== nextItem.stock;

        if (priceChanged) {
            changes.push({ id, type: "price", newValue: nextItem.price });
        }

        if (stockChanged) {
            changes.push({ id, type: "stock", newValue: nextItem.stock });
        }
    }

    // 2. Удалённые
    for (const id of prevMap.keys()) {
        if (!nextMap.has(id)) {
            changes.push({ id, type: "deleted" });
        }
    }

    return changes;
}