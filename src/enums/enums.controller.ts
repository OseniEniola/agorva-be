import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { ResponseUtil } from 'src/common/utils/response.util';
import { EnumsService } from './enums.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('enums')
export class EnumsController {
    constructor(private readonly enumsService: EnumsService) {}

  // Get all enums at once
  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Get all enums',
    description: 'Retrieve all enum values at once for application initialization'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'All enums retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Enums retrieved successfully',
        data: {
          productCategories: ['vegetables', 'fruits', 'meat'],
          certificationTypes: ['organic', 'halal', 'kosher'],
          productConditions: ['fresh', 'excellent', 'imperfect']
        }
      }
    }
  })
  getAllEnums() {
    const enums = this.enumsService.getAllEnums();
    return ResponseUtil.success(enums, 'Enums retrieved successfully');
  }

  // Get product categories with labels
  @Public()
  @Get('product-categories')
  @ApiOperation({ 
    summary: 'Get product categories',
    description: 'Retrieve all product categories with human-readable labels for dropdown menus'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Product categories retrieved',
    schema: {
      example: {
        success: true,
        message: 'Product categories retrieved',
        data: [
          { value: 'vegetables', label: 'Vegetables' },
          { value: 'fruits', label: 'Fruits' },
          { value: 'meat', label: 'Meat' }
        ]
      }
    }
  })
  getProductCategories() {
    const categories = this.enumsService.getProductCategories();
    return ResponseUtil.success(categories, 'Product categories retrieved');
  }

  // Get certification types with labels
  @Public()
  @Get('certifications')
  @ApiOperation({ 
    summary: 'Get certification types',
    description: 'Retrieve all certification types including Halal, Kosher, Organic, etc.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Certifications retrieved',
    schema: {
      example: {
        success: true,
        message: 'Certifications retrieved',
        data: [
          { value: 'halal', label: 'Halal' },
          { value: 'kosher', label: 'Kosher' },
          { value: 'organic', label: 'Organic' },
          { value: 'vegan', label: 'Vegan' }
        ]
      }
    }
  })
  getCertifications() {
    const certifications = this.enumsService.getCertificationTypes();
    return ResponseUtil.success(certifications, 'Certifications retrieved');
  }

  // Get product conditions with labels
  @Public()
  @Get('conditions')
  @ApiOperation({ 
    summary: 'Get product conditions',
    description: 'Retrieve product condition types (Fresh, Imperfect, Damaged, etc.)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Product conditions retrieved',
    schema: {
      example: {
        success: true,
        message: 'Product conditions retrieved',
        data: [
          { value: 'fresh', label: 'Fresh' },
          { value: 'imperfect', label: 'Imperfect (Discounted)' },
          { value: 'slightly_damaged', label: 'Slightly Damaged' }
        ]
      }
    }
  })
  getConditions() {
    const conditions = this.enumsService.getProductConditions();
    return ResponseUtil.success(conditions, 'Product conditions retrieved');
  }

  // Get unit types with labels
  @Public()
  @Get('units')
  @ApiOperation({ 
    summary: 'Get unit types',
    description: 'Retrieve all measurement unit types (kg, lb, dozen, liter, etc.)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Unit types retrieved',
    schema: {
      example: {
        success: true,
        message: 'Unit types retrieved',
        data: [
          { value: 'kg', label: 'Kilogram (kg)' },
          { value: 'lb', label: 'Pound (lb)' },
          { value: 'dozen', label: 'Dozen' }
        ]
      }
    }
  })
  getUnits() {
    const units = this.enumsService.getUnitTypes();
    return ResponseUtil.success(units, 'Unit types retrieved');
  }

  // Get storage types with labels
  @Public()
  @Get('storage-types')
  @ApiOperation({ 
    summary: 'Get storage types',
    description: 'Retrieve storage requirement types (Ambient, Refrigerated, Frozen, etc.)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Storage types retrieved',
    schema: {
      example: {
        success: true,
        message: 'Storage types retrieved',
        data: [
          { value: 'ambient', label: 'Room Temperature' },
          { value: 'refrigerated', label: 'Refrigerated' },
          { value: 'frozen', label: 'Frozen' }
        ]
      }
    }
  })
  getStorageTypes() {
    const storageTypes = this.enumsService.getStorageTypes();
    return ResponseUtil.success(storageTypes, 'Storage types retrieved');
  }

  // Get shipping methods with labels
  @Public()
  @Get('shipping-methods')
  @ApiOperation({ 
    summary: 'Get shipping methods',
    description: 'Retrieve available shipping method types'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Shipping methods retrieved',
    schema: {
      example: {
        success: true,
        message: 'Shipping methods retrieved',
        data: [
          { value: 'standard', label: 'Standard Shipping' },
          { value: 'refrigerated', label: 'Refrigerated Shipping' },
          { value: 'frozen', label: 'Frozen Shipping' }
        ]
      }
    }
  })
  getShippingMethods() {
    const shippingMethods = this.enumsService.getShippingMethods();
    return ResponseUtil.success(shippingMethods, 'Shipping methods retrieved');
  }

  // Get product origins with labels
  @Public()
  @Get('origins')
  @ApiOperation({ 
    summary: 'Get product origins',
    description: 'Retrieve product origin types (Local, Regional, National, Imported)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Product origins retrieved',
    schema: {
      example: {
        success: true,
        message: 'Product origins retrieved',
        data: [
          { value: 'local', label: 'Local (Within 50 miles)' },
          { value: 'regional', label: 'Regional (Within state)' },
          { value: 'national', label: 'National' },
          { value: 'imported', label: 'Imported' }
        ]
      }
    }
  })
  getOrigins() {
    const origins = this.enumsService.getProductOrigins();
    return ResponseUtil.success(origins, 'Product origins retrieved');
  }

  // Get product statuses with labels
  @Public()
  @Get('statuses')
  @ApiOperation({ 
    summary: 'Get product statuses',
    description: 'Retrieve product status types (Draft, Active, Out of Stock, etc.)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Product statuses retrieved',
    schema: {
      example: {
        success: true,
        message: 'Product statuses retrieved',
        data: [
          { value: 'draft', label: 'Draft' },
          { value: 'active', label: 'Active' },
          { value: 'out_of_stock', label: 'Out of Stock' }
        ]
      }
    }
  })
  getStatuses() {
    const statuses = this.enumsService.getProductStatuses();
    return ResponseUtil.success(statuses, 'Product statuses retrieved');
  }
}
