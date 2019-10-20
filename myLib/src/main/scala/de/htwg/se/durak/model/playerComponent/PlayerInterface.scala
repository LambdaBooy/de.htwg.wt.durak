package de.htwg.se.durak.model.playerComponent

import de.htwg.se.durak.model.cardComponent.CardInterface
import play.api.libs.json.JsObject

import scala.xml.Node

trait PlayerInterface {
  val name: String

  var handCards: List[CardInterface]

  def toString: String

  def pickCards(cards: List[CardInterface]): Unit

  def dropCards(cards: List[CardInterface]): Unit

  def hasCard(card: CardInterface): Boolean

  def sortHandCards(implicit ordering: Ordering[CardInterface]): Unit

  def nameToXml: Node

  def toXml: Node

  def nameToJson: JsObject

  def toJson: JsObject
}
