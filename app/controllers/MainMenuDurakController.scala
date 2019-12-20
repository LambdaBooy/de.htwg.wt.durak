package controllers

import akka.actor.{ Actor, ActorRef, ActorSystem, Props }
import akka.stream.Materializer
import com.mohiva.play.silhouette.api.actions.SecuredRequest
import com.mohiva.play.silhouette.api.{ HandlerResult, Silhouette }
import com.mohiva.play.silhouette.api.repositories.AuthInfoRepository
import com.mohiva.play.silhouette.impl.providers.GoogleTotpInfo
import de.htwg.se.durak.Durak
import de.htwg.se.durak.controller.controllerComponent.ControllerInterface
import javax.inject.{ Inject, Singleton }
import models.User
import org.webjars.play.WebJarsUtil
import play.api.i18n.I18nSupport
import play.api.libs.streams.ActorFlow
import play.api.mvc.{ AbstractController, AnyContent, AnyContentAsEmpty, ControllerComponents, Request, WebSocket }
import utils.auth.DefaultEnv

import scala.concurrent.{ ExecutionContext, Future }
import scala.swing.Reactor

@Singleton
class MainMenuDurakController @Inject() ()(
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
  var participants: Map[String, ActorRef] = Map.empty[String, ActorRef]
  var gameStarted: Boolean = false

  def newGame = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    authInfoRepository.find[GoogleTotpInfo](request.identity.loginInfo).map { totpInfoOpt =>
      if (gameController.players.size < 2) {
        Ok(views.html.mainMenuDurak(request.identity, totpInfoOpt))
      } else if (!gameStarted) {
        println("HIER: " + gameController.gameStatus.toString)
        gameController.newGame()
        gameStarted = true
        participants.values.foreach(_ ! "New game")
        Redirect(routes.DurakController.durak())
      } else {
        Redirect(routes.DurakController.durak())
      }
    }
  }

  object MyWebSocketActor {
    def props(user: User)(out: ActorRef) = Props(new MyWebSocketActor(user, out))
  }

  class MyWebSocketActor(user: User, out: ActorRef) extends Actor with Reactor {
    listenTo(gameController);

    def receive = {
      case msg: String =>
        participants += user.fullName.get -> out
        println("Msg received from: " + user.fullName.get)
        sendNotificationToClients
    }

    def sendNotificationToClients(): Unit = {
      println("Received event from Controller")
      participants.values.foreach(_ ! "Update components")
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
