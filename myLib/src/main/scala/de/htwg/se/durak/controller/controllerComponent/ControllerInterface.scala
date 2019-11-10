package de.htwg.se.durak.controller.controllerComponent

import de.htwg.se.durak.controller.controllerComponent.GameStatus.GameStatus
import de.htwg.se.durak.model.cardComponent.CardInterface
import de.htwg.se.durak.model.gameComponent.GameInterface
import de.htwg.se.durak.model.playerComponent.PlayerInterface

import scala.swing.Publisher
import scala.swing.event.Event

trait ControllerInterface extends Publisher {
  var game: GameInterface

  var gameStatus: GameStatus

  var players: List[PlayerInterface]

  def newPlayer(name: String): Unit

  def resetPlayers(): Unit

  def newGame(): Unit

  def playCard(firstCard: CardInterface, secondCard: Option[CardInterface]): String

  def throwCardIn(card: CardInterface): Unit

  def undo(): Unit

  def redo(): Unit

  def playOk(): String

  def takeCards(): Unit

  def checkIfGameIsOver: Boolean

  def notifyUI(exception: Exception): Unit

  def activePlayerToString(): String

  def trumpCardToString(): String

  def currentTurnToString(): String

  def activePlayerHandCardsToString(): String

  def currentAttackerToString(): String

  def currentVictimToString(): String

  def currentNeighbourToString(): String

  def currentAttackCardsToString(): String

  def getCurrentBlockedByMap: Map[CardInterface, CardInterface]

  def deckSizeToString(): String

  def winnersToString(): String

  def saveGame(fileName: String): Unit

  def loadGame(fileName: String): Unit

  def gameToString(): String

  def exitGame(): Unit
}

class CardsChangedEvent extends Event

class GameOverEvent extends Event

class NewGameEvent extends Event

class NewPlayerEvent extends Event

class ResetPlayersEvent extends Event

class ExitGameEvent extends Event

class ExceptionEvent(exception: Exception) extends Event {
  def getException: Exception = {
    exception
  }
}


