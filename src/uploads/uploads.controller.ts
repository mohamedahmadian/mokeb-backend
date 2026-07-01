import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RoleName } from '@prisma/client';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

const uploadInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('national-id-card')
  @UseInterceptors(uploadInterceptor)
  uploadNationalIdCard(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.saveNationalIdCard(file);
  }

  @Post('mawkib-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  @UseInterceptors(uploadInterceptor)
  uploadMawkibImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.saveMawkibImage(file);
  }

  @Post('profile-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RoleName.Admin,
    RoleName.MawkibOwner,
    RoleName.Pilgrim,
    RoleName.HonoraryServant,
  )
  @UseInterceptors(uploadInterceptor)
  uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.saveProfileImage(file);
  }
}
