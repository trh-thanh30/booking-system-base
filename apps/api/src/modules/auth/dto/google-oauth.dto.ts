import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class StartGoogleOAuthDto {
  @IsOptional()
  @IsIn(['vi', 'en'])
  locale?: 'vi' | 'en';

  @IsOptional()
  @IsString()
  @Matches(/^\/(?!\/)/, {
    message: 'returnTo must be an application-relative path',
  })
  returnTo?: string;
}

export class GoogleOAuthCallbackDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}
