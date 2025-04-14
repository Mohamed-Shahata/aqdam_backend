import { Injectable, Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CLOUDINARY } from "src/utils/constant";
import { v2 as cloudinary } from "cloudinary"


export const CloudinaryProvider: Provider = {
  provide: CLOUDINARY,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    return cloudinary.config({
      cloud_name: config.get<string>("CLOUD_NAME"),
      api_key: config.get<string>("CLOUD_API_KEY"),
      api_secret: config.get<string>("CLOUD_API_SECRET")
    })
  }
}