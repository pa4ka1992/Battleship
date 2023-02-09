import router from "../route/index.js";
import { wsRouter } from "../route/index.js";
import { gameService } from "../services/game-service.js";
import { tokenService } from "../services/token-service.js";

export class GameController {
  async startGame(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = tokenService.validateRefreshToken(refreshToken);
      const { opponent } = await gameService.startGame(refreshToken);
      let wsId;

      if (opponent) {
        wsId = opponent._id;

        return res.status(200).json({
          gameId: wsId,
          user: { id: userData.id, name: userData.name },
        });
      } else {
        wsId = userData.id;

        return res.status(200).json({
          gameId: wsId,
          user: { id: userData.id, name: userData.name },
        });
      }
    } catch (error) {
      return res.status(500).json({ message: "Ошибка на сервере" });
    }
  }
}

export const gameController = new GameController();
