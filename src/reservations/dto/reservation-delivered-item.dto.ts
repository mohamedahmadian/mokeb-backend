import { ReservationDeliveredItemStatus } from '@prisma/client';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReservationDeliveredItemDto {
  @IsString({ message: 'نام کالا نامعتبر است' })
  @IsNotEmpty({ message: 'نام کالا الزامی است' })
  @MaxLength(200, { message: 'نام کالا نباید بیشتر از ۲۰۰ کاراکتر باشد' })
  itemName: string;

  @IsInt({ message: 'تعداد نامعتبر است' })
  @Min(1, { message: 'تعداد باید حداقل ۱ باشد' })
  quantity: number;

  @IsOptional()
  @IsString({ message: 'توضیحات نامعتبر است' })
  @MaxLength(1000, { message: 'توضیحات نباید بیشتر از ۱۰۰۰ کاراکتر باشد' })
  description?: string;
}

export class UpdateReservationDeliveredItemDto extends CreateReservationDeliveredItemDto {}
