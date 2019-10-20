package de.htwg.se.durak.model.turnComponent

import de.htwg.se.durak.model.cardComponent.CardInterface
import de.htwg.se.durak.model.playerComponent.PlayerInterface
import de.htwg.se.durak.model.turnComponent.turnBaseImpl.Turn
import play.api.libs.json.JsObject

import scala.xml.Node

trait TurnInterface {
  val attacker: PlayerInterface

  val victim: PlayerInterface

  val neighbour: PlayerInterface

  val attackCards: List[CardInterface]

  val blockedBy: Map[CardInterface, CardInterface]

  def addBlockCard(attackCard: CardInterface, blockCard: CardInterface): Turn

  def addAttackCard(card: CardInterface): Turn

  def getCards: List[CardInterface]

  def getPlayers: List[PlayerInterface]

  def toXml: Node

  def blockedByMapEntryToXml(entry: (CardInterface, CardInterface)): Node

  def toJson: JsObject

  def blockedByMapEntryToJson(entry: (CardInterface, CardInterface)): JsObject

  def toString: String
}
