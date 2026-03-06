import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Food {
    id: bigint;
    expiryDate: bigint;
    name: string;
    unit: string;
    addedDate: bigint;
    quantity: number;
    category: string;
}
export interface Recipe {
    id: bigint;
    name: string;
    tags: Array<string>;
    description: string;
    steps: Array<string>;
    ingredients: Array<string>;
}
export interface backendInterface {
    addFood(name: string, category: string, quantity: number, unit: string, expiryDate: bigint): Promise<bigint>;
    addRecipe(name: string, description: string, ingredients: Array<string>, steps: Array<string>, tags: Array<string>): Promise<bigint>;
    getExpiringFoods(days: bigint): Promise<Array<Food>>;
    listFoods(): Promise<Array<Food>>;
    listRecipes(): Promise<Array<Recipe>>;
    markFoodConsumed(foodId: bigint): Promise<void>;
    recommendRecipes(): Promise<Array<Recipe>>;
}
