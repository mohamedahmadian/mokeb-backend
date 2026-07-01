import { UploadsService } from './uploads.service';
export declare class UploadsController {
    private uploadsService;
    constructor(uploadsService: UploadsService);
    uploadNationalIdCard(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadMawkibImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadProfileImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
