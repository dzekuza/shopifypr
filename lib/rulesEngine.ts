// import { Rule } from '@prisma/client';
// Local Rule type based on schema.prisma
export type Rule = {
  id: string;
  shopId: string;
  type: string;
  condition: any;
  message: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

type CartData = {
  total: number;
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    collectionIds: string[];
  }>;
  customerTags: string[];
  countryCode: string;
};

export class RulesEngine {
  private rules: Rule[];

  constructor(rules: Rule[]) {
    this.rules = rules.sort((a, b) => b.priority - a.priority);
  }

  evaluateCart(cartData: CartData): string | null {
    for (const rule of this.rules) {
      if (!rule.isActive) continue;

      const condition = rule.condition as any;
      let matches = false;

      switch (rule.type) {
        case 'cart_total':
          matches = this.evaluateCartTotal(cartData.total, condition);
          break;
        case 'collection':
          matches = this.evaluateCollection(cartData.items, condition);
          break;
        case 'customer_tag':
          matches = this.evaluateCustomerTag(cartData.customerTags, condition);
          break;
        case 'country':
          matches = this.evaluateCountry(cartData.countryCode, condition);
          break;
      }

      if (matches) {
        return rule.message;
      }
    }

    return null;
  }

  private evaluateCartTotal(total: number, condition: { operator: string; value: number }): boolean {
    switch (condition.operator) {
      case '>':
        return total > condition.value;
      case '>=':
        return total >= condition.value;
      case '<':
        return total < condition.value;
      case '<=':
        return total <= condition.value;
      case '==':
        return total === condition.value;
      default:
        return false;
    }
  }

  private evaluateCollection(items: CartData['items'], condition: { collectionId: string }): boolean {
    return items.some(item => item.collectionIds.includes(condition.collectionId));
  }

  private evaluateCustomerTag(tags: string[], condition: { tag: string }): boolean {
    return tags.includes(condition.tag);
  }

  private evaluateCountry(countryCode: string, condition: { country: string }): boolean {
    return countryCode.toUpperCase() === condition.country.toUpperCase();
  }
} 