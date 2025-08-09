import { validate, ValidationError } from 'class-validator'
import { plainToClass } from 'class-transformer'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class ValidationUtils {
  static async validateDto<T extends object>(
    dtoClass: new () => T,
    data: any
  ): Promise<ValidationResult> {
    const dto = plainToClass(dtoClass, data)
    const errors: ValidationError[] = await validate(dto)
    
    if (errors.length === 0) {
      return { isValid: true, errors: [] }
    }

    const errorMessages = errors.map(error => {
      return Object.values(error.constraints || {}).join(', ')
    })

    return { isValid: false, errors: errorMessages }
  }

  static formatValidationErrors(errors: ValidationError[]): string[] {
    return errors.map(error => {
      const constraints = error.constraints || {}
      return Object.values(constraints).join(', ')
    })
  }
}
