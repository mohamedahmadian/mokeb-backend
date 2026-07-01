export declare class UploadsService {
    private readonly uploadsRoot;
    saveNationalIdCard(file?: Express.Multer.File): Promise<{
        url: string;
    }>;
    saveMawkibImage(file?: Express.Multer.File): Promise<{
        url: string;
    }>;
    saveProfileImage(file?: Express.Multer.File): Promise<{
        url: string;
    }>;
    private saveImage;
}
