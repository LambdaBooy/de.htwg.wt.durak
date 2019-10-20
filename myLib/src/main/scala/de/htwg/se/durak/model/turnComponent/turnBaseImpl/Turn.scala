package de.htwg.se.durak.model.turnComponent.turnBaseImpl

import de.htwg.se.durak.model.cardComponent.CardInterface
import de.htwg.se.durak.model.playerComponent.PlayerInterface
import de.htwg.se.durak.model.turnComponent.TurnInterface
import play.api.libs.json.{JsObject, Json}

import scala.xml.Node

case class Turn(attacker: PlayerInterface, victim: PlayerInterface, neighbour: PlayerInterface,
                attackCards: List[CardInterface], blockedBy: Map[CardInterface, CardInterface]) extends TurnInterface {

  def this(attacker: PlayerInterface, victim: PlayerInterface, neighbor: PlayerInterface)
  = this(attacker: PlayerInterface, victim: PlayerInterface, neighbor: PlayerInterface, Nil, Map())

  def addBlockCard(attackCard: CardInterface, blockCard: CardInterface): Turn = copy(attacker, victim, neighbour,
    attackCards.filterNot(c => c.equals(attackCard)), blockedBy + (attackCard -> blockCard))

  def addAttackCard(card: CardInterface): Turn = copy(attacker, victim, neighbour, card :: attackCards)

  def getCards: List[CardInterface] = attackCards ::: blockedBy.values.toList ::: blockedBy.keys.toList

  def getPlayers: List[PlayerInterface] = List(attacker, victim, neighbour)

  def toXml: Node = {
    <currentTurn>
      <attacker>
        {attacker.nameToXml}
      </attacker>
      <victim>
        {victim.nameToXml}
      </victim>
      <neighbour>
        {neighbour.nameToXml}
      </neighbour>
      <attackCards>
        {attackCards.map(c => c.toXml)}
      </attackCards>
        {blockedBy.map(entry => blockedByMapEntryToXml(entry))}
    </currentTurn>
  }

  def blockedByMapEntryToXml(entry: (CardInterface, CardInterface)): Node = {
    <blockedBy>
      <attackCards>
        {entry._1.toXml}
      </attackCards>
      <blockingCards>
        {entry._2.toXml}
      </blockingCards>
    </blockedBy>
  }

  def toJson: JsObject = {
    Json.obj(
      "attacker" -> attacker.nameToJson,
      "victim" -> victim.nameToJson,
      "neighbour" -> neighbour.nameToJson,
      "attackCards" -> attackCards.map(c => c.toJson),
      "blockedBy" -> blockedBy.map(entry => blockedByMapEntryToJson(entry))
    )
  }

  def blockedByMapEntryToJson(entry: (CardInterface, CardInterface)): JsObject = {
    Json.obj(
      "attackCards" -> entry._1.toJson,
      "blockingCards" -> entry._2.toJson
    )
  }

  override def toString: String = {
    ("Attacker: " + attacker.toString + "\n"
      + "Defender: " + victim.toString + "\n"
      + "Neighbor: " + neighbour.toString + "\n"
      + "Cards to block: " + attackCards.mkString("; ") + "\n"
      + "Blocked Cards: " + blockedBy.mkString("; "))
  }

}
