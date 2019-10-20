package de.htwg.se.durak.model.playerComponent.playerBaseImpl

import de.htwg.se.durak.model.cardComponent.CardInterface
import de.htwg.se.durak.model.playerComponent.PlayerInterface
import play.api.libs.json.{JsObject, JsString, Json}

import scala.xml.Node

case class Player(name: String, var handCards: List[CardInterface]) extends PlayerInterface {
  def this(name: String) = this(name: String, Nil)

  override def toString: String = name

  def pickCards(cards: List[CardInterface]): Unit = handCards = handCards ::: cards

  def dropCards(cards: List[CardInterface]): Unit = handCards = handCards.filterNot(elem => cards.contains(elem))

  def hasCard(card: CardInterface): Boolean = handCards.contains(card)

  def sortHandCards(implicit ordering: Ordering[CardInterface]): Unit = handCards = handCards.sortBy(c => (c.color, c.value))

  def nameToXml: Node = {
    <player>
      <name>
        {name}
      </name>
    </player>
  }

  def toXml: Node = {
    <player>
      <name>
        {name}
      </name>
      <handCards>
        {handCards.map(c => c.toXml)}
      </handCards>
    </player>
  }

  def nameToJson: JsObject = {
    Json.obj(
      "player" -> Json.obj(
        "name" -> JsString(name)
      )
    )
  }

  def toJson: JsObject = {
    Json.obj(
      "player" -> Json.obj(
        "name" -> JsString(name),
        "handCards" -> handCards.map(c => c.toJson)
      )
    )
  }
}
