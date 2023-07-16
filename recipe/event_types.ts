
  interface UserCreated extends Event {
    type: "UserCreated";
    data: {
        user_id: number;
        user_name: string;
        email: string;
    }
    };

    interface LoginSuccess extends Event {
        type: 'LoginSuccess';
        data: {
          user_id: number;
          email: string;
        };
      };

      interface Event {
        type: string;
        data: any;
      }


      interface RecipeItem {
        
        recipe_item: string;
        portion_size: string;
        recipe_item_id: number;

    }
    
    interface Recipe {
        id: number;
        recipe_name: string;
        recipe_items: RecipeItem[];
        recipe_cuisine: string;
        recipe_type: string;
    }
    



      export{
        Event,
          UserCreated,
          LoginSuccess,
          RecipeItem,
          Recipe
      }