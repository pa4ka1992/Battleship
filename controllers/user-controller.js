import { userService } from "../services/user-service.js";
import { validationResult } from "express-validator";
import { ApiError } from "../exeptions/api-eror.js";

export class UserController {
  setCookies(userData, res, state) {
    const message =
      state === "login"
        ? "Пользователь с таким именем уже существует"
        : "Пользователь не авторизован";

    if (userData) {
      return res
        .status(200)
        .cookie("refreshToken", userData.refreshToken, {
          maxAge: 3600000000,
          httpOnly: true,
          sameSite: "none",
          secure: true,
        })
        .json(userData);
    } else {
      throw ApiError.AuthorizationError(message);
    }
  }

  async logIn(req, res, next) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.ShortNameError();
      }

      const { name } = req.body;
      const userData = await userService.logIn(name);

      return this.setCookies(userData, res, "login");
    } catch (error) {
      next(error);
    }
  }

  async logOut(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logOut(refreshToken);

      return res
        .clearCookie(refreshToken, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        })
        .status(200)
        .json({ message: "Пользователь удален" });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);

      return this.setCookies(userData, res, "refresh");
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await userService.getUsers();
      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
