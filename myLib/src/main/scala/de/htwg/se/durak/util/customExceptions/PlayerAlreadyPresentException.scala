package de.htwg.se.durak.util.customExceptions

class PlayerAlreadyPresentException(val message: String = "Player name already present!") extends Exception(message)
