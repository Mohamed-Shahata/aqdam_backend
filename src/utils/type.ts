import { UserRole } from "./enum.roles"

export type JWTPayload = {
  id: number,
  role: UserRole
}

export type AccessToken = {
  accessToken: string
}

export type ImageType = {
  public_id: string,
  url: string
}