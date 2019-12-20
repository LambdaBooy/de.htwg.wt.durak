package de.htwg.se.durak.model.cardComponent.cardBaseImpl

import de.htwg.se.durak.model.cardComponent.CardInterface
import de.htwg.se.durak.model.cardComponent.cardBaseImpl.CardColor.CardColor
import de.htwg.se.durak.model.cardComponent.cardBaseImpl.CardValue.CardValue
import play.api.libs.json.{ JsObject, JsString, Json }

import scala.xml.Node

case class Card(color: CardColor, value: CardValue) extends CardInterface {

  override def toString: String = color + " " + value

  def toXml: Node = {
    <card>
      <color>
        { color }
      </color>
      <value>
        { value }
      </value>
    </card>
  }

  def toJson: JsObject = {
    Json.obj(
      "card" -> Json.obj(
        "color" -> JsString(color.toString),
        "value" -> JsString(value.toString)))
  }
}
