import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";

module {
  type OldFood = {
    id : Nat;
    name : Text;
    category : Text;
    quantity : Float;
    unit : Text;
    expiryDate : Int;
    addedDate : Int;
  };

  type OldRecipe = {
    id : Nat;
    name : Text;
    description : Text;
    ingredients : [Text];
    steps : [Text];
    tags : [Text];
  };

  type OldActor = {
    foods : Map.Map<Nat, OldFood>;
    recipes : Map.Map<Nat, OldRecipe>;
    nextFoodId : Nat;
    nextRecipeId : Nat;
  };

  type NewFood = {
    id : Nat;
    name : Text;
    category : Text;
    quantity : Float;
    unit : Text;
    expiryDate : Int;
    addedDate : Int;
  };

  type NewRecipe = {
    id : Nat;
    name : Text;
    description : Text;
    ingredients : [Text];
    steps : [Text];
    tags : [Text];
  };

  type NewActor = {
    foods : Map.Map<Nat, NewFood>;
    recipes : Map.Map<Nat, NewRecipe>;
    nextFoodId : Nat;
    nextRecipeId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newFoods = old.foods.map<Nat, OldFood, NewFood>(
      func(_id, food) {
        { food with category = food.category };
      }
    );
    { old with foods = newFoods };
  };
};
