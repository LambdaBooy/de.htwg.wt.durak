package de.htwg.se.durak.model.deckComponent

import de.htwg.se.durak.model.cardComponent.CardInterface
import play.api.libs.json.JsObject

import scala.xml.Node

trait DeckInterface {
  val cards: List[CardInterface]

  def head: CardInterface

  def tail: DeckInterface

  def shuffle: DeckInterface

  def popTopCard(): (CardInterface, DeckInterface)

  def popNCards(n: Int): (List[CardInterface], DeckInterface)

  def toXml: Node

  def toJson: List[JsObject]

  def toString: String
}
