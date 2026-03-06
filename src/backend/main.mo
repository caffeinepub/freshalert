import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Migration "migration";
import Runtime "mo:core/Runtime";

(with migration = Migration.run)
actor {
  // Data Models
  type Food = {
    id : Nat;
    name : Text;
    category : Text;
    quantity : Float;
    unit : Text;
    expiryDate : Int;
    addedDate : Int;
  };

  type Recipe = {
    id : Nat;
    name : Text;
    description : Text;
    ingredients : [Text];
    steps : [Text];
    tags : [Text];
  };

  // Stores
  let foods = Map.empty<Nat, Food>();
  let recipes = Map.empty<Nat, Recipe>();
  var nextFoodId = 1;
  var nextRecipeId = 1;

  // Comparators for sorting by id
  module Food {
    public func compare(a : Food, b : Food) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Recipe {
    public func compare(a : Recipe, b : Recipe) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Food Management
  public shared ({ caller }) func addFood(name : Text, category : Text, quantity : Float, unit : Text, expiryDate : Int) : async Nat {
    let food : Food = {
      id = nextFoodId;
      name;
      category;
      quantity;
      unit;
      expiryDate;
      addedDate = Time.now();
    };
    foods.add(nextFoodId, food);
    nextFoodId += 1;
    food.id;
  };

  public query ({ caller }) func listFoods() : async [Food] {
    foods.values().toArray().sort();
  };

  func _getExpiringFoods(days : Int) : [Food] {
    let now = Time.now();
    let threshold = now + days * 24 * 60 * 60 * 1_000_000_000;
    foods.values().toArray().filter(
      func(food) {
        food.expiryDate <= threshold;
      }
    );
  };

  public shared ({ caller }) func getExpiringFoods(days : Int) : async [Food] {
    _getExpiringFoods(days);
  };

  public shared ({ caller }) func markFoodConsumed(foodId : Nat) : async () {
    if (not foods.containsKey(foodId)) {
      Runtime.trap("Food with id " # foodId.toText() # " not found");
    };
    foods.remove(foodId);
  };

  // Recipe Management
  public shared ({ caller }) func addRecipe(name : Text, description : Text, ingredients : [Text], steps : [Text], tags : [Text]) : async Nat {
    let recipe : Recipe = {
      id = nextRecipeId;
      name;
      description;
      ingredients;
      steps;
      tags;
    };
    recipes.add(nextRecipeId, recipe);
    nextRecipeId += 1;
    recipe.id;
  };

  public query ({ caller }) func listRecipes() : async [Recipe] {
    recipes.values().toArray().sort();
  };

  public query ({ caller }) func recommendRecipes() : async [Recipe] {
    let expiringFoods = _getExpiringFoods(3);
    let expiringFoodNamesList = List.empty<Text>();

    for (food in expiringFoods.values()) {
      expiringFoodNamesList.add(food.name);
    };

    let expiringFoodNames = expiringFoodNamesList.toArray();
    let matchingRecipesList = List.empty<Recipe>();

    for (recipe in recipes.values()) {
      var matches = 0;
      for (ingredient in recipe.ingredients.values()) {
        for (expiringFood in expiringFoodNames.values()) {
          if (ingredient.contains(#text expiringFood)) {
            matches += 1;
          };
        };
      };
      if (matches > 0) {
        matchingRecipesList.add(recipe);
      };
    };

    matchingRecipesList.toArray();
  };

  // System Functions
  system func preupgrade() {};
  system func postupgrade() {
    preloadSampleData();
  };

  // Sample Data in Spanish
  func preloadSampleData() {
    let sampleFoods : [Food] = [
      { id = nextFoodId; name = "Leche"; category = "Lácteos"; quantity = 1.0; unit = "L"; expiryDate = Time.now() + 3 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 1; name = "Yogur"; category = "Lácteos"; quantity = 4.0; unit = "Unidades"; expiryDate = Time.now() + 5 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 2; name = "Queso"; category = "Lácteos"; quantity = 200.0; unit = "g"; expiryDate = Time.now() + 7 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 3; name = "Pollo"; category = "Carnes"; quantity = 500.0; unit = "g"; expiryDate = Time.now() + 2 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 4; name = "Carne molida"; category = "Carnes"; quantity = 300.0; unit = "g"; expiryDate = Time.now() + 3 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 5; name = "Tomate"; category = "Verduras"; quantity = 4.0; unit = "Unidades"; expiryDate = Time.now() + 6 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 6; name = "Cebolla"; category = "Verduras"; quantity = 3.0; unit = "Unidades"; expiryDate = Time.now() + 10 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 7; name = "Pimiento"; category = "Verduras"; quantity = 4.0; unit = "Unidades"; expiryDate = Time.now() + 8 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 8; name = "Zanahoria"; category = "Verduras"; quantity = 2.0; unit = "Unidades"; expiryDate = Time.now() + 6 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 9; name = "Lechuga"; category = "Verduras"; quantity = 1.0; unit = "Unidades"; expiryDate = Time.now() + 4 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 10; name = "Manzana"; category = "Frutas"; quantity = 6.0; unit = "Unidades"; expiryDate = Time.now() + 5 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 11; name = "Plátano"; category = "Frutas"; quantity = 8.0; unit = "Unidades"; expiryDate = Time.now() + 4 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 12; name = "Huevos"; category = "Huevos"; quantity = 8.0; unit = "Unidades"; expiryDate = Time.now() + 12 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 13; name = "Pan de molde"; category = "Panadería y repostería"; quantity = 1.0; unit = "Paquete"; expiryDate = Time.now() + 2 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 14; name = "Arroz"; category = "Cereales y granos"; quantity = 500.0; unit = "g"; expiryDate = Time.now() + 180 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
      { id = nextFoodId + 15; name = "Atún"; category = "Pescados y mariscos"; quantity = 2.0; unit = "Latas"; expiryDate = Time.now() + 60 * 24 * 60 * 60 * 1_000_000_000; addedDate = Time.now() },
    ];

    for (food in sampleFoods.values()) {
      foods.add(food.id, food);
    };
    nextFoodId += sampleFoods.size();

    // Sample Recipes (Spanish):
    let sampleRecipes : [Recipe] = [
      {
        id = nextRecipeId;
        name = "Ensalada mixta";
        description = "Mezcla de verduras frescas.";
        ingredients = ["Lechuga", "Tomate", "Cebolla", "Aceite de oliva", "Sal"];
        steps = [
          "Lavar la lechuga y cortarla en tiras.",
          "Cortar los tomates en rodajas.",
          "Picar la cebolla finamente.",
          "Mezclar todo en un bol.",
          "Añadir aceite de oliva y sal al gusto."
        ];
        tags = ["saludable", "rápida", "vegetariana", "niños"];
      },
      {
        id = nextRecipeId + 1;
        name = "Arroz con pollo";
        description = "Plato tradicional de arroz con pollo y verduras.";
        ingredients = ["Arroz", "Pollo", "Tomate", "Cebolla", "Ajo", "Pimiento", "Caldo"];
        steps = [
          "Dorar el pollo en una sartén.",
          "Añadir cebolla, ajo y pimiento picados.",
          "Agregar tomate y sofreír.",
          "Añadir arroz y caldo.",
          "Cocinar a fuego medio hasta que el arroz esté listo."
        ];
        tags = ["completa", "familiar", "niños"];
      },
      {
        id = nextRecipeId + 2;
        name = "Pasta con salsa de tomate";
        description = "Pasta con salsa casera de tomate.";
        ingredients = ["Pasta", "Tomate", "Ajo", "Aceite de oliva", "Sal", "Albahaca"];
        steps = [
          "Cocinar la pasta.",
          "Preparar salsa con tomate, ajo y aceite de oliva.",
          "Mezclar la salsa con la pasta.",
          "Añadir albahaca fresca."
        ];
        tags = ["rápida", "vegetariana", "niños"];
      },
      {
        id = nextRecipeId + 3;
        name = "Omelette de huevo";
        description = "Tortilla de huevo rápida y fácil.";
        ingredients = ["Huevos", "Sal", "Aceite", "Pimienta"];
        steps = [
          "Batir los huevos con sal y pimienta.",
          "Calentar el aceite en una sartén.",
          "Cocinar los huevos batidos hasta que estén firmes."
        ];
        tags = ["rápida", "desayuno", "niños"];
      },
      {
        id = nextRecipeId + 4;
        name = "Sopa de verduras";
        description = "Sopa saludable de verduras variadas.";
        ingredients = ["Zanahoria", "Cebolla", "Pimiento", "Ajo", "Sal", "Aceite de oliva"];
        steps = [
          "Cortar las verduras en trozos pequeños.",
          "Saltear cebolla y ajo en aceite de oliva.",
          "Agregar el resto de verduras y cocinar.",
          "Añadir agua y sal, hervir hasta que las verduras estén tiernas."
        ];
        tags = ["saludable", "vegetariana", "niños"];
      },
      {
        id = nextRecipeId + 5;
        name = "Sándwich clásico";
        description = "Sándwich con pan de molde y vegetales frescos.";
        ingredients = ["Pan de molde", "Queso", "Tomate", "Lechuga", "Sal"];
        steps = [
          "Rebanar el queso y el tomate.",
          "Colocar los ingredientes en el pan de molde.",
          "Añadir lechuga y sal al gusto."
        ];
        tags = ["rápida", "niños", "desayuno"];
      },
      {
        id = nextRecipeId + 6;
        name = "Arroz frito";
        description = "Arroz salteado con huevos y cebolla.";
        ingredients = ["Arroz", "Huevos", "Cebolla", "Aceite", "Sal", "Salsa de soja"];
        steps = [
          "Cocinar el arroz y reservar.",
          "Saltear cebolla en aceite caliente.",
          "Agregar arroz y mezclar bien.",
          "Batir los huevos y añadirlos a la mezcla.",
          "Añadir salsa de soja al gusto."
        ];
        tags = ["rápida", "familiar"];
      },
      {
        id = nextRecipeId + 7;
        name = "Puré de papa";
        description = "Puré cremoso de papas.";
        ingredients = ["Papa", "Mantequilla", "Leche", "Sal", "Pimienta"];
        steps = [
          "Hervir las papas hasta que estén blandas.",
          "Machacarlas con mantequilla.",
          "Añadir leche, sal y pimienta al gusto."
        ];
        tags = ["niños", "familiar", "saludable"];
      },
      {
        id = nextRecipeId + 8;
        name = "Panqueques";
        description = "Panqueques suaves para desayuno.";
        ingredients = ["Harina", "Huevos", "Leche", "Azúcar", "Mantequilla", "Sal"];
        steps = [
          "Mezclar harina, huevos y leche.",
          "Añadir azúcar y sal.",
          "Cocinar en sartén con mantequilla."
        ];
        tags = ["desayuno", "niños", "rápida"];
      },
      {
        id = nextRecipeId + 9;
        name = "Ensalada de frutas";
        description = "Mezcla de frutas picadas frescas.";
        ingredients = ["Manzana", "Plátano", "Limón", "Miel"];
        steps = [
          "Cortar frutas en trozos pequeños.",
          "Mezclar en un bol.",
          "Añadir jugo de limón y miel al gusto."
        ];
        tags = ["saludable", "rápida", "niños", "postre"];
      },
      {
        id = nextRecipeId + 10;
        name = "Pasta con atún";
        description = "Pasta con atún y salsa de tomate.";
        ingredients = ["Pasta", "Atún", "Tomate", "Aceitunas", "Aceite de oliva", "Sal"];
        steps = [
          "Cocinar la pasta.",
          "Preparar salsa con tomate y aceitunas.",
          "Agregar atún a la salsa.",
          "Mezclar con la pasta."
        ];
        tags = ["rápida", "pescado"];
      },
      {
        id = nextRecipeId + 11;
        name = "Pollo al horno";
        description = "Pollo horneado con especias.";
        ingredients = ["Pollo", "Ajo", "Aceite de oliva", "Sal", "Pimienta", "Limón"];
        steps = [
          "Marinar el pollo con ajo, aceite, sal y limón.",
          "Hornear a temperatura media hasta que esté dorado."
        ];
        tags = ["saludable", "familiar"];
      },
      {
        id = nextRecipeId + 12;
        name = "Lentejas";
        description = "Guiso de lentejas con verduras.";
        ingredients = ["Lentejas", "Zanahoria", "Cebolla", "Tomate", "Ajo", "Aceite", "Sal"];
        steps = [
          "Cocinar las lentejas.",
          "Saltear el resto de ingredientes.",
          "Añadir todo junto y cocinar hasta que las verduras estén tiernas."
        ];
        tags = ["saludable", "vegetariana", "legumbres"];
      },
      {
        id = nextRecipeId + 13;
        name = "Arroz con huevo";
        description = "Arroz con huevo frito rápido.";
        ingredients = ["Arroz", "Huevos", "Aceite", "Sal"];
        steps = [
          "Cocinar el arroz.",
          "Freír los huevos.",
          "Servir juntos."
        ];
        tags = ["rápida", "niños", "sencilla"];
      },
      {
        id = nextRecipeId + 14;
        name = "Tostadas con aguacate";
        description = "Tostadas saludables de pan y aguacate.";
        ingredients = ["Pan de molde", "Aguacate", "Limón", "Sal", "Pimienta"];
        steps = [
          "Tostar el pan.",
          "Preparar el aguacate con limón, sal y pimienta.",
          "Untar en el pan tostado."
        ];
        tags = ["saludable", "rápida", "desayuno", "vegetariana"];
      },
    ];

    for (recipe in sampleRecipes.values()) {
      recipes.add(recipe.id, recipe);
    };
    nextRecipeId += sampleRecipes.size();
  };
};
