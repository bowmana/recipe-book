export interface Option {
    value: string;
    label: string;
}

export interface RecipeItem {
    recipe_item: string;
    portion_size: string;
    recipe_item_id: number;
}

export interface Recipe {
    recipe_items: RecipeItem[];
    recipe_id: number;
    recipe_name: string;
    recipe_cuisine: string;
    recipe_type: string;
    recipe_description: string;
    recipe_images: string[];
}


export interface EditableRecipeItem {
    recipe_item_id: string;
    recipe_item: string;
    portion_size: string;
    isEditing: boolean;
}
