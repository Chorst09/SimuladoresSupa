"use server";

import { suggestPriceAdjustments, SuggestPriceAdjustmentsInput } from '@/ai/flows/suggest-price-adjustments';

export async function getPriceSuggestion(input: SuggestPriceAdjustmentsInput) {
    try {
        const result = await suggestPriceAdjustments(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting AI price suggestion:", error);
        return { success: false, error: "Failed to get price suggestion from AI." };
    }
}