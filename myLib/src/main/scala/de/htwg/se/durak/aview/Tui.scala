package de.htwg.se.durak.aview

import de.htwg.se.durak.controller.controllerComponent.{ControllerInterface, GameStatus}
import de.htwg.se.durak.controller.controllerComponent.GameStatus._
import de.htwg.se.durak.model.cardComponent.cardBaseImpl.Card
import de.htwg.se.durak.util.cardConverter.CardStringConverter
import de.htwg.se.durak.util.customExceptions.IllegalTurnException

import io.StdIn.readLine
import scala.swing.Reactor
import scala.util.{Failure, Success, Try}

class Tui(controller: ControllerInterface) extends Reactor {

  listenTo(controller)

  private val converter = CardStringConverter

  def processInputLine(input: String): Unit = {

    val tokens = input.split(" ")

    tokens.head match {
      case "play" =>
        parseCards(tokens.tail.toList) match {
          case Success(cards) => controller.playCard(cards._1, cards._2)
          case Failure(ex) => System.err.println("Error while parsing cards: " + ex.getMessage)
        }
      case "player" | "p" =>
        if (tokens.size > 1) {
          controller.newPlayer(tokens.tail.mkString(" "))
        }
      case "reset players" => controller.resetPlayers()
      case "undo" => controller.undo()
      case "redo" => controller.redo()
      case "help" | "h" => printHelp()
      case "new" => controller.newGame()
      case "take" => controller.takeCards()
      case "ok" => controller.playOk()
      case "load" =>
        print("Enter a fileName: ")
        val fileName: String = readLine()
        controller.loadGame(fileName)
      case "q" | "exit" => controller.exitGame()
      case "players" => println(controller.players.mkString(" "))
      case _ => println("Bitte was?")
    }
  }

  def printHelp(): Unit = {
    println()
    println("Hello, this is help text!")
    println("Fist add players, then start game!")
    println("type [player <name>] for new player.")
    println("type [reset players] to reset the already added players.")
    println("type [new] for new game.")
    println("type [play <AttackCard>] or [play <DefendCard> <CardToDefend>] for attack / defense.")
    println("type [ok] for indicating you are done with the current turn.")
    println("type [take] to take all cards if you are the victim of the current turn.")
    println("type [load] to load a saved game.")
    println("type [undo] to undo last step.")
    println("type [redo] to redo last step.")
    println("type [q] or [exit] to exit the game.")
  }

  def parseCards(input: List[String]): Try[(Card, Option[Card])] = {
    input.size match {
      case 2 => Try(Card(converter.parseColorString(input.head), converter.parseValueString(input.last)), None)
      case 4 => Try((Card(converter.parseColorString(input.head), converter.parseValueString(input(1))),
        Some(Card(converter.parseColorString(input(2)), converter.parseValueString(input(3))))))
      case _ => throw new IllegalTurnException("Specify card pls..")
    }

  }

  reactions += {
    case _ => updateTui()
  }

  def updateTui(): Unit = {
    val trumpCardColorValueArray: Array[String] = controller.trumpCardToString().split(" ")
    val trumpCardColorAsString: String = trumpCardColorValueArray(0)
    val trumpCardValueAsString: String = trumpCardColorValueArray(1)

    println(GameStatus.message(controller.gameStatus))

    if (controller.gameStatus == NEW || controller.gameStatus == CARDLAYED || controller.gameStatus == TAKE ||
      controller.gameStatus == OK || controller.gameStatus == UNDO || controller.gameStatus == REDO ||
      controller.gameStatus == LOADED) {
      println()
      println("=============================================")
      println(controller.activePlayerToString() + " turn: ")
      println(controller.activePlayerHandCardsToString())
      println("Trump: [" + trumpCardColorAsString + "] " + trumpCardValueAsString)
      println(controller.currentTurnToString())
      print("cards: ")
      print(controller.activePlayerHandCardsToString() + "\n")
      print("winners: " + controller.winnersToString() + "\n")
      println("=============================================")
      println()
    }
  }
}