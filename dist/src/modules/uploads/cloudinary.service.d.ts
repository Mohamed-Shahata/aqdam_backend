export declare class CloudinaryService {
    uploadImage(file: Express.Multer.File, folder?: string): Promise<any>;
    deleteImage(publicId: string): Promise<unknown>;
}
