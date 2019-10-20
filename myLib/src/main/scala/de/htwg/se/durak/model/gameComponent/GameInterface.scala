package de.htwg.se.durak.model.gameComponent

import de.htwg.se.durak.model.cardComponent.CardInterface
import de.htwg.se.durak.model.deckComponent.DeckInterface
import de.htwg.se.durak.model.playerComponent.PlayerInterface
import de.htwg.se.durak.model.turnComponent.TurnInterface


trait GameInterface {
  val players: List[PlayerInterface]
  val deck: DeckInterface
  val trump: CardInterface
  val currentTurn: TurnInterface
  val active: PlayerInterface
  val winners: List[PlayerInterface]

  def start(): GameInterface
  def playOk(): GameInterface
  def isShovable(card: CardInterface): Boolean
  def closeTurn(success: Boolean): (TurnInterface, DeckInterface)
  def takeCards(): GameInterface
  def distributeCards(people: List[PlayerInterface]): DeckInterface
  def playCard(card: CardInterface, cardToBlock: Option[CardInterface]): GameInterface
  def defend(card: CardInterface, cardToBlock: Option[CardInterface]): GameInterface
  def winByDefence(): GameInterface
  def attack(card: CardInterface): GameInterface
  def shove(card: CardInterface): GameInterface
  def checkBlockCard(use: CardInterface, against: CardInterface): Boolean
  def checkAttackCard(card: CardInterface): Boolean
  def nextPlayersMove(): PlayerInterface
  def getNeighbour(player: PlayerInterface): PlayerInterface
  def getRightNeighbour(player: PlayerInterface): PlayerInterface
}
