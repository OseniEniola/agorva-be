export enum ProductCategory {
  // Fresh Produce
  VEGETABLES = 'vegetables',
  FRUITS = 'fruits',
  HERBS = 'herbs',
  MUSHROOMS = 'mushrooms',
  SPROUTS = 'sprouts',
  
  // Animal Products
  DAIRY = 'dairy',
  MEAT = 'meat',
  POULTRY = 'poultry',
  SEAFOOD = 'seafood',
  EGGS = 'eggs',
  
  // Pantry & Staples
  GRAINS = 'grains',
  LEGUMES = 'legumes',
  NUTS = 'nuts',
  SEEDS = 'seeds',
  FLOUR = 'flour',
  PASTA = 'pasta',
  RICE = 'rice',
  
  // Processed & Value-Added
  BAKED_GOODS = 'baked_goods',
  PRESERVES = 'preserves',
  JAMS_JELLIES = 'jams_jellies',
  PICKLES = 'pickles',
  SAUCES = 'sauces',
  CONDIMENTS = 'condiments',
  CHEESE = 'cheese',
  YOGURT = 'yogurt',
  
  // Beverages
  JUICE = 'juice',
  MILK = 'milk',
  TEA = 'tea',
  COFFEE = 'coffee',
  
  // Natural Products
  HONEY = 'honey',
  MAPLE_SYRUP = 'maple_syrup',
  OILS = 'oils',
  VINEGAR = 'vinegar',
  
  // Prepared Foods
  READY_TO_EAT = 'ready_to_eat',
  FROZEN = 'frozen',
  DRIED = 'dried',
  
  // Other
  FLOWERS = 'flowers',
  PLANTS = 'plants',
  OTHER = 'other'
}

export enum ProductStatus {
  DRAFT = 'draft',                     // Not yet published
  ACTIVE = 'active',                   // Available for sale
  OUT_OF_STOCK = 'out_of_stock',       // Temporarily unavailable
  LOW_STOCK = 'low_stock',             // Running low (< 10 units)
  DISCONTINUED = 'discontinued',       // No longer available
  SEASONAL = 'seasonal',               // Seasonal item, not currently in season
  PENDING_APPROVAL = 'pending_approval', // Awaiting admin approval
  REJECTED = 'rejected'                // Rejected by admin
}

export enum UnitType {
  // Weight
  KG = 'kg',
  GRAM = 'gram',
  LB = 'lb',
  OUNCE = 'ounce',
  TON = 'ton',
  
  // Volume
  LITER = 'liter',
  MILLILITER = 'milliliter',
  GALLON = 'gallon',
  QUART = 'quart',
  PINT = 'pint',
  CUP = 'cup',
  
  // Count
  PIECE = 'piece',
  DOZEN = 'dozen',
  HALF_DOZEN = 'half_dozen',
  BUNCH = 'bunch',
  HEAD = 'head',
  
  // Package
  BAG = 'bag',
  BOX = 'box',
  PACK = 'pack',
  BUNDLE = 'bundle',
  CARTON = 'carton',
  CRATE = 'crate',
  JAR = 'jar',
  BOTTLE = 'bottle',
  CAN = 'can',
  CONTAINER = 'container'
}

export enum CertificationType {
  // Organic & Natural
  ORGANIC = 'organic',
  CERTIFIED_ORGANIC = 'certified_organic',
  NON_GMO = 'non_gmo',
  NON_GMO_VERIFIED = 'non_gmo_verified',
  PESTICIDE_FREE = 'pesticide_free',
  HERBICIDE_FREE = 'herbicide_free',
  CHEMICAL_FREE = 'chemical_free',
  
  // Animal Welfare
  GRASS_FED = 'grass_fed',
  PASTURE_RAISED = 'pasture_raised',
  FREE_RANGE = 'free_range',
  CAGE_FREE = 'cage_free',
  HUMANELY_RAISED = 'humanely_raised',
  NO_ANTIBIOTICS = 'no_antibiotics',
  NO_HORMONES = 'no_hormones',
  
  // Religious & Cultural
  HALAL = 'halal',
  KOSHER = 'kosher',
  
  // Sustainability
  LOCALLY_GROWN = 'locally_grown',
  FAIR_TRADE = 'fair_trade',
  RAINFOREST_ALLIANCE = 'rainforest_alliance',
  SUSTAINABLE = 'sustainable',
  REGENERATIVE = 'regenerative',
  BIODYNAMIC = 'biodynamic',
  
  // Quality Standards
  USDA_INSPECTED = 'usda_inspected',
  FDA_APPROVED = 'fda_approved',
  FOOD_SAFETY_CERTIFIED = 'food_safety_certified',
  
  // Dietary
  GLUTEN_FREE = 'gluten_free',
  VEGAN = 'vegan',
  VEGETARIAN = 'vegetarian',
  DAIRY_FREE = 'dairy_free',
  NUT_FREE = 'nut_free',
  
  // Other
  HEIRLOOM = 'heirloom',
  WILD_CAUGHT = 'wild_caught',
  FARM_RAISED = 'farm_raised',
  HANDMADE = 'handmade',
  SMALL_BATCH = 'small_batch'
}

export enum ProductCondition {
  FRESH = 'fresh',                     // Just harvested/produced
  EXCELLENT = 'excellent',             // Perfect condition
  GOOD = 'good',                       // Minor cosmetic imperfections
  FAIR = 'fair',                       // Noticeable imperfections but still good
  IMPERFECT = 'imperfect',             // Ugly produce - still perfectly edible
  SLIGHTLY_DAMAGED = 'slightly_damaged', // Minor damage from farm/transport
  OVERRIPE = 'overripe',               // Past peak ripeness
  NEAR_EXPIRY = 'near_expiry'          // Close to expiration date
}

export enum StorageType {
  AMBIENT = 'ambient',                 // Room temperature
  REFRIGERATED = 'refrigerated',       // Requires refrigeration
  FROZEN = 'frozen',                   // Must be kept frozen
  COOL_DRY = 'cool_dry'                // Cool, dry place
}

export enum ShippingMethod {
  STANDARD = 'standard',
  REFRIGERATED = 'refrigerated',
  FROZEN = 'frozen',
  FRAGILE = 'fragile',
  PERISHABLE = 'perishable',
  NO_SHIPPING = 'no_shipping'          // Pickup only
}

export enum ProductOrigin {
  LOCAL = 'local',                     // Within 50 miles
  REGIONAL = 'regional',               // Within state/province
  NATIONAL = 'national',               // Within country
  IMPORTED = 'imported'                // From another country
}