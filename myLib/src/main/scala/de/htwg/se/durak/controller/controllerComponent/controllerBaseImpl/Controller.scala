package de.htwg.se.durak.controller.controllerComponent.controllerBaseImpl

import com.google.inject.{ Guice, Inject }
import net.codingwell.scalaguice.InjectorExtensions._
import de.htwg.se.durak.DurakModule
import de.htwg.se.durak.controller.controllerComponent.GameStatus._
import de.htwg.se.durak.controller.controllerComponent._
import de.htwg.se.durak.model.cardComponent.CardInterface
import de.htwg.se.durak.model.fileIOComponent._
import de.htwg.se.durak.model.gameComponent.GameInterface
import de.htwg.se.durak.util.customExceptions._
import de.htwg.se.durak.model.gameComponent.gameBaseImpl.Game
import de.htwg.se.durak.model.playerComponent.PlayerInterface
import de.htwg.se.durak.model.playerComponent.playerBaseImpl.Player
import de.htwg.se.durak.util.PlayCommand
import de.htwg.se.durak.util.undoManager.UndoManager
import play.api.libs.json.JsObject

import scala.swing.Publisher

class Controller @Inject() (var game: GameInterface) extends ControllerInterface with Publisher {

  var gameStatus: GameStatus = IDLE
  var players: List[PlayerInterface] = Nil
  private val undoManager = new UndoManager
  val injector: ScalaInjector = Guice.createInjector(new DurakModule)
  val fileIO: FileIOInterface = injector.instance[FileIOInterface]

  def newPlayer(name: String): String = {
    if (!players.toStream.collect({ case p => p.name }).contains(name) && name.nonEmpty) {
      players = Player(name, Nil) :: players
      gameStatus = NEWPLAYER
      publish(new NewPlayerEvent)
    } else {
      gameStatus = PLAYERALREADYPRESENT
      notifyUI(new PlayerAlreadyPresentException)
    }

    gameStatus.toString
  }

  def resetPlayers(): Unit = {
    players = Nil
    gameStatus = RESETPLAYERS
    publish(new ResetPlayersEvent)
  }

  def newGame(): Unit = {
    if (players.size > 1) {
      game = new Game(players).start()
      gameStatus = NEW
      publish(new NewGameEvent)
    } else {
      gameStatus = MOREPLAYERSNEEDED
      notifyUI(new MoreThanOnePlayerNeededException)
    }
  }

  def playCard(firstCard: CardInterface, secondCard: Option[CardInterface]): String = {
    try {
      undoManager.doStep(PlayCommand(firstCard, secondCard, this))
      if (!checkIfGameIsOver) {
        gameStatus = CARDLAYED
        publish(new CardsChangedEvent)
      }
    } catch {
      case iTE: IllegalTurnException =>
        gameStatus = ILLEGALTURN
        notifyUI(iTE)
      case mBCE: MissingBlockingCardException =>
        gameStatus = MISSINGBLOCKINGCARD
        notifyUI(mBCE)
      case vHNECTBE: VictimHasNotEnoughCardsToBlockException =>
        gameStatus = VICTIMHASNOTENOUGHTCARDS
        notifyUI(vHNECTBE)
    }
    gameStatus.toString
  }

  def throwCardIn(card: CardInterface): String = {
    try {
      undoManager.doStep(PlayCommand(card, None, this))
      if (!checkIfGameIsOver) {
        gameStatus = CARDLAYED
        publish(new CardsChangedEvent)
      }
    } catch {
      case vHNECTBE: VictimHasNotEnoughCardsToBlockException =>
        gameStatus = VICTIMHASNOTENOUGHTCARDS
        notifyUI(vHNECTBE)
      case iTE: IllegalTurnException =>
        gameStatus = ILLEGALTURN
        notifyUI(iTE)
    }
    gameStatus.toString
  }

  def undo(): String = {
    undoManager.undoStep()
    gameStatus = UNDO
    publish(new CardsChangedEvent)
    gameStatus.toString;
  }

  def redo(): Unit = {
    undoManager.redoStep()
    gameStatus = REDO
    publish(new CardsChangedEvent)
  }

  def playOk(): String = {
    undoManager.purgeMemento()
    try {
      game = game.playOk()
      gameStatus = OK
      publish(new CardsChangedEvent)
    } catch {
      case _: LayCardFirsException =>
        gameStatus = LAYCARDFIRST
        notifyUI(new LayCardFirsException)
    }
    gameStatus.toString
  }

  def takeCards(): String = {
    try {
      undoManager.purgeMemento()
      game = game.takeCards()
      gameStatus = TAKE
      publish(new CardsChangedEvent)
    } catch {
      case nCTTE: NoCardsToTakeException =>
        gameStatus = NOCARDSTOTAKE
        notifyUI(nCTTE)
    }

    gameStatus.toString();
  }

  def checkIfGameIsOver: Boolean = {
    if (game.players.size == 1) {
      gameStatus = OVER
      publish(new GameOverEvent)
      true
    } else {
      false
    }
  }

  def notifyUI(exception: Exception): Unit = {
    publish(new ExceptionEvent(exception))
  }

  def activePlayerToString(): String = {
    game.active.toString
  }

  def activePlayerHandCardsToString(): String = {
    game.active.handCards.mkString(",")
  }

  def trumpCardToString(): String = {
    game.trump.toString
  }

  def currentTurnToString(): String = {
    game.currentTurn.toString
  }

  def currentAttackerToString(): String = {
    game.currentTurn.attacker.toString
  }

  def currentVictimToString(): String = {
    game.currentTurn.victim.toString
  }

  def currentNeighbourToString(): String = {
    game.currentTurn.neighbour.toString
  }

  def currentAttackCardsToString(): String = {
    game.currentTurn.attackCards.mkString(",")
  }

  def getCurrentBlockedByMap: Map[CardInterface, CardInterface] = {
    game.currentTurn.blockedBy
  }

  def deckSizeToString(): String = {
    game.deck.cards.size.toString
  }

  def winnersToString(): String = {
    game.winners.toString()
  }

  def saveGame(fileName: String): Unit = {
    gameStatus = SAVED
    fileIO.save(game, fileName)
  }

  def loadGame(fileName: String): Unit = {
    game = fileIO.load(fileName)
    gameStatus = LOADED
    publish(new NewGameEvent)
  }

  def gameToString(): String = {
    val trumpCardColorValueArray: Array[String] = trumpCardToString().split(" ")
    val trumpCardColorAsString: String = trumpCardColorValueArray(0)
    val trumpCardValueAsString: String = trumpCardColorValueArray(1)

    var gameString: String = ""

    if (gameStatus == NEW || gameStatus == CARDLAYED || gameStatus == TAKE || gameStatus == OK || gameStatus == UNDO ||
      gameStatus == REDO || gameStatus == LOADED) {
      gameString = gameString.concat("\n=============================================\n" + activePlayerToString() + " turn: \n" +
        activePlayerHandCardsToString() + "\nTrump: [" + trumpCardColorAsString + "] " + trumpCardValueAsString + "\n" +
        currentTurnToString() + "\ncards: " + activePlayerHandCardsToString() + "\nwinners: " + winnersToString() + "\n" +
        "=============================================\n\n")
    }
    gameString
  }

  def exitGame(): Unit = {
    gameStatus = EXIT
    System.exit(0)
  }

  def toJson(): JsObject = {
    fileIO.gameToJson(game)
  }
}
