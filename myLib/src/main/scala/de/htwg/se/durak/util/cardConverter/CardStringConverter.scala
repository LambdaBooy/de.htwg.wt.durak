package de.htwg.se.durak.util.cardConverter

import de.htwg.se.durak.model.cardComponent.cardBaseImpl.CardColor.CardColor
import de.htwg.se.durak.model.cardComponent.cardBaseImpl.{ Card, CardColor, CardValue }
import de.htwg.se.durak.model.cardComponent.cardBaseImpl.CardValue.CardValue

object CardStringConverter {
  def parseColorString(input: String): CardColor = input match {
    case "Herz" | "herz" => CardColor.Herz
    case "Karo" | "karo" => CardColor.Karo
    case "Kreuz" | "kreuz" => CardColor.Kreuz
    case "Pik" | "pik" => CardColor.Pik
  }

  def parseValueString(input: String): CardValue = input match {
    case "2" | "Zwei" | "zwei" => CardValue.Zwei
    case "3" | "Drei" | "drei" => CardValue.Drei
    case "4" | "Vier" | "vier" => CardValue.Vier
    case "5" | "Fünf" | "fünf" => CardValue.Fünf
    case "6" | "Sechs" | "sechs" => CardValue.Sechs
    case "7" | "Sieben" | "sieben" => CardValue.Sieben
    case "8" | "Acht" | "acht" => CardValue.Acht
    case "9" | "Neun" | "neun" => CardValue.Neun
    case "10" | "Zehn" | "zehn" => CardValue.Zehn
    case "B" | "b" | "bube" | "Bube" => CardValue.Bube
    case "D" | "d" | "dame" | "Dame" => CardValue.Dame
    case "K" | "k" | "könig" | "König" => CardValue.König
    case "A" | "a" | "ass" | "Ass" => CardValue.Ass
  }

  def parseColorObject(color: CardColor): String = color match {
    case CardColor.Kreuz => "Kreuz"
    case CardColor.Karo => "Karo"
    case CardColor.Herz => "Herz"
    case CardColor.Pik => "Pik"
  }

  def parseCardObjectToCardString(card: Card): String = parseColorObject(card.color) + " " + parseValueObject(card.value)

  def parseValueObject(value: CardValue): String = value match {
    case CardValue.Zwei => "2"
    case CardValue.Drei => "3"
    case CardValue.Vier => "4"
    case CardValue.Fünf => "5"
    case CardValue.Sechs => "6"
    case CardValue.Sieben => "7"
    case CardValue.Acht => "8"
    case CardValue.Neun => "9"
    case CardValue.Zehn => "10"
    case CardValue.Bube => "B"
    case CardValue.Dame => "D"
    case CardValue.König => "K"
    case CardValue.Ass => "A"
  }

  def parseCardStringToCardObject(cardString: String): Card = {
    val cardColorValueArray: Array[String] = cardString.split(" ")
    val cardColorAsString: String = cardColorValueArray(0)
    val cardValueAsString: String = cardColorValueArray(1)

    val cardColor: CardColor = parseColorString(cardColorAsString)
    val cardValue: CardValue = parseValueString(cardValueAsString)

    Card(cardColor, cardValue)
  }

}
