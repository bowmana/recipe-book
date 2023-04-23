interface RecipeItem {
    id: string;
    recipe_item_id: string;
    isEditing: boolean;
}

interface Recipe{
    id: string;
    recipe: string;
    recipe_items: RecipeItem[];
}
    
interface RecipeList {
    recipes: Recipe[];
}