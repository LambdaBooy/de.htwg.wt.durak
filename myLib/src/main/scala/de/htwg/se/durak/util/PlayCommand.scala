package de.htwg.se.durak.util

import de.htwg.se.durak.controller.controllerComponent.ControllerInterface
import de.htwg.se.durak.model.cardComponent.CardInterface
import de.htwg.se.durak.model.gameComponent.GameInterface
import de.htwg.se.durak.util.undoManager.Command

case class PlayCommand(firstCard: CardInterface, secondCard: Option[CardInterface], controller: ControllerInterface) extends Command {

  var memento: GameInterface = controller.game
  var cardMemento: List[CardInterface] = controller.game.active.handCards

  override def doStep(): Unit = {
    memento = controller.game
    cardMemento = controller.game.active.handCards
    controller.game = controller.game.playCard(firstCard, secondCard)
  }

  override def undoStep(): Unit = {
    switchState()
  }

  override def redoStep(): Unit = {
    switchState()
  }

  def switchState(): Unit = {
    val newMemento = controller.game
    val newCardMemento = controller.game.active.handCards
    controller.game = memento
    controller.game.active.handCards = cardMemento
    memento = newMemento
    cardMemento = newCardMemento
  }
}
