package de.htwg.se.durak.util.customExceptions

class NoCardsToTakeException(val message: String = "There are no cards to take.") extends Exception(message)
