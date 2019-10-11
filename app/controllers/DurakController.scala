package controllers


import de.htwg.se.durak.Durak
import javax.inject._
import play.api._
import play.api.mvc._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class DurakController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
  val gameController = Durak.controller
  val durakAsText = gameController.game.toString

  def about() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.index())
  }

  def durak() = Action {
    Ok(durakAsText)
  }
}
