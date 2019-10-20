package de.htwg.se.durak.model.fileIOComponent

import de.htwg.se.durak.model.gameComponent.GameInterface

trait FileIOInterface {
  def load(fileName: String): GameInterface
  def save(game: GameInterface, fileName: String)
}
