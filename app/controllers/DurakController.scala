package controllers

import akka.actor._
import akka.stream.Materializer
import com.mohiva.play.silhouette.api.{ HandlerResult, Silhouette }
import com.mohiva.play.silhouette.api.actions.SecuredRequest
import com.mohiva.play.silhouette.api.repositories.AuthInfoRepository
import com.mohiva.play.silhouette.impl.providers.GoogleTotpInfo
import de.htwg.se.durak.controller.controllerComponent.{ ControllerInterface, GameStatus }
import javax.inject._
import org.webjars.play.WebJarsUtil
import play.api.mvc._
import utils.auth.DefaultEnv
import play.api.i18n.I18nSupport

import scala.swing.Reactor
import scala.concurrent.{ ExecutionContext, Future }
import models.User
import play.api.libs.streams.ActorFlow
import de.htwg.se.durak.Durak
import de.htwg.se.durak.model.cardComponent.cardBaseImpl.Card
import de.htwg.se.durak.util.cardConverter.CardStringConverter
import de.htwg.se.durak.util.customExceptions.IllegalTurnException

import scala.collection.mutable.ArrayBuffer
import scala.util.{ Failure, Success, Try }

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's mainMenuDurak page.
 */
@Singleton
class DurakController @Inject() ()(
  components: ControllerComponents,
  silhouette: Silhouette[DefaultEnv],
  authInfoRepository: AuthInfoRepository
)(
  implicit
  webJarsUtil: WebJarsUtil,
  assets: AssetsFinder,
  system: ActorSystem,
  mat: Materializer,
  ec: ExecutionContext
) extends AbstractController(components) with I18nSupport {

  val gameController: ControllerInterface = Durak.controller
  private val converter = CardStringConverter
  var participants: Map[String, ActorRef] = Map.empty[String, ActorRef]

  def about = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      Ok(views.html.aboutDurak(request.identity, totpInfoOpt))
    }
  }

  def durak = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      if (gameController.players.size < 2 || gameController.gameStatus == GameStatus.NEWPLAYER) {
        Ok(views.html.mainMenuDurak(request.identity, totpInfoOpt))
      } else {
        Ok(views.html.durak(gameController, request.identity, totpInfoOpt))
      }
    }
  }

  def durakPolymer = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      Ok(views.html.durakPolymer(gameController, request.identity, totpInfoOpt))
    }
  }

  def durakVue = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      Ok(views.html.durakVue(gameController, request.identity, totpInfoOpt))
    }
  }

  def playCard(input: String) = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
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
  }

  def parseCards(input: List[String]): Try[(Card, Option[Card])] = {
    input.size match {
      case 2 =>
        val attackCard = Card(converter.parseColorString(input.head), converter.parseValueString(input.last))
        Try((attackCard, None))
      case 4 =>
        val attackCard = Card(converter.parseColorString(input.head), converter.parseValueString(input(1)))
        val defendingCard = Some(Card(converter.parseColorString(input(2)), converter.parseValueString(input(3))))
        Try((attackCard, defendingCard))
      case _ => throw new IllegalTurnException("Specify card pls..")
    }
  }

  def undo = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { _ =>
      Ok(gameController.undo())
    }
  }

  def take = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { _ =>
      Ok(gameController.takeCards())
    }
  }

  def ok = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { _ =>
      Ok(gameController.playOk())
    }
  }

  def throwCardIn(input: String) = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { _ =>
      val tokens = input.split(" ")
      var result = "This should not happen :'("
      parseCards(tokens.toList) match {
        case Success(cards) => result = gameController.throwCardIn(cards._1)
        case Failure(ex) => System.err.println("Error while parsing cards: " + ex.getMessage)
      }
      Ok(result)
    }
  }

  def getPlayerRole = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      var res: String = ""
      if (request.identity.fullName.get == gameController.game.currentTurn.attacker.name) {
        res = "attacker"
      } else if (request.identity.fullName.get == gameController.game.currentTurn.victim.name) {
        res = "defender"
      } else {
        if (gameController.game.players.size > 2) {
          println("Not implemented yet!")
        }
      }
      Ok(res)
    }
  }

  def addPlayer(name: String) = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      Ok(gameController.newPlayer(name))
    }
  }

  def getPlayers = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      Ok(gameController.players.mkString(","))
    }
  }

  def getClientId = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      Ok(request.identity.userID.toString)
    }
  }

  def getClientName = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      Ok(request.identity.fullName.get.toString)
    }
  }

  object MyWebSocketActor {
    def props(user: User)(out: ActorRef) = Props(new MyWebSocketActor(user, out))
  }

  class MyWebSocketActor(user: User, out: ActorRef) extends Actor with Reactor {
    listenTo(gameController);

    def receive = {
      case msg: String =>
        println("Msg received from: " + user.fullName.get)
        participants += user.fullName.get -> out
        sendJsonToClients()
    }

    reactions += {
      case _ =>
        sendJsonToClients()
    }

    def sendJsonToClients(): Unit = {
      println("Received event from Controller")
      participants.values.foreach(_ ! gameController.toJson.toString)
    }
  }

  def socket = WebSocket.acceptOrResult[String, String] { request =>
    implicit val req = Request(request, AnyContentAsEmpty)
    silhouette.SecuredRequestHandler { securedRequest =>
      Future.successful(HandlerResult(Ok, Some(securedRequest.identity)))
    }.map {
      case HandlerResult(r, Some(user)) => Right(ActorFlow.actorRef(MyWebSocketActor.props(user)))
      case HandlerResult(r, None) => Left(r)
    }
  }
}
