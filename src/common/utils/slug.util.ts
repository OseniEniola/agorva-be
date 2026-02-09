import slugify from 'slugify';

export class SlugUtil {
  /**
   * Generate a URL-friendly slug from a name
   */
  static generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true, // Remove special characters
      remove: /[*+~.()'"!:@]/g,
    });
  }

  /**
   * Validate that a slug follows the correct format
   * - Only lowercase letters, numbers, and hyphens
   * - Cannot start or end with a hyphen
   * - Between 3 and 63 characters (subdomain length limit)
   */
  static validateSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
    return slugRegex.test(slug);
  }

  /**
   * Make a slug unique by appending a number if needed
   */
  static makeUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
    let slug = baseSlug;
    let counter = 1;

    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
