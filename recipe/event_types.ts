
  interface UserCreated extends Event {
    type: "UserCreated";
    data: {
        user_id: number;
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
        recipe_item_id: number;

    }
    
    interface Recipe {
        id: string;
        recipe_name: string;
        recipe_items: RecipeItem[];
    }
    



      export{
        Event,
          UserCreated,
          LoginSuccess,
          RecipeItem,
          Recipe
      }