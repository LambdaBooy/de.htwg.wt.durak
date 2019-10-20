package de.htwg.se.durak.model.fileIOComponent.fileIOXmlImpl

import java.io.{File, PrintWriter}

import de.htwg.se.durak.model.cardComponent.CardInterface
import de.htwg.se.durak.model.deckComponent.DeckInterface
import de.htwg.se.durak.model.fileIOComponent.FileIOInterface
import de.htwg.se.durak.model.gameComponent.GameInterface
import de.htwg.se.durak.model.deckComponent.deckBaseImpl.Deck
import de.htwg.se.durak.model.gameComponent.gameBaseImpl.Game
import de.htwg.se.durak.model.playerComponent.PlayerInterface
import de.htwg.se.durak.model.playerComponent.playerBaseImpl.Player
import de.htwg.se.durak.model.turnComponent.{TurnInterface, turnBaseImpl}
import de.htwg.se.durak.util.cardConverter.CardStringConverter

import scala.xml.Node
import scala.xml.{Elem, PrettyPrinter}

class FileIO extends FileIOInterface {
  override def load(fileName: String): GameInterface = {
    val fileNameWithoutExtension: String = removeExtensionFromFileName(fileName)
    val file: Elem = xml.XML.loadFile("save/" + fileNameWithoutExtension + ".xml")

    val players: List[PlayerInterface] = createPlayersList(file)
    val deck: DeckInterface = createDeck(file)
    val trump: CardInterface = createTrump(file)
    val currentTurn: TurnInterface = createTurn(file, players)
    val active: PlayerInterface = createActivePlayer(file, players)
    val winners: List[PlayerInterface] = createWinnersList(file)

    Game(players, deck, trump, currentTurn, active, winners)
  }

  override def save(game: GameInterface, fileName: String): Unit = saveString(game, fileName)

  def saveString(game: GameInterface, fileName: String): Unit = {
    val WIDTH: Int = 120
    val STEP: Int = 4
    val fileNameWithoutExtension: String = removeExtensionFromFileName(fileName)
    val printWriter: PrintWriter = new PrintWriter(new File("save/" + fileNameWithoutExtension + ".xml"))
    val prettyPrinter: PrettyPrinter = new PrettyPrinter(WIDTH, STEP)
    val xml = prettyPrinter.format(gameToXml(game))
    printWriter.write(xml)
    printWriter.close()
  }

  def removeExtensionFromFileName(fileName: String): String = {
    if (fileName.contains(".")) {
      fileName.substring(0, fileName.lastIndexOf('.'))
    } else {
      fileName
    }
  }

  def createCard(c: Node): List[CardInterface] = {
    val cardColor: String = (c \ "color").text.trim
    val cardValue: String = (c \ "value").text.trim
    val card: CardInterface = CardStringConverter.parseCardStringToCardObject(cardColor + " " + cardValue)
    List(card)
  }

  def createPlayersList(file: Elem): List[PlayerInterface] = {
    var players: List[PlayerInterface] = Nil

    (file \\ "players" \\ "player").foreach(node => {
      val name = (node \ "name").text.toString.trim
      var handCards: List[CardInterface] = Nil

      (node \\ "handCards" \ "card").foreach(card => {
        handCards = handCards ::: createCard(card)
      })

      players = players ::: List(Player(name, handCards))
    })

    players
  }

  def createDeck(file: Elem): DeckInterface = {
    var cards: List[CardInterface] = Nil

    (file \\ "deck" \ "card").foreach(card => {
      cards = cards ::: createCard(card)
    })

    Deck(cards)
  }

  def createTrump(file: Elem): CardInterface = {
    createCard((file \\ "trump" \ "card").head).head
  }

  def createTurn(file: Elem, players: List[PlayerInterface]): TurnInterface = {
    val attackerName = (file \\ "attacker" \ "player" \ "name").text.toString.trim
    val victimName = (file \\ "victim" \ "player" \ "name").text.toString.trim
    val neighbourName = (file \\ "neighbour" \ "player" \ "name").text.toString.trim

    var attackCards: List[CardInterface] = Nil
    var blockedAttackCards: List[CardInterface] = Nil
    var blockingCards: List[CardInterface] = Nil

    (file \\ "currentTurn" \ "attackCards" \ "card").foreach(c => {
      attackCards = attackCards ::: createCard(c)
    })

    (file \\ "blockedBy" \ "attackCards" \ "card").foreach(c => {
      blockedAttackCards = blockedAttackCards ::: createCard(c)
    })

    (file \\ "blockedBy" \ "blockingCards" \ "card").foreach(c => {
      blockingCards = blockingCards ::: createCard(c)
    })

    val attacker: PlayerInterface = players.filter(p => p.name.equals(attackerName)).head
    val victim: PlayerInterface = players.filter(p => p.name.equals(victimName)).head
    val neighbour: PlayerInterface = players.filter(p => p.name.equals(neighbourName)).head
    var blockedBy: Map[CardInterface, CardInterface] = Map()

    for ((attackCard, blockingCard) <- blockedAttackCards zip blockingCards) {
      blockedBy = blockedBy + (attackCard -> blockingCard)
    }

    turnBaseImpl.Turn(attacker, victim, neighbour, attackCards, blockedBy)
  }

  def createActivePlayer(file: Elem, players: List[PlayerInterface]): PlayerInterface = {
    val activePlayerName: String = (file \\ "active" \ "player" \ "name").text.toString.trim
    players.filter(p => p.name.equals(activePlayerName)).head
  }

  def createWinnersList(file: Elem): List[PlayerInterface] = {
    var winners: List[PlayerInterface] = Nil

    (file \\ "winners" \ "player").foreach(p => {
      val playerName: String = (p \ "name").text.toString.trim
      winners = winners ::: List(Player(playerName, Nil))
    })

    winners
  }

  def gameToXml(game: GameInterface): Elem = {
    <game>
      <players>
        {game.players.map(p => p.toXml)}
      </players>
        {game.deck.toXml}
      <trump>
        {game.trump.toXml}
      </trump>
        {game.currentTurn.toXml}
      <active>
        {game.active.nameToXml}
      </active>
      <winners>
        {game.winners.map(p => p.nameToXml)}
      </winners>
    </game>
  }
}
