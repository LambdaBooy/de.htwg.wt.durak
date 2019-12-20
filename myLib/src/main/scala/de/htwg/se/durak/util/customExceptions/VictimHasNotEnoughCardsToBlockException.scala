package de.htwg.se.durak.util.customExceptions

class VictimHasNotEnoughCardsToBlockException(val message: String = "Victim has not enough cards to block!") extends Exception(message)
