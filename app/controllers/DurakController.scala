package controllers


import de.htwg.se.durak.Durak
import de.htwg.se.durak.controller.controllerComponent.{ControllerInterface, GameStatus}
import de.htwg.se.durak.model.cardComponent.cardBaseImpl.Card
import de.htwg.se.durak.util.cardConverter.CardStringConverter
import de.htwg.se.durak.util.customExceptions.IllegalTurnException
import javax.inject._
import play.api.mvc._

import scala.util.{Failure, Success, Try}

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class DurakController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
  val gameController: ControllerInterface = Durak.controller

  private val converter = CardStringConverter

  def about: Action[AnyContent] = Action {
    Ok(views.html.index())
  }

  def durak: Action[AnyContent] = Action {
    println(gameController.gameStatus)
    if (gameController.players.size < 2 || gameController.gameStatus == GameStatus.NEWPLAYER) {
      Ok(views.html.mainMenu())
    } else {
      Ok(views.html.durak(gameController))
    }
  }

  def addPlayer(name: String): Action[AnyContent] = Action {
    gameController.newPlayer(name)
    Redirect(routes.DurakController.durak())
  }

  def newGame: Action[AnyContent] = Action {
    if (gameController.players.size < 2) {
      Redirect(routes.DurakController.durak())
    } else {
      gameController.newGame()
      Redirect(routes.DurakController.durak())
    }
  }

  def playCard(input: String): Action[AnyContent] = Action {
    val tokens = input.split(" ")
    var result = "This should not happen :'("
    try {
      parseCards(tokens.toList) match {
        case Success(cards) => result = gameController.playCard(cards._1, cards._2)
        case Failure(ex) => System.err.println("Error while parsing cards: " + ex.getMessage)
      }
      Ok(result)
    } catch {
      case _: IllegalTurnException => Ok("Card: '" + input + "' doesn't exist!")
    }
  }

  def throwCardIn(input: String): Action[AnyContent] = Action {
    val tokens = input.split(" ");
    var result = "This should not happen :'("
    try {
      parseCards(tokens.toList) match {
        case Success(cards) => result = gameController.throwCardIn(cards._1)
        case Failure(ex) => System.err.println("Error while parsing cards: " + ex.getMessage)
      }
      Ok(result)
    }
  }

  def ok: Action[AnyContent] = Action {
    Ok(gameController.playOk())
  }

  def take: Action[AnyContent] = Action {
    Ok(gameController.takeCards());
  }

  def getNumberOfPlayers: Action[AnyContent] = Action {
    Ok(gameController.players.size.toString)
  }

  def exit: Action[AnyContent] = Action {
    gameController.exitGame()
    Ok("Exit")
  }

  def parseCards(input: List[String]): Try[(Card, Option[Card])] = {
    input.size match {
      case 2 => Try(Card(converter.parseColorString(input.head), converter.parseValueString(input.last)), None)
      case 4 => Try((Card(converter.parseColorString(input.head), converter.parseValueString(input(1))),
        Some(Card(converter.parseColorString(input(2)), converter.parseValueString(input(3))))))
      case _ => throw new IllegalTurnException("Specify card pls..")
    }
  }

  def undo: Action[AnyContent] = Action {
    Ok(gameController.undo());
  }

  def getActivePlayer: Action[AnyContent] = Action {
    Ok(gameController.game.active.name)
  }

  def getAttacker: Action[AnyContent] = Action {
    Ok(gameController.game.currentTurn.attacker.name)
  }

  def getDefender: Action[AnyContent] = Action {
    Ok(gameController.game.currentTurn.victim.name)
  }

  def getNeighbor: Action[AnyContent] = Action {
    Ok(gameController.game.currentTurn.neighbour.name)
  }

  def getActivePlayerHandCards: Action[AnyContent] = Action {
    Ok(gameController.game.active.handCards.toString)
  }

  def getAttackerHandCards: Action[AnyContent] = Action {
    Ok(gameController.game.currentTurn.attacker.handCards.mkString(","))
  }

  def getDefenderHandCards: Action[AnyContent] = Action {
    Ok(gameController.game.currentTurn.victim.handCards.mkString(","))
  }

  def getAttackCards: Action[AnyContent] = Action {
    Ok(gameController.game.currentTurn.attackCards.mkString(","))
  }

  def getBlockedCards: Action[AnyContent] = Action {
    Ok(gameController.game.currentTurn.blockedBy.keys.mkString(","))
  }

  def getBlockingCards: Action[AnyContent] = Action {
    Ok(gameController.game.currentTurn.blockedBy.values.mkString(","))
  }
}
