import { BadRequestException, Injectable } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary"
import * as toStream from "buffer-to-stream"

@Injectable()
export class CloudinaryService {

  /**
   * 
   * @param file 
   * @param folder 
   * @returns 
   */
  public async uploadImage(file: Express.Multer.File, folder: string = "uploads"): Promise<any> {
    return new Promise((resolve, rejects) => {
      if (file.size > 1000000) {
        return rejects(new BadRequestException("size image is bigger"));
      };

      if (!file.mimetype.startsWith("image")) {
        return rejects(new BadRequestException("invalid format"));
      };

      const upload = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
        if (err) return rejects(err)
        resolve(result)
      })
      toStream(file.buffer).pipe(upload);
    })
  };


  /**
   * 
   * @param publicId 
   * @returns 
   */
  public async deleteImage(publicId: string) {
    return new Promise((resolve, rejects) => {
      cloudinary.uploader.destroy(publicId, (err, result) => {
        if (err) return rejects(err);
        resolve(result);
      })
    })
  }
}