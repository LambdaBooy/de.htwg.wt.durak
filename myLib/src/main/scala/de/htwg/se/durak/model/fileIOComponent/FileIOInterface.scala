package de.htwg.se.durak.model.fileIOComponent

import de.htwg.se.durak.model.gameComponent.GameInterface
import play.api.libs.json.JsObject

trait FileIOInterface {
  def load(fileName: String): GameInterface
  def save(game: GameInterface, fileName: String)
  def gameToJson(game: GameInterface): JsObject
}
