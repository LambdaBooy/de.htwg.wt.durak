package de.htwg.se.durak.model.fileIOComponent.fileIOJsonImpl

import java.io.{ File, PrintWriter }

import de.htwg.se.durak.model.cardComponent.CardInterface
import de.htwg.se.durak.model.deckComponent.DeckInterface
import de.htwg.se.durak.model.deckComponent.deckBaseImpl.Deck
import de.htwg.se.durak.model.fileIOComponent.FileIOInterface
import de.htwg.se.durak.model.gameComponent.GameInterface
import de.htwg.se.durak.model.gameComponent.gameBaseImpl.Game
import de.htwg.se.durak.model.playerComponent.PlayerInterface
import de.htwg.se.durak.model.playerComponent.playerBaseImpl.Player
import de.htwg.se.durak.model.turnComponent.{ TurnInterface, turnBaseImpl }
import de.htwg.se.durak.util.cardConverter.CardStringConverter
import play.api.libs.json.{ JsObject, JsValue, Json }

import scala.io.{ BufferedSource, Source }

class FileIO extends FileIOInterface {
  override def load(fileName: String): GameInterface = {
    val fileNameWithoutExtension: String = removeExtensionFromFileName(fileName)
    val source: BufferedSource = Source.fromFile("save/" + fileNameWithoutExtension + ".json")
    val sourceAsString = source.getLines().mkString
    val sourceAsJson: JsValue = Json.parse(sourceAsString)

    val players: List[PlayerInterface] = createPlayersLit(sourceAsJson)
    val deck: DeckInterface = createDeck(sourceAsJson)
    val trump: CardInterface = createTrump(sourceAsJson)
    val currentTurn: TurnInterface = createTurn(sourceAsJson, players)
    val active: PlayerInterface = createActivePlayer(sourceAsJson, players)
    val winners: List[PlayerInterface] = createWinnersList(sourceAsJson)

    source.close()

    Game(players, deck, trump, currentTurn, active, winners)
  }

  override def save(game: GameInterface, fileName: String): Unit = {
    val fileNameWithoutExtension: String = removeExtensionFromFileName(fileName)
    val printWriter = new PrintWriter(new File("save/" + fileNameWithoutExtension + ".json"))
    printWriter.write(Json.prettyPrint(gameToJson(game)))
    printWriter.close()
  }

  def removeExtensionFromFileName(fileName: String): String = {
    if (fileName.contains(".")) {
      fileName.substring(0, fileName.lastIndexOf('.'))
    } else {
      fileName
    }
  }

  def createCard(c: JsValue): List[CardInterface] = {
    val cardColor: String = (c \ "color").get.as[String]
    val cardValue: String = (c \ "value").get.as[String]
    val card: CardInterface = CardStringConverter.parseCardStringToCardObject(cardColor + " " + cardValue)
    List(card)
  }

  def createPlayersLit(sourceAsJson: JsValue): List[PlayerInterface] = {
    var players: List[PlayerInterface] = Nil

    (sourceAsJson \ "game" \ "players" \\ "player").foreach(p => {
      val name: String = (p \ "name").get.as[String]
      var handCards: List[CardInterface] = Nil

      (p \ "handCards" \\ "card").foreach(c => {
        handCards = handCards ::: createCard(c)
      })

      val player: PlayerInterface = Player(name, handCards)
      players = players ::: List(player)
    })

    players
  }

  def createDeck(sourceAsJson: JsValue): DeckInterface = {
    var cards: List[CardInterface] = Nil

    (sourceAsJson \ "game" \ "deck" \\ "card").foreach(c => {
      cards = cards ::: createCard(c)
    })

    Deck(cards)
  }

  def createTrump(sourceAsJson: JsValue): CardInterface = {
    createCard((sourceAsJson \ "game" \ "trump" \\ "card").head).head
  }

  def createTurn(sourceAsJson: JsValue, players: List[PlayerInterface]): TurnInterface = {
    val attackerName = (sourceAsJson \ "game" \ "currentTurn" \ "attacker" \ "player" \ "name").get.as[String]
    val victimName = (sourceAsJson \ "game" \ "currentTurn" \ "victim" \ "player" \ "name").get.as[String]
    val neighbourName = (sourceAsJson \ "game" \ "currentTurn" \ "neighbour" \ "player" \ "name").get.as[String]

    var attackCards: List[CardInterface] = Nil
    var blockedAttackCards: List[CardInterface] = Nil
    var blockingCards: List[CardInterface] = Nil

    (sourceAsJson \ "game" \ "currentTurn" \ "attackCards" \\ "card").foreach(c => {
      attackCards = attackCards ::: createCard(c)
    })

    (sourceAsJson \ "game" \ "currentTurn" \ "blockedBy" \\ "attackCards").foreach(entry => {
      (entry \\ "card").foreach(c => {
        blockedAttackCards = blockedAttackCards ::: createCard(c)
      })
    })

    (sourceAsJson \ "game" \ "currentTurn" \ "blockedBy" \\ "blockingCards").foreach(entry => {
      (entry \\ "card").foreach(c => {
        blockingCards = blockingCards ::: createCard(c)
      })
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

  def createActivePlayer(sourceAsJson: JsValue, players: List[PlayerInterface]): PlayerInterface = {
    val activePlayerName: String = (sourceAsJson \ "game" \ "active" \ "player" \ "name").get.as[String]
    players.filter(p => p.name.equals(activePlayerName)).head
  }

  def createWinnersList(sourceAsJson: JsValue): List[PlayerInterface] = {
    var winners: List[PlayerInterface] = Nil

    (sourceAsJson \ "game" \ "winners" \\ "player").foreach(player => {
      val playerName: String = (player \ "name").get.as[String]
      winners = winners ::: List(Player(playerName, Nil))
    })

    winners
  }

  def gameToJson(game: GameInterface): JsObject = {
    Json.obj(
      "game" -> Json.obj(
        "players" -> game.players.map(p => p.toJson),
        "deck" -> game.deck.toJson,
        "trump" -> game.trump.toJson,
        "currentTurn" -> game.currentTurn.toJson,
        "active" -> game.active.nameToJson,
        "winners" -> game.winners.map(p => p.nameToJson)))
  }
}
