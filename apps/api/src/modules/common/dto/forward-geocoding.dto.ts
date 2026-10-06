import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class ForwardGeocodingDto {
  @Transform(trim)
  @IsString()
  @Length(2, 2)
  countryCode: string;

  @Transform(trim)
  @IsString()
  @Length(1, 255)
  addressLine1: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2 = '';

  @Transform(trim)
  @IsString()
  @Length(1, 100)
  locality: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  administrativeAreaLevel1 = '';

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  administrativeAreaLevel2 = '';

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode = '';

  @IsIn(['vi', 'en'])
  locale: 'vi' | 'en' = 'vi';
}
