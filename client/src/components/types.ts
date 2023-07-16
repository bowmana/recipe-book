export interface Option {
    value: string;
    label: string;
}

export interface RecipeItem {
    recipe_item: string;
    portion_size: string;
    recipe_item_id: number; //<- this is a number because it is used as a unique key after get request
}

export interface Recipe {
    recipe_items: RecipeItem[];
    recipe_id: number;
    recipe_name: string;
    recipe_cuisine: string;
    recipe_type: string;
    recipe_description: string;
    recipe_images: string[];
    u_name: string;
    u_id: number;
    original_u_id: number;
    original_u_name: string;
}


export interface EditableRecipeItem {
    recipe_item_id: string; //<- this is a string not number because it is used as a temporary key before get request in the edit recipe form (aka any additional recipe items added before posting gets a temporary key)
    recipe_item: string;
    portion_size: string;
    isEditing: boolean;
}
