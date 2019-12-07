package controllers


import de.htwg.se.durak.Durak
import de.htwg.se.durak.controller.controllerComponent.{CardsChangedEvent, ControllerInterface, GameStatus, NewGameEvent, NewPlayerEvent}
import de.htwg.se.durak.model.cardComponent.cardBaseImpl.Card
import de.htwg.se.durak.util.cardConverter.CardStringConverter
import de.htwg.se.durak.util.customExceptions.IllegalTurnException
import javax.inject._
import play.api.libs.streams.ActorFlow
import play.api.mvc._
import akka.actor._
import akka.stream.Materializer
import java.util.UUID
import scala.collection.mutable
import scala.swing.Reactor
import scala.util.{Failure, Success, Try}

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class DurakController @Inject()(cc: ControllerComponents)(
  implicit system: ActorSystem,
  mat: Materializer) extends AbstractController(cc) {

  val gameController: ControllerInterface = Durak.controller
  var cookieToUuid: mutable.Map[String, String] = mutable.Map()
  var uuidToPlayer: mutable.Map[String, String] = mutable.Map()

  private val converter = CardStringConverter

  def about: Action[AnyContent] = Action {
    Ok(views.html.index())
  }

  def durak: Action[AnyContent] = Action {
    println(gameController.gameStatus)
    if (gameController.players.size < 2 || gameController.gameStatus == GameStatus.NEWPLAYER) {
      Ok(views.html.mainMenu(gameController))
    } else {
      Ok(views.html.durak(gameController))
    }
  }

  def addPlayer(name: String): Action[AnyContent] = Action {
    Ok(gameController.newPlayer(name))
  }

  def check: Action[AnyContent] = Action {
    implicit request => {
      val cookie = request.cookies.get("PLAY_SESSION") match {
        case Some(cookie) => cookie.value
        case None => "This should not happen :'("
      }

      if (cookieToUuid.contains(cookie)) {
        Ok("COOKIEALREADYEXISTS")
      } else {
        Ok("COOKIEISNOTPRESENT")
      }
    }
  }

  def getPlayers: Action[AnyContent] = Action {
    Ok(gameController.players.mkString(" "))
  }

  def newGame: Action[AnyContent] = Action {
    if (gameController.players.size < 2) {
      Redirect(routes.DurakController.durak())
    } else {
      gameController.newGame()
      // Redirect(routes.DurakController.durak())
      Redirect(routes.DurakController.durakPolymer())
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
    val tokens = input.split(" ")
    var result = "This should not happen :'("
    parseCards(tokens.toList) match {
      case Success(cards) => result = gameController.throwCardIn(cards._1)
      case Failure(ex) => System.err.println("Error while parsing cards: " + ex.getMessage)
    }
    Ok(result)
  }

  def ok: Action[AnyContent] = Action {
    Ok(gameController.playOk())
  }

  def take: Action[AnyContent] = Action {
    Ok(gameController.takeCards())
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
    Ok(gameController.undo())
  }

  def gameToJson: Action[AnyContent] = Action {
    Ok(gameController.toJson)
  }

  def getPlayerRole: Action[AnyContent] = Action {
    implicit request => {
      val cookie = request.cookies.get("PLAY_SESSION") match {
        case Some(cookie) => cookie.value
        case None => "This should not happen :'("
      }

      val uuid = cookieToUuid(cookie)
      val playerName = uuidToPlayer(uuid)

      var res = "This should not happen :'("

      if (playerName == gameController.game.currentTurn.attacker.name) {
        res = "attacker"
      } else if (playerName == gameController.game.currentTurn.victim.name) {
        res = "defender"
      } else {
        if (gameController.game.players.size > 2) {
          println("Not implemented yet!")
        }
      }
      Ok(res)
    }
  }

  def getPlayerName: Action[AnyContent] = Action {
    implicit request => {
      val cookie = request.cookies.get("PLAY_SESSION") match {
        case Some(cookie) => cookie.value
        case None => "This should not happen :'("
      }

      val uuid = cookieToUuid(cookie)
      Ok(uuidToPlayer(uuid))
    }
  }

  def gameStatus: Action[AnyContent] = Action {
    Ok(gameController.gameStatus.toString)
  }

  def socket(playerName: Option[String]): WebSocket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      println("Connect received")

      val cookie = request.cookies.get("PLAY_SESSION") match {
        case Some(c) => c.value
        case None => "This shouldn't happen :'("
      }

      if (cookieToUuid.contains(cookie)) {
        println("cookie: " + cookie + " is already present!")
        val uuid = cookieToUuid(cookie)
        val playerName = uuidToPlayer(uuid)

        if (playerName == gameController.game.currentTurn.attacker.name) {
          println("user: " + playerName + " is attacker")
        } else if (playerName == gameController.game.currentTurn.victim.name) {
          println("user: " + playerName + " is defender")
        } else {
          if (gameController.game.players.size > 2) {
            println("Not implemented yet!")
          }
        }
      } else {
        println("cookie was not present. Adding it now ...")
        val uuid = UUID.randomUUID.toString
        cookieToUuid(cookie) = uuid

        playerName match {
          case Some(name) => uuidToPlayer(uuid) = name
          case None => println("This shouldn't happen :'(")
        }
      }

      DurakWebSocketActorFactory.create(out, request)
    }
  }

  def durakPolymer(): Action[AnyContent] = Action {
    Ok(views.html.durakPolymer())
  }

  object DurakWebSocketActorFactory {
    def create(out: ActorRef, request: RequestHeader): Props = {
      Props(new DurakWebSocketActor(out, request))
    }
  }

  class DurakWebSocketActor(out: ActorRef, request: RequestHeader) extends Actor with Reactor {
    listenTo(gameController)

    def receive: PartialFunction[Any, Unit] = {
      case msg: String =>
        sendJsonToClient()
    }

    reactions += {
      case _ =>
        sendJsonToClient()
    }

    def sendJsonToClient(): Unit = {
      println("Received event from Controller")
      out ! gameController.toJson.toString
    }
  }

}
