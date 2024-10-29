import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  Type,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SearchArtistQueryDto } from '../../../modules/artists/dto/api-dto/artist.api-dto';

@Injectable()
export class SearchFriendsQueryValidationPipe implements PipeTransform<SearchArtistQueryDto> {
  async transform(value: SearchArtistQueryDto, { metatype }: ArgumentMetadata) {
    // class-validator decorators validation
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }

    // custom validation
    if (!value.query && !value.genreId && !value.category && value.following === undefined) {
      throw new BadRequestException(
        'One of params (query, genreId, category or following) must be specified!',
      );
    }

    if (value.query && (value.genreId || value.category || value.following)) {
      throw new BadRequestException(
        'Can not use query with genreId, category and following params!',
      );
    }

    return value;
  }

  private toValidate(metatype: Type): boolean {
    const types: Type[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
