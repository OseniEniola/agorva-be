import { Injectable } from '@nestjs/common';
import { CertificationType, ProductCategory, ProductCondition, ProductOrigin, ProductStatus, ShippingMethod, StorageType, UnitType } from 'src/common/enums/products-enum';
import { UserRole, UserStatus } from 'src/common/enums/user-role.enum';

@Injectable()
export class EnumsService {
     getAllEnums() {
    return {
      productCategories: this.getEnumValues(ProductCategory),
      productStatuses: this.getEnumValues(ProductStatus),
      unitTypes: this.getEnumValues(UnitType),
      certificationTypes: this.getEnumValues(CertificationType),
      productConditions: this.getEnumValues(ProductCondition),
      storageTypes: this.getEnumValues(StorageType),
      shippingMethods: this.getEnumValues(ShippingMethod),
      productOrigins: this.getEnumValues(ProductOrigin),
      userRoles: this.getEnumValues(UserRole),
      userStatuses: this.getEnumValues(UserStatus),
    };
  }

  getProductCategories() {
    return this.getEnumWithLabels(ProductCategory, {
      vegetables: 'Vegetables',
      fruits: 'Fruits',
      herbs: 'Herbs & Spices',
      mushrooms: 'Mushrooms',
      sprouts: 'Sprouts',
      dairy: 'Dairy Products',
      meat: 'Meat',
      poultry: 'Poultry',
      seafood: 'Seafood',
      eggs: 'Eggs',
      grains: 'Grains',
      legumes: 'Legumes & Beans',
      nuts: 'Nuts',
      seeds: 'Seeds',
      flour: 'Flour',
      pasta: 'Pasta',
      rice: 'Rice',
      baked_goods: 'Baked Goods',
      preserves: 'Preserves',
      jams_jellies: 'Jams & Jellies',
      pickles: 'Pickles',
      sauces: 'Sauces',
      condiments: 'Condiments',
      cheese: 'Cheese',
      yogurt: 'Yogurt',
      juice: 'Juice',
      milk: 'Milk',
      tea: 'Tea',
      coffee: 'Coffee',
      honey: 'Honey',
      maple_syrup: 'Maple Syrup',
      oils: 'Oils',
      vinegar: 'Vinegar',
      ready_to_eat: 'Ready to Eat',
      frozen: 'Frozen',
      dried: 'Dried',
      flowers: 'Flowers',
      plants: 'Plants',
      other: 'Other',
    });
  }

  getCertificationTypes() {
    return this.getEnumWithLabels(CertificationType, {
      organic: 'Organic',
      certified_organic: 'Certified Organic',
      non_gmo: 'Non-GMO',
      non_gmo_verified: 'Non-GMO Verified',
      pesticide_free: 'Pesticide Free',
      herbicide_free: 'Herbicide Free',
      chemical_free: 'Chemical Free',
      grass_fed: 'Grass Fed',
      pasture_raised: 'Pasture Raised',
      free_range: 'Free Range',
      cage_free: 'Cage Free',
      humanely_raised: 'Humanely Raised',
      no_antibiotics: 'No Antibiotics',
      no_hormones: 'No Hormones',
      halal: 'Halal',
      kosher: 'Kosher',
      locally_grown: 'Locally Grown',
      fair_trade: 'Fair Trade',
      rainforest_alliance: 'Rainforest Alliance',
      sustainable: 'Sustainable',
      regenerative: 'Regenerative',
      biodynamic: 'Biodynamic',
      usda_inspected: 'USDA Inspected',
      fda_approved: 'FDA Approved',
      food_safety_certified: 'Food Safety Certified',
      gluten_free: 'Gluten Free',
      vegan: 'Vegan',
      vegetarian: 'Vegetarian',
      dairy_free: 'Dairy Free',
      nut_free: 'Nut Free',
      heirloom: 'Heirloom',
      wild_caught: 'Wild Caught',
      farm_raised: 'Farm Raised',
      handmade: 'Handmade',
      small_batch: 'Small Batch',
    });
  }

  getProductConditions() {
    return this.getEnumWithLabels(ProductCondition, {
      fresh: 'Fresh',
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      imperfect: 'Imperfect (Discounted)',
      slightly_damaged: 'Slightly Damaged',
      overripe: 'Overripe',
      near_expiry: 'Near Expiry',
    });
  }

  getUnitTypes() {
    return this.getEnumWithLabels(UnitType, {
      kg: 'Kilogram (kg)',
      gram: 'Gram (g)',
      lb: 'Pound (lb)',
      ounce: 'Ounce (oz)',
      ton: 'Ton',
      liter: 'Liter (L)',
      milliliter: 'Milliliter (ml)',
      gallon: 'Gallon (gal)',
      quart: 'Quart (qt)',
      pint: 'Pint (pt)',
      cup: 'Cup',
      piece: 'Piece',
      dozen: 'Dozen',
      half_dozen: 'Half Dozen',
      bunch: 'Bunch',
      head: 'Head',
      bag: 'Bag',
      box: 'Box',
      pack: 'Pack',
      bundle: 'Bundle',
      carton: 'Carton',
      crate: 'Crate',
      jar: 'Jar',
      bottle: 'Bottle',
      can: 'Can',
      container: 'Container',
    });
  }

  getStorageTypes() {
    return this.getEnumWithLabels(StorageType, {
      ambient: 'Room Temperature',
      refrigerated: 'Refrigerated',
      frozen: 'Frozen',
      cool_dry: 'Cool & Dry Place',
    });
  }

  getShippingMethods() {
    return this.getEnumWithLabels(ShippingMethod, {
      standard: 'Standard Shipping',
      refrigerated: 'Refrigerated Shipping',
      frozen: 'Frozen Shipping',
      fragile: 'Fragile (Handle with Care)',
      perishable: 'Perishable',
      no_shipping: 'No Shipping (Pickup Only)',
    });
  }

  getProductOrigins() {
    return this.getEnumWithLabels(ProductOrigin, {
      local: 'Local (Within 50 miles)',
      regional: 'Regional (Within state)',
      national: 'National',
      imported: 'Imported',
    });
  }

  getProductStatuses() {
    return this.getEnumWithLabels(ProductStatus, {
      draft: 'Draft',
      active: 'Active',
      out_of_stock: 'Out of Stock',
      low_stock: 'Low Stock',
      discontinued: 'Discontinued',
      seasonal: 'Seasonal',
      pending_approval: 'Pending Approval',
      rejected: 'Rejected',
    });
  }

  private getEnumValues(enumObj: any): string[] {
    return Object.values(enumObj);
  }

  private getEnumWithLabels(
    enumObj: any,
    labels: Record<string, string>,
  ): Array<{ value: string; label: string }> {
    return Object.values(enumObj).map((value: string) => ({
      value,
      label: labels[value] || value,
    }));
  }
}
