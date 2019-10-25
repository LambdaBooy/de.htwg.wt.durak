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
    try {
      parseCards(tokens.toList) match {
        case Success(cards) => gameController.playCard(cards._1, cards._2)
        case Failure(ex) => System.err.println("Error while parsing cards: " + ex.getMessage)
      }
      Redirect(routes.DurakController.durak())
    } catch {
      case _: IllegalTurnException => Ok("Card: '" + input + "' doesn't exist!" )
    }
  }

  def ok: Action[AnyContent] = Action {
    gameController.playOk()
    Redirect(routes.DurakController.durak())
  }

  def take: Action[AnyContent] = Action {
    gameController.takeCards()
    Redirect(routes.DurakController.durak())
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
    gameController.undo()
    Redirect(routes.DurakController.durak())
  }
}
