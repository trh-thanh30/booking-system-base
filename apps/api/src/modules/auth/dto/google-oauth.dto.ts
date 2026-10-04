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
  // Optional Google response metadata; identity is verified from the ID token.
  @IsOptional()
  @IsString()
  iss?: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  authuser?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

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
